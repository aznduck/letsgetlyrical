package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegisterControllerTest {
    private RegisterController registerController;
    private RegisterService registerService;

    @BeforeEach
    void setUpBeforeClass() throws Exception {
        registerService = mock(RegisterService.class);
        registerController = new RegisterController(registerService);
    }

    @Test
    void registerUserValid() throws SQLException {
        String username = "test";
        String password = "Real1";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setPassword(password);

        when(registerService.createUser(request)).thenReturn(1);

        ResponseEntity<UserResponse> responseEntity = registerController.registerUser(request);

        assertNotNull(responseEntity);
        assertEquals(responseEntity.getStatusCode(), HttpStatus.OK);
    }

    @Test
    void registerUserInvalidUsername() throws SQLException {
        String username = "$";
        String password = "Real1";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setPassword(password);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("username"));
    }

    @Test
    void registerUserInvalidPassword() throws SQLException {
        String username = "test";
        String password = "notreal";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setPassword(password);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("password"));
    }

    @Test
    void registerUserSQLException() throws SQLException {
        String username = "test";
        String password = "Real1";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setPassword(password);

        when(registerService.createUser(request)).thenThrow(SQLException.class);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Error adding User"));
    }

    @Test
    void registerUserUsernameException() throws SQLException {
        String username = "test";
        String password = "Real1";
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setPassword(password);

        when(registerService.createUser(request)).thenThrow(UsernameNotAvailableException.class);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Username not available"));
    }

    @Test
    void isValidUsernameValid() {
        String username = "test";
        assertTrue(registerController.isValidUsername(username));
    }

    @Test
    void isValidUsernameInvalid() {
        String username = "$";
        assertFalse(registerController.isValidUsername(username));
    }

    @Test
    void isValidUsernameNull() {
        assertFalse(registerController.isValidUsername(null));
    }

    @Test
    void isValidPasswordValid() {
        String password = "Test1";
        assertTrue(registerController.isValidPassword(password));
    }

    @Test
    void isValidPasswordInvalid() {
        String password = "test";
        assertFalse(registerController.isValidPassword(password));
    }

    @Test
    void isValidPasswordNull() {
        assertFalse(registerController.isValidPassword(null));
    }
}