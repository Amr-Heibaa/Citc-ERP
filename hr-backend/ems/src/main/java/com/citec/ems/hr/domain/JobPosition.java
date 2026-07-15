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
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "job_position", schema = "hr")
@Getter
@Setter
@NoArgsConstructor
public class JobPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_id")
    private Long positionId;

    @Column(name = "position_code", nullable = false, length = 100)
    private String positionCode;

    @Column(name = "position_title", nullable = false)
    private String positionTitle;

    @Column(name = "position_title_ar", nullable = false)
    private String positionTitleAr;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "org_unit_id", nullable = false)
    private OrganizationUnit orgUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    private JobGrade grade;

    @Column(name = "position_level")
    private Integer positionLevel = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reports_to_position_id")
    private JobPosition reportsToPosition;

    @Column(name = "position_description", columnDefinition = "text")
    private String positionDescription;

    @Column(name = "position_description_ar", columnDefinition = "text")
    private String positionDescriptionAr;

    @Column(name = "is_open", nullable = false)
    private Boolean open = true;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}



