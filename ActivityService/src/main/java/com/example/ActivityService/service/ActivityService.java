package com.example.ActivityService.service;

import com.example.ActivityService.dto.ActivityRequest;
import com.example.ActivityService.dto.ActivityResponse;
import com.example.ActivityService.model.Activity;
import com.example.ActivityService.repository.ActivityRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j

public class ActivityService {
    private final  ActivityRepo activityRepo;
    private final UserValidationService userValidationService;
    private final RabbitTemplate rabbitTemplate;
    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    public ActivityResponse trackActivity(ActivityRequest activityRequest) {
        boolean isValidUser = userValidationService.validateUser(activityRequest.getUserId());
        if(!isValidUser) {
            throw new RuntimeException("Invalid user" + activityRequest.getUserId());
        }

        System.out.println("REQUEST RECEIVED");
        Activity activity = Activity.builder()
                .userId(activityRequest.getUserId())
                .type(activityRequest.getType())
                .caloriesBurned(activityRequest.getCaloriesBurned())
                .startTime(activityRequest.getStartTime())
                .additionalMetrics(activityRequest.getAdditionalMetrics())
                .duration(activityRequest.getDuration())
                .build();
        System.out.println(activity);
        Activity savedActivity = activityRepo.save(activity);

        //Publish to RabbitMq

        try{
            rabbitTemplate.convertAndSend(exchange, routingKey, savedActivity);

        }
        catch (Exception e){
            log.error("failed to publish activity to Rabbitmq",  e);

        }
        return mapToResponse(savedActivity);


    }
    private ActivityResponse mapToResponse(Activity activity) {
        ActivityResponse activityResponse = new ActivityResponse();
        activityResponse.setId(activity.getId());
        activityResponse.setUserId(activity.getUserId());
        activityResponse.setCaloriesBurned(activity.getCaloriesBurned());
        activityResponse.setStartTime(activity.getStartTime());
        activityResponse.setAdditionalMetrics(activity.getAdditionalMetrics());
        activityResponse.setDuration(activity.getDuration());
        activityResponse.setType(activity.getType());
        activityResponse.setCreatedAt(activity.getCreatedAt());
        activityResponse.setUpdatedAt(activity.getUpdatedAt());
        return activityResponse;
    }

    public List<ActivityResponse> getUserActivity(String userId) {
        List<Activity> activities= activityRepo.findByUserId(userId);
        return activities.stream()
                .map(this:: mapToResponse)
                .collect(Collectors.toList());

    }

    public ActivityResponse getActivityById(String activityId) {
        return activityRepo.findById(activityId)
                .map(this:: mapToResponse)
                .orElseThrow(()-> new RuntimeException("activity not found"));
    }
}
