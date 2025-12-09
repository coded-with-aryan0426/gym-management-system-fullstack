package com.gym.management.controller;

import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public Map<String, Integer> getStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("owners", userRepository.findByRoleName("OWNER").size());
        stats.put("trainers", userRepository.findByRoleName("TRAINER").size());
        stats.put("staff", userRepository.findByRoleName("STAFF").size());
        stats.put("customers", userRepository.findByRoleName("CUSTOMER").size());
        return stats;
    }
}
