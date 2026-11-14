import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from '@neondatabase/serverless'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const migrationsDirectory = resolve(projectRoot, 'db', 'migrations')
const migrationFilenamePattern = /^([0-9]{4})_([a-z0-9_]+)[.]sql$/
const lockName = 'controluce.schema_migrations'

async function loadMigrations() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort()

  const migrations = []
  const seenVersions = new Set()

  for (const filename of files) {
    const match = migrationFilenamePattern.exec(filename)
    if (!match) {
      throw new Error('Nome migrazione non valido: ' + filename + '. Usa NNNN_nome_descrittivo.sql.')
    }

    const version = match[1]
    const name = match[2]
    if (seenVersions.has(version)) {
      throw new Error('Versione migrazione duplicata: ' + version)
    }
    seenVersions.add(version)

    const content = await readFile(resolve(migrationsDirectory, filename), 'utf8')
    if (!content.trim()) {
      throw new Error('La migrazione è vuota: ' + filename)
    }

    const checksum = createHash('sha256').update(content, 'utf8').digest('hex')
    migrations.push({ version, name, filename, content, checksum })
  }

  if (migrations.length === 0) {
    throw new Error('Nessuna migrazione SQL trovata in db/migrations.')
  }

  return migrations
}

function validateAppliedMigrations(appliedRows, migrations) {
  const known = new Map(migrations.map((migration) => [migration.version, migration]))
  const applied = new Map()

  for (const row of appliedRows) {
    const migration = known.get(row.version)
    if (!migration) {
      throw new Error(
        'Il database contiene la migrazione ' + row.version +
        ', ma il relativo file non è presente in db/migrations. Ripristina il file prima di continuare.',
      )
    }

    if (row.name !== migration.name || row.checksum !== migration.checksum) {
      throw new Error(
        'La migrazione già applicata ' + row.version + ' è stata modificata. ' +
        'Non viene rieseguita: ripristina il file originale e crea una nuova migrazione.',
      )
    }
    applied.set(row.version, row)
  }

  let foundPending = false
  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      foundPending = true
    } else if (foundPending) {
      throw new Error(
        'Cronologia migrazioni non sequenziale: ' + migration.version +
        ' risulta applicata mentre una migrazione precedente manca.',
      )
    }
  }

  return applied
}

async function main() {
  const migrations = await loadMigrations()

  if (process.argv.includes('--check')) {
    for (const migration of migrations) {
      console.log(migration.filename + '  sha256:' + migration.checksum)
    }
    console.log('Controllo completato: ' + migrations.length + ' migrazioni valide.')
    return
  }

  const connectionString =
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim()

  if (!connectionString) {
    throw new Error('Database non configurato: imposta POSTGRES_URL o DATABASE_URL.')
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10000,
  })

  let client
  let lockAcquired = false

  try {
    client = await pool.connect()

    await client.query(`
      CREATE TABLE IF NOT EXISTS controluce_schema_migrations (
        version TEXT PRIMARY KEY CHECK (version ~ '^[0-9]{4}$'),
        name TEXT NOT NULL,
        checksum CHAR(64) NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query('SELECT pg_advisory_lock(hashtext($1)::bigint)', [lockName])
    lockAcquired = true

    const { rows } = await client.query(
      'SELECT version, name, checksum FROM controluce_schema_migrations ORDER BY version',
    )
    const applied = validateAppliedMigrations(rows, migrations)

    for (const migration of migrations) {
      if (applied.has(migration.version)) {
        console.log('Già applicata: ' + migration.filename)
        continue
      }

      await client.query('BEGIN')
      try {
        // File SQL versionati e revisionati nel repository: contenuto attendibile, non derivato da input utente.
        await client.query(migration.content)
        await client.query(
          'INSERT INTO controluce_schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
          [migration.version, migration.name, migration.checksum],
        )
        await client.query('COMMIT')
        console.log('Applicata: ' + migration.filename)
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined)
        throw error
      }
    }

    console.log('Migrazioni database completate.')
  } finally {
    if (client && lockAcquired) {
      await client.query('SELECT pg_advisory_unlock(hashtext($1)::bigint)', [lockName]).catch(() => undefined)
    }
    client?.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Migrazioni database non completate:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
