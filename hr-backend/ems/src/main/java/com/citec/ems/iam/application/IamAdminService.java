package com.citec.ems.iam.application;


import com.citec.ems.iam.domain.*;
import com.citec.ems.iam.infrastructure.*;
import com.citec.ems.shared.BadRequestException;
import com.citec.ems.shared.NotFoundException;
import com.citec.ems.iam.web.IamDtos.PermissionCreateRequest;
import com.citec.ems.iam.web.IamDtos.PermissionResponse;
import com.citec.ems.iam.web.IamDtos.RoleCreateRequest;
import com.citec.ems.iam.web.IamDtos.RolePermissionGrantRequest;
import com.citec.ems.iam.web.IamDtos.RoleResponse;
import com.citec.ems.iam.web.IamDtos.UserCreateRequest;
import com.citec.ems.iam.web.IamDtos.UserDetail;
import com.citec.ems.iam.web.IamDtos.UserRoleAssignRequest;
import com.citec.ems.iam.web.IamDtos.UserSummary;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IamAdminService {

    private final UserRepository userRepository;
    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ApplicationModuleRepository applicationModuleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    public IamAdminService(
            UserRepository userRepository,
            UserStatusRepository userStatusRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            ApplicationModuleRepository applicationModuleRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userStatusRepository = userStatusRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.applicationModuleRepository = applicationModuleRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserSummary> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::userSummary);
    }

    @Transactional(readOnly = true)
    public UserDetail getUser(Long userId) {
        User user = getUserEntity(userId);
        LocalDate today = LocalDate.now();
        return new UserDetail(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus().getStatusCode(),
                userRoleRepository.findActiveRoleCodesByUserId(userId, today),
                rolePermissionRepository.findAllowedPermissionCodesByUserId(userId, today),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    @Transactional
    public UserSummary createUser(UserCreateRequest request) {
        userRepository.findByUsernameIgnoreCase(request.username()).ifPresent(user -> {
            throw new BadRequestException("Username already exists.");
        });
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            throw new BadRequestException("Email already exists.");
        });

        UserStatus status = request.userStatusId() == null
                ? userStatusRepository.findByStatusCodeIgnoreCase(UserStatus.ACTIVE)
                        .orElseThrow(() -> new NotFoundException("ACTIVE user status was not found."))
                : userStatusRepository.findById(request.userStatusId())
                        .orElseThrow(() -> new NotFoundException("User status was not found."));

        User user = new User();
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(status);
        return userSummary(userRepository.save(user));
    }

    @Transactional
    public void assignRole(Long userId, UserRoleAssignRequest request) {
        User user = getUserEntity(userId);
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new NotFoundException("Role was not found."));
        LocalDate startDate = request.startDate() == null ? LocalDate.now() : request.startDate();
        UserRoleId id = new UserRoleId(user.getUserId(), role.getRoleId(), startDate);
        if (userRoleRepository.existsById(id)) {
            throw new BadRequestException("Role assignment already exists for this start date.");
        }
        UserRole assignment = new UserRole();
        assignment.setId(id);
        assignment.setUser(user);
        assignment.setRole(role);
        assignment.setEndDate(request.endDate());
        assignment.setAssignedBy(request.assignedByUserId() == null ? null : getUserEntity(request.assignedByUserId()));
        userRoleRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public Page<RoleResponse> listRoles(Pageable pageable) {
        return roleRepository.findAll(pageable).map(this::roleResponse);
    }

    @Transactional
    public RoleResponse createRole(RoleCreateRequest request) {
        roleRepository.findByRoleCodeIgnoreCase(request.roleCode()).ifPresent(role -> {
            throw new BadRequestException("Role code already exists.");
        });
        Role role = new Role();
        role.setRoleCode(request.roleCode().trim().toUpperCase());
        role.setRoleName(request.roleName().trim());
        role.setDescription(request.description());
        role.setActive(request.active() == null || request.active());
        return roleResponse(roleRepository.save(role));
    }

    @Transactional(readOnly = true)
    public Page<PermissionResponse> listPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable).map(this::permissionResponse);
    }

    @Transactional
    public PermissionResponse createPermission(PermissionCreateRequest request) {
        permissionRepository.findByPermissionCodeIgnoreCase(request.permissionCode()).ifPresent(permission -> {
            throw new BadRequestException("Permission code already exists.");
        });
        Permission permission = new Permission();
        permission.setPermissionCode(request.permissionCode().trim().toUpperCase());
        permission.setPermissionName(request.permissionName().trim());
        permission.setDescription(request.description());
        permission.setActive(request.active() == null || request.active());
        permission.setApplicationModule(request.applicationModuleId() == null
                ? null
                : applicationModuleRepository.findById(request.applicationModuleId())
                        .orElseThrow(() -> new NotFoundException("Application module was not found.")));
        return permissionResponse(permissionRepository.save(permission));
    }

    @Transactional
    public void grantPermission(Long roleId, RolePermissionGrantRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NotFoundException("Role was not found."));
        Permission permission = permissionRepository.findById(request.permissionId())
                .orElseThrow(() -> new NotFoundException("Permission was not found."));
        LocalDate startDate = request.startDate() == null ? LocalDate.now() : request.startDate();
        RolePermissionId id = new RolePermissionId(role.getRoleId(), permission.getPermissionId(), startDate);
        if (rolePermissionRepository.existsById(id)) {
            throw new BadRequestException("Role permission grant already exists for this start date.");
        }
        RolePermission rolePermission = new RolePermission();
        rolePermission.setId(id);
        rolePermission.setRole(role);
        rolePermission.setPermission(permission);
        rolePermission.setEndDate(request.endDate());
        rolePermission.setAllowed(request.allowed() == null || request.allowed());
        rolePermission.setActive(request.active() == null || request.active());
        rolePermission.setGrantedBy(request.grantedByUserId() == null ? null : getUserEntity(request.grantedByUserId()));
        rolePermissionRepository.save(rolePermission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> applicationPermissions(Integer applicationModuleId) {
        ApplicationModule module = applicationModuleRepository.findById(applicationModuleId)
                .orElseThrow(() -> new NotFoundException("Application module was not found."));
        return permissionRepository.findAll().stream()
                .filter(permission -> permission.getApplicationModule() != null
                        && permission.getApplicationModule().getApplicationModuleId().equals(module.getApplicationModuleId()))
                .map(this::permissionResponse)
                .toList();
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User was not found."));
    }

    private UserSummary userSummary(User user) {
        return new UserSummary(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus().getStatusCode(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    private RoleResponse roleResponse(Role role) {
        return new RoleResponse(
                role.getRoleId(),
                role.getRoleCode(),
                role.getRoleName(),
                role.getDescription(),
                role.getActive());
    }

    private PermissionResponse permissionResponse(Permission permission) {
        return new PermissionResponse(
                permission.getPermissionId(),
                permission.getApplicationModule() == null ? null : permission.getApplicationModule().getApplicationModuleId(),
                permission.getPermissionCode(),
                permission.getPermissionName(),
                permission.getDescription(),
                permission.getActive());
    }
}




