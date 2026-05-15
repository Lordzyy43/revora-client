type Props = {
  rows?: number
}

export function LoadingBlock({ rows = 4 }: Props) {
  return (
    <div className="loading-block" aria-label="Loading data">
      {Array.from({ length: rows }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  )
}
