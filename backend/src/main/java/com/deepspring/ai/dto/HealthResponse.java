package com.deepspring.ai.dto;

import java.time.Instant;
import java.util.Map;

public class HealthResponse {

    private String status;
    private String application;
    private String version;
    private String aiProvider;
    private String configuredModel;
    private String ollamaBaseUrl;
    private Instant timestamp;
    private Map<String, Object> details;

    public HealthResponse() {
        this.timestamp = Instant.now();
    }

    public HealthResponse(String status, String application, String version, String aiProvider, String configuredModel, String ollamaBaseUrl) {
        this.status = status;
        this.application = application;
        this.version = version;
        this.aiProvider = aiProvider;
        this.configuredModel = configuredModel;
        this.ollamaBaseUrl = ollamaBaseUrl;
        this.timestamp = Instant.now();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getAiProvider() {
        return aiProvider;
    }

    public void setAiProvider(String aiProvider) {
        this.aiProvider = aiProvider;
    }

    public String getConfiguredModel() {
        return configuredModel;
    }

    public void setConfiguredModel(String configuredModel) {
        this.configuredModel = configuredModel;
    }

    public String getOllamaBaseUrl() {
        return ollamaBaseUrl;
    }

    public void setOllamaBaseUrl(String ollamaBaseUrl) {
        this.ollamaBaseUrl = ollamaBaseUrl;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
