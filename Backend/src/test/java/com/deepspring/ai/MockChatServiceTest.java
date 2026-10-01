package com.deepspring.ai;

import com.deepspring.ai.config.AppProperties;
import com.deepspring.ai.dto.ChatChunkResponse;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import com.deepspring.ai.exception.AiServiceException;
import com.deepspring.ai.service.MockChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MockChatServiceTest {

    private MockChatService mockChatService;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        appProperties.getMock().setStreamDelayMillis(1); // Fast tests
        mockChatService = new MockChatService(appProperties);
    }

    @Test
    void testProviderNameAndModel() {
        assertEquals("mock", mockChatService.getProviderName());
        assertEquals("deepseek-r1-mock", mockChatService.getActiveModel());
    }

    @Test
    void testGenerateGreetingResponse() {
        ChatRequest request = new ChatRequest("Hello there!");
        ChatResponse response = mockChatService.generate(request);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().contains("DeepSpring AI"));
        assertNotNull(response.getReasoningContent());
        assertNotNull(response.getConversationId());
        assertEquals("deepseek-r1-mock", response.getModel());
    }

    @Test
    void testGenerateCodeResponse() {
        ChatRequest request = new ChatRequest("Show me some Java code");
        ChatResponse response = mockChatService.generate(request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("```java"));
    }

    @Test
    void testStreamResponse() {
        ChatRequest request = new ChatRequest("Hello");
        Flux<ChatChunkResponse> flux = mockChatService.stream(request);

        List<ChatChunkResponse> chunks = flux.collectList().block();
        assertNotNull(chunks);
        assertFalse(chunks.isEmpty());

        // Last chunk should be marked done
        ChatChunkResponse lastChunk = chunks.get(chunks.size() - 1);
        assertTrue(Boolean.TRUE.equals(lastChunk.getIsDone()));
        assertEquals("deepseek-r1-mock", lastChunk.getModel());
    }

    @Test
    void testSimulatedErrorTrigger() {
        ChatRequest request = new ChatRequest("trigger_mock_error");
        assertThrows(AiServiceException.class, () -> mockChatService.generate(request));
    }
}
