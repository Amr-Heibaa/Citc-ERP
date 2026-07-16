package com.citec.ems.hr.web;


import com.citec.ems.hr.application.*;
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
import jakarta.validation.Valid;
import com.citec.ems.iam.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public Page<EmployeeSummary> listEmployees(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long orgUnitId,
            @RequestParam(required = false) String statusCode,
            Pageable pageable) {
        return employeeService.listEmployees(q, orgUnitId, statusCode, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeSummary createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        return employeeService.createEmployee(request);
    }

    @GetMapping("/me")
    public EmployeeSummary getMyEmployee(@AuthenticationPrincipal AuthenticatedUser principal) {
        return employeeService.getMyEmployee(principal.userId());
    }

    @GetMapping("/{employeeId}")
    public EmployeeDetail getEmployee(@PathVariable Long employeeId) {
        return employeeService.getEmployee(employeeId);
    }

    @PutMapping("/{employeeId}")
    public EmployeeSummary updateEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        return employeeService.updateEmployee(employeeId, request);
    }

    @PostMapping("/{employeeId}/profiles")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeProfileResponse addProfile(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeProfileRequest request) {
        return employeeService.addProfile(employeeId, request);
    }

    @PostMapping("/{employeeId}/contracts")
    @ResponseStatus(HttpStatus.CREATED)
    public EmploymentContractResponse addContract(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmploymentContractRequest request) {
        return employeeService.addContract(employeeId, request);
    }

    @PostMapping("/{employeeId}/position-assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public PositionAssignmentResponse addPositionAssignment(
            @PathVariable Long employeeId,
            @Valid @RequestBody PositionAssignmentRequest request) {
        return employeeService.addPositionAssignment(employeeId, request);
    }

    @PostMapping("/{employeeId}/employment-records")
    @ResponseStatus(HttpStatus.CREATED)
    public EmploymentRecordResponse addEmploymentRecord(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmploymentRecordRequest request) {
        return employeeService.addEmploymentRecord(employeeId, request);
    }
}




