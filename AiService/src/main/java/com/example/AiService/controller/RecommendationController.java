package com.example.AiService.controller;

import com.example.AiService.model.Recommendation;
import com.example.AiService.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recommendation>> getUserRecommendations(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.getUserRecommendation(userId));


    }
    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<Recommendation>> getActivityRecommendations(@PathVariable String activityId) {
        return ResponseEntity.ok(recommendationService.getActivityRecommendation(activityId));


    }

    @DeleteMapping("/activity/{activityId}")
    public ResponseEntity<Void> deleteActivityRecommendation(@PathVariable String activityId) {
        recommendationService.deleteActivityRecommendation(activityId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/activity/{activityId}/regenerate")
    public ResponseEntity<Recommendation> regenerateActivityRecommendation(@PathVariable String activityId) {
        return ResponseEntity.ok(recommendationService.regenerateActivityRecommendation(activityId));
    }


}
