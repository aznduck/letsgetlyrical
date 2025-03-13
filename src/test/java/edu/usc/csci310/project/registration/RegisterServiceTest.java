package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.openqa.selenium.devtools.Message;

import javax.crypto.SecretKeyFactory;
import java.security.NoSuchAlgorithmException;
import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.security.MessageDigest;

class RegisterServiceTest {
    private RegisterService registerService;
    private Connection conn;

    @BeforeEach
    void setUpBeforeClass() throws Exception {
        conn = mock(Connection.class);
        registerService = spy(new RegisterService(conn));
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
    void testHashUsernameValid() {
        String hashedUsername1 = registerService.hashUsername("Username");
        String hashedUsername2 = registerService.hashUsername("Username");
        assertEquals(hashedUsername1, hashedUsername2);
    }

    @Test
    void testHashUsernameException() throws NoSuchAlgorithmException {
        try(MockedStatic<MessageDigest> mockedMD = Mockito.mockStatic(MessageDigest.class);) {
            mockedMD.when(() -> MessageDigest.getInstance("SHA-256")).thenThrow(new NoSuchAlgorithmException("test"));
            assertThrows(RuntimeException.class, () -> registerService.hashUsername("Username"));
        }
    }

    @Test
    void testIsUsernameAvailableYes() throws SQLException {
        String username = "Username";
        String hashedUsername = registerService.hashUsername(username);
        String sqlString = "SELECT * FROM users WHERE username = ?";

        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        assertTrue(registerService.isUsernameAvailable(username));
    }

    @Test
    void testIsUsernameAvailableNo() throws SQLException {
        String username = "Username";
        String hashedUsername = registerService.hashUsername(username);
        String sqlString = "SELECT * FROM users WHERE username = ?";

        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);

        assertFalse(registerService.isUsernameAvailable(username));
    }

    @Test
    void testIsUsernameAvailableException() throws SQLException {
        String username = "Username";
        String hashedUsername = registerService.hashUsername(username);
        String sqlString = "SELECT * FROM users WHERE username = ?";

        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeQuery()).thenThrow(new SQLException());

        assertThrows(RuntimeException.class, () -> registerService.isUsernameAvailable(username));
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

        doReturn(true).when(registerService).isUsernameAvailable(username);
        doReturn("hashedUsername").when(registerService).hashUsername(username);
        doReturn("hashedPassword").when(registerService).hashPassword(password);
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

        doReturn(true).when(registerService).isUsernameAvailable(username);
        doReturn("hashedUsername").when(registerService).hashUsername(username);
        doReturn("hashedPassword").when(registerService).hashPassword(password);
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

        doReturn(true).when(registerService).isUsernameAvailable(username);
        doReturn("hashedUsername").when(registerService).hashUsername(username);
        doReturn("hashedPassword").when(registerService).hashPassword(password);
        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        SQLException sqle = assertThrows(SQLException.class, () -> registerService.createUser(createUserRequest));
        assertTrue(sqle.getMessage().contains("Failed to retrieve the generated ID"));

    }

    @Test
    void createRegistrationUserNotAvailable() throws SQLException {
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

        doReturn(false).when(registerService).isUsernameAvailable(username);

        UsernameNotAvailableException unae = assertThrows(UsernameNotAvailableException.class, () -> registerService.createUser(createUserRequest));
        assertTrue(unae.getMessage().contains("Username not available"));
    }


}