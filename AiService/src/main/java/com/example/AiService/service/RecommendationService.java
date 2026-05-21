package com.example.AiService.service;

import com.example.AiService.model.Recommendation;
import com.example.AiService.repository.AiRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final AiRepo aiRepo;

    public List<Recommendation> getUserRecommendation(String userId) {
        return aiRepo.findByUserId(userId);
    }

    public Recommendation getActivityRecommendation(String activityId) {
        return aiRepo.findByActivityId(activityId)
                .orElseThrow(()-> new RuntimeException("No recommendation found for activity" + activityId));
    }
}
