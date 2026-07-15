package com.citec.ems.iam.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "client_application", schema = "iam")
@Getter
@Setter
@NoArgsConstructor
public class ClientApplication {

    @Id
    @Column(name = "client_application_id")
    private Short clientApplicationId;

    @Column(name = "client_code", nullable = false, length = 50)
    private String clientCode;

    @Column(name = "client_name", length = 100)
    private String clientName;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;
}



