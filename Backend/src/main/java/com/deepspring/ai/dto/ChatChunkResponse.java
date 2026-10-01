package com.deepspring.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatChunkResponse {

    private String content;
    private String thinkingChunk;
    private Boolean isDone;
    private String conversationId;
    private String model;
    private String error;

    public ChatChunkResponse() {
    }

    public static ChatChunkResponse contentChunk(String content) {
        ChatChunkResponse chunk = new ChatChunkResponse();
        chunk.setContent(content);
        return chunk;
    }

    public static ChatChunkResponse thinkingChunk(String thinking) {
        ChatChunkResponse chunk = new ChatChunkResponse();
        chunk.setThinkingChunk(thinking);
        return chunk;
    }

    public static ChatChunkResponse done(String conversationId, String model) {
        ChatChunkResponse chunk = new ChatChunkResponse();
        chunk.setIsDone(true);
        chunk.setConversationId(conversationId);
        chunk.setModel(model);
        return chunk;
    }

    public static ChatChunkResponse errorChunk(String error) {
        ChatChunkResponse chunk = new ChatChunkResponse();
        chunk.setError(error);
        chunk.setIsDone(true);
        return chunk;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getThinkingChunk() {
        return thinkingChunk;
    }

    public void setThinkingChunk(String thinkingChunk) {
        this.thinkingChunk = thinkingChunk;
    }

    public Boolean getIsDone() {
        return isDone;
    }

    public void setIsDone(Boolean isDone) {
        this.isDone = isDone;
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

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
