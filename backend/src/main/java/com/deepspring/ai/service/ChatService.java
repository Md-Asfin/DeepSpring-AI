package com.deepspring.ai.service;

import com.deepspring.ai.dto.ChatChunkResponse;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import reactor.core.publisher.Flux;

public interface ChatService {

    /**
     * Generate a complete synchronous response for the chat request.
     */
    ChatResponse generate(ChatRequest request);

    /**
     * Generate a reactive streaming response sending incremental chunks.
     */
    Flux<ChatChunkResponse> stream(ChatRequest request);

    /**
     * Get the active provider name (e.g., "mock", "ollama").
     */
    String getProviderName();

    /**
     * Get the currently active model name.
     */
    String getActiveModel();
}
