package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    @Query("""
            select distinct p.permissionCode
            from RolePermission rp
            join rp.permission p
            join rp.role r
            join UserRole ur on ur.role = r
            where ur.user.userId = :userId
              and ur.active = true
              and rp.active = true
              and rp.allowed = true
              and p.active = true
              and ur.id.startDate <= :today
              and rp.id.startDate <= :today
              and (ur.endDate is null or ur.endDate >= :today)
              and (rp.endDate is null or rp.endDate >= :today)
            """)
    List<String> findAllowedPermissionCodesByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);
}




