package edu.usc.csci310.project.login;

import edu.usc.csci310.project.registration.CreateUserRequest;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginServiceTest {

    @Test
    void loginUser() throws SQLException {
        Connection conn = mock();

        ResultSet rs = mock();
        when(rs.next()).thenReturn(true);
        when(rs.getInt("id")).thenReturn(1);
        PreparedStatement ps = mock();
        when(conn.prepareStatement("SELECT * FROM users WHERE username = ? AND password = ?")).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        LoginService loginService = new LoginService(conn);
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("testuser");
        createUserRequest.setPassword("testpassword");
        assertTrue(loginService.loginUser(createUserRequest)>0);
    }
    @Test
    void testHashPasswordValid() {
        LoginService loginService = new LoginService(null);
        String hashedPW = loginService.hashPassword("Password1");
        boolean isHashedPWCorrect = loginService.verifyPassword("Password1", hashedPW);
        assertTrue(isHashedPWCorrect);
    }
}