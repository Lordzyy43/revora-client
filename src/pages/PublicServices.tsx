import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useServiceCategories, useServices } from '../hooks/useCatalog'
import { formatCurrency } from '../lib/status'

export function PublicServices() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const categoriesQuery = useServiceCategories()
  const servicesQuery = useServices({ category_id: categoryId, search: search || undefined, per_page: 60 })
  const categories = categoriesQuery.data ?? []
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])

  return (
    <MotionPage className="public-page">
      <header className="public-nav">
        <Brand />
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Sign in</Link>
          <Link className="button button-primary" to="/register">
            Register
          </Link>
        </nav>
      </header>

      <section className="public-section public-section-hero">
        <p className="eyebrow">Service catalog</p>
        <h1>Choose the service your vehicle needs.</h1>
        <p>Browse active backend services, compare estimated duration and price, then continue to booking.</p>
      </section>

      <section className="public-section">
        <div className="catalog-toolbar">
          <label className="search-field inline">
            <Search size={16} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services"
              value={search}
            />
          </label>
          <div className="filter-row no-margin">
            <button
              className={`filter-pill ${categoryId === undefined ? 'active' : ''}`}
              onClick={() => setCategoryId(undefined)}
              type="button"
            >
              All
            </button>
            {categories.map((category) => (
              <button
                className={`filter-pill ${categoryId === category.id ? 'active' : ''}`}
                key={category.id}
                onClick={() => setCategoryId(category.id)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {servicesQuery.isLoading ? <LoadingBlock rows={5} /> : null}
        <div className="public-card-grid">
          {services.map((service) => (
            <Link className="service-card" key={service.id} to={`/services/${service.id}`}>
              {service.image_url ? <img alt="" src={service.image_url} /> : null}
              <div className="section-heading compact-heading">
                <StatusBadge tone="info">{`${service.estimated_duration ?? 45} min`}</StatusBadge>
                <span>{formatCurrency(service.base_price)}</span>
              </div>
              <strong>{service.name}</strong>
              <p>{service.short_description ?? service.description ?? 'Active workshop service available for reservation.'}</p>
            </Link>
          ))}
        </div>
      </section>
    </MotionPage>
  )
}
