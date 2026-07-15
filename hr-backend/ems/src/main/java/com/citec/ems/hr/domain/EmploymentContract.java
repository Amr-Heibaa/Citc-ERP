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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "employment_contract", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class EmploymentContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_type_id")
    private ContractType contractType;

    @Column(name = "contract_number", length = 50)
    private String contractNumber;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "salary", precision = 14, scale = 2)
    private BigDecimal salary;

    @Column(name = "salary_currency", nullable = false, length = 10)
    private String salaryCurrency = "EGP";

    @Column(name = "working_hours_per_week", precision = 5, scale = 2)
    private BigDecimal workingHoursPerWeek;

    @Column(name = "working_hours_per_month", precision = 5, scale = 2)
    private BigDecimal workingHoursPerMonth;

    @Column(name = "probation_period_days")
    private Integer probationPeriodDays;

    @Column(name = "is_fulltime")
    private Boolean fulltime;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}



