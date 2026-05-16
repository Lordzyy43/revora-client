import { useQuery } from '@tanstack/react-query'
import { fetchInspectionTemplates } from '../services/inspectionTemplates'

export function useInspectionTemplates() {
  return useQuery({
    queryKey: ['inspection-templates'],
    queryFn: fetchInspectionTemplates,
  })
}
