import { useQuery } from '@tanstack/react-query'
import { listEmployees } from '@/lib/api/hr-api'
import { getMyEmployee } from '@/lib/api/hr-api'
import { getEmployeeDetail } from '@/lib/api/hr-api'

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

export function useEmployeeDetail(employeeId: number) {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployeeDetail(employeeId),
    enabled: !Number.isNaN(employeeId),
  })
}