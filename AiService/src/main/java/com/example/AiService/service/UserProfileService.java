package com.example.AiService.service;

import com.example.AiService.model.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class UserProfileService {
    private final WebClient userServiceWebClient;

    public UserProfileService(@Qualifier("userServiceWebClient") WebClient userServiceWebClient) {
        this.userServiceWebClient = userServiceWebClient;
    }

    public UserProfile getUserProfile(String userId) {
        try {
            return userServiceWebClient.get()
                    .uri("/api/users/keycloak/{userId}", userId)
                    .retrieve()
                    .bodyToMono(UserProfile.class)
                    .block();
        } catch (Exception e) {
            log.warn("Could not load user profile for AI personalization: {}", userId, e);
            return null;
        }
    }
}
