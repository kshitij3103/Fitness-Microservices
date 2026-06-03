package com.example.AiService.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.reactive.function.client.WebClient;
@Configuration
public class WebClientConfig {
    @Bean
    @Primary
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient userServiceWebClient(
            @Qualifier("loadBalancedWebClientBuilder") WebClient.Builder webClientBuilder) {

        return webClientBuilder
                .baseUrl("http://USER-SERVICE")
                .build();
    }

    @Bean
    public WebClient activityServiceWebClient(
            @Qualifier("loadBalancedWebClientBuilder") WebClient.Builder webClientBuilder) {

        return webClientBuilder
                .baseUrl("http://ACTIVITY-SERVICE")
                .build();
    }
}
