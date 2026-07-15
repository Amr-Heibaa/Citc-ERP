package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentRecordRepository extends JpaRepository<EmploymentRecord, Long> {
    Optional<EmploymentRecord> findFirstByEmployeeEmployeeIdAndCurrentTrue(Long employeeId);

    List<EmploymentRecord> findByEmployeeEmployeeIdOrderByStartDateDesc(Long employeeId);
}




