package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findFirstByEmployeeEmployeeIdAndPrimaryProfileTrue(Long employeeId);

    List<EmployeeProfile> findByEmployeeEmployeeIdOrderByPrimaryProfileDescCreatedAtDesc(Long employeeId);

    /** Batch-loads the primary profiles for many employees in ONE query (avoids N+1). */
    @Query("""
            select profile
            from EmployeeProfile profile
            join fetch profile.employee employee
            where employee.employeeId in :employeeIds
              and profile.primaryProfile = true
            """)
    List<EmployeeProfile> findPrimaryProfilesByEmployeeIds(@Param("employeeIds") Collection<Long> employeeIds);
}