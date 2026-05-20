package com.example.ActivityService.service;

import lombok.Data;
import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Data
public class UserValidationService {
    private final WebClient userServiceWebClient;
    public boolean validateUser(String userId){
        try {
            return userServiceWebClient.get()
                    .uri("/api/users/{userId}/validate", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
        }
        catch(WebClientResponseException e){
            if(e.getStatusCode()== HttpStatus.NOT_FOUND)
                throw new RuntimeException("user not found" + userId );
            else if (e.getStatusCode()== HttpStatus.BAD_REQUEST){
                throw new RuntimeException("invalid request" + userId );
            }

        }
        return false;
    }

}
