package com.deepspring.ai.controller;

import com.deepspring.ai.config.AppProperties;
import com.deepspring.ai.dto.HealthResponse;
import com.deepspring.ai.service.ChatService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final ChatService chatService;
    private final AppProperties appProperties;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    public HealthController(ChatService chatService, AppProperties appProperties) {
        this.chatService = chatService;
        this.appProperties = appProperties;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse(
                "UP",
                "DeepSpring AI",
                "1.0.0",
                chatService.getProviderName(),
                chatService.getActiveModel(),
                ollamaBaseUrl
        );

        response.setDetails(Map.of(
                "environment", "production-ready",
                "allowedOrigins", appProperties.getCors().getAllowedOrigins(),
                "streamingSupported", true,
                "thinkingExtractionSupported", true
        ));

        return ResponseEntity.ok(response);
    }
}
