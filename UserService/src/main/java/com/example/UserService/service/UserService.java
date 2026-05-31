package com.example.UserService.service;

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
    public UserResponse register(@Valid RegisterRequest registerRequest) {
        if(userRepo.existsByEmail(registerRequest.getEmail())) {
            User existingUser = userRepo.findByEmail(registerRequest.getEmail());
            if(existingUser.getKeycloackId()==null && registerRequest.getKeycloackId()!=null) {
                existingUser.setKeycloackId(registerRequest.getKeycloackId());
                existingUser = userRepo.save(existingUser);
            }
            UserResponse userResponse = new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setKeycloackId(existingUser.getKeycloackId());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstName(existingUser.getFirstName());
            userResponse.setLastName(existingUser.getLastName());
            userResponse.setPassword(existingUser.getPassword());
            userResponse.setCreatedDate(existingUser.getCreatedDate());
            userResponse.setUpdatedDate(existingUser.getUpdatedDate());
            return userResponse;
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setKeycloackId(registerRequest.getKeycloackId());
        User savedUser = userRepo.save(user);
        UserResponse userResponse = new UserResponse();
        userResponse.setKeycloackId(savedUser.getKeycloackId());
        userResponse.setId(savedUser.getId());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setPassword(savedUser.getPassword());
        userResponse.setCreatedDate(savedUser.getCreatedDate());
        userResponse.setUpdatedDate(savedUser.getUpdatedDate());
        return userResponse;

    }

    public UserResponse getUserProfile(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(()-> new RuntimeException("user not found"));
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPassword(user.getPassword());
        userResponse.setCreatedDate(user.getCreatedDate());
        userResponse.setUpdatedDate(user.getUpdatedDate());
        return userResponse;

    }

    public boolean existsByUserId(String userId) {
         return userRepo.existsByKeycloackId(userId);
    }
}
