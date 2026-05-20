package com.example.UserService.controller;

import com.example.UserService.dto.RegisterRequest;
import com.example.UserService.dto.UserResponse;
import com.example.UserService.repository.UserRepo;
import com.example.UserService.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor

public class UserController {

    private UserService userService;
    private UserRepo userRepo;
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }
    @PostMapping("/register")
    public  ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest){
        if(userRepo.existsByEmail(registerRequest.getEmail())){
            throw new RuntimeException("Email already exists");

        }


        return ResponseEntity.ok(userService.register(registerRequest));

    }
    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.existsByUserId(userId));
    }

}
