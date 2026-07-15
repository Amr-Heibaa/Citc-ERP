package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientApplicationRepository extends JpaRepository<ClientApplication, Short> {
    Optional<ClientApplication> findByClientCodeIgnoreCase(String clientCode);
}




