package com.deepspring.ai.service;

import com.deepspring.ai.config.AppProperties;
import com.deepspring.ai.dto.ChatChunkResponse;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import com.deepspring.ai.exception.AiServiceException;
import com.deepspring.ai.util.DeepSeekResponseParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service("mockChatService")
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockChatService implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(MockChatService.class);
    private final AppProperties appProperties;

    public MockChatService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @Override
    public String getProviderName() {
        return "mock";
    }

    @Override
    public String getActiveModel() {
        return "deepseek-r1-mock";
    }

    @Override
    public ChatResponse generate(ChatRequest request) {
        String prompt = request.getPrompt();
        log.info("Mock AI generating synchronous response for prompt length: {}", prompt.length());

        checkSimulatedErrors(prompt);

        String rawResponse = generateMockRawResponse(prompt);
        var parsed = DeepSeekResponseParser.parse(rawResponse);

        String conversationId = request.getConversationId() != null 
                ? request.getConversationId() 
                : UUID.randomUUID().toString();

        return ChatResponse.of(parsed.message(), parsed.reasoningContent(), conversationId, getActiveModel());
    }

    @Override
    public Flux<ChatChunkResponse> stream(ChatRequest request) {
        String prompt = request.getPrompt();
        log.info("Mock AI starting streaming response for prompt length: {}", prompt.length());

        if (prompt.contains("trigger_mock_error")) {
            return Flux.error(new AiServiceException("Simulated AI streaming failure.", "MOCK_STREAM_ERROR"));
        }
        if (prompt.contains("trigger_unavailable_error")) {
            return Flux.error(new AiServiceException("The AI service is currently unavailable.", "AI_SERVICE_UNAVAILABLE"));
        }

        String conversationId = request.getConversationId() != null 
                ? request.getConversationId() 
                : UUID.randomUUID().toString();

        String rawResponse = generateMockRawResponse(prompt);
        var parsed = DeepSeekResponseParser.parse(rawResponse);

        List<ChatChunkResponse> chunks = new ArrayList<>();

        // 1. Send reasoning / thinking tokens if present
        if (parsed.reasoningContent() != null && !parsed.reasoningContent().isBlank()) {
            String[] thinkingWords = parsed.reasoningContent().split("(?<=\\s)|(?<=[.,\n])");
            for (String word : thinkingWords) {
                if (!word.isEmpty()) {
                    chunks.add(ChatChunkResponse.thinkingChunk(word));
                }
            }
        }

        // 2. Send content tokens
        String[] messageWords = parsed.message().split("(?<=\\s)|(?<=[.,\n])");
        for (String word : messageWords) {
            if (!word.isEmpty()) {
                chunks.add(ChatChunkResponse.contentChunk(word));
            }
        }

        // 3. Send completion chunk
        chunks.add(ChatChunkResponse.done(conversationId, getActiveModel()));

        long delay = Math.max(10, appProperties.getMock().getStreamDelayMillis());

        return Flux.interval(Duration.ofMillis(delay))
                .take(chunks.size())
                .map(index -> chunks.get(index.intValue()));
    }

    private void checkSimulatedErrors(String prompt) {
        if (prompt.contains("trigger_mock_error")) {
            throw new AiServiceException("Simulated mock provider failure for testing.", "MOCK_ERROR");
        }
        if (prompt.contains("trigger_unavailable_error")) {
            throw new AiServiceException("The local AI service is unavailable. Start Ollama and make sure the configured DeepSeek model is installed.", "AI_SERVICE_UNAVAILABLE");
        }
    }

    private String generateMockRawResponse(String prompt) {
        String lower = prompt.toLowerCase();

        if (lower.contains("hello") || lower.contains("hi") || lower.contains("hey")) {
            return """
                    <think>
                    The user is greeting me.
                    I should introduce myself as DeepSpring AI, mention local and private execution, and offer assistance.
                    </think>
                    Hello! I am **DeepSpring AI**, your private AI assistant running locally on your own machine.
                    
                    How can I help you today? You can ask me to:
                    * Write and debug code
                    * Explain complex concepts
                    * Draft articles or documentation
                    * Analyze data and problem-solve
                    """;
        }

        if (lower.contains("code") || lower.contains("java") || lower.contains("python") || lower.contains("react") || lower.contains("script")) {
            return """
                    <think>
                    The user is asking for code.
                    I will provide a clean, documented example with syntax highlighting and explain how it works.
                    </think>
                    Here is a modern example demonstrating private stream processing in **Java**:

                    ```java
                    package com.deepspring.ai.demo;

                    import java.util.List;
                    import java.util.stream.Collectors;

                    public class StreamProcessingDemo {
                        public static void main(String[] args) {
                            List<String> prompts = List.of("DeepSpring AI", "Spring Boot", "Ollama", "DeepSeek R1");

                            List<String> processed = prompts.stream()
                                    .filter(p -> p.startsWith("Deep"))
                                    .map(String::toUpperCase)
                                    .collect(Collectors.toList());

                            System.out.println("Processed: " + processed);
                        }
                    }
                    ```

                    ### Key Highlights:
                    1. **Filtering**: Selects items with prefix `Deep`.
                    2. **Mapping**: Converts to uppercase.
                    3. **Immutability**: Preserves original collection state.
                    """;
        }

        if (lower.contains("deepseek") || lower.contains("ollama") || lower.contains("model")) {
            return """
                    <think>
                    The user is asking about DeepSeek and Ollama integration.
                    Explain the local reasoning capabilities, private data architecture, and offline inference benefits.
                    </think>
                    ### DeepSpring AI + DeepSeek R1 Architecture

                    DeepSpring AI runs **DeepSeek** models completely locally via **Ollama**.

                    | Feature | DeepSpring AI (Local) | Cloud AI Services |
                    | :--- | :--- | :--- |
                    | **Privacy** | 100% On-Device | Data sent to external servers |
                    | **Cost** | Free (Open-Source) | Per-token billing |
                    | **Latency** | Local GPU / CPU speed | Network dependent |
                    | **Offline** | Fully functional offline | Requires internet connection |

                    > **Note**: Your conversation data and prompts never leave your local system.
                    """;
        }

        return """
                <think>
                The user has submitted a general query.
                I will break down the response logically, providing structured reasoning and a comprehensive answer.
                </think>
                Thank you for your question! Here is a structured breakdown:

                ### Summary
                DeepSpring AI processed your request locally using simulated reasoning and streaming architecture.

                ### Details:
                * **Input Received**: "%s"
                * **Mode**: Private local execution
                * **Format**: Full Markdown with syntax highlighting and reasoning extraction support.

                Feel free to ask follow-up questions!
                """.formatted(prompt.length() > 50 ? prompt.substring(0, 50) + "..." : prompt);
    }
}
