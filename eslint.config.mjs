import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  // Le regole React 19.2 segnalano effetti preesistenti: durante questa migrazione
  // li manteniamo visibili come warning, evitando refactor funzionali fuori scope.
  {
    files: [
      'app/admin/page.tsx',
      'components/ShareButtons.tsx',
      'components/StatsDashboard.tsx',
      'components/admin/PostEditor.tsx',
      'components/admin/ReaderMessages.tsx',
      'components/admin/SeoDashboard.tsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: [
      'components/admin/ArticlePreview.tsx',
      'components/admin/PostEditor.tsx',
    ],
    rules: {
      'react-hooks/purity': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])
