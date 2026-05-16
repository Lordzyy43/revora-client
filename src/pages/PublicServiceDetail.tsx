import { ArrowRight, Clock, CreditCard, FileText } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AsyncState } from '../components/AsyncState'
import { Brand } from '../components/Brand'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useService } from '../hooks/useCatalog'
import { formatCurrency } from '../lib/status'

const fallbackIncludes = [
  'Initial service advisor review',
  'Workshop slot reservation',
  'Digital service order tracking',
  'Customer approval when an estimate is required',
]

const fallbackBenefits = [
  'Transparent estimate before repair continues',
  'Status updates from admin and mechanic workflow',
  'Vehicle history stored in your Revora account',
]

export function PublicServiceDetail() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const serviceQuery = useService(serviceId ?? '')
  const service = serviceQuery.data
  const bookingTarget = `/customer/bookings?service_id=${serviceId ?? ''}`
  const includedItems = service?.included_items?.length ? service.included_items : fallbackIncludes
  const benefits = service?.benefits?.length ? service.benefits : fallbackBenefits

  return (
    <MotionPage className="public-page">
      <header className="public-nav">
        <Brand />
        <nav>
          <Link to="/services">Services</Link>
          <Link to="/login">Sign in</Link>
          <Link className="button button-primary" to="/register">
            Register
          </Link>
        </nav>
      </header>

      {serviceQuery.isLoading ? <LoadingBlock /> : null}
      {serviceQuery.isError ? (
        <section className="public-section">
          <AsyncState
            action="Back to services"
            message="This service could not be loaded from the backend."
            onAction={() => navigate('/services')}
            title="Service unavailable"
            variant="error"
          />
        </section>
      ) : null}

      {service ? (
        <>
          <section className="public-service-detail">
            <div>
              <p className="eyebrow">Workshop service</p>
              <h1>{service.name}</h1>
              <p>{service.short_description ?? service.description ?? 'A Revora workshop service ready for customer booking.'}</p>
              <div className="button-row">
                <Link className="button button-primary" to={bookingTarget}>
                  Book this service
                  <ArrowRight size={16} />
                </Link>
                <Link className="button button-secondary" to="/services">
                  Browse more
                </Link>
              </div>
            </div>
            {service.image_url ? <img className="service-detail-image" alt="" src={service.image_url} /> : null}
            <aside className="content-card">
              <div className="metric-list">
                <div>
                  <span>
                    <Clock size={16} />
                    Duration
                  </span>
                  <strong>{service.estimated_duration ?? 45} min</strong>
                </div>
                <div>
                  <span>
                    <CreditCard size={16} />
                    Base price
                  </span>
                  <strong>{formatCurrency(service.base_price)}</strong>
                </div>
                <div>
                  <span>
                    <FileText size={16} />
                    Status
                  </span>
                  <StatusBadge tone={service.is_active === false ? 'warning' : 'success'}>
                    {service.is_active === false ? 'Inactive' : 'Active'}
                  </StatusBadge>
                </div>
              </div>
            </aside>
          </section>

          <section className="public-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Booking process</p>
                <h2>What happens after booking</h2>
              </div>
            </div>
            <div className="public-feature-grid">
              <article>
                <strong>1. Reserve slot</strong>
                <p>Select your vehicle and available workshop time from backend capacity.</p>
              </article>
              <article>
                <strong>2. Admin confirms</strong>
                <p>The workshop validates the booking and receives the vehicle.</p>
              </article>
              <article>
                <strong>3. Inspect and estimate</strong>
                <p>Inspection items and estimate rows appear in customer tracking.</p>
              </article>
              <article>
                <strong>4. Track completion</strong>
                <p>Follow every stage until quality check and completion.</p>
              </article>
            </div>
          </section>

          <section className="public-section">
            <div className="public-info-grid">
              <article className="content-card">
                <p className="eyebrow">Included</p>
                <h2>Service experience</h2>
                <div className="checklist compact-checklist">
                  {includedItems.map((item) => (
                    <div className="check-row" key={item}>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="content-card">
                <p className="eyebrow">Why Revora</p>
                <h2>Customer visibility</h2>
                <div className="checklist compact-checklist">
                  {benefits.map((item) => (
                    <div className="check-row" key={item}>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </>
      ) : null}
    </MotionPage>
  )
}
