package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.exception.UsernameNotAvailableException;
import edu.usc.csci310.project.services.RegisterService;
import edu.usc.csci310.project.requests.CreateUserRequest;
import edu.usc.csci310.project.responses.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;

@RestController
@RequestMapping("/api/register")
public class RegisterController {
    private final RegisterService registerService;
    public RegisterController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping()
    public ResponseEntity<UserResponse> registerUser(@RequestBody CreateUserRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new RuntimeException("Username cannot be empty");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new RuntimeException("Password cannot be empty");
            }
            if (!isValidUsername(request.getUsername())) {
                throw new RuntimeException("Invalid input: username must only contain letters, numbers, spaces, underscores, or hyphens.");
            }
            if (!isValidPassword(request.getPassword())) {
                throw new RuntimeException("Invalid input: password must contain a lowercase, uppercase, and number.");
            }
            int id = registerService.createUser(request);
            UserResponse response = new UserResponse(id, request.getUsername(), request.getPassword());
            return ResponseEntity.ok().body(response);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding User: " + e.getMessage(), e);
        }
        catch(UsernameNotAvailableException unae) {
            throw new RuntimeException("Service says Username not available " + unae.getMessage(), unae);
        }
    }

    public boolean isValidUsername(String username) {
        return username != null && username.matches("^[a-zA-Z0-9 _-]+$");
    }

    public boolean isValidPassword(String password) {
        return password != null && password.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*");
    }
}
