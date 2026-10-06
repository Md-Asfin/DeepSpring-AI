package com.deepspring.ai.service;

import com.deepspring.ai.dto.ChatChunkResponse;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import com.deepspring.ai.exception.AiServiceException;
import com.deepspring.ai.util.DeepSeekResponseParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Service("ollamaChatService")
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "ollama")
public class OllamaChatService implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(OllamaChatService.class);

    private final ChatClient chatClient;

    @Value("${spring.ai.ollama.chat.options.model:deepseek-r1}")
    private String modelName;

    @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    public OllamaChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public String getProviderName() {
        return "ollama";
    }

    @Override
    public String getActiveModel() {
        return modelName;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    @Override
    public ChatResponse generate(ChatRequest request) {
        String conversationId = request.getConversationId() != null 
                ? request.getConversationId() 
                : UUID.randomUUID().toString();

        log.info("Dispatching chat request to Ollama [{}] at {}", modelName, baseUrl);

        try {
            var promptSpec = chatClient.prompt().user(request.getPrompt());
            if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
                promptSpec.system(request.getSystemPrompt());
            }

            String rawContent = promptSpec.call().content();
            var parsed = DeepSeekResponseParser.parse(rawContent);

            return ChatResponse.of(parsed.message(), parsed.reasoningContent(), conversationId, modelName);
        } catch (Exception e) {
            log.error("Failed to communicate with Ollama backend: {}", e.getMessage(), e);
            throw translateException(e);
        }
    }

    @Override
    public Flux<ChatChunkResponse> stream(ChatRequest request) {
        String conversationId = request.getConversationId() != null 
                ? request.getConversationId() 
                : UUID.randomUUID().toString();

        log.info("Initiating streaming chat request to Ollama [{}]", modelName);

        try {
            var promptSpec = chatClient.prompt().user(request.getPrompt());
            if (request.getSystemPrompt() != null && !request.getSystemPrompt().isBlank()) {
                promptSpec.system(request.getSystemPrompt());
            }

            AtomicBoolean insideThinkTag = new AtomicBoolean(false);

            return promptSpec.stream()
                    .content()
                    .map(token -> processStreamToken(token, insideThinkTag))
                    .concatWith(Flux.just(ChatChunkResponse.done(conversationId, modelName)))
                    .onErrorResume(e -> {
                        log.error("Ollama streaming stream error: {}", e.getMessage());
                        return Flux.just(ChatChunkResponse.errorChunk(
                                "Streaming interrupted: The Ollama service encountered an error or disconnected. " + e.getMessage()
                        ));
                    });
        } catch (Exception e) {
            log.error("Failed to initiate Ollama stream: {}", e.getMessage(), e);
            return Flux.error(translateException(e));
        }
    }

    private ChatChunkResponse processStreamToken(String token, AtomicBoolean insideThinkTag) {
        if (token.contains("<think>")) {
            insideThinkTag.set(true);
            token = token.replace("<think>", "");
            return ChatChunkResponse.thinkingChunk(token);
        }
        if (token.contains("</think>")) {
            insideThinkTag.set(false);
            token = token.replace("</think>", "");
            return ChatChunkResponse.contentChunk(token);
        }

        if (insideThinkTag.get()) {
            return ChatChunkResponse.thinkingChunk(token);
        } else {
            return ChatChunkResponse.contentChunk(token);
        }
    }

    private AiServiceException translateException(Exception e) {
        String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        if (message.contains("connection refused") || message.contains("connect") || message.contains("i/o error") || message.contains("offline")) {
            return new AiServiceException(
                    "The local AI service is unavailable. Start Ollama at " + baseUrl + " and make sure the model '" + modelName + "' is installed.",
                    e,
                    "AI_SERVICE_UNAVAILABLE"
            );
        }
        return new AiServiceException("Ollama service error: " + e.getMessage(), e, "OLLAMA_ERROR");
    }
}
