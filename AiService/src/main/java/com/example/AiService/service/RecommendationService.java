package com.example.AiService.service;

import com.example.AiService.model.Recommendation;
import com.example.AiService.repository.AiRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final AiRepo aiRepo;
    private final ActivityLookupService activityLookupService;
    private final ActivityAiService activityAiService;

    public List<Recommendation> getUserRecommendation(String userId) {
        return aiRepo.findByUserId(userId);
    }

    public List<Recommendation> getActivityRecommendation(String activityId) {
        return aiRepo.findByActivityId(activityId)
                .map(List::of)
                .orElseGet(List::of);
    }

    public void deleteActivityRecommendation(String activityId) {
        aiRepo.findByActivityId(activityId).ifPresent(aiRepo::delete);
    }

    public Recommendation regenerateActivityRecommendation(String activityId) {
        var activity = activityLookupService.getActivity(activityId);
        Recommendation recommendation = activityAiService.generateRecommendation(activity);

        aiRepo.findByActivityId(activityId).ifPresent(existingRecommendation ->
                recommendation.setId(existingRecommendation.getId()));

        return aiRepo.save(recommendation);
    }
}
