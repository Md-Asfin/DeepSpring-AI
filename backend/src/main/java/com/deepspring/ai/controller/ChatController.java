package com.deepspring.ai.controller;

import com.deepspring.ai.dto.ChatChunkResponse;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import com.deepspring.ai.dto.ModelInfo;
import com.deepspring.ai.service.ChatService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Synchronous Chat Completion endpoint
     * POST /api/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        log.info("Received synchronous chat request [provider={}]", chatService.getProviderName());
        ChatResponse response = chatService.generate(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Server-Sent Events (SSE) Streaming Chat endpoint
     * POST /api/chat/stream
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<ChatChunkResponse>> streamChat(@Valid @RequestBody ChatRequest request) {
        log.info("Received streaming chat request [provider={}]", chatService.getProviderName());

        return chatService.stream(request)
                .map(chunk -> ServerSentEvent.<ChatChunkResponse>builder()
                        .data(chunk)
                        .event(Boolean.TRUE.equals(chunk.getIsDone()) ? "done" : "message")
                        .build())
                .doOnError(e -> log.error("Stream error in ChatController: {}", e.getMessage()))
                .doOnCancel(() -> log.info("Client cancelled stream"));
    }

    /**
     * List supported/available models
     * GET /api/models
     */
    @GetMapping("/models")
    public ResponseEntity<List<ModelInfo>> getModels() {
        String activeModel = chatService.getActiveModel();
        List<ModelInfo> models = List.of(
                new ModelInfo(activeModel, activeModel, "Active configured DeepSeek reasoning model", true, true),
                new ModelInfo("deepseek-r1:1.5b", "DeepSeek R1 (1.5B)", "Lightweight reasoning model for fast inference", true, false),
                new ModelInfo("deepseek-r1:7b", "DeepSeek R1 (7B)", "Balanced reasoning model for general coding and analysis", true, false),
                new ModelInfo("deepseek-r1:8b", "DeepSeek R1 (8B)", "Enhanced reasoning capability", true, false),
                new ModelInfo("deepseek-r1:14b", "DeepSeek R1 (14B)", "High-accuracy reasoning and advanced problem solving", true, false),
                new ModelInfo("deepseek-r1:32b", "DeepSeek R1 (32B)", "Full-scale deep reasoning model", true, false)
        );
        return ResponseEntity.ok(models);
    }
}
