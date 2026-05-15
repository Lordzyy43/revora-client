import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>Workspace not found</h1>
      <p>The requested Revora screen is not available in this prototype.</p>
      <Link className="button button-primary" to="/">
        Back to login
      </Link>
    </main>
  )
}
