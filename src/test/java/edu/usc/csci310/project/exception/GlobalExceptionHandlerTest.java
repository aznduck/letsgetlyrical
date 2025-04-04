package edu.usc.csci310.project.exception;

import edu.usc.csci310.project.exception.GlobalExceptionHandler;
import edu.usc.csci310.project.exception.UsernameNotAvailableException;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    @Test
    void handleUsernameNotAvailableException() {
        UsernameNotAvailableException ex = new UsernameNotAvailableException("test exception");
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<Map<String, String>> responseEntity = handler.handleUsernameNotAvailableException(ex);
        assertNotNull(responseEntity);
        assertEquals(ex.getMessage(), responseEntity.getBody().get("error"));
    }
}