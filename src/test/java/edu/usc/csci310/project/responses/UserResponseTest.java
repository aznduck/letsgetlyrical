package edu.usc.csci310.project.responses;

import edu.usc.csci310.project.responses.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserResponseTest {
    private int id;
    private String username;
    private String password;
    private UserResponse userResponse;

    @BeforeEach
    public void setUp() {
        this.id = 1;
        this.username = "username";
        this.password = "Password1";
        this.userResponse = new UserResponse(id, username, password);
    }

    @Test
    void getId() {

        assertEquals(id, userResponse.getId());
    }

    @Test
    void getPassword() {
        assertEquals(password, userResponse.getPassword());
    }

    @Test
    void getUsername() {
        assertEquals(username, userResponse.getUsername());
    }
}