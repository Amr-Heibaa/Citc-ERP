package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrganizationUnitRepository extends JpaRepository<OrganizationUnit, Long> {

    Optional<OrganizationUnit> findByOrganizationOrganizationIdAndUnitCodeIgnoreCase(Integer organizationId, String unitCode);

    @Query("""
            select unit
            from OrganizationUnit unit
            where (:organizationId is null or unit.organization.organizationId = :organizationId)
              and (:parentOrgUnitId is null or unit.parentOrgUnit.orgUnitId = :parentOrgUnitId)
              and (:q is null
                   or lower(unit.unitCode) like lower(concat('%', :q, '%'))
                   or lower(unit.unitName) like lower(concat('%', :q, '%')))
            """)
    org.springframework.data.domain.Page<OrganizationUnit> search(
            @Param("organizationId") Integer organizationId,
            @Param("parentOrgUnitId") Long parentOrgUnitId,
            @Param("q") String q,
            org.springframework.data.domain.Pageable pageable);
}




