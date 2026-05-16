import { ArrowRight, CalendarClock, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import { Brand } from '../components/Brand'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { useServices } from '../hooks/useCatalog'
import { useWorkshopProfile } from '../hooks/useWorkshop'
import { formatCurrency } from '../lib/status'

export function PublicHome() {
  const workshopQuery = useWorkshopProfile()
  const servicesQuery = useServices({ per_page: 6 })
  const services = servicesQuery.data ?? []
  const workshop = workshopQuery.data
  const featuredServices = services.filter((service) => service.is_featured).length
    ? services.filter((service) => service.is_featured)
    : services

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

      <section className="public-hero">
        <img alt="Vehicle service bay" src={workshop?.hero_image_url ?? heroImage} />
        <div className="public-hero-copy">
          <p className="eyebrow">{workshop?.name ?? 'Revora workshop platform'}</p>
          <h1>{workshop?.tagline ?? 'Book service, approve estimates, and track your vehicle in one flow.'}</h1>
          <p>{workshop?.description ?? 'Revora connects customer reservations with real workshop execution, mechanic updates, and owner-level visibility.'}</p>
          <div className="button-row">
            <Link className="button button-primary" to="/services">
              Browse Services
              <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>From booking to completion</h2>
          </div>
        </div>
        <div className="public-feature-grid">
          <article>
            <CalendarClock size={20} />
            <strong>Reserve a slot</strong>
            <p>Select vehicle, service, date, and backend-validated workshop availability.</p>
          </article>
          <article>
            <ClipboardCheck size={20} />
            <strong>Review estimate</strong>
            <p>See inspection notes, itemized estimate, and approve only when ready.</p>
          </article>
          <article>
            <Wrench size={20} />
            <strong>Track progress</strong>
            <p>Follow service stages from vehicle received through inspection, QC, and completion.</p>
          </article>
          <article>
            <ShieldCheck size={20} />
            <strong>Role-aware workspace</strong>
            <p>Customers, admins, mechanics, and owners each get the right operational surface.</p>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Service catalog</p>
            <h2>Popular workshop services</h2>
          </div>
          <Link className="subtle-link" to="/services">
            View all services
          </Link>
        </div>
        {servicesQuery.isLoading ? <LoadingBlock rows={3} /> : null}
        <div className="public-card-grid">
          {featuredServices.map((service) => (
            <Link className="service-card" key={service.id} to={`/services/${service.id}`}>
              {service.image_url ? <img alt="" src={service.image_url} /> : null}
              <span>{service.estimated_duration ?? 45} min</span>
              <strong>{service.name}</strong>
              <p>{service.short_description ?? service.description ?? 'Workshop service available for booking.'}</p>
              <small>{formatCurrency(service.base_price)}</small>
            </Link>
          ))}
        </div>
      </section>

      {workshop ? (
        <section className="public-section">
          <div className="public-info-grid">
            <article className="content-card">
              <p className="eyebrow">Contact</p>
              <h2>{workshop.name}</h2>
              <div className="metric-list">
                <div><span>Phone</span><strong>{workshop.phone ?? '-'}</strong></div>
                <div><span>Email</span><strong>{workshop.email ?? '-'}</strong></div>
                <div><span>Address</span><strong>{workshop.address ?? '-'}</strong></div>
              </div>
            </article>
            <article className="content-card">
              <p className="eyebrow">Opening hours</p>
              <h2>Workshop schedule</h2>
              <div className="metric-list">
                {workshop.opening_hours?.slice(0, 6).map((item) => (
                  <div key={item.day}>
                    <span>{item.day}</span>
                    <strong>{item.is_closed ? 'Closed' : `${item.open} - ${item.close}`}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </MotionPage>
  )
}
