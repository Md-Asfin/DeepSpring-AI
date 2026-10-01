package com.deepspring.ai;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "app.ai.provider=mock"
})
class DeepSpringAiApplicationTests {

    @Test
    void contextLoads() {
    }
}
