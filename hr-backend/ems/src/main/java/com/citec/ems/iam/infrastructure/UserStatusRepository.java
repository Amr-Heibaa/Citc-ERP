package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserStatusRepository extends JpaRepository<UserStatus, Short> {
    Optional<UserStatus> findByStatusCodeIgnoreCase(String statusCode);
}




