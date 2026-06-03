package com.example.UserService.dto;

import lombok.Data;

@Data
public class FitnessProfileRequest {
    private Integer age;
    private Double heightCm;
    private Double weightKg;
    private String fitnessGoal;
    private String experienceLevel;
}
