package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationProfileRepository extends JpaRepository<OrganizationProfile, Integer> {
    Optional<OrganizationProfile> findFirstByOrganizationOrganizationIdAndActiveTrue(Integer organizationId);
}




