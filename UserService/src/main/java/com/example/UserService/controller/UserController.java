package com.example.UserService.controller;

import com.example.UserService.dto.FitnessProfileRequest;
import com.example.UserService.dto.RegisterRequest;
import com.example.UserService.dto.UserResponse;
import com.example.UserService.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor

public class UserController {

    private UserService userService;
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @GetMapping("/keycloak/{keycloackId}")
    public ResponseEntity<UserResponse> getUserProfileByKeycloackId(@PathVariable String keycloackId) {
        return ResponseEntity.ok(userService.getUserProfileByKeycloackId(keycloackId));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile(@RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(userService.getUserProfileByKeycloackId(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateFitnessProfile(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody FitnessProfileRequest fitnessProfileRequest) {

        return ResponseEntity.ok(userService.updateFitnessProfile(userId, fitnessProfileRequest));
    }

    @PostMapping("/register")
    public  ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest){
        return ResponseEntity.ok(userService.register(registerRequest));

    }
    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.existsByUserId(userId));
    }

}
