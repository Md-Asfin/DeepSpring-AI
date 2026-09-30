package com.telusko;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HelloController {

    private final ChatClient chatClient;

    public HelloController(ChatClient.Builder chatClient) {
        this.chatClient = chatClient.build();
    }


    @GetMapping("/{chat}")
    public ResponseEntity<String> promptWithPathVariable(@PathVariable String chat) {
        try {
            String response = chatClient
                    .prompt(chat)
                    .call()
                    .content();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

}
