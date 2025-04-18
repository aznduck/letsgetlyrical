package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.requests.LoginUserRequest;
import edu.usc.csci310.project.services.LoginService;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import static edu.usc.csci310.project.Utils.hashPassword;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class LoginServiceTest {

    @Test
    void loginUserValid() throws SQLException {
        Connection conn = mock();
        PreparedStatement ps = mock();
        ResultSet rs = mock();

        when(conn.prepareStatement("SELECT * FROM users WHERE username = ?")).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getString("password")).thenReturn("Password0");
        when(rs.getInt("id")).thenReturn(1);

        try (MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.verifyPassword("Password0", "Password0")).thenReturn(true);

            LoginService loginService = new LoginService(conn);
            LoginUserRequest loginUserRequest = new LoginUserRequest();
            loginUserRequest.setUsername("testuser");
            loginUserRequest.setPassword("Password0");
            assertTrue(loginService.loginUser(loginUserRequest) > 0);
        }
    }

    @Test
    void loginUserNoUser() throws SQLException {
        Connection conn = mock();
        PreparedStatement ps = mock();
        ResultSet rs = mock();

        when(conn.prepareStatement("SELECT * FROM users WHERE username = ?")).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        LoginService loginService = new LoginService(conn);
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("testuser");
        loginUserRequest.setPassword("Password0");
        assertEquals(-1, loginService.loginUser(loginUserRequest));
    }

    @Test
    void loginUserWrongPassword() throws SQLException {
        Connection conn = mock();
        PreparedStatement ps = mock();
        ResultSet rs = mock();

        when(conn.prepareStatement("SELECT * FROM users WHERE username = ?")).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getString("password")).thenReturn("Password0");

        try (MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.verifyPassword("Password0", "Password0")).thenReturn(false);

            LoginService loginService = new LoginService(conn);
            LoginUserRequest loginUserRequest = new LoginUserRequest();
            loginUserRequest.setUsername("testuser");
            loginUserRequest.setPassword("Password0");
            assertEquals(-2, loginService.loginUser(loginUserRequest));
        }
    }

    @Test
    void testHashPasswordValid() {
        LoginService loginService = new LoginService(null);
        String hashedPW = hashPassword("Password1");
        boolean isHashedPWCorrect = Utils.verifyPassword("Password1", hashedPW);
        assertTrue(isHashedPWCorrect);
    }
}