package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationModuleRepository extends JpaRepository<ApplicationModule, Integer> {
    Optional<ApplicationModule> findByApplicationCodeIgnoreCase(String applicationCode);
}




