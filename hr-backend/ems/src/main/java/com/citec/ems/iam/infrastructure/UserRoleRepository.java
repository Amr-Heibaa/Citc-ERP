package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("""
            select distinct r.roleCode
            from UserRole ur
            join ur.role r
            where ur.user.userId = :userId
              and ur.active = true
              and r.active = true
              and ur.id.startDate <= :today
              and (ur.endDate is null or ur.endDate >= :today)
            """)
    List<String> findActiveRoleCodesByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);
}




