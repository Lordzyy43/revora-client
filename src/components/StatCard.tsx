import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { Stat } from '../types'

export function StatCard({ label, value, trend, tone = 'neutral' }: Stat) {
  const TrendIcon = tone === 'danger' ? ArrowDownRight : ArrowUpRight

  return (
    <article className="stat-card">
      <div>
        <p className="eyebrow">{label}</p>
        <strong>{value}</strong>
      </div>
      <span className={`trend trend-${tone}`}>
        <TrendIcon size={14} />
        {trend}
      </span>
    </article>
  )
}
