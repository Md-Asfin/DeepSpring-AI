package com.deepspring.ai.dto;

import java.time.Instant;

public class ChatResponse {

    private String message;
    private String reasoningContent;
    private String conversationId;
    private String model;
    private String finishReason;
    private Instant timestamp;

    public ChatResponse() {
        this.timestamp = Instant.now();
    }

    public ChatResponse(String message, String reasoningContent, String conversationId, String model) {
        this.message = message;
        this.reasoningContent = reasoningContent;
        this.conversationId = conversationId;
        this.model = model;
        this.finishReason = "stop";
        this.timestamp = Instant.now();
    }

    public static ChatResponse of(String message, String reasoningContent, String conversationId, String model) {
        return new ChatResponse(message, reasoningContent, conversationId, model);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReasoningContent() {
        return reasoningContent;
    }

    public void setReasoningContent(String reasoningContent) {
        this.reasoningContent = reasoningContent;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
