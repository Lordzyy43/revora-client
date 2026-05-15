import { AlertCircle, Inbox } from 'lucide-react'

type Props = {
  title: string
  message: string
  action?: string
  onAction?: () => void
  variant?: 'empty' | 'error'
}

export function AsyncState({ title, message, action, onAction, variant = 'empty' }: Props) {
  const Icon = variant === 'error' ? AlertCircle : Inbox

  return (
    <div className={`async-state async-state-${variant}`}>
      <Icon size={22} />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {action ? (
        <button className="button button-secondary" onClick={onAction} type="button">
          {action}
        </button>
      ) : null}
    </div>
  )
}
