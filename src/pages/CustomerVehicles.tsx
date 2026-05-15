import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatusBadge } from '../components/StatusBadge'
import { useCreateVehicle, useDeleteVehicle, useUpdateVehicle, useVehicles } from '../hooks/useVehicles'
import type { Vehicle } from '../services/vehicles'

const vehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1980).max(2100),
  plate_number: z.string().min(3, 'Plate number is required'),
  transmission_type: z.enum(['manual', 'automatic']),
  fuel_type: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  last_odometer: z.number().min(0).optional(),
  color: z.string().optional(),
})

type VehicleForm = z.infer<typeof vehicleSchema>

export function CustomerVehicles() {
  const vehiclesQuery = useVehicles()
  const createMutation = useCreateVehicle()
  const deleteMutation = useDeleteVehicle()
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const updateMutation = useUpdateVehicle(editingVehicle?.id ?? '')
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate_number: '',
      transmission_type: 'automatic',
      fuel_type: 'gasoline',
      last_odometer: 0,
      color: '',
    },
  })
  const isEditing = Boolean(editingVehicle)

  return (
    <MotionPage className="page-grid">
      <section className="content-card span-7">
        <h2>My Vehicles</h2>
        {vehiclesQuery.isLoading ? <LoadingBlock /> : null}
        {vehiclesQuery.isError ? (
          <AsyncState
            action="Retry"
            message="Vehicle data could not be loaded."
            onAction={() => void vehiclesQuery.refetch()}
            title="Unable to load vehicles"
            variant="error"
          />
        ) : null}
        {vehiclesQuery.data?.length === 0 ? (
          <AsyncState message="Add your first vehicle to start booking services." title="No vehicles yet" />
        ) : null}
        {vehiclesQuery.data?.map((vehicle) => (
          <div className="list-row" key={vehicle.id}>
            <StatusBadge tone="info">{vehicle.fuel_type}</StatusBadge>
            <div>
              <strong>{vehicle.brand} {vehicle.model} {vehicle.year}</strong>
              <p>{vehicle.plate_number} | {vehicle.transmission_type} | {vehicle.color ?? 'No color'}</p>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                setEditingVehicle(vehicle)
                reset({
                  brand: vehicle.brand,
                  model: vehicle.model,
                  year: vehicle.year,
                  plate_number: vehicle.plate_number,
                  transmission_type: vehicle.transmission_type,
                  fuel_type: vehicle.fuel_type,
                  last_odometer: vehicle.last_odometer ?? 0,
                  color: vehicle.color ?? '',
                })
              }}
              type="button"
              aria-label={`Edit ${vehicle.plate_number}`}
            >
              <Pencil size={15} />
            </button>
            <button
              className="icon-button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(vehicle.id)}
              type="button"
              aria-label={`Delete ${vehicle.plate_number}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </section>

      <section className="content-card span-5">
        <form
          className="form-stack"
          onSubmit={handleSubmit((values) => {
            if (editingVehicle) {
              updateMutation.mutate(values, {
                onSuccess: () => {
                  setEditingVehicle(null)
                  reset(defaultVehicleForm())
                },
              })
              return
            }

            createMutation.mutate(values, {
              onSuccess: () => reset(defaultVehicleForm()),
            })
          })}
        >
          <div className="section-heading compact-heading">
            <h2>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            {isEditing ? (
              <button
                className="icon-button"
                onClick={() => {
                  setEditingVehicle(null)
                  reset(defaultVehicleForm())
                }}
                type="button"
                aria-label="Cancel editing"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
          <label>Brand<input {...register('brand')} />{errors.brand ? <small className="field-error">{errors.brand.message}</small> : null}</label>
          <label>Model<input {...register('model')} />{errors.model ? <small className="field-error">{errors.model.message}</small> : null}</label>
          <label>Year<input {...register('year', { valueAsNumber: true })} type="number" />{errors.year ? <small className="field-error">{errors.year.message}</small> : null}</label>
          <label>Plate Number<input {...register('plate_number')} />{errors.plate_number ? <small className="field-error">{errors.plate_number.message}</small> : null}</label>
          <label>Transmission<select {...register('transmission_type')}><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label>
          <label>Fuel<select {...register('fuel_type')}><option value="gasoline">Gasoline</option><option value="diesel">Diesel</option><option value="electric">Electric</option><option value="hybrid">Hybrid</option></select></label>
          <label>Last Odometer<input {...register('last_odometer', { valueAsNumber: true })} type="number" /></label>
          <label>Color<input {...register('color')} /></label>
          <button className="button button-primary" disabled={createMutation.isPending || updateMutation.isPending} type="submit">
            {isEditing ? <Save size={16} /> : <Plus size={16} />}
            {isEditing ? 'Save Vehicle' : 'Add Vehicle'}
          </button>
          {createMutation.isError || updateMutation.isError ? (
            <p className="form-error">Vehicle could not be saved. Check plate number and required fields.</p>
          ) : null}
          {createMutation.isSuccess || updateMutation.isSuccess ? (
            <p className="form-success">Vehicle data synced with backend.</p>
          ) : null}
        </form>
      </section>
    </MotionPage>
  )
}

function defaultVehicleForm(): VehicleForm {
  return {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate_number: '',
    transmission_type: 'automatic',
    fuel_type: 'gasoline',
    last_odometer: 0,
    color: '',
  }
}
