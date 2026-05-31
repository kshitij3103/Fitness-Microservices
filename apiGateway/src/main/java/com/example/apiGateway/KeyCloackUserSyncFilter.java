package com.example.apiGateway;


import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import user.RegisterRequest;
import user.UserService;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeyCloackUserSyncFilter implements WebFilter {
    private final UserService userService;
    @Override
    public Mono<Void> filter(ServerWebExchange serverWebExchange, WebFilterChain webFilterChain) {
        String userId = serverWebExchange.getRequest().getHeaders()
                 .getFirst("X-User-Id");
        String token = serverWebExchange.getRequest().getHeaders()
                .getFirst("Authorization");
        RegisterRequest registerRequest = getUserDetails(token);
        if(userId==null){
            userId=registerRequest.getKeycloackId();
        }
        if(userId!=null && token!=null){
            String finalUserId = userId;
            return userService.validateUser(userId)
                    .flatMap(exist->{
                        if(!exist){

                            if(registerRequest!=null){
                                return userService.registerUser(registerRequest)
                                        .then(Mono.empty());
                            }
                            else{
                                return Mono.empty();
                            }

                        }
                        else{
                            log.info("user already exist");
                            return Mono.empty();

                        }
                    })
                    .then(Mono.defer(()->{
                        ServerHttpRequest mutatedRequest = serverWebExchange.getRequest().mutate()
                                .header("X-User-Id", finalUserId)
                                .build();
                        return webFilterChain.filter(serverWebExchange.mutate().request(mutatedRequest).build());
                    }));
        }
        return webFilterChain.filter(serverWebExchange);


    }

    private RegisterRequest getUserDetails(String token) {
        try{
            String tokenWithoutBearer=token.replace("Bearer ", "").trim();
            SignedJWT signedJwt = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = signedJwt.getJWTClaimsSet();
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(claims.getStringClaim("email"));
            registerRequest.setFirstName(claims.getStringClaim("given_name"));
            registerRequest.setLastName(claims.getStringClaim("family_name"));
            registerRequest.setPassword("dummy@123");
            registerRequest.setKeycloackId(claims.getStringClaim("sub"));
            return registerRequest;

        }
        catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }

}
