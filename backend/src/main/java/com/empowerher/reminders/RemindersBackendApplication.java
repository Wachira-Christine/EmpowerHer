package com.empowerher.reminders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RemindersBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(RemindersBackendApplication.class, args);
        System.out.println("EmpowerHer Reminders Backend Service started successfully!");
    }
}
