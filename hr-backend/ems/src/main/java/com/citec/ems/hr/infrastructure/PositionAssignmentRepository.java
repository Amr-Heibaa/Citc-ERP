package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionAssignmentRepository extends JpaRepository<PositionAssignment, Long> {
    List<PositionAssignment> findByEmployeeEmployeeIdOrderByStartDateDesc(Long employeeId);
}




