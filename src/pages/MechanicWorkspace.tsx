import { Camera, CheckCircle2, Play, Send, Wrench } from 'lucide-react'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { ServiceTimeline } from '../components/ServiceTimeline'
import { StatusBadge } from '../components/StatusBadge'
import { useMechanicServiceOrders, useUpdateMechanicStatus } from '../hooks/useServiceOrders'

export function MechanicWorkspace() {
  const serviceOrdersQuery = useMechanicServiceOrders()
  const jobs = serviceOrdersQuery.data ?? []
  const currentJob = jobs[0]
  const updateStatusMutation = useUpdateMechanicStatus(currentJob?.serviceOrderId ?? '')

  return (
    <MotionPage className="mechanic-board">
      <section className="job-rail">
        <h2>My Jobs</h2>
        {serviceOrdersQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {serviceOrdersQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Assigned service orders could not be loaded."
            onAction={() => void serviceOrdersQuery.refetch()}
            title="Unable to load jobs"
            variant="error"
          />
        ) : null}
        {!serviceOrdersQuery.isLoading && !serviceOrdersQuery.isError && jobs.length === 0 ? (
          <AsyncState message="Assigned service orders will appear here." title="No assigned jobs" />
        ) : null}
        {jobs.map((job) => (
          <article className="job-card" key={job.id}>
            <div>
              <strong>{job.id}</strong>
              <StatusBadge>{job.status}</StatusBadge>
            </div>
            <h3>{job.vehicle}</h3>
            <p>
              {job.plate} | {job.customer}
            </p>
            <div className="progress-track">
              <span style={{ width: `${progressFromStatus(job.status)}%` }} />
            </div>
          </article>
        ))}
      </section>

      <section className="content-card focus-job">
        {currentJob ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Current job</p>
                <h2>{currentJob.vehicle}</h2>
                <p>
                  {currentJob.id} | {currentJob.plate} | {currentJob.customer}
                </p>
              </div>
              <StatusBadge>{currentJob.status}</StatusBadge>
            </div>
            <ServiceTimeline current={currentJob.status} />
            <div className="action-grid">
              <button
                className="button button-primary"
                disabled={updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'in_progress',
                    note: 'Service work started by mechanic.',
                  })
                }
                type="button"
              >
                <Play size={16} />
                Start Work
              </button>
              <button
                className="button button-secondary"
                disabled={updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'quality_check',
                    note: 'Service work completed, moving to QC.',
                  })
                }
                type="button"
              >
                <Send size={16} />
                Send to QC
              </button>
              <button className="button button-secondary" type="button">
                <Camera size={16} />
                Add Evidence
              </button>
              <button className="button button-secondary" type="button">
                <Wrench size={16} />
                Update Notes
              </button>
            </div>
            <div className="checklist">
              {['Inspection', 'In Progress', 'Quality Check', 'Completed'].map((task) => (
                <div className="check-row" key={task}>
                  <span>{task}</span>
                  {progressFromStatus(currentJob.status) >= progressFromLabel(task) ? (
                    <CheckCircle2 size={16} />
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <AsyncState message="Open jobs assigned by admin will show here." title="No current job" />
        )}
      </section>

      <section className="content-card notes-panel">
        <h2>Job Context</h2>
        {currentJob ? (
          <>
            <div className="note-box">Estimate: {currentJob.estimate}</div>
            <div className="list-row">
              <StatusBadge>{currentJob.priority}</StatusBadge>
              <span>Priority</span>
            </div>
            <div className="list-row">
              <StatusBadge tone="info">{currentJob.rawStatus ?? currentJob.status}</StatusBadge>
              <span>Backend status</span>
            </div>
          </>
        ) : (
          <AsyncState message="Select an assigned service order to see job context." title="No context" />
        )}
      </section>
    </MotionPage>
  )
}

function progressFromStatus(status: string) {
  const progress: Record<string, number> = {
    Booked: 8,
    'Checked In': 18,
    Inspection: 32,
    Diagnosis: 44,
    'Waiting Approval': 52,
    'Estimate Approved': 60,
    'In Progress': 68,
    'Quality Check': 86,
    Ready: 94,
    Completed: 100,
    Cancelled: 100,
  }

  return progress[status] ?? 0
}

function progressFromLabel(label: string) {
  return progressFromStatus(label)
}
