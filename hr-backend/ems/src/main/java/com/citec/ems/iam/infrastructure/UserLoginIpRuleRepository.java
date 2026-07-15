package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserLoginIpRuleRepository extends JpaRepository<UserLoginIpRule, Long> {

    @Query("""
            select rule
            from UserLoginIpRule rule
            left join rule.applicationModule module
            where rule.user.userId = :userId
              and rule.active = true
              and rule.startDate <= :today
              and (rule.endDate is null or rule.endDate >= :today)
              and (:applicationModuleId is null or module.applicationModuleId is null or module.applicationModuleId = :applicationModuleId)
            """)
    List<UserLoginIpRule> findActiveRules(
            @Param("userId") Long userId,
            @Param("applicationModuleId") Integer applicationModuleId,
            @Param("today") LocalDate today);
}




