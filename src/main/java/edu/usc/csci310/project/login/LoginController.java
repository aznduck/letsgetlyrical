package edu.usc.csci310.project.login;


import edu.usc.csci310.project.registration.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static edu.usc.csci310.project.Utils.isValidPassword;
import static edu.usc.csci310.project.Utils.isValidUsername;

import java.sql.SQLException;

@RestController
@RequestMapping("/api/login")
public class LoginController {
    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> loginUser(@RequestBody LoginUserRequest request) {
        try {
            if (!isValidUsername(request.getUsername())) {
                throw new RuntimeException("Invalid input: username must only contain letters, numbers, spaces, underscores, or hyphens.");
            }
            if (!isValidPassword(request.getPassword())) {
                throw new RuntimeException("Invalid input: password must contain a lowercase, uppercase, and number.");
            }
            int id = loginService.loginUser(request);
            UserResponse response = new UserResponse(id, request.getUsername(), request.getPassword());
            return ResponseEntity.ok().body(response);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding User: " + e.getMessage(), e);
        }
    }




}
