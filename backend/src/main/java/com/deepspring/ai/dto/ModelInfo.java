package com.deepspring.ai.dto;

public class ModelInfo {

    private String id;
    private String name;
    private String description;
    private boolean supportsThinking;
    private boolean isDefault;

    public ModelInfo() {
    }

    public ModelInfo(String id, String name, String description, boolean supportsThinking, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.supportsThinking = supportsThinking;
        this.isDefault = isDefault;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isSupportsThinking() {
        return supportsThinking;
    }

    public void setSupportsThinking(boolean supportsThinking) {
        this.supportsThinking = supportsThinking;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
