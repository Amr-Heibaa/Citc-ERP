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
const SECURITY: Crumb = { label: "breadcrumbs.security", to: "/security" };
const SECURITY_USERS: Crumb = { label: "breadcrumbs.securityUsers", to: "/security/users" };
const SECURITY_ROLES: Crumb = { label: "breadcrumbs.securityRoles", to: "/security/roles" };
const SECURITY_PERMISSIONS: Crumb = {
  label: "breadcrumbs.securityPermissions",
  to: "/security/permissions",
};
const SECURITY_MODULES: Crumb = { label: "breadcrumbs.securityModules", to: "/security/modules" };

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

  { pattern: /^\/security$/, build: () => [{ label: "breadcrumbs.security" }] },
  {
    pattern: /^\/security\/users$/,
    build: () => [SECURITY, { label: "breadcrumbs.securityUsers" }],
  },
  {
    pattern: /^\/security\/users\/(\d+)\/assign-roles$/,
    build: ([id]) => [
      SECURITY,
      SECURITY_USERS,
      { label: "breadcrumbs.securityUserDetails", to: `/security/users/${id}` },
      { label: "breadcrumbs.securityAssignRoles" },
    ],
  },
  {
    pattern: /^\/security\/users\/(\d+)$/,
    build: () => [SECURITY, SECURITY_USERS, { label: "breadcrumbs.securityUserDetails" }],
  },
  {
    pattern: /^\/security\/roles$/,
    build: () => [SECURITY, { label: "breadcrumbs.securityRoles" }],
  },
  {
    pattern: /^\/security\/roles\/(\d+)$/,
    build: () => [SECURITY, SECURITY_ROLES, { label: "breadcrumbs.securityRoleDetails" }],
  },
  {
    pattern: /^\/security\/permissions$/,
    build: () => [SECURITY, { label: "breadcrumbs.securityPermissions" }],
  },
  {
    pattern: /^\/security\/permissions\/(\d+)$/,
    build: () => [
      SECURITY,
      SECURITY_PERMISSIONS,
      { label: "breadcrumbs.securityPermissionDetails" },
    ],
  },
  {
    pattern: /^\/security\/modules$/,
    build: () => [SECURITY, { label: "breadcrumbs.securityModules" }],
  },
  {
    pattern: /^\/security\/modules\/(\d+)$/,
    build: () => [SECURITY, SECURITY_MODULES, { label: "breadcrumbs.securityModuleDetails" }],
  },
  {
    pattern: /^\/security\/audit-logs$/,
    build: () => [SECURITY, { label: "breadcrumbs.securityAuditLogs" }],
  },
];

export function getBreadcrumbs(pathname: string): Crumb[] {
  for (const rule of rules) {
    const match = rule.pattern.exec(pathname);
    if (match) return rule.build(match.slice(1));
  }
  return [];
}
