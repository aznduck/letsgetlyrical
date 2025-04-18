package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.controllers.RegisterController;
import edu.usc.csci310.project.exception.UsernameNotAvailableException;
import edu.usc.csci310.project.requests.CreateUserRequest;
import edu.usc.csci310.project.responses.UserResponse;
import edu.usc.csci310.project.services.RegisterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
    void registerUserNullUsername() {
        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername()).thenReturn(null);
        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Username cannot be empty"));
    }

    @Test
    void registerUserEmptyUsername() {
        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername()).thenReturn("");
        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Username cannot be empty"));
    }

    @Test
    void registerUserNullPassword() {
        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername()).thenReturn("user");
        when(request.getPassword()).thenReturn(null);
        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Password cannot be empty"));
    }

    @Test
    void registerUserEmptyPassword() {
        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername()).thenReturn("user");
        when(request.getPassword()).thenReturn("");
        RuntimeException rte = assertThrows(RuntimeException.class, () -> registerController.registerUser(request));
        assertTrue(rte.getMessage().contains("Password cannot be empty"));
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