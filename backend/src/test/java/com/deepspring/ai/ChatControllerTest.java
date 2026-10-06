package com.deepspring.ai;

import com.deepspring.ai.config.AppProperties;
import com.deepspring.ai.controller.ChatController;
import com.deepspring.ai.controller.HealthController;
import com.deepspring.ai.dto.ChatRequest;
import com.deepspring.ai.dto.ChatResponse;
import com.deepspring.ai.exception.AiServiceException;
import com.deepspring.ai.exception.GlobalExceptionHandler;
import com.deepspring.ai.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {ChatController.class, HealthController.class})
@Import({GlobalExceptionHandler.class})
@EnableConfigurationProperties(AppProperties.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        when(chatService.getProviderName()).thenReturn("mock");
        when(chatService.getActiveModel()).thenReturn("deepseek-r1-mock");
    }

    @Test
    void testChatEndpointSuccess() throws Exception {
        ChatResponse expectedResponse = ChatResponse.of("Hello from DeepSpring AI!", "Thinking...", "conv-123", "deepseek-r1-mock");
        when(chatService.generate(any(ChatRequest.class))).thenReturn(expectedResponse);

        ChatRequest request = new ChatRequest("Hello!");

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hello from DeepSpring AI!"))
                .andExpect(jsonPath("$.reasoningContent").value("Thinking..."))
                .andExpect(jsonPath("$.conversationId").value("conv-123"))
                .andExpect(jsonPath("$.model").value("deepseek-r1-mock"));
    }

    @Test
    void testChatValidationFailsOnBlankPrompt() throws Exception {
        ChatRequest request = new ChatRequest("");

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("DeepSpring AI"))
                .andExpect(jsonPath("$.aiProvider").value("mock"));
    }

    @Test
    void testModelsEndpoint() throws Exception {
        mockMvc.perform(get("/api/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("deepseek-r1-mock"))
                .andExpect(jsonPath("$[0].supportsThinking").value(true));
    }

    @Test
    void testAiServiceUnavailableHandling() throws Exception {
        when(chatService.generate(any(ChatRequest.class)))
                .thenThrow(new AiServiceException("The local AI service is unavailable.", "AI_SERVICE_UNAVAILABLE"));

        ChatRequest request = new ChatRequest("Hello");

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("AI_SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.status").value(503));
    }
}
