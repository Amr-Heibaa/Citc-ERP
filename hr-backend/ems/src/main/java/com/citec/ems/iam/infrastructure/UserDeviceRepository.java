package com.citec.ems.iam.infrastructure;


import com.citec.ems.iam.domain.*;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    Optional<UserDevice> findByDeviceUuid(UUID deviceUuid);
}




