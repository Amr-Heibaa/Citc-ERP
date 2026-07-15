package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelationTypeRepository extends JpaRepository<RelationType, Integer> {
    Optional<RelationType> findByRelationCodeIgnoreCase(String relationCode);
}




