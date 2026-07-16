package com.citec.ems.hr.application;


import com.citec.ems.hr.domain.*;
import com.citec.ems.hr.infrastructure.*;
import com.citec.ems.shared.BadRequestException;
import com.citec.ems.shared.NotFoundException;
import com.citec.ems.shared.TextNormalizer;
import com.citec.ems.hr.web.HrDtos.EmployeeCreateRequest;
import com.citec.ems.hr.web.HrDtos.EmployeeDetail;
import com.citec.ems.hr.web.HrDtos.EmployeeProfileRequest;
import com.citec.ems.hr.web.HrDtos.EmployeeProfileResponse;
import com.citec.ems.hr.web.HrDtos.EmployeeSummary;
import com.citec.ems.hr.web.HrDtos.EmployeeUpdateRequest;
import com.citec.ems.hr.web.HrDtos.EmploymentContractRequest;
import com.citec.ems.hr.web.HrDtos.EmploymentContractResponse;
import com.citec.ems.hr.web.HrDtos.EmploymentRecordRequest;
import com.citec.ems.hr.web.HrDtos.EmploymentRecordResponse;
import com.citec.ems.hr.web.HrDtos.PositionAssignmentRequest;
import com.citec.ems.hr.web.HrDtos.PositionAssignmentResponse;
import com.citec.ems.iam.UserAccountSummary;
import com.citec.ems.iam.UserAccounts;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final EmployeeStatusRepository employeeStatusRepository;
    private final OrganizationUnitRepository organizationUnitRepository;
    private final JobPositionRepository jobPositionRepository;
    private final ContractTypeRepository contractTypeRepository;
    private final EmploymentContractRepository employmentContractRepository;
    private final PositionAssignmentRepository positionAssignmentRepository;
    private final EmploymentRecordRepository employmentRecordRepository;
    private final UserAccounts userAccounts;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            EmployeeProfileRepository employeeProfileRepository,
            EmployeeStatusRepository employeeStatusRepository,
            OrganizationUnitRepository organizationUnitRepository,
            JobPositionRepository jobPositionRepository,
            ContractTypeRepository contractTypeRepository,
            EmploymentContractRepository employmentContractRepository,
            PositionAssignmentRepository positionAssignmentRepository,
            EmploymentRecordRepository employmentRecordRepository,
            UserAccounts userAccounts) {
        this.employeeRepository = employeeRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.employeeStatusRepository = employeeStatusRepository;
        this.organizationUnitRepository = organizationUnitRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.contractTypeRepository = contractTypeRepository;
        this.employmentContractRepository = employmentContractRepository;
        this.positionAssignmentRepository = positionAssignmentRepository;
        this.employmentRecordRepository = employmentRecordRepository;
        this.userAccounts = userAccounts;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeSummary> listEmployees(String q, Long orgUnitId, String statusCode, Pageable pageable) {
        Page<Employee> page = employeeRepository.search(blankToNull(q), orgUnitId, blankToNull(statusCode), pageable);
        List<Employee> employees = page.getContent();
        if (employees.isEmpty()) {
            return page.map(employee -> employeeSummary(employee, null, null));
        }

        // ONE query for every primary profile on this page
        Map<Long, EmployeeProfile> profilesByEmployeeId = employeeProfileRepository
                .findPrimaryProfilesByEmployeeIds(employees.stream().map(Employee::getEmployeeId).toList())
                .stream()
                .collect(Collectors.toMap(
                        profile -> profile.getEmployee().getEmployeeId(),
                        profile -> profile,
                        (first, second) -> first));

        // ONE query for every linked user account on this page
        Set<Long> userIds = employees.stream()
                .map(Employee::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, UserAccountSummary> usersById = userAccounts.findSummaries(userIds);

        return page.map(employee -> employeeSummary(
                employee,
                profilesByEmployeeId.get(employee.getEmployeeId()),
                employee.getUserId() == null ? null : usersById.get(employee.getUserId())));
    }

    @Transactional(readOnly = true)
    public EmployeeDetail getEmployee(Long employeeId) {
        Employee employee = getEmployeeEntity(employeeId);
        return new EmployeeDetail(
                employeeSummary(employee),
                employeeProfileRepository.findByEmployeeEmployeeIdOrderByPrimaryProfileDescCreatedAtDesc(employeeId)
                        .stream().map(this::profileResponse).toList(),
                employmentContractRepository.findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId)
                        .stream().map(this::contractResponse).toList(),
                positionAssignmentRepository.findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId)
                        .stream().map(this::assignmentResponse).toList(),
                employmentRecordRepository.findByEmployeeEmployeeIdOrderByStartDateDesc(employeeId)
                        .stream().map(this::recordResponse).toList(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }

    /** Self-service: returns the employee record linked to the given user account. */
    @Transactional(readOnly = true)
    public EmployeeSummary getMyEmployee(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No employee record is linked to this user."));
        return employeeSummary(employee);
    }

    @Transactional
    public EmployeeSummary createEmployee(EmployeeCreateRequest request) {
        String employeeNumber = TextNormalizer.code(request.employeeNumber());
        employeeRepository.findByEmployeeNumberIgnoreCase(employeeNumber).ifPresent(employee -> {
            throw new BadRequestException("Employee number already exists.");
        });
        Employee employee = new Employee();
        employee.setEmployeeNumber(employeeNumber);
        employee.setUserId(request.userId() == null ? null : requireUserId(request.userId()));
        employee.setCurrentOrgUnit(request.currentOrgUnitId() == null ? null : getOrgUnit(request.currentOrgUnitId()));
        employee.setHireDate(request.hireDate());
        employee.setStartDate(request.startDate());
        employee.setStatus(resolveStatus(request.employeeStatusId()));
        Employee saved = employeeRepository.save(employee);

        if (request.profile() != null) {
            EmployeeProfile profile = buildProfile(saved, request.profile());
            profile.setPrimaryProfile(request.profile().primary() == null || request.profile().primary());
            employeeProfileRepository.save(profile);
        }
        return employeeSummary(saved);
    }

    @Transactional
    public EmployeeSummary updateEmployee(Long employeeId, EmployeeUpdateRequest request) {
        Employee employee = getEmployeeEntity(employeeId);
        if (request.employeeNumber() != null) {
            String employeeNumber = TextNormalizer.code(request.employeeNumber());
            if (!employeeNumber.equalsIgnoreCase(employee.getEmployeeNumber())) {
                employeeRepository.findByEmployeeNumberIgnoreCase(employeeNumber).ifPresent(existing -> {
                    throw new BadRequestException("Employee number already exists.");
                });
                employee.setEmployeeNumber(employeeNumber);
            }
        }
        if (request.userId() != null) {
            employee.setUserId(requireUserId(request.userId()));
        }
        if (request.currentOrgUnitId() != null) {
            employee.setCurrentOrgUnit(getOrgUnit(request.currentOrgUnitId()));
        }
        if (request.hireDate() != null) {
            employee.setHireDate(request.hireDate());
        }
        if (request.startDate() != null) {
            employee.setStartDate(request.startDate());
        }
        if (request.terminationDate() != null) {
            employee.setTerminationDate(request.terminationDate());
        }
        if (request.employeeStatusId() != null) {
            employee.setStatus(resolveStatus(request.employeeStatusId()));
        }
        return employeeSummary(employee);
    }

    @Transactional
    public EmployeeProfileResponse addProfile(Long employeeId, EmployeeProfileRequest request) {
        Employee employee = getEmployeeEntity(employeeId);
        boolean primary = request.primary() == null || request.primary();
        if (primary) {
            employeeProfileRepository.findFirstByEmployeeEmployeeIdAndPrimaryProfileTrue(employeeId)
                    .ifPresent(existing -> existing.setPrimaryProfile(false));
        }
        EmployeeProfile profile = buildProfile(employee, request);
        profile.setPrimaryProfile(primary);
        return profileResponse(employeeProfileRepository.save(profile));
    }

    @Transactional
    public EmploymentContractResponse addContract(Long employeeId, EmploymentContractRequest request) {
        Employee employee = getEmployeeEntity(employeeId);
        EmploymentContract contract = new EmploymentContract();
        contract.setEmployee(employee);
        contract.setContractType(request.contractTypeId() == null ? null : getContractType(request.contractTypeId()));
        contract.setContractNumber(TextNormalizer.code(request.contractNumber()));
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setSalary(request.salary());
        String currency = TextNormalizer.code(request.salaryCurrency());
        contract.setSalaryCurrency(currency == null ? "EGP" : currency);
        contract.setWorkingHoursPerWeek(request.workingHoursPerWeek());
        contract.setWorkingHoursPerMonth(request.workingHoursPerMonth());
        contract.setProbationPeriodDays(request.probationPeriodDays());
        contract.setFulltime(request.fulltime());
        contract.setActive(request.active() == null || request.active());
        return contractResponse(employmentContractRepository.save(contract));
    }

    @Transactional
    public PositionAssignmentResponse addPositionAssignment(Long employeeId, PositionAssignmentRequest request) {
        Employee employee = getEmployeeEntity(employeeId);
        JobPosition position = getPosition(request.positionId());
        PositionAssignment assignment = new PositionAssignment();
        assignment.setEmployee(employee);
        assignment.setPosition(position);
        assignment.setAssignmentType(request.assignmentType() == null ? (short) 1 : request.assignmentType());
        assignment.setPrimaryAssignment(request.primary() == null || request.primary());
        assignment.setStartDate(request.startDate() == null ? LocalDate.now() : request.startDate());
        assignment.setEndDate(request.endDate());
        assignment.setActive(request.active() == null || request.active());
        assignment.setAssignedByUserId(request.assignedByUserId() == null ? null : requireUserId(request.assignedByUserId()));
        assignment.setAssignedAt(LocalDateTime.now());
        if (Boolean.TRUE.equals(assignment.getActive()) && Boolean.TRUE.equals(assignment.getPrimaryAssignment())) {
            employee.setCurrentOrgUnit(position.getOrgUnit());
        }
        return assignmentResponse(positionAssignmentRepository.save(assignment));
    }

    @Transactional
    public EmploymentRecordResponse addEmploymentRecord(Long employeeId, EmploymentRecordRequest request) {
        Employee employee = getEmployeeEntity(employeeId);
        boolean current = request.current() == null || request.current();
        if (current) {
            employmentRecordRepository.findFirstByEmployeeEmployeeIdAndCurrentTrue(employeeId)
                    .ifPresent(existing -> {
                        existing.setCurrent(false);
                        if (existing.getEndDate() == null) {
                            existing.setEndDate(request.startDate().minusDays(1));
                        }
                    });
        }
        EmploymentRecord record = new EmploymentRecord();
        record.setEmployee(employee);
        record.setOrgUnit(request.orgUnitId() == null ? null : getOrgUnit(request.orgUnitId()));
        record.setPosition(request.positionId() == null ? null : getPosition(request.positionId()));
        record.setRecordType(request.recordType());
        record.setStartDate(request.startDate());
        record.setEndDate(request.endDate());
        record.setContract(request.contractId() == null ? null : getContract(request.contractId()));
        record.setReportingTo(request.reportingToEmployeeId() == null ? null : getEmployeeEntity(request.reportingToEmployeeId()));
        record.setCurrent(current);
        if (current && record.getOrgUnit() != null) {
            employee.setCurrentOrgUnit(record.getOrgUnit());
        }
        return recordResponse(employmentRecordRepository.save(record));
    }

    private EmployeeProfile buildProfile(Employee employee, EmployeeProfileRequest request) {
        EmployeeProfile profile = new EmployeeProfile();
        profile.setEmployee(employee);
        profile.setFirstName(TextNormalizer.trim(request.firstName()));
        profile.setOtherName(TextNormalizer.trim(request.otherName()));
        profile.setDisplayName(TextNormalizer.trim(request.displayName()));
        profile.setGender(request.gender());
        profile.setBirthDate(request.birthDate());
        profile.setNationalId(TextNormalizer.trim(request.nationalId()));
        profile.setPersonalEmail(TextNormalizer.email(request.personalEmail()));
        profile.setBusinessEmail(TextNormalizer.email(request.businessEmail()));
        profile.setPhoneNumber(TextNormalizer.trim(request.phoneNumber()));
        profile.setMobileNumber(TextNormalizer.trim(request.mobileNumber()));
        profile.setCountryId(request.countryId());
        profile.setStateId(request.stateId());
        profile.setCityId(request.cityId());
        profile.setAddressLine1(TextNormalizer.trim(request.addressLine1()));
        profile.setAddressLine2(TextNormalizer.trim(request.addressLine2()));
        profile.setPostalCode(TextNormalizer.trim(request.postalCode()));
        return profile;
    }
    private EmployeeStatus resolveStatus(Short statusId) {
        if (statusId != null) {
            return employeeStatusRepository.findById(statusId)
                    .orElseThrow(() -> new NotFoundException("Employee status was not found."));
        }
        return employeeStatusRepository.findByStatusCodeIgnoreCase(EmployeeStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("ACTIVE employee status was not found."));
    }

    private Employee getEmployeeEntity(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee was not found."));
    }

    private Long requireUserId(Long userId) {
        if (!userAccounts.existsById(userId)) {
            throw new NotFoundException("User was not found.");
        }
        return userId;
    }

    private OrganizationUnit getOrgUnit(Long orgUnitId) {
        return organizationUnitRepository.findById(orgUnitId)
                .orElseThrow(() -> new NotFoundException("Organization unit was not found."));
    }

    private JobPosition getPosition(Long positionId) {
        return jobPositionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException("Position was not found."));
    }

    private ContractType getContractType(Integer contractTypeId) {
        return contractTypeRepository.findById(contractTypeId)
                .orElseThrow(() -> new NotFoundException("Contract type was not found."));
    }

    private EmploymentContract getContract(Long contractId) {
        return employmentContractRepository.findById(contractId)
                .orElseThrow(() -> new NotFoundException("Employment contract was not found."));
    }

    private EmployeeSummary employeeSummary(Employee employee) {
        EmployeeProfile profile = employeeProfileRepository
                .findFirstByEmployeeEmployeeIdAndPrimaryProfileTrue(employee.getEmployeeId())
                .orElse(null);
        UserAccountSummary user = employee.getUserId() == null
                ? null
                : userAccounts.findSummary(employee.getUserId()).orElse(null);
        return employeeSummary(employee, profile, user);
    }

    private EmployeeSummary employeeSummary(Employee employee, EmployeeProfile profile, UserAccountSummary user) {
        return new EmployeeSummary(
                employee.getEmployeeId(),
                employee.getEmployeeNumber(),
                user == null ? null : user.userId(),
                user == null ? null : user.username(),
                employee.getCurrentOrgUnit() == null ? null : employee.getCurrentOrgUnit().getOrgUnitId(),
                employee.getCurrentOrgUnit() == null ? null : employee.getCurrentOrgUnit().getUnitName(),
                employee.getStatus().getStatusCode(),
                profile == null ? null : profile.getDisplayName(),
                profile == null ? null : profile.getBusinessEmail(),
                employee.getHireDate(),
                employee.getStartDate(),
                employee.getTerminationDate());
    }

    private EmployeeProfileResponse profileResponse(EmployeeProfile profile) {
        return new EmployeeProfileResponse(
                profile.getProfileId(),
                profile.getPrimaryProfile(),
                profile.getFirstName(),
                profile.getOtherName(),
                profile.getDisplayName(),
                profile.getGender(),
                profile.getBirthDate(),
                profile.getNationalId(),
                profile.getPersonalEmail(),
                profile.getBusinessEmail(),
                profile.getPhoneNumber(),
                profile.getMobileNumber(),
                profile.getCountryId(),
                profile.getStateId(),
                profile.getCityId(),
                profile.getAddressLine1(),
                profile.getAddressLine2(),
                profile.getPostalCode());
    }

    private EmploymentContractResponse contractResponse(EmploymentContract contract) {
        return new EmploymentContractResponse(
                contract.getContractId(),
                contract.getContractType() == null ? null : contract.getContractType().getContractTypeId(),
                contract.getContractType() == null ? null : contract.getContractType().getContractTypeCode(),
                contract.getContractNumber(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getSalary(),
                contract.getSalaryCurrency(),
                contract.getWorkingHoursPerWeek(),
                contract.getWorkingHoursPerMonth(),
                contract.getProbationPeriodDays(),
                contract.getFulltime(),
                contract.getActive());
    }

    private PositionAssignmentResponse assignmentResponse(PositionAssignment assignment) {
        return new PositionAssignmentResponse(
                assignment.getPositionAssignmentId(),
                assignment.getPosition().getPositionId(),
                assignment.getPosition().getPositionCode(),
                assignment.getPosition().getPositionTitle(),
                assignment.getAssignmentType(),
                assignment.getPrimaryAssignment(),
                assignment.getStartDate(),
                assignment.getEndDate(),
                assignment.getActive(),
                assignment.getAssignedByUserId(),
                assignment.getAssignedAt());
    }

    private EmploymentRecordResponse recordResponse(EmploymentRecord record) {
        return new EmploymentRecordResponse(
                record.getEmploymentId(),
                record.getOrgUnit() == null ? null : record.getOrgUnit().getOrgUnitId(),
                record.getOrgUnit() == null ? null : record.getOrgUnit().getUnitName(),
                record.getPosition() == null ? null : record.getPosition().getPositionId(),
                record.getPosition() == null ? null : record.getPosition().getPositionTitle(),
                record.getRecordType(),
                record.getStartDate(),
                record.getEndDate(),
                record.getContract() == null ? null : record.getContract().getContractId(),
                record.getReportingTo() == null ? null : record.getReportingTo().getEmployeeId(),
                record.getCurrent());
    }

    private String blankToNull(String value) {
        return TextNormalizer.trim(value);
    }
}




