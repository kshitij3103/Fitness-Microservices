package com.example.AiService.service;

import com.example.AiService.model.Activity;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ActivityLookupService {
    private final WebClient activityServiceWebClient;

    public ActivityLookupService(
            @Qualifier("activityServiceWebClient") WebClient activityServiceWebClient) {

        this.activityServiceWebClient = activityServiceWebClient;
    }

    public Activity getActivity(String activityId) {
        return activityServiceWebClient.get()
                .uri("/api/activities/{activityId}", activityId)
                .retrieve()
                .bodyToMono(Activity.class)
                .block();
    }
}
