package edu.usc.csci310.project;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppConfigTest {
    @Test
    void testRestTemplateCreation() {
        // Create a mock RestTemplateBuilder
        RestTemplateBuilder mockBuilder = mock(RestTemplateBuilder.class);
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        // Set up the mock to return the mock RestTemplate when build() is called
        when(mockBuilder.build()).thenReturn(mockRestTemplate);

        // Create the AppConfig instance
        AppConfig appConfig = new AppConfig();

        // Call the method under test
        RestTemplate result = appConfig.restTemplate(mockBuilder);

        // Verify that the builder's build method was called
        verify(mockBuilder).build();

        // Verify that the result is what we expect
        assertSame(mockRestTemplate, result, "The returned RestTemplate should be the one created by the builder");
    }
}