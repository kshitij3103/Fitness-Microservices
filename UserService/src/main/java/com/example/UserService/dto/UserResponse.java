package com.example.UserService.dto;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
@Data

public class UserResponse {

    private String id;
    private String keycloackId;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Integer age;
    private Double heightCm;
    private Double weightKg;
    private String fitnessGoal;
    private String experienceLevel;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

}
