import { Check } from 'lucide-react'
import { serviceLifecycle } from '../data/revora'
import type { ServiceStatus } from '../types'

type Props = {
  current: ServiceStatus
}

export function ServiceTimeline({ current }: Props) {
  const currentIndex = serviceLifecycle.indexOf(current)

  return (
    <ol className="timeline">
      {serviceLifecycle.map((step, index) => {
        const state =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next'

        return (
          <li className={`timeline-step timeline-${state}`} key={step}>
            <span className="timeline-node">
              {state === 'done' ? <Check size={13} /> : index + 1}
            </span>
            <span>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
