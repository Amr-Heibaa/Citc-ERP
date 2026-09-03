import type { EmployeeDetail } from "@/lib/api/generated/model";

import i18n from "@/i18n";
import { formatDate } from "@/features/hr/shared/utils/format";
import { escapeHtml, printHtmlReport } from "@/features/hr/shared/utils/export";

function fullName(emp: EmployeeDetail) {
  return (
    emp.displayName ||
    [emp.firstName, emp.otherName].filter(Boolean).join(" ") ||
    "—"
  );
}

function field(label: string, value: unknown) {
  return `
    <div class="profile-field">
      <span class="profile-field-label">${escapeHtml(label)}</span>
      <span class="profile-field-value">${escapeHtml(value ?? "—") || "—"}</span>
    </div>
  `;
}

function contractsTable(emp: EmployeeDetail) {
  const contracts = emp.contracts ?? [];
  if (contracts.length === 0) {
    return `<p class="profile-empty">${escapeHtml(i18n.t("employees.profileExport.noContracts"))}</p>`;
  }

  const rows = contracts
    .map(
      (c) => `
        <tr>
          <td>${escapeHtml(c.contractNumber ?? "—")}</td>
          <td>${escapeHtml(c.contractTypeName ?? c.contractTypeCode ?? "—")}</td>
          <td>${escapeHtml(formatDate(c.startDate))}</td>
          <td>${escapeHtml(formatDate(c.endDate))}</td>
          <td>${escapeHtml(
            c.active
              ? i18n.t("employees.profileExport.contractActive")
              : i18n.t("employees.profileExport.contractEnded"),
          )}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>${escapeHtml(i18n.t("employees.profileExport.columns.contractNumber"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.type"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.start"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.end"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.status"))}</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function historyTable(emp: EmployeeDetail) {
  const history = emp.history ?? [];
  if (history.length === 0) {
    return `<p class="profile-empty">${escapeHtml(i18n.t("employees.profileExport.noHistory"))}</p>`;
  }

  const rows = history
    .map(
      (h) => `
        <tr>
          <td>${escapeHtml(h.orgUnitName ?? "—")}</td>
          <td>${escapeHtml(h.positionTitle ?? "—")}</td>
          <td>${escapeHtml(h.reportingToName ?? "—")}</td>
          <td>${escapeHtml(formatDate(h.startDate))}</td>
          <td>${escapeHtml(h.current ? i18n.t("employees.profileExport.current") : formatDate(h.endDate))}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>${escapeHtml(i18n.t("employees.profileExport.columns.unit"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.position"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.reportsTo"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.start"))}</th><th>${escapeHtml(i18n.t("employees.profileExport.columns.end"))}</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function profileSectionHtml(emp: EmployeeDetail) {
  const name = fullName(emp);
  const subtitle = [emp.positionTitle, emp.department].filter(Boolean).join(" · ");
  const photo = emp.profilePhotoDataUrl
    ? `<img src="${emp.profilePhotoDataUrl}" alt="${escapeHtml(name)}" class="profile-photo" />`
    : `<div class="profile-photo profile-photo-placeholder">${escapeHtml(
        name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      )}</div>`;

  const field2 = (key: string, value: unknown) =>
    field(i18n.t(`employees.profileExport.fields.${key}`), value);

  return `
    <section class="profile-section">
      <div class="profile-banner">
        ${photo}
        <div>
          <h2 class="profile-name">${escapeHtml(name)}</h2>
          <p class="profile-subtitle">${escapeHtml(subtitle || "—")}</p>
          <p class="profile-subtitle">${escapeHtml(i18n.t("employees.profileExport.employeeNumberPrefix"))}${escapeHtml(emp.employeeNumber ?? "—")} · ${escapeHtml(emp.statusName ?? emp.statusCode ?? "—")}</p>
        </div>
      </div>

      <h3 class="profile-heading">${escapeHtml(i18n.t("employees.profileExport.personalInformation"))}</h3>
      <div class="profile-grid">
        ${field2("fullName", name)}
        ${field2("gender", emp.genderLabel)}
        ${field2("birthDate", formatDate(emp.birthDate))}
        ${field2("nationalId", emp.nationalId)}
        ${field2("maritalStatus", emp.maritalStatus)}
        ${field2("qualification", emp.qualification)}
        ${field2("specialization", emp.specialization)}
        ${field2("personalEmail", emp.personalEmail)}
        ${field2("businessEmail", emp.businessEmail)}
        ${field2("mobile", emp.mobileNumber)}
        ${field2("phone", emp.phoneNumber)}
        ${field2("address", [emp.addressLine1, emp.addressLine2].filter(Boolean).join(", "))}
      </div>

      <h3 class="profile-heading">${escapeHtml(i18n.t("employees.profileExport.employment"))}</h3>
      <div class="profile-grid">
        ${field2("department", emp.department)}
        ${field2("branch", emp.branch)}
        ${field2("section", emp.section)}
        ${field2("position", emp.positionTitle)}
        ${field2("grade", emp.gradeName)}
        ${field2("manager", emp.manager)}
        ${field2("teamLeader", emp.teamLeader)}
        ${field2("hireDate", formatDate(emp.hireDate))}
        ${field2("startDate", formatDate(emp.startDate))}
        ${field2("terminationDate", formatDate(emp.terminationDate))}
        ${field2("workLocation", emp.workLocation)}
        ${field2("totalExperienceYears", emp.totalExperienceYears)}
      </div>

      <h3 class="profile-heading">${escapeHtml(i18n.t("employees.profileExport.skills"))}</h3>
      <p class="profile-skills">${
        emp.skills && emp.skills.length > 0
          ? emp.skills.map(escapeHtml).join(", ")
          : escapeHtml(i18n.t("employees.profileExport.noSkills"))
      }</p>

      <h3 class="profile-heading">${escapeHtml(i18n.t("employees.profileExport.contracts"))}</h3>
      ${contractsTable(emp)}

      <h3 class="profile-heading">${escapeHtml(i18n.t("employees.profileExport.employmentHistory"))}</h3>
      ${historyTable(emp)}
    </section>
  `;
}

const PROFILE_STYLES = `
  .profile-section {
    page-break-after: always;
    padding-top: 8px;
  }

  .profile-section:last-child {
    page-break-after: avoid;
  }

  .profile-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
  }

  .profile-photo {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    object-fit: cover;
    border: 2px solid #f5841f;
  }

  .profile-photo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a2535;
    color: white;
    font-weight: 700;
    font-size: 20px;
  }

  .profile-name {
    margin: 0;
    font-size: 18px;
  }

  .profile-subtitle {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 12px;
  }

  .profile-heading {
    margin: 18px 0 8px;
    font-size: 13px;
    color: #1a2535;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 24px;
  }

  .profile-field {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px dashed #f0f1f3;
    font-size: 11.5px;
  }

  .profile-field-label {
    color: #6b7280;
  }

  .profile-field-value {
    font-weight: 600;
    color: #1a2535;
    text-align: right;
  }

  .profile-skills {
    font-size: 11.5px;
    color: #1a2535;
  }

  .profile-empty {
    font-size: 11.5px;
    color: #9ca3af;
  }
`;

export function printEmployeeProfiles(
  employees: EmployeeDetail[],
  options?: { title?: string; subtitle?: string },
) {
  if (employees.length === 0) return;

  const bodyHtml = `
    <style>${PROFILE_STYLES}</style>
    ${employees.map(profileSectionHtml).join("")}
  `;

  printHtmlReport({
    title:
      options?.title ??
      (employees.length === 1 ? fullName(employees[0]) : i18n.t("employees.export.employeeProfiles")),
    subtitle: options?.subtitle,
    bodyHtml,
    orientation: "portrait",
  });
}
