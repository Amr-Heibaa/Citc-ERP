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

export type ContractInfo = {
  contractId: number
  contractNumber: string | null
  startDate: string | null
  endDate: string | null
  salary: number | null
  salaryCurrency: string | null
  fulltime: boolean | null
  active: boolean
}

export type EmployeeDetail = {
  employeeId: number
  employeeNumber: string
  userId: number | null
  hireDate: string | null
  startDate: string | null
  terminationDate: string | null
  employeeStatusId: number | null
  statusCode: string | null
  statusName: string | null
  firstName: string | null
  otherName: string | null
  displayName: string | null
  gender: number | null
  genderLabel: string | null
  birthDate: string | null
  nationalId: string | null
  personalEmail: string | null
  businessEmail: string | null
  phoneNumber: string | null
  mobileNumber: string | null
  countryId: number | null
  stateId: number | null
  cityId: number | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  currentOrgUnitId: number | null
  department: string | null
  branch: string | null
  section: string | null
  positionTitle: string | null
  gradeName: string | null
  gradeRank: number | null
  manager: string | null
  teamLeader: string | null
  skills: string[]
  contracts: ContractInfo[]
}

export async function getEmployeeDetail(employeeId: number): Promise<EmployeeDetail> {
  const res = await axiosInstance.get(`/api/hr/employees/${employeeId}`)
  return res.data
}