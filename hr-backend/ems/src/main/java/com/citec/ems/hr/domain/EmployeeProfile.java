package com.citec.ems.hr.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "employee_profile", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "is_primary", nullable = false)
    private Boolean primaryProfile = true;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "other_name", nullable = false, length = 200)
    private String otherName;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "gender", nullable = false)
    private Short gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "national_id", length = 14)
    private String nationalId;

    @Column(name = "personal_email", length = 100)
    private String personalEmail;

    @Column(name = "business_email", length = 100)
    private String businessEmail;

    @Column(name = "phone_number", length = 100)
    private String phoneNumber;

    @Column(name = "mobile_number", length = 100)
    private String mobileNumber;

    @Column(name = "country_id")
    private Short countryId;

    @Column(name = "state_id")
    private Integer stateId;

    @Column(name = "city_id")
    private Integer cityId;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "profile_photo", columnDefinition = "bytea")
    private byte[] profilePhoto;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}



