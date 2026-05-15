import { MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import type { WorkOrder } from '../types'

type Props = {
  orders: WorkOrder[]
  compact?: boolean
  detailBasePath?: string
  onSelect?: (order: WorkOrder) => void
  selectedOrderId?: string
}

export function WorkOrderTable({
  compact = false,
  detailBasePath,
  onSelect,
  orders,
  selectedOrderId,
}: Props) {
  return (
    <div className="table-shell">
      <table className={compact ? 'compact-table' : undefined}>
        <thead>
          <tr>
            <th>WO Number</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Mechanic</th>
            <th>Priority</th>
            <th>Estimate</th>
            <th>Due</th>
            <th>Updated</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              className={selectedOrderId === order.id ? 'selected-row' : undefined}
              key={order.id}
              onClick={() => onSelect?.(order)}
            >
              <td>
                <strong>{order.id}</strong>
                <small>{order.plate}</small>
              </td>
              <td>{order.customer}</td>
              <td>{order.vehicle}</td>
              <td>
                <StatusBadge>{order.status}</StatusBadge>
              </td>
              <td>{order.mechanic}</td>
              <td>
                <StatusBadge>{order.priority}</StatusBadge>
              </td>
              <td>{order.estimate}</td>
              <td>{order.due}</td>
              <td>{order.updated}</td>
              <td>
                {detailBasePath ? (
                  <Link
                    className="icon-button"
                    onClick={(event) => event.stopPropagation()}
                    to={`${detailBasePath}/${order.serviceOrderId}`}
                    aria-label={`Open ${order.id}`}
                  >
                    <MoreHorizontal size={16} />
                  </Link>
                ) : (
                  <button className="icon-button" type="button" aria-label={`Open ${order.id}`}>
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
