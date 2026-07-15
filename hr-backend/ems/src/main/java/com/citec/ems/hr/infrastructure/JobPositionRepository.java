package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {

    Optional<JobPosition> findByPositionCodeIgnoreCase(String positionCode);

    @Query("""
            select position
            from JobPosition position
            where (:orgUnitId is null or position.orgUnit.orgUnitId = :orgUnitId)
              and (:q is null
                   or lower(position.positionCode) like lower(concat('%', :q, '%'))
                   or lower(position.positionTitle) like lower(concat('%', :q, '%')))
            """)
    org.springframework.data.domain.Page<JobPosition> search(
            @Param("orgUnitId") Long orgUnitId,
            @Param("q") String q,
            org.springframework.data.domain.Pageable pageable);
}




