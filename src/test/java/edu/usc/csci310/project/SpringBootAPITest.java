package edu.usc.csci310.project;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.SpringApplication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;

class SpringBootAPITest {

    private SpringBootAPI api;

    @BeforeEach
    void setUp() {
        api = new SpringBootAPI();
    }

    @Test
    void testMain() {
        // Use mockStatic to prevent the actual Spring application from starting
        try (MockedStatic<SpringApplication> mockedSpringApplication = mockStatic(SpringApplication.class)) {
            // Call the main method
            SpringBootAPI.main(new String[]{});

            // Verify that SpringApplication.run was called with the correct parameters
            mockedSpringApplication.verify(() ->
                    SpringApplication.run(
                            eq(SpringBootAPI.class),
                            any(String[].class)
                    )
            );
        }
    }

    @Test
    void testRedirect() {
        // Simply test that the redirect method returns the expected string
        String result = api.redirect();
        assertEquals("forward:/", result);
    }
}