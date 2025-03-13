package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginServiceTest {

    @Test
    void loginUser() throws SQLException {
        Connection conn = mock();

        when(conn.prepareStatement("SELECT * FROM users WHERE username = ? AND password = ?")).thenReturn(null);

        LoginService loginService = new LoginService(conn);
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("testuser");
        createUserRequest.setPassword("testpassword");
        assertTrue(loginService.loginUser(createUserRequest)>0);
    }
}