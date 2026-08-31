export type Crumb = {
  /** i18n key, resolved via t() in BreadcrumbNav. */
  label: string;
  to?: string;
};

const HR: Crumb = { label: "breadcrumbs.hr", to: "/hr" };
const EMPLOYEES: Crumb = { label: "breadcrumbs.employees", to: "/hr/employees" };
const ORGANIZATIONS: Crumb = { label: "breadcrumbs.organizations", to: "/hr/organizations" };
const JOBS: Crumb = { label: "breadcrumbs.jobs", to: "/hr/jobs" };
const POSITIONS: Crumb = { label: "breadcrumbs.positions", to: "/hr/jobs/positions" };
const EMPLOYMENT: Crumb = { label: "breadcrumbs.employment", to: "/hr/employment" };
const HR_SETTINGS: Crumb = { label: "breadcrumbs.hrSettings", to: "/hr/settings" };
const HR_REPORTS: Crumb = { label: "breadcrumbs.reports", to: "/hr/reports" };

type Rule = {
  pattern: RegExp;
  build: (params: string[]) => Crumb[];
};

const rules: Rule[] = [
  { pattern: /^\/$/, build: () => [{ label: "breadcrumbs.dashboard" }] },
  { pattern: /^\/notifications$/, build: () => [{ label: "breadcrumbs.notifications" }] },
  { pattern: /^\/requests$/, build: () => [{ label: "breadcrumbs.requests" }] },
  {
    pattern: /^\/requests\/new$/,
    build: () => [
      { label: "breadcrumbs.requests", to: "/requests" },
      { label: "breadcrumbs.newRequest" },
    ],
  },
  { pattern: /^\/projects$/, build: () => [{ label: "breadcrumbs.projects" }] },
  { pattern: /^\/reports$/, build: () => [{ label: "breadcrumbs.reports" }] },
  { pattern: /^\/settings$/, build: () => [{ label: "breadcrumbs.settings" }] },

  { pattern: /^\/hr$/, build: () => [{ label: "breadcrumbs.hr" }] },

  { pattern: /^\/hr\/employees$/, build: () => [HR, { label: "breadcrumbs.employees" }] },
  {
    pattern: /^\/hr\/employees\/new$/,
    build: () => [HR, EMPLOYEES, { label: "breadcrumbs.createEmployee" }],
  },
  {
    pattern: /^\/hr\/employees\/deleted$/,
    build: () => [HR, EMPLOYEES, { label: "breadcrumbs.deletedEmployees" }],
  },
  {
    pattern: /^\/hr\/employees\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      EMPLOYEES,
      { label: "breadcrumbs.employeeDetails", to: `/hr/employees/${id}` },
      { label: "breadcrumbs.editEmployee" },
    ],
  },
  {
    pattern: /^\/hr\/employees\/(\d+)$/,
    build: () => [HR, EMPLOYEES, { label: "breadcrumbs.employeeDetails" }],
  },

  {
    pattern: /^\/hr\/organizations$/,
    build: () => [HR, { label: "breadcrumbs.organizations" }],
  },
  {
    pattern: /^\/hr\/organizations\/new$/,
    build: () => [HR, ORGANIZATIONS, { label: "breadcrumbs.createOrganization" }],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      ORGANIZATIONS,
      { label: "breadcrumbs.organizationDetails", to: `/hr/organizations/${id}` },
      { label: "breadcrumbs.editOrganization" },
    ],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)\/units\/(\d+)$/,
    build: ([id]) => [
      HR,
      ORGANIZATIONS,
      { label: "breadcrumbs.organizationDetails", to: `/hr/organizations/${id}` },
      { label: "breadcrumbs.unitDetails" },
    ],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)$/,
    build: () => [HR, ORGANIZATIONS, { label: "breadcrumbs.organizationDetails" }],
  },

  { pattern: /^\/hr\/jobs$/, build: () => [HR, { label: "breadcrumbs.jobs" }] },
  {
    pattern: /^\/hr\/jobs\/grades$/,
    build: () => [HR, JOBS, { label: "breadcrumbs.jobGrades" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions$/,
    build: () => [HR, JOBS, { label: "breadcrumbs.positions" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/new$/,
    build: () => [HR, JOBS, POSITIONS, { label: "breadcrumbs.createPosition" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      JOBS,
      POSITIONS,
      { label: "breadcrumbs.positionDetails", to: `/hr/jobs/positions/${id}` },
      { label: "breadcrumbs.editPosition" },
    ],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/(\d+)$/,
    build: () => [HR, JOBS, POSITIONS, { label: "breadcrumbs.positionDetails" }],
  },

  {
    pattern: /^\/hr\/employment$/,
    build: () => [HR, { label: "breadcrumbs.employment" }],
  },
  {
    pattern: /^\/hr\/employment\/records$/,
    build: () => [HR, EMPLOYMENT, { label: "breadcrumbs.employmentRecords" }],
  },

  {
    pattern: /^\/hr\/settings$/,
    build: () => [HR, { label: "breadcrumbs.hrSettings" }],
  },
  {
    pattern: /^\/hr\/settings\/history$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.history" }],
  },
  {
    pattern: /^\/hr\/settings\/employee-statuses$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.employeeStatuses" }],
  },
  {
    pattern: /^\/hr\/settings\/contract-types$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.contractTypes" }],
  },
  {
    pattern: /^\/hr\/settings\/skills$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.skills" }],
  },
  {
    pattern: /^\/hr\/settings\/functional-relation-types$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.functionalRelationTypes" }],
  },
  {
    pattern: /^\/hr\/settings\/access-delegation$/,
    build: () => [HR, HR_SETTINGS, { label: "breadcrumbs.accessDelegation" }],
  },

  { pattern: /^\/hr\/reports$/, build: () => [HR, { label: "breadcrumbs.reports" }] },
  {
    pattern: /^\/hr\/reports\/hires-resignations$/,
    build: () => [HR, HR_REPORTS, { label: "breadcrumbs.hiresAndResignations" }],
  },
  {
    pattern: /^\/hr\/reports\/contract-types$/,
    build: () => [HR, HR_REPORTS, { label: "breadcrumbs.contractTypes" }],
  },
];

export function getBreadcrumbs(pathname: string): Crumb[] {
  for (const rule of rules) {
    const match = rule.pattern.exec(pathname);
    if (match) return rule.build(match.slice(1));
  }
  return [];
}
