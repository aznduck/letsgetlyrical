package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {
    private int id;
    private String username;
    private String password;
    private User user;

    @BeforeEach
    public void setUp() {
        this.id = 1;
        this.username = "username";
        this.password = "Password1";
        this.user = new User(id, username, password);
    }

    @Test
    void getId() {
        assertEquals(id, user.getId());
    }
}