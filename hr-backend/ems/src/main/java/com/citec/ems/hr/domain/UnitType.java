package com.citec.ems.hr.domain;

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
@Table(name = "unit_type", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class UnitType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_type_id")
    private Integer unitTypeId;

    @Column(name = "unit_code", nullable = false, length = 50)
    private String unitCode;

    @Column(name = "unit_name_en", nullable = false, length = 200)
    private String unitNameEn;

    @Column(name = "unit_name_ar", nullable = false, length = 200)
    private String unitNameAr;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "description_ar", columnDefinition = "text")
    private String descriptionAr;
}



