package com.citec.ems.hr.web;


import com.citec.ems.hr.application.*;
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
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr")
public class HrReferenceController {

    private final HrReferenceService hrReferenceService;

    public HrReferenceController(HrReferenceService hrReferenceService) {
        this.hrReferenceService = hrReferenceService;
    }

    @GetMapping("/organizations")
    public Page<OrganizationResponse> listOrganizations(Pageable pageable) {
        return hrReferenceService.listOrganizations(pageable);
    }

    @PostMapping("/organizations")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse createOrganization(@Valid @RequestBody OrganizationCreateRequest request) {
        return hrReferenceService.createOrganization(request);
    }

    @GetMapping("/org-units")
    public Page<OrganizationUnitResponse> listOrganizationUnits(
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Long parentOrgUnitId,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return hrReferenceService.listOrganizationUnits(organizationId, parentOrgUnitId, q, pageable);
    }

    @PostMapping("/org-units")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationUnitResponse createOrganizationUnit(@Valid @RequestBody OrganizationUnitCreateRequest request) {
        return hrReferenceService.createOrganizationUnit(request);
    }

    @GetMapping("/unit-types")
    public Page<UnitTypeResponse> listUnitTypes(Pageable pageable) {
        return hrReferenceService.listUnitTypes(pageable);
    }

    @GetMapping("/employee-statuses")
    public Page<EmployeeStatusResponse> listEmployeeStatuses(Pageable pageable) {
        return hrReferenceService.listEmployeeStatuses(pageable);
    }

    @GetMapping("/job-grades")
    public Page<JobGradeResponse> listJobGrades(Pageable pageable) {
        return hrReferenceService.listJobGrades(pageable);
    }

    @PostMapping("/job-grades")
    @ResponseStatus(HttpStatus.CREATED)
    public JobGradeResponse createJobGrade(@Valid @RequestBody JobGradeCreateRequest request) {
        return hrReferenceService.createJobGrade(request);
    }

    @GetMapping("/positions")
    public Page<JobPositionResponse> listJobPositions(
            @RequestParam(required = false) Long orgUnitId,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return hrReferenceService.listJobPositions(orgUnitId, q, pageable);
    }

    @PostMapping("/positions")
    @ResponseStatus(HttpStatus.CREATED)
    public JobPositionResponse createJobPosition(@Valid @RequestBody JobPositionCreateRequest request) {
        return hrReferenceService.createJobPosition(request);
    }

    @GetMapping("/contract-types")
    public Page<ContractTypeResponse> listContractTypes(Pageable pageable) {
        return hrReferenceService.listContractTypes(pageable);
    }

    @PostMapping("/contract-types")
    @ResponseStatus(HttpStatus.CREATED)
    public ContractTypeResponse createContractType(@Valid @RequestBody ContractTypeCreateRequest request) {
        return hrReferenceService.createContractType(request);
    }
}




