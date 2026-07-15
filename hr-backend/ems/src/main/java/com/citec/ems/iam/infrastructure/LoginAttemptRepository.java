package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
}




