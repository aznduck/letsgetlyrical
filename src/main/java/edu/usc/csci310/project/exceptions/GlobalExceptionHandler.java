package edu.usc.csci310.project.exceptions;

import edu.usc.csci310.project.exceptions.UsernameNotAvailableException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UsernameNotAvailableException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotAvailableException(UsernameNotAvailableException ex) {
        Map<String, String> errorResponse = new HashMap<String, String>();
        errorResponse.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(errorResponse);
    }
}
