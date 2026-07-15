package com.citec.ems.iam.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_status", schema = "iam")
@Getter
@Setter
@NoArgsConstructor
public class UserStatus {

    public static final String ACTIVE = "ACTIVE";

    @Id
    @Column(name = "user_status_id")
    private Short userStatusId;

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode;

    @Column(name = "description")
    private String description;
}



