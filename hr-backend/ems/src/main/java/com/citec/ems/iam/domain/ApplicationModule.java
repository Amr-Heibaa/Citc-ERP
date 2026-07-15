package com.citec.ems.iam.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "application_module", schema = "iam")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_module_id")
    private Integer applicationModuleId;

    @Column(name = "application_code", nullable = false, length = 50)
    private String applicationCode;

    @Column(name = "application_name", nullable = false, length = 100)
    private String applicationName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;
}



