package com.deepspring.ai;

import com.deepspring.ai.dto.ErrorResponse;
import com.deepspring.ai.exception.AiServiceException;
import com.deepspring.ai.exception.GlobalExceptionHandler;
import com.deepspring.ai.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void testHandleInvalidRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/chat");

        ResponseEntity<ErrorResponse> response = handler.handleInvalidRequest(
                new InvalidRequestException("Invalid prompt parameter"),
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INVALID_REQUEST", response.getBody().getError());
        assertEquals("Invalid prompt parameter", response.getBody().getMessage());
        assertEquals("/api/chat", response.getBody().getPath());
    }

    @Test
    void testHandleAiServiceUnavailable() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/chat");

        ResponseEntity<ErrorResponse> response = handler.handleAiServiceException(
                new AiServiceException("Ollama offline", "AI_SERVICE_UNAVAILABLE"),
                request
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("AI_SERVICE_UNAVAILABLE", response.getBody().getError());
    }

    @Test
    void testHandleGenericException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/chat");

        ResponseEntity<ErrorResponse> response = handler.handleGenericException(
                new RuntimeException("Database down"),
                request
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().getError());
        // Stack trace / internal detail is NOT leaked
        assertEquals("An unexpected server error occurred. Please try again later.", response.getBody().getMessage());
    }
}
