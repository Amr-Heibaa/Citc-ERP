export type Crumb = {
  label: string;
  to?: string;
};

const HR: Crumb = { label: "HR", to: "/hr" };
const EMPLOYEES: Crumb = { label: "Employees", to: "/hr/employees" };
const ORGANIZATIONS: Crumb = { label: "Organizations", to: "/hr/organizations" };
const JOBS: Crumb = { label: "Jobs", to: "/hr/jobs" };
const POSITIONS: Crumb = { label: "Positions", to: "/hr/jobs/positions" };
const EMPLOYMENT: Crumb = { label: "Employment", to: "/hr/employment" };
const HR_SETTINGS: Crumb = { label: "HR Settings", to: "/hr/settings" };
const HR_REPORTS: Crumb = { label: "Reports", to: "/hr/reports" };

type Rule = {
  pattern: RegExp;
  build: (params: string[]) => Crumb[];
};

const rules: Rule[] = [
  { pattern: /^\/$/, build: () => [{ label: "Dashboard" }] },
  { pattern: /^\/notifications$/, build: () => [{ label: "Notifications" }] },
  { pattern: /^\/requests$/, build: () => [{ label: "Requests" }] },
  {
    pattern: /^\/requests\/new$/,
    build: () => [
      { label: "Requests", to: "/requests" },
      { label: "New Request" },
    ],
  },
  { pattern: /^\/projects$/, build: () => [{ label: "Projects" }] },
  { pattern: /^\/reports$/, build: () => [{ label: "Reports" }] },
  { pattern: /^\/settings$/, build: () => [{ label: "Settings" }] },

  { pattern: /^\/hr$/, build: () => [{ label: "HR" }] },

  { pattern: /^\/hr\/employees$/, build: () => [HR, { label: "Employees" }] },
  {
    pattern: /^\/hr\/employees\/new$/,
    build: () => [HR, EMPLOYEES, { label: "Create Employee" }],
  },
  {
    pattern: /^\/hr\/employees\/deleted$/,
    build: () => [HR, EMPLOYEES, { label: "Deleted Employees" }],
  },
  {
    pattern: /^\/hr\/employees\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      EMPLOYEES,
      { label: "Employee Details", to: `/hr/employees/${id}` },
      { label: "Edit Employee" },
    ],
  },
  {
    pattern: /^\/hr\/employees\/(\d+)$/,
    build: () => [HR, EMPLOYEES, { label: "Employee Details" }],
  },

  {
    pattern: /^\/hr\/organizations$/,
    build: () => [HR, { label: "Organizations" }],
  },
  {
    pattern: /^\/hr\/organizations\/new$/,
    build: () => [HR, ORGANIZATIONS, { label: "Create Organization" }],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      ORGANIZATIONS,
      { label: "Organization Details", to: `/hr/organizations/${id}` },
      { label: "Edit Organization" },
    ],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)\/units\/(\d+)$/,
    build: ([id]) => [
      HR,
      ORGANIZATIONS,
      { label: "Organization Details", to: `/hr/organizations/${id}` },
      { label: "Unit Details" },
    ],
  },
  {
    pattern: /^\/hr\/organizations\/(\d+)$/,
    build: () => [HR, ORGANIZATIONS, { label: "Organization Details" }],
  },

  { pattern: /^\/hr\/jobs$/, build: () => [HR, { label: "Jobs" }] },
  {
    pattern: /^\/hr\/jobs\/grades$/,
    build: () => [HR, JOBS, { label: "Job Grades" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions$/,
    build: () => [HR, JOBS, { label: "Positions" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/new$/,
    build: () => [HR, JOBS, POSITIONS, { label: "Create Position" }],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/(\d+)\/edit$/,
    build: ([id]) => [
      HR,
      JOBS,
      POSITIONS,
      { label: "Position Details", to: `/hr/jobs/positions/${id}` },
      { label: "Edit Position" },
    ],
  },
  {
    pattern: /^\/hr\/jobs\/positions\/(\d+)$/,
    build: () => [HR, JOBS, POSITIONS, { label: "Position Details" }],
  },

  {
    pattern: /^\/hr\/employment$/,
    build: () => [HR, { label: "Employment" }],
  },
  {
    pattern: /^\/hr\/employment\/records$/,
    build: () => [HR, EMPLOYMENT, { label: "Employment Records" }],
  },

  {
    pattern: /^\/hr\/settings$/,
    build: () => [HR, { label: "HR Settings" }],
  },
  {
    pattern: /^\/hr\/settings\/history$/,
    build: () => [HR, HR_SETTINGS, { label: "History" }],
  },
  {
    pattern: /^\/hr\/settings\/employee-statuses$/,
    build: () => [HR, HR_SETTINGS, { label: "Employee Statuses" }],
  },
  {
    pattern: /^\/hr\/settings\/contract-types$/,
    build: () => [HR, HR_SETTINGS, { label: "Contract Types" }],
  },
  {
    pattern: /^\/hr\/settings\/skills$/,
    build: () => [HR, HR_SETTINGS, { label: "Skills" }],
  },
  {
    pattern: /^\/hr\/settings\/functional-relation-types$/,
    build: () => [HR, HR_SETTINGS, { label: "Functional Relation Types" }],
  },
  {
    pattern: /^\/hr\/settings\/access-delegation$/,
    build: () => [HR, HR_SETTINGS, { label: "Access Delegation" }],
  },

  { pattern: /^\/hr\/reports$/, build: () => [HR, { label: "Reports" }] },
  {
    pattern: /^\/hr\/reports\/hires-resignations$/,
    build: () => [HR, HR_REPORTS, { label: "Hires & Resignations" }],
  },
  {
    pattern: /^\/hr\/reports\/contract-types$/,
    build: () => [HR, HR_REPORTS, { label: "Contract Types" }],
  },
];

export function getBreadcrumbs(pathname: string): Crumb[] {
  for (const rule of rules) {
    const match = rule.pattern.exec(pathname);
    if (match) return rule.build(match.slice(1));
  }
  return [];
}
