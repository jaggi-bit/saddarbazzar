package com.sadarbazar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SadarBazarApplication {

    public static void main(String[] args) {
        SpringApplication.run(SadarBazarApplication.class, args);
    }
}
