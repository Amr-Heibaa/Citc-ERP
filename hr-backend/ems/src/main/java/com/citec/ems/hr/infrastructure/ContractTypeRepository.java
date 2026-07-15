package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractTypeRepository extends JpaRepository<ContractType, Integer> {
    Optional<ContractType> findByContractTypeCodeIgnoreCase(String contractTypeCode);
}




