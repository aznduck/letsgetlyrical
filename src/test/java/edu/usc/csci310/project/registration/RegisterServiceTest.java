package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import javax.crypto.SecretKeyFactory;
import java.security.NoSuchAlgorithmException;
import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegisterServiceTest {
    private RegisterService registerService;
    private Connection conn;

    @BeforeEach
    void setUpBeforeClass() throws Exception {
        conn = mock(Connection.class);
        registerService = new RegisterService(conn);

    }

    @Test
    void testHashPasswordValid() {
        String hashedPW = registerService.hashPassword("Password1");
        boolean isHashedPWCorrect = registerService.verifyPassword("Password1", hashedPW);
        assertTrue(isHashedPWCorrect);
    }

    @Test
    void testHashPasswordException() throws NoSuchAlgorithmException {
        try(MockedStatic<SecretKeyFactory> mockedSKF = Mockito.mockStatic(SecretKeyFactory.class);) {
            mockedSKF.when(() -> SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")).thenThrow(new NoSuchAlgorithmException());

            assertThrows(RuntimeException.class, () -> registerService.hashPassword("Password1"));
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    void testVerifyPasswordException() throws NoSuchAlgorithmException {
        try(MockedStatic<SecretKeyFactory> mockedSKF = Mockito.mockStatic(SecretKeyFactory.class);) {
            mockedSKF.when(() -> SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")).thenThrow(new NoSuchAlgorithmException());

            assertThrows(RuntimeException.class, () -> registerService.verifyPassword("Password1", "HashedPassword1"));
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    void createRegistrationValid() throws SQLException {
        int id = 1;
        String username = "test";
        String password = "TestPassword1";
        String hashedPW = registerService.hashPassword(password);

        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(username);
        createUserRequest.setPassword(hashedPW);

        String sqlString = "INSERT INTO users (username, password) VALUES (?, ?)";
        Statement st = mock(Statement.class);
        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);

        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt(1)).thenReturn(200);

        assertEquals(200, registerService.createUser(createUserRequest));
    }

    @Test
    void createRegistrationNoRowsAffected() throws SQLException {
        int id = 1;
        String username = "test";
        String password = "TestPassword1";

        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(username);
        createUserRequest.setPassword(password);

        String sqlString = "INSERT INTO users (username, password) VALUES (?, ?)";
        Statement st = mock(Statement.class);
        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(-1);

        SQLException sqle = assertThrows(SQLException.class, () -> registerService.createUser(createUserRequest));
        assertTrue(sqle.getMessage().contains("No rows affected"));
    }

    @Test
    void createRegistrationRsNextFalse() throws SQLException {
        int id = 1;
        String username = "test";
        String password = "TestPassword1";

        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(username);
        createUserRequest.setPassword(password);

        String sqlString = "INSERT INTO users (username, password) VALUES (?, ?)";
        Statement st = mock(Statement.class);
        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        SQLException sqle = assertThrows(SQLException.class, () -> registerService.createUser(createUserRequest));
        assertTrue(sqle.getMessage().contains("Failed to retrieve the generated ID"));

    }

}