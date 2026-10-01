package com.deepspring.ai;

import com.deepspring.ai.util.DeepSeekResponseParser;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeepSeekResponseParserTest {

    @Test
    void testParseWithThinkingTags() {
        String raw = "<think>\nThinking about the problem...\nLet's calculate 2 + 2.\n</think>\nThe answer is 4.";
        var parsed = DeepSeekResponseParser.parse(raw);

        assertNotNull(parsed.reasoningContent());
        assertTrue(parsed.reasoningContent().contains("Thinking about the problem"));
        assertEquals("The answer is 4.", parsed.message());
    }

    @Test
    void testParseWithoutThinkingTags() {
        String raw = "Just a regular AI message without thinking tags.";
        var parsed = DeepSeekResponseParser.parse(raw);

        assertNull(parsed.reasoningContent());
        assertEquals("Just a regular AI message without thinking tags.", parsed.message());
    }

    @Test
    void testParseWithOpenThinkTag() {
        String raw = "<think>Still thinking in progress...";
        var parsed = DeepSeekResponseParser.parse(raw);

        assertNotNull(parsed.reasoningContent());
        assertEquals("Still thinking in progress...", parsed.reasoningContent());
    }

    @Test
    void testParseNullOrEmpty() {
        var parsedNull = DeepSeekResponseParser.parse(null);
        assertNull(parsedNull.reasoningContent());
        assertEquals("", parsedNull.message());

        var parsedEmpty = DeepSeekResponseParser.parse("   ");
        assertNull(parsedEmpty.reasoningContent());
        assertEquals("", parsedEmpty.message());
    }
}
