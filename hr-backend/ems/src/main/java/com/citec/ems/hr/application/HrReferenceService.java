package com.citec.ems.hr.application;


import com.citec.ems.hr.domain.*;
import com.citec.ems.hr.infrastructure.*;
import com.citec.ems.shared.BadRequestException;
import com.citec.ems.shared.NotFoundException;
import com.citec.ems.shared.TextNormalizer;
import com.citec.ems.hr.web.HrDtos.ContractTypeCreateRequest;
import com.citec.ems.hr.web.HrDtos.ContractTypeResponse;
import com.citec.ems.hr.web.HrDtos.EmployeeStatusResponse;
import com.citec.ems.hr.web.HrDtos.JobGradeCreateRequest;
import com.citec.ems.hr.web.HrDtos.JobGradeResponse;
import com.citec.ems.hr.web.HrDtos.JobPositionCreateRequest;
import com.citec.ems.hr.web.HrDtos.JobPositionResponse;
import com.citec.ems.hr.web.HrDtos.OrganizationCreateRequest;
import com.citec.ems.hr.web.HrDtos.OrganizationResponse;
import com.citec.ems.hr.web.HrDtos.OrganizationUnitCreateRequest;
import com.citec.ems.hr.web.HrDtos.OrganizationUnitResponse;
import com.citec.ems.hr.web.HrDtos.UnitTypeResponse;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HrReferenceService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationUnitRepository organizationUnitRepository;
    private final UnitTypeRepository unitTypeRepository;
    private final JobGradeRepository jobGradeRepository;
    private final JobPositionRepository jobPositionRepository;
    private final ContractTypeRepository contractTypeRepository;
    private final EmployeeStatusRepository employeeStatusRepository;

    public HrReferenceService(
            OrganizationRepository organizationRepository,
            OrganizationUnitRepository organizationUnitRepository,
            UnitTypeRepository unitTypeRepository,
            JobGradeRepository jobGradeRepository,
            JobPositionRepository jobPositionRepository,
            ContractTypeRepository contractTypeRepository,
            EmployeeStatusRepository employeeStatusRepository) {
        this.organizationRepository = organizationRepository;
        this.organizationUnitRepository = organizationUnitRepository;
        this.unitTypeRepository = unitTypeRepository;
        this.jobGradeRepository = jobGradeRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.contractTypeRepository = contractTypeRepository;
        this.employeeStatusRepository = employeeStatusRepository;
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponse> listOrganizations(Pageable pageable) {
        return organizationRepository.findAll(pageable).map(this::organizationResponse);
    }

    @Transactional
    public OrganizationResponse createOrganization(OrganizationCreateRequest request) {
        String organizationCode = TextNormalizer.code(request.organizationCode());
        organizationRepository.findByOrganizationCodeIgnoreCase(organizationCode).ifPresent(organization -> {
            throw new BadRequestException("Organization code already exists.");
        });
        Organization organization = new Organization();
        organization.setOrganizationCode(organizationCode);
        organization.setOrganizationNameEn(TextNormalizer.trim(request.organizationNameEn()));
        organization.setOrganizationNameAr(TextNormalizer.trim(request.organizationNameAr()));
        organization.setActive(request.active() == null || request.active());
        return organizationResponse(organizationRepository.save(organization));
    }

    @Transactional(readOnly = true)
    public Page<OrganizationUnitResponse> listOrganizationUnits(
            Integer organizationId,
            Long parentOrgUnitId,
            String q,
            Pageable pageable) {
        return organizationUnitRepository.search(organizationId, parentOrgUnitId, blankToNull(q), pageable)
                .map(this::organizationUnitResponse);
    }

    @Transactional
    public OrganizationUnitResponse createOrganizationUnit(OrganizationUnitCreateRequest request) {
        Organization organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new NotFoundException("Organization was not found."));
        String unitCode = TextNormalizer.code(request.unitCode());
        organizationUnitRepository.findByOrganizationOrganizationIdAndUnitCodeIgnoreCase(
                request.organizationId(),
                unitCode).ifPresent(unit -> {
            throw new BadRequestException("Organization unit code already exists for this organization.");
        });
        OrganizationUnit unit = new OrganizationUnit();
        unit.setOrganization(organization);
        unit.setUnitType(unitTypeRepository.findById(request.unitTypeId())
                .orElseThrow(() -> new NotFoundException("Unit type was not found.")));
        unit.setParentOrgUnit(request.parentOrgUnitId() == null ? null : getOrganizationUnit(request.parentOrgUnitId()));
        unit.setUnitCode(unitCode);
        unit.setUnitName(TextNormalizer.trim(request.unitName()));
        unit.setUnitNameAr(TextNormalizer.trim(request.unitNameAr()));
        unit.setDescription(TextNormalizer.trim(request.description()));
        unit.setDescriptionAr(TextNormalizer.trim(request.descriptionAr()));
        unit.setStartDate(request.startDate() == null ? LocalDate.now() : request.startDate());
        unit.setEndDate(request.endDate());
        unit.setActive(request.active() == null || request.active());
        return organizationUnitResponse(organizationUnitRepository.save(unit));
    }

    @Transactional(readOnly = true)
    public Page<UnitTypeResponse> listUnitTypes(Pageable pageable) {
        return unitTypeRepository.findAll(pageable).map(this::unitTypeResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeStatusResponse> listEmployeeStatuses(Pageable pageable) {
        return employeeStatusRepository.findAll(pageable).map(this::employeeStatusResponse);
    }

    @Transactional(readOnly = true)
    public Page<JobGradeResponse> listJobGrades(Pageable pageable) {
        return jobGradeRepository.findAll(pageable).map(this::jobGradeResponse);
    }

    @Transactional
    public JobGradeResponse createJobGrade(JobGradeCreateRequest request) {
        String gradeCode = TextNormalizer.code(request.gradeCode());
        jobGradeRepository.findByGradeCodeIgnoreCase(gradeCode).ifPresent(grade -> {
            throw new BadRequestException("Job grade code already exists.");
        });
        JobGrade grade = new JobGrade();
        grade.setGradeCode(gradeCode);
        grade.setGradeName(TextNormalizer.trim(request.gradeName()));
        grade.setGradeRank(request.gradeRank());
        grade.setActive(request.active() == null || request.active());
        return jobGradeResponse(jobGradeRepository.save(grade));
    }

    @Transactional(readOnly = true)
    public Page<JobPositionResponse> listJobPositions(Long orgUnitId, String q, Pageable pageable) {
        return jobPositionRepository.search(orgUnitId, blankToNull(q), pageable).map(this::jobPositionResponse);
    }

    @Transactional
    public JobPositionResponse createJobPosition(JobPositionCreateRequest request) {
        String positionCode = TextNormalizer.code(request.positionCode());
        jobPositionRepository.findByPositionCodeIgnoreCase(positionCode).ifPresent(position -> {
            throw new BadRequestException("Position code already exists.");
        });
        JobPosition position = new JobPosition();
        position.setPositionCode(positionCode);
        position.setPositionTitle(TextNormalizer.trim(request.positionTitle()));
        position.setPositionTitleAr(TextNormalizer.trim(request.positionTitleAr()));
        position.setOrgUnit(getOrganizationUnit(request.orgUnitId()));
        position.setGrade(request.gradeId() == null ? null : getJobGrade(request.gradeId()));
        position.setPositionLevel(request.positionLevel() == null ? 1 : request.positionLevel());
        position.setReportsToPosition(request.reportsToPositionId() == null ? null : getJobPosition(request.reportsToPositionId()));
        position.setPositionDescription(TextNormalizer.trim(request.positionDescription()));
        position.setPositionDescriptionAr(TextNormalizer.trim(request.positionDescriptionAr()));
        position.setOpen(request.open() == null || request.open());
        position.setActive(request.active() == null || request.active());
        return jobPositionResponse(jobPositionRepository.save(position));
    }

    @Transactional(readOnly = true)
    public Page<ContractTypeResponse> listContractTypes(Pageable pageable) {
        return contractTypeRepository.findAll(pageable).map(this::contractTypeResponse);
    }

    @Transactional
    public ContractTypeResponse createContractType(ContractTypeCreateRequest request) {
        String contractTypeCode = TextNormalizer.code(request.contractTypeCode());
        contractTypeRepository.findByContractTypeCodeIgnoreCase(contractTypeCode).ifPresent(contractType -> {
            throw new BadRequestException("Contract type code already exists.");
        });
        ContractType contractType = new ContractType();
        contractType.setContractTypeCode(contractTypeCode);
        contractType.setContractTypeName(TextNormalizer.trim(request.contractTypeName()));
        contractType.setDescription(TextNormalizer.trim(request.description()));
        contractType.setActive(request.active() == null || request.active());
        return contractTypeResponse(contractTypeRepository.save(contractType));
    }

    private OrganizationUnit getOrganizationUnit(Long orgUnitId) {
        return organizationUnitRepository.findById(orgUnitId)
                .orElseThrow(() -> new NotFoundException("Organization unit was not found."));
    }

    private JobGrade getJobGrade(Long gradeId) {
        return jobGradeRepository.findById(gradeId)
                .orElseThrow(() -> new NotFoundException("Job grade was not found."));
    }

    private JobPosition getJobPosition(Long positionId) {
        return jobPositionRepository.findById(positionId)
                .orElseThrow(() -> new NotFoundException("Job position was not found."));
    }

    private OrganizationResponse organizationResponse(Organization organization) {
        return new OrganizationResponse(
                organization.getOrganizationId(),
                organization.getOrganizationCode(),
                organization.getOrganizationNameEn(),
                organization.getOrganizationNameAr(),
                organization.getActive());
    }

    private OrganizationUnitResponse organizationUnitResponse(OrganizationUnit unit) {
        return new OrganizationUnitResponse(
                unit.getOrgUnitId(),
                unit.getOrganization().getOrganizationId(),
                unit.getOrganization().getOrganizationCode(),
                unit.getUnitType().getUnitTypeId(),
                unit.getUnitType().getUnitCode(),
                unit.getParentOrgUnit() == null ? null : unit.getParentOrgUnit().getOrgUnitId(),
                unit.getUnitCode(),
                unit.getUnitName(),
                unit.getUnitNameAr(),
                unit.getStartDate(),
                unit.getEndDate(),
                unit.getActive());
    }

    private UnitTypeResponse unitTypeResponse(UnitType unitType) {
        return new UnitTypeResponse(
                unitType.getUnitTypeId(),
                unitType.getUnitCode(),
                unitType.getUnitNameEn(),
                unitType.getUnitNameAr(),
                unitType.getDescription(),
                unitType.getDescriptionAr());
    }

    private EmployeeStatusResponse employeeStatusResponse(EmployeeStatus status) {
        return new EmployeeStatusResponse(
                status.getEmployeeStatusId(),
                status.getStatusCode(),
                status.getDescription());
    }

    private JobGradeResponse jobGradeResponse(JobGrade grade) {
        return new JobGradeResponse(
                grade.getGradeId(),
                grade.getGradeCode(),
                grade.getGradeName(),
                grade.getGradeRank(),
                grade.getActive());
    }

    private JobPositionResponse jobPositionResponse(JobPosition position) {
        return new JobPositionResponse(
                position.getPositionId(),
                position.getPositionCode(),
                position.getPositionTitle(),
                position.getPositionTitleAr(),
                position.getOrgUnit().getOrgUnitId(),
                position.getOrgUnit().getUnitName(),
                position.getGrade() == null ? null : position.getGrade().getGradeId(),
                position.getGrade() == null ? null : position.getGrade().getGradeCode(),
                position.getPositionLevel(),
                position.getReportsToPosition() == null ? null : position.getReportsToPosition().getPositionId(),
                position.getOpen(),
                position.getActive());
    }

    private ContractTypeResponse contractTypeResponse(ContractType contractType) {
        return new ContractTypeResponse(
                contractType.getContractTypeId(),
                contractType.getContractTypeCode(),
                contractType.getContractTypeName(),
                contractType.getDescription(),
                contractType.getActive());
    }

    private String blankToNull(String value) {
        return TextNormalizer.trim(value);
    }
}




