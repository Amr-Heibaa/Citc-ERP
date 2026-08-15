import { axiosInstance } from "@/lib/api/axios";

export type EmployeeSummary = {
  employeeId: number;
  employeeNumber: string;
  userId: number | null;
  displayName: string | null;
  profilePhotoDataUrl: string | null;
  currentOrgUnitId: number | null;
  currentOrgUnitName: string | null;
  employeeStatusId: number | null;
  statusCode: string | null;
  statusName: string | null;
  positionTitle: string | null;
  personalEmail: string | null;
  businessEmail: string | null;
  mobileNumber: string | null;
  hireDate: string | null;
  startDate: string | null;
  terminationDate: string | null;
};

export type ContractInfo = {
  contractId: number;
  contractNumber: string | null;
  startDate: string | null;
  endDate: string | null;
  salary: number | null;
  salaryCurrency: string | null;
  fulltime: boolean | null;
  active: boolean;
};

export type HistoryEntry = {
  employmentId: number;
  orgUnitName: string | null;
  positionTitle: string | null;
  reportingToName: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
};

export type EmployeeDetail = {
  employeeId: number;
  employeeNumber: string;
  userId: number | null;
  hireDate: string | null;
  startDate: string | null;
  terminationDate: string | null;
  employeeStatusId: number | null;
  statusCode: string | null;
  statusName: string | null;

  firstName: string | null;
  otherName: string | null;
  displayName: string | null;
  gender: number | null;
  genderLabel: string | null;
  birthDate: string | null;
  nationalId: string | null;
  nationalIdExpiryDate: string | null;
  militaryExemptionExpiryDate: string | null;
  qualification: string | null;

  personalEmail: string | null;
  businessEmail: string | null;
  phoneNumber: string | null;
  mobileNumber: string | null;

  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  profilePhotoDataUrl: string | null;

  currentOrgUnitId: number | null;
  department: string | null;
  branch: string | null;
  section: string | null;

  positionTitle: string | null;
  gradeName: string | null;
  gradeRank: number | null;

  manager: string | null;
  teamLeader: string | null;

  skills: string[];
  contracts: ContractInfo[];
  history: HistoryEntry[];
};

export type CreateEmployeeRequest = {
  userId?: number | null;

  employeeNumber: string;
  currentOrgUnitId?: number | null;
  employeeStatusId?: number | null;
  hireDate?: string | null;
  startDate?: string | null;

  firstName: string;
  otherName?: string | null;
  displayName?: string | null;
  gender?: number | null;
  birthDate?: string | null;
  nationalId?: string | null;
  nationalIdExpiryDate?: string | null;
  militaryExemptionExpiryDate?: string | null;
  qualification?: string | null;

  personalEmail?: string | null;
  businessEmail?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;

  countryId?: number | null;
  stateId?: number | null;
  cityId?: number | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  profilePhotoBase64?: string | null;
  skills?: string[] | null;

  positionId?: number | null;
  assignmentType?: number | null;
  positionStartDate?: string | null;
  positionEndDate?: string | null;
  reportingToEmployeeId?: number | null;

  contractTypeId?: number | null;
  contractNumber?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  salary?: number | null;
  salaryCurrency?: string | null;
  workingHoursPerWeek?: number | null;
  workingHoursPerMonth?: number | null;
  probationPeriodDays?: number | null;
  fulltime?: boolean | null;
};

export type UpdateEmployeeRequest = Omit<CreateEmployeeRequest, "userId"> & {
  terminationDate?: string | null;
  skills?: string[];
};

export type StatusRef = {
  id: number;
  code: string;
  name: string;
};

export type OrgUnitRef = {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  organizationId: number;
};

export type OrganizationRef = {
  id: number;
  code: string;
  name: string;
};
export type PositionRef = {
  id: number;
  code: string;
  title: string;
  orgUnitId: number;
};

export type ContractTypeRef = {
  id: number;
  code: string;
  name: string;
};

export async function listEmployees(): Promise<EmployeeSummary[]> {
  const response =
    await axiosInstance.get<EmployeeSummary[]>("/api/hr/employees");

  return response.data;
}

export async function getMyEmployee(): Promise<EmployeeSummary> {
  const response = await axiosInstance.get<EmployeeSummary>(
    "/api/hr/employees/me",
  );

  return response.data;
}

export async function getEmployeeDetail(
  employeeId: number,
): Promise<EmployeeDetail> {
  const response = await axiosInstance.get<EmployeeDetail>(
    `/api/hr/employees/${employeeId}`,
  );

  return response.data;
}

export async function createEmployee(
  data: CreateEmployeeRequest,
): Promise<number> {
  const response = await axiosInstance.post<number>("/api/hr/employees", data);

  return response.data;
}

export async function updateEmployee(
  employeeId: number,
  data: UpdateEmployeeRequest,
): Promise<void> {
  await axiosInstance.put(`/api/hr/employees/${employeeId}`, data);
}

export async function listStatuses(): Promise<StatusRef[]> {
  const response = await axiosInstance.get<StatusRef[]>("/api/hr/ref/statuses");

  return response.data;
}

export async function listOrgUnits(): Promise<OrgUnitRef[]> {
  const response = await axiosInstance.get<OrgUnitRef[]>(
    "/api/hr/ref/org-units",
  );

  return response.data;
}

export async function listOrganizations(): Promise<OrganizationRef[]> {
  const response = await axiosInstance.get<OrganizationRef[]>(
    "/api/hr/ref/organizations",
  );

  return response.data;
}

export async function listPositions(): Promise<PositionRef[]> {
  const response = await axiosInstance.get<PositionRef[]>(
    "/api/hr/ref/positions",
  );

  return response.data;
}

export async function listContractTypes(): Promise<ContractTypeRef[]> {
  const response = await axiosInstance.get<ContractTypeRef[]>(
    "/api/hr/ref/contract-types",
  );

  return response.data;
}
