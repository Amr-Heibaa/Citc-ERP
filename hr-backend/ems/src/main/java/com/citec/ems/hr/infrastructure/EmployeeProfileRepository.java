package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findFirstByEmployeeEmployeeIdAndPrimaryProfileTrue(Long employeeId);

    List<EmployeeProfile> findByEmployeeEmployeeIdOrderByPrimaryProfileDescCreatedAtDesc(Long employeeId);
}




