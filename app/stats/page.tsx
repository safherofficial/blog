import type { Metadata } from 'next'
import StatsDashboard from '@/components/StatsDashboard'
export const metadata: Metadata = { title: 'Statistiche sito', robots: { index: false, follow: false, noarchive: true } }
export const dynamic = 'force-dynamic'
export default function StatsPage() { return <StatsDashboard /> }
