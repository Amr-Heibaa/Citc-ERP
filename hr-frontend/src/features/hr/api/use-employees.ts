import { useQuery } from '@tanstack/react-query'
import { listEmployees } from '@/lib/api/hr-api'
import { getMyEmployee } from '@/lib/api/hr-api'

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  })

  
}

export function useMyEmployee() {
  return useQuery({
    queryKey: ['my-employee'],
    queryFn: getMyEmployee,
    retry: false, // don't retry on 404 (user not linked to an employee)
  })
}