package com.gym.management.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UserJsonTest {

    @Test
    public void testPasswordSerialization() throws JsonProcessingException {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("secretPassword");
        user.setFullName("Test User");

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(user);

        // Fix verification: Password should NOT be serialized
        assertFalse(json.contains("\"password\":\"secretPassword\""), "Password should NOT be present in JSON");
        assertFalse(json.contains("secretPassword"), "Password value should NOT be present in JSON");

        // Verify deserialization works (WRITE_ONLY behavior)
        String inputJson = "{\"username\":\"newUser\", \"password\":\"newPassword\"}";
        User deserializedUser = mapper.readValue(inputJson, User.class);
        assertEquals("newPassword", deserializedUser.getPassword(), "Password should be deserialized correctly");
    }
}
