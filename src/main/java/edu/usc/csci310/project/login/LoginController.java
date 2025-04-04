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
//                throw new RuntimeException("Invalid input: username must only contain letters, numbers, spaces, underscores, or hyphens.");
                return ResponseEntity.status(400).body(new UserResponse(-3, "Invalid input: username must only contain letters, numbers, spaces, underscores, or hyphens.", ""));
            }
            if (!isValidPassword(request.getPassword())) {
//                throw new RuntimeException("Invalid input: password must contain a lowercase, uppercase, and number.");
                return ResponseEntity.status(400).body(new UserResponse(-3, "Invalid input: password must contain a lowercase, uppercase, and number", ""));

            }
            // login result
            int id = loginService.loginUser(request);

            // if user doesn't exist
            if(id == -1) {
                return ResponseEntity.status(404).body(new UserResponse(id, "User not found", ""));
            }
            // if password is incorrect
            else if(id == -2) {
                return ResponseEntity.status(401).body(new UserResponse(id, "Invalid password", ""));
            }
            // if successful
            else {
                return ResponseEntity.ok().body(new UserResponse(id, "Successfully logged in", ""));
            }


        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding User: " + e.getMessage(), e);
        }
    }




}
