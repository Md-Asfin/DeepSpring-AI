package com.deepspring.ai.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DeepSeekResponseParser {

    private static final Pattern THINK_PATTERN = Pattern.compile("<think>(.*?)</think>", Pattern.DOTALL);

    public record ParsedResponse(String reasoningContent, String message) {}

    /**
     * Parses reasoning/thinking content and cleaned message from DeepSeek response text.
     */
    public static ParsedResponse parse(String rawContent) {
        if (rawContent == null || rawContent.isBlank()) {
            return new ParsedResponse(null, "");
        }

        Matcher matcher = THINK_PATTERN.matcher(rawContent);
        if (matcher.find()) {
            String thinking = matcher.group(1).trim();
            String cleanMessage = matcher.replaceAll("").trim();
            return new ParsedResponse(thinking.isEmpty() ? null : thinking, cleanMessage);
        }

        // Handle open <think> tag without closing </think>
        if (rawContent.contains("<think>")) {
            int thinkIndex = rawContent.indexOf("<think>");
            String thinking = rawContent.substring(thinkIndex + 7).trim();
            String beforeThink = rawContent.substring(0, thinkIndex).trim();
            return new ParsedResponse(thinking.isEmpty() ? null : thinking, beforeThink);
        }

        return new ParsedResponse(null, rawContent.trim());
    }
}
