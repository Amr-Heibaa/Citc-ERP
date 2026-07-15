package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobGradeRepository extends JpaRepository<JobGrade, Long> {
    Optional<JobGrade> findByGradeCodeIgnoreCase(String gradeCode);
}




