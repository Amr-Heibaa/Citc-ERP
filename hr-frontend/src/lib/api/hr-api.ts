import { axiosInstance } from '@/lib/api/axios'

export type EmployeeSummary = {
  employeeId: number
  employeeNumber: string
  userId: number | null
  displayName: string | null
  currentOrgUnitId: number | null
  currentOrgUnitName: string | null
  employeeStatusId: number | null
  statusCode: string | null
  statusName: string | null
  positionTitle: string | null
  personalEmail: string | null
  businessEmail: string | null
  mobileNumber: string | null
  hireDate: string | null
  startDate: string | null
  terminationDate: string | null
}

export async function listEmployees(): Promise<EmployeeSummary[]> {
  const res = await axiosInstance.get('/api/hr/employees')
  return res.data
}

export async function getMyEmployee(): Promise<EmployeeSummary> {
  const res = await axiosInstance.get('/api/hr/employees/me')
  return res.data
}