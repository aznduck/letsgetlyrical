package edu.usc.csci310.project.login;

import edu.usc.csci310.project.Utils;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import static edu.usc.csci310.project.Utils.hashPassword;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("testuser");
        loginUserRequest.setPassword("testpassword");
        assertTrue(loginService.loginUser(loginUserRequest) > 0);
    }

    @Test
    void testHashPasswordValid() {
        LoginService loginService = new LoginService(null);
        String hashedPW = hashPassword("Password1");
        boolean isHashedPWCorrect = Utils.verifyPassword("Password1", hashedPW);
        assertTrue(isHashedPWCorrect);
    }
}