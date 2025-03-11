package edu.usc.csci310.project.registration;

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

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody CreateUserRequest request) {
        try {
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
    }

    public boolean isValidUsername(String username) {
        return username != null && username.matches("^[a-zA-Z0-9 _-]+$");
    }

    public boolean isValidPassword(String username) {
        return username != null && username.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*");
    }
}
