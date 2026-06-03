package com.example.UserService.service;

import com.example.UserService.dto.FitnessProfileRequest;
import com.example.UserService.dto.RegisterRequest;
import com.example.UserService.dto.UserResponse;
import com.example.UserService.model.User;
import com.example.UserService.repository.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service

public class UserService {
    @Autowired
    private UserRepo userRepo;

    private UserResponse mapToResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setKeycloackId(user.getKeycloackId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPassword(user.getPassword());
        userResponse.setAge(user.getAge());
        userResponse.setHeightCm(user.getHeightCm());
        userResponse.setWeightKg(user.getWeightKg());
        userResponse.setFitnessGoal(user.getFitnessGoal());
        userResponse.setExperienceLevel(user.getExperienceLevel());
        userResponse.setCreatedDate(user.getCreatedDate());
        userResponse.setUpdatedDate(user.getUpdatedDate());
        return userResponse;
    }

    public UserResponse register(@Valid RegisterRequest registerRequest) {
        if(userRepo.existsByEmail(registerRequest.getEmail())) {
            User existingUser = userRepo.findByEmail(registerRequest.getEmail());
            if(existingUser.getKeycloackId()==null && registerRequest.getKeycloackId()!=null) {
                existingUser.setKeycloackId(registerRequest.getKeycloackId());
                existingUser = userRepo.save(existingUser);
            }
            return mapToResponse(existingUser);
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setKeycloackId(registerRequest.getKeycloackId());
        User savedUser = userRepo.save(user);
        return mapToResponse(savedUser);

    }

    public UserResponse getUserProfile(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(()-> new RuntimeException("user not found"));
        return mapToResponse(user);

    }

    public boolean existsByUserId(String userId) {
         return userRepo.existsByKeycloackId(userId);
    }

    public UserResponse getUserProfileByKeycloackId(String keycloackId) {
        User user = userRepo.findByKeycloackId(keycloackId);
        if (user == null) {
            throw new RuntimeException("user not found");
        }
        return mapToResponse(user);
    }

    public UserResponse updateFitnessProfile(String keycloackId, FitnessProfileRequest fitnessProfileRequest) {
        User user = userRepo.findByKeycloackId(keycloackId);
        if (user == null) {
            throw new RuntimeException("user not found");
        }

        user.setAge(fitnessProfileRequest.getAge());
        user.setHeightCm(fitnessProfileRequest.getHeightCm());
        user.setWeightKg(fitnessProfileRequest.getWeightKg());
        user.setFitnessGoal(fitnessProfileRequest.getFitnessGoal());
        user.setExperienceLevel(fitnessProfileRequest.getExperienceLevel());
        return mapToResponse(userRepo.save(user));
    }
}
