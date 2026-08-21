src/features/hr/
  pages/
    hr-home-page.tsx           # HR module landing page

  shared/                      # genuinely generic building blocks reused across sub-features
    components/
      info-row.tsx              # InfoRow, SectionTitle
      edit-section.tsx
      select-field.tsx          # shadcn Select + RHF Controller wrapper
    utils/
      format.ts                 # formatDate, initials

  employees/
    api/
      use-employees.ts          # composed hooks over lib/api/generated/ems/employee-controller etc.
      query-keys.ts
      import-row-types.ts       # documented workaround for a backend OpenAPI bug (see file header)
    schemas/
      employee-schema.ts        # zod validation
      employee-mappers.ts       # form values <-> generated request/response types
    store/
      employee-wizard-store.ts
      employees-filters-store.ts
    forms/
      identity-step-form.tsx
      personal-info-step-form.tsx
      employment-step-form.tsx
      position-step-form.tsx
      contract-step-form.tsx
    components/
      employee-status-badge.tsx
      employees-table.tsx
      employees-filters-bar.tsx
      employees-export-dialog.tsx
      employee-import-dialog.tsx
      employee-contract-import-dialog.tsx
      employee-create-wizard.tsx
      employee-edit-form.tsx
      employee-detail-hero.tsx
      employee-detail-tabs.tsx
      employee-overview-tab.tsx
      employee-personal-tab.tsx
      employee-employment-tab.tsx
      employee-contracts-tab.tsx
      employee-history-tab.tsx
      wizard-header.tsx
      wizard-footer.tsx
      wizard-field.tsx
      wizard-design-art.tsx
    pages/
      employees-page.tsx
      employee-detail-page.tsx
      employee-create-page.tsx
      employee-edit-page.tsx
    utils/
      egyptian-national-id.ts
      employee-export.ts

  organizations/
    api/
      use-organizations.ts      # composed hooks over lib/api/generated/ems/organization-controller etc.
      query-keys.ts
    schemas/
      organization-schema.ts
      organization-mappers.ts
    store/
      organizations-filters-store.ts
    components/
      organization-status-badge.tsx
      organizations-table.tsx (or cards)
      organizations-filters-bar.tsx
      organization-form.tsx     # shared create/edit form body
      organization-logo-upload.tsx
    pages/
      organizations-page.tsx
      organization-detail-page.tsx
      organization-create-page.tsx
      organization-edit-page.tsx

Rule: every sub-feature (employees/, organizations/, and whatever comes next —
units, jobs, employment) only imports from its own folder or from
features/hr/shared/. Nothing crosses between sub-features directly.
