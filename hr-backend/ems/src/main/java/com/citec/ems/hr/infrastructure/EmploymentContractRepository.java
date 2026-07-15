package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, Long> {
    List<EmploymentContract> findByEmployeeEmployeeIdOrderByStartDateDesc(Long employeeId);
}




