package user;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@Data
public class UserService {

    private final WebClient userServiceWebClient;

    public  Mono<UserResponse> registerUser(RegisterRequest registerRequest) {
        return userServiceWebClient.post()
                .uri("/api/users/register")
                .bodyValue(registerRequest)
                .retrieve()
                .bodyToMono(user.UserResponse.class)
                .onErrorResume(WebClientResponseException.class, e -> {

                    if (e.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR) {
                        return Mono.error(
                                new RuntimeException("Internal Server Error: " + e.getMessage())
                        );
                    }

                    else if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                        return Mono.error(
                                new RuntimeException("Invalid request: " + e.getMessage())
                        );
                    }

                    return Mono.error(e);
                });

    }

    public Mono<Boolean> validateUser(String userId) {

        return userServiceWebClient.get()
                .uri("/api/users/{userId}/validate", userId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .onErrorResume(WebClientResponseException.class, e -> {

                    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                        return Mono.error(
                                new RuntimeException("User not found: " + userId)
                        );
                    }

                    else if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                        return Mono.error(
                                new RuntimeException("Invalid request: " + userId)
                        );
                    }

                    return Mono.error(e);
                });
    }
}