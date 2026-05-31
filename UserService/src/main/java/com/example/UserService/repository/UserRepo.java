package com.example.UserService.repository;

import com.example.UserService.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User,String> {

    boolean existsByEmail(String email);

    boolean existsByKeycloackId(String userId);

    User findByEmail(@NotBlank(message = "email is required") @Email(message = "invalid email format") String email);
}
