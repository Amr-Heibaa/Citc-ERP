package com.citec.ems.hr.web;


import com.citec.ems.hr.application.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class HrDtos {

    private HrDtos() {
    }

    public record EmployeeCreateRequest(
            @NotBlank @Size(max = 50) String employeeNumber,
            Long userId,
            Long currentOrgUnitId,
            LocalDate hireDate,
            LocalDate startDate,
            Short employeeStatusId,
            @Valid EmployeeProfileRequest profile) {
    }

    public record EmployeeUpdateRequest(
            @Size(max = 50) String employeeNumber,
            Long userId,
            Long currentOrgUnitId,
            LocalDate hireDate,
            LocalDate startDate,
            LocalDate terminationDate,
            Short employeeStatusId) {
    }

    public record EmployeeProfileRequest(
            Boolean primary,
            @NotBlank @Size(max = 100) String firstName,
            @NotBlank @Size(max = 200) String otherName,
            @Size(max = 100) String displayName,
            @NotNull Short gender,
            LocalDate birthDate,
            @Size(max = 14) String nationalId,
            @Email @Size(max = 100) String personalEmail,
            @Email @Size(max = 100) String businessEmail,
            @Size(max = 100) String phoneNumber,
            @Size(max = 100) String mobileNumber,
            Short countryId,
            Integer stateId,
            Integer cityId,
            @Size(max = 255) String addressLine1,
            @Size(max = 255) String addressLine2,
            @Size(max = 20) String postalCode) {
    }

    public record EmployeeSummary(
            Long employeeId,
            String employeeNumber,
            Long userId,
            String username,
            Long currentOrgUnitId,
            String currentOrgUnitName,
            String statusCode,
            String displayName,
            String businessEmail,
            LocalDate hireDate,
            LocalDate startDate,
            LocalDate terminationDate) {
    }

    public record EmployeeDetail(
            EmployeeSummary employee,
            List<EmployeeProfileResponse> profiles,
            List<EmploymentContractResponse> contracts,
            List<PositionAssignmentResponse> positionAssignments,
            List<EmploymentRecordResponse> employmentRecords,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
    }

    public record EmployeeProfileResponse(
            Long profileId,
            Boolean primary,
            String firstName,
            String otherName,
            String displayName,
            Short gender,
            LocalDate birthDate,
            String nationalId,
            String personalEmail,
            String businessEmail,
            String phoneNumber,
            String mobileNumber,
            Short countryId,
            Integer stateId,
            Integer cityId,
            String addressLine1,
            String addressLine2,
            String postalCode) {
    }

    public record EmploymentContractRequest(
            Integer contractTypeId,
            @Size(max = 50) String contractNumber,
            @NotNull LocalDate startDate,
            LocalDate endDate,
            @DecimalMin("0.00") BigDecimal salary,
            @Size(max = 10) String salaryCurrency,
            BigDecimal workingHoursPerWeek,
            BigDecimal workingHoursPerMonth,
            Integer probationPeriodDays,
            Boolean fulltime,
            Boolean active) {
    }

    public record EmploymentContractResponse(
            Long contractId,
            Integer contractTypeId,
            String contractTypeCode,
            String contractNumber,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal salary,
            String salaryCurrency,
            BigDecimal workingHoursPerWeek,
            BigDecimal workingHoursPerMonth,
            Integer probationPeriodDays,
            Boolean fulltime,
            Boolean active) {
    }

    public record PositionAssignmentRequest(
            @NotNull Long positionId,
            Short assignmentType,
            Boolean primary,
            LocalDate startDate,
            LocalDate endDate,
            Boolean active,
            Long assignedByUserId) {
    }

    public record PositionAssignmentResponse(
            Long positionAssignmentId,
            Long positionId,
            String positionCode,
            String positionTitle,
            Short assignmentType,
            Boolean primary,
            LocalDate startDate,
            LocalDate endDate,
            Boolean active,
            Long assignedByUserId,
            LocalDateTime assignedAt) {
    }

    public record EmploymentRecordRequest(
            Long orgUnitId,
            Long positionId,
            Short recordType,
            @NotNull LocalDate startDate,
            LocalDate endDate,
            Long contractId,
            Long reportingToEmployeeId,
            Boolean current) {
    }

    public record EmploymentRecordResponse(
            Long employmentId,
            Long orgUnitId,
            String orgUnitName,
            Long positionId,
            String positionTitle,
            Short recordType,
            LocalDate startDate,
            LocalDate endDate,
            Long contractId,
            Long reportingToEmployeeId,
            Boolean current) {
    }

    public record EmployeeStatusResponse(Short employeeStatusId, String statusCode, String description) {
    }

    public record OrganizationCreateRequest(
            @NotBlank @Size(max = 100) String organizationCode,
            @NotBlank @Size(max = 255) String organizationNameEn,
            @NotBlank @Size(max = 255) String organizationNameAr,
            Boolean active) {
    }

    public record OrganizationResponse(
            Integer organizationId,
            String organizationCode,
            String organizationNameEn,
            String organizationNameAr,
            Boolean active) {
    }

    public record UnitTypeResponse(
            Integer unitTypeId,
            String unitCode,
            String unitNameEn,
            String unitNameAr,
            String description,
            String descriptionAr) {
    }

    public record OrganizationUnitCreateRequest(
            @NotNull Integer organizationId,
            @NotNull Integer unitTypeId,
            Long parentOrgUnitId,
            @NotBlank @Size(max = 50) String unitCode,
            @NotBlank @Size(max = 255) String unitName,
            @NotBlank @Size(max = 255) String unitNameAr,
            String description,
            String descriptionAr,
            LocalDate startDate,
            LocalDate endDate,
            Boolean active) {
    }

    public record OrganizationUnitResponse(
            Long orgUnitId,
            Integer organizationId,
            String organizationCode,
            Integer unitTypeId,
            String unitTypeCode,
            Long parentOrgUnitId,
            String unitCode,
            String unitName,
            String unitNameAr,
            LocalDate startDate,
            LocalDate endDate,
            Boolean active) {
    }

    public record JobGradeCreateRequest(
            @NotBlank @Size(max = 100) String gradeCode,
            @Size(max = 255) String gradeName,
            @NotNull Short gradeRank,
            Boolean active) {
    }

    public record JobGradeResponse(Long gradeId, String gradeCode, String gradeName, Short gradeRank, Boolean active) {
    }

    public record JobPositionCreateRequest(
            @NotBlank @Size(max = 100) String positionCode,
            @NotBlank @Size(max = 255) String positionTitle,
            @NotBlank @Size(max = 255) String positionTitleAr,
            @NotNull Long orgUnitId,
            Long gradeId,
            Integer positionLevel,
            Long reportsToPositionId,
            String positionDescription,
            String positionDescriptionAr,
            Boolean open,
            Boolean active) {
    }

    public record JobPositionResponse(
            Long positionId,
            String positionCode,
            String positionTitle,
            String positionTitleAr,
            Long orgUnitId,
            String orgUnitName,
            Long gradeId,
            String gradeCode,
            Integer positionLevel,
            Long reportsToPositionId,
            Boolean open,
            Boolean active) {
    }

    public record ContractTypeCreateRequest(
            @NotBlank @Size(max = 100) String contractTypeCode,
            @NotBlank @Size(max = 255) String contractTypeName,
            String description,
            Boolean active) {
    }

    public record ContractTypeResponse(
            Integer contractTypeId,
            String contractTypeCode,
            String contractTypeName,
            String description,
            Boolean active) {
    }
}




