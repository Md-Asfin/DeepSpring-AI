package com.deepspring.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /**
     * AI provider type: "mock" or "ollama"
     */
    private String aiProvider = "mock";

    /**
     * CORS configuration
     */
    private Cors cors = new Cors();

    /**
     * Mock AI provider settings
     */
    private Mock mock = new Mock();

    public String getAiProvider() {
        return aiProvider;
    }

    public void setAiProvider(String aiProvider) {
        this.aiProvider = aiProvider;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Mock getMock() {
        return mock;
    }

    public void setMock(Mock mock) {
        this.mock = mock;
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173", "http://localhost:3000");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Mock {
        private long streamDelayMillis = 40;
        private boolean simulateThinking = true;

        public long getStreamDelayMillis() {
            return streamDelayMillis;
        }

        public void setStreamDelayMillis(long streamDelayMillis) {
            this.streamDelayMillis = streamDelayMillis;
        }

        public boolean isSimulateThinking() {
            return simulateThinking;
        }

        public void setSimulateThinking(boolean simulateThinking) {
            this.simulateThinking = simulateThinking;
        }
    }
}
