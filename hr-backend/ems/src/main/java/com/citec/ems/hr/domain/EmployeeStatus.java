package com.citec.ems.hr.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_status", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeStatus {

    public static final String ACTIVE = "ACTIVE";

    @Id
    @Column(name = "employee_status_id")
    private Short employeeStatusId;

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode;

    @Column(name = "description")
    private String description;
}



