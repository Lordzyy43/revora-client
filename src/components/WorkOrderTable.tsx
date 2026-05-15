import { MoreHorizontal } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { WorkOrder } from '../types'

type Props = {
  orders: WorkOrder[]
  compact?: boolean
}

export function WorkOrderTable({ orders, compact = false }: Props) {
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
            <tr key={order.id}>
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
                <button className="icon-button" type="button" aria-label={`Open ${order.id}`}>
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
