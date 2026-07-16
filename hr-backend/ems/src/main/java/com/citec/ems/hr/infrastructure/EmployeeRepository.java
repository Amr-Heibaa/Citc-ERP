package com.citec.ems.hr.infrastructure;


import com.citec.ems.hr.domain.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeNumberIgnoreCase(String employeeNumber);

    @EntityGraph(attributePaths = {"status", "currentOrgUnit"})
    @Query("""
            select employee
            from Employee employee
            where (:orgUnitId is null or employee.currentOrgUnit.orgUnitId = :orgUnitId)
              and (:statusCode is null
                   or lower(employee.status.statusCode) = lower(cast(:statusCode as string)))
              and (:q is null
                   or lower(employee.employeeNumber) like lower(concat('%', cast(:q as string), '%')))
            """)
    org.springframework.data.domain.Page<Employee> search(
            @Param("q") String q,
            @Param("orgUnitId") Long orgUnitId,
            @Param("statusCode") String statusCode,
            org.springframework.data.domain.Pageable pageable);
}