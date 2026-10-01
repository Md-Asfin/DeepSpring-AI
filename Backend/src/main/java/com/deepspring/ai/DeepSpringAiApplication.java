package com.deepspring.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.deepspring.ai.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class DeepSpringAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeepSpringAiApplication.class, args);
    }
}
