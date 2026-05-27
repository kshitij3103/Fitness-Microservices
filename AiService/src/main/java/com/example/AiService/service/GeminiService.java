package com.example.AiService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.url}")
    private String geminiApiurl;

    @Value("${gemini.api.key}")
    private String geminiApikey;

    private final WebClient webClient;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAnswer(String question){
        Map<String,Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", question)
                        })
                }
        );

        try {
            // CORRECTED: Using Spring's URI template to safely attach the key
            return webClient.post()
                    .uri(geminiApiurl + "?key={key}", geminiApikey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        } catch (WebClientResponseException e) {
            log.error("Google Gemini API Error!");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            log.error("An unexpected error occurred: ", e);
            throw e;
        }
    }
}