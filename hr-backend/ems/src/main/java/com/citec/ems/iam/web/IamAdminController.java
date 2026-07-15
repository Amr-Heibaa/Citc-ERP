package com.citec.ems.iam.web;


import com.citec.ems.iam.application.*;
import com.citec.ems.iam.web.IamDtos.PermissionCreateRequest;
import com.citec.ems.iam.web.IamDtos.PermissionResponse;
import com.citec.ems.iam.web.IamDtos.RoleCreateRequest;
import com.citec.ems.iam.web.IamDtos.RolePermissionGrantRequest;
import com.citec.ems.iam.web.IamDtos.RoleResponse;
import com.citec.ems.iam.web.IamDtos.UserCreateRequest;
import com.citec.ems.iam.web.IamDtos.UserDetail;
import com.citec.ems.iam.web.IamDtos.UserRoleAssignRequest;
import com.citec.ems.iam.web.IamDtos.UserSummary;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iam")
public class IamAdminController {

    private final IamAdminService iamAdminService;

    public IamAdminController(IamAdminService iamAdminService) {
        this.iamAdminService = iamAdminService;
    }

    @GetMapping("/users")
    public Page<UserSummary> listUsers(Pageable pageable) {
        return iamAdminService.listUsers(pageable);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummary createUser(@Valid @RequestBody UserCreateRequest request) {
        return iamAdminService.createUser(request);
    }

    @GetMapping("/users/{userId}")
    public UserDetail getUser(@PathVariable Long userId) {
        return iamAdminService.getUser(userId);
    }

    @PostMapping("/users/{userId}/roles")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignRole(@PathVariable Long userId, @Valid @RequestBody UserRoleAssignRequest request) {
        iamAdminService.assignRole(userId, request);
    }

    @GetMapping("/roles")
    public Page<RoleResponse> listRoles(Pageable pageable) {
        return iamAdminService.listRoles(pageable);
    }

    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse createRole(@Valid @RequestBody RoleCreateRequest request) {
        return iamAdminService.createRole(request);
    }

    @PostMapping("/roles/{roleId}/permissions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantPermission(
            @PathVariable Long roleId,
            @Valid @RequestBody RolePermissionGrantRequest request) {
        iamAdminService.grantPermission(roleId, request);
    }

    @GetMapping("/permissions")
    public Page<PermissionResponse> listPermissions(Pageable pageable) {
        return iamAdminService.listPermissions(pageable);
    }

    @PostMapping("/permissions")
    @ResponseStatus(HttpStatus.CREATED)
    public PermissionResponse createPermission(@Valid @RequestBody PermissionCreateRequest request) {
        return iamAdminService.createPermission(request);
    }

    @GetMapping("/application-modules/{applicationModuleId}/permissions")
    public List<PermissionResponse> applicationPermissions(@PathVariable Integer applicationModuleId) {
        return iamAdminService.applicationPermissions(applicationModuleId);
    }
}




