package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.exceptions.UsernameNotAvailableException;
import edu.usc.csci310.project.requests.CreateUserRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import javax.crypto.SecretKeyFactory;
import java.security.NoSuchAlgorithmException;
import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import static edu.usc.csci310.project.Utils.hashPassword;

class RegisterServiceTest {
    private RegisterService registerService;
    private Connection conn;
    private Statement st;
    private PreparedStatement pst;
    private ResultSet rs;

    @BeforeEach
    void setUpBeforeClass() throws Exception {
        conn = mock(Connection.class);
        registerService = spy(new RegisterService(conn));
        st = mock(Statement.class);
        pst = mock(PreparedStatement.class);
        rs = mock(ResultSet.class);
    }

    @Test
    void testHashPasswordValid() {
        String hashedPW = hashPassword("Password1");
        boolean isHashedPWCorrect = Utils.verifyPassword("Password1", hashedPW);
        assertTrue(isHashedPWCorrect);
    }

    @Test
    void testHashPasswordException() throws NoSuchAlgorithmException {
        try(MockedStatic<SecretKeyFactory> mockedSKF = Mockito.mockStatic(SecretKeyFactory.class)) {
            mockedSKF.when(() -> SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")).thenThrow(new NoSuchAlgorithmException());

            assertThrows(RuntimeException.class, () -> Utils.hashPassword("Password1"));
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

        String decodedUsername = registerService.unhashUsername(hashedUsername1);
        assertEquals("Username", decodedUsername);
    }

    @Test
    void testDecodeUsername() {
        String originalUsername = "testuser";
        String encodedUsername = registerService.hashUsername(originalUsername);
        String decodedUsername = registerService.unhashUsername(encodedUsername);

        assertEquals(originalUsername, decodedUsername);
    }

    @Test
    void testHashUsernameException() {
        try (MockedStatic<Utils> mockedUtils = Mockito.mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.hashUsername("Username"))
                    .thenThrow(new RuntimeException("Encoding error"));
            assertThrows(RuntimeException.class, () -> registerService.hashUsername("Username"));
        }
    }

    private PreparedStatement setupUsernameCheck(String username, boolean isAvailable) throws SQLException {
        String hashedUsername = registerService.hashUsername(username);
        String sqlString = "SELECT * FROM users WHERE username = ?";

        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(!isAvailable);

        return pst;
    }

    @Test
    void testIsUsernameAvailableYes() throws SQLException {
        String username = "Username";
        setupUsernameCheck(username, true);

        assertTrue(registerService.isUsernameAvailable(username));
    }

    @Test
    void testIsUsernameAvailableNo() throws SQLException {
        String username = "Username";
        setupUsernameCheck(username, false);

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
        try(MockedStatic<SecretKeyFactory> mockedSKF = Mockito.mockStatic(SecretKeyFactory.class)) {
            mockedSKF.when(() -> SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")).thenThrow(new NoSuchAlgorithmException());

            assertThrows(RuntimeException.class, () -> Utils.verifyPassword("Password1", "HashedPassword1"));
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    CreateUserRequest generateValidCreateUserRequest(String username, String password) {
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(username);
        createUserRequest.setPassword(password);
        return createUserRequest;
    }

    private void testCreateUserScenario(boolean rsNextReturns, Integer expectedId) throws SQLException {
        String username = "test";
        String password = "TestPassword1";
        CreateUserRequest createUserRequest = generateValidCreateUserRequest(username, password);
        String sqlString = "INSERT INTO users (username, password) VALUES (?, ?)";

        Statement st = mock(Statement.class);
        PreparedStatement pst = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(rs.next()).thenReturn(rsNextReturns);
        if (rsNextReturns && expectedId != null) {
            when(rs.getInt(1)).thenReturn(expectedId);
        }

        doReturn(true).when(registerService).isUsernameAvailable(username);
        doReturn("hashedUsername").when(registerService).hashUsername(username);
        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);

        try (MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.hashPassword(password)).thenReturn("hashedPassword");

            if (!rsNextReturns) {
                SQLException sqle = assertThrows(SQLException.class,
                        () -> registerService.createUser(createUserRequest));
                assertTrue(sqle.getMessage().contains("Failed to retrieve the generated ID"));
            } else {
                int actualId = registerService.createUser(createUserRequest);
                assertEquals(expectedId, actualId);
            }
        }
    }

    @Test
    void createRegistrationRsNextFalse() throws SQLException {
        testCreateUserScenario(false, null);
    }

    @Test
    void createRegistrationValid() throws SQLException {
        testCreateUserScenario(true, 200);
    }


    // Refactored method to set up mocks for createUser, let createRegistrationNoRowsAffected and createRegistrationUserNotAvailable use this method
    private void setupCreateUserMocks(String username, String password, boolean isUsernameAvailable) throws SQLException {
        doReturn(isUsernameAvailable).when(registerService).isUsernameAvailable(username);
        doReturn("hashedUsername").when(registerService).hashUsername(username);

        try (MockedStatic<Utils> mockedUtils = mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.hashPassword(password)).thenReturn("hashedPassword");
        }
    }

    @Test
    void createRegistrationNoRowsAffected() throws SQLException {
        String username = "test";
        String password = "TestPassword1";
        String sqlString = "INSERT INTO users (username, password) VALUES (?, ?)";

        setupCreateUserMocks(username, password, true);

        when(conn.createStatement()).thenReturn(st);
        when(conn.prepareStatement(sqlString)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(-1);

        SQLException sqle = assertThrows(SQLException.class, () -> registerService.createUser(generateValidCreateUserRequest(username, password)));
      
        assertTrue(sqle.getMessage().contains("No rows affected"));
    }

    @Test
    void createRegistrationUserNotAvailable() throws SQLException {
        String username = "test";
        String password = "TestPassword1";

        setupCreateUserMocks(username, password, false);

        UsernameNotAvailableException unae = assertThrows(UsernameNotAvailableException.class, () -> registerService.createUser(generateValidCreateUserRequest(username, password)));
        assertTrue(unae.getMessage().contains("Username not available"));
    }

}