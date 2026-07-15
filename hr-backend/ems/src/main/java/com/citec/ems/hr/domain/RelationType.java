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
@Table(name = "relation_type", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class RelationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "relation_type_id")
    private Integer relationTypeId;

    @Column(name = "relation_code", nullable = false, length = 50)
    private String relationCode;

    @Column(name = "relation_name", nullable = false)
    private String relationName;

    @Column(name = "relation_name_ar", nullable = false)
    private String relationNameAr;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "description_ar", columnDefinition = "text")
    private String descriptionAr;
}



