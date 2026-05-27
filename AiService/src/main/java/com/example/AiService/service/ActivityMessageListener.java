package com.example.AiService.service;

import com.example.AiService.model.Activity;
import com.example.AiService.model.Recommendation;
import com.example.AiService.repository.AiRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class ActivityMessageListener {
    private final ActivityAiService activityAiService;
    private final AiRepo  aiRepo;

    private final ObjectMapper objectMapper;

    @RabbitListener(queues="activity.queue")
    public void processActivity(String message) throws Exception {

        Activity activity =
                objectMapper.readValue(message, Activity.class);

        log.info("Activity received : {}", activity.getId());
        //log.info("Generated Recommendation :{} ");
        Recommendation recommendation = activityAiService.generateRecommendation(activity);
        aiRepo.save(recommendation);

    }
}