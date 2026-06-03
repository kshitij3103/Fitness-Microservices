package com.example.AiService.model;

import lombok.Data;

@Data
public class UserProfile {
    private String id;
    private String keycloackId;
    private String email;
    private String firstName;
    private String lastName;
    private Integer age;
    private Double heightCm;
    private Double weightKg;
    private String fitnessGoal;
    private String experienceLevel;
}
