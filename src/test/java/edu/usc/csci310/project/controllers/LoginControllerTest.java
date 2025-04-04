package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.controllers.LoginController;
import edu.usc.csci310.project.requests.LoginUserRequest;
import edu.usc.csci310.project.services.LoginService;
import org.junit.jupiter.api.Test;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoginControllerTest {

    LoginService service = mock(LoginService.class);
    LoginController controller = new LoginController(service);

    @Test
    void loginUserValid() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("john_doe");
        loginUserRequest.setPassword("Passw0rd");
        when(service.loginUser(loginUserRequest)).thenReturn(1);
        assertEquals(200, controller.loginUser(loginUserRequest).getStatusCode().value());
    }

    @Test
    void loginUserNoUser() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("john_doe1");
        loginUserRequest.setPassword("Passw0rd1");

        when(service.loginUser(loginUserRequest)).thenReturn(-1);
        assertEquals(404, controller.loginUser(loginUserRequest).getStatusCode().value());
    }

    @Test
    void loginUserWrongPassword() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("john_doe2");
        loginUserRequest.setPassword("Passw0rd2");

        when(service.loginUser(loginUserRequest)).thenReturn(-2);
        assertEquals(401, controller.loginUser(loginUserRequest).getStatusCode().value());
    }

    @Test
    void loginUserInvalidUsername() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("```");
        loginUserRequest.setPassword("Passw0rd1");


        when(service.loginUser(loginUserRequest)).thenReturn(-3);
        assertEquals(400, controller.loginUser(loginUserRequest).getStatusCode().value());
//        RuntimeException re = assertThrows(RuntimeException.class, () -> controller.loginUser(loginUserRequest));
//        assertTrue(re.getMessage().contains("Invalid input: username must only contain letters, numbers, spaces, underscores, or hyphens"));
    }

    @Test
    void loginUserInvalidPassword() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("validUsername");
        loginUserRequest.setPassword("```");

        when(service.loginUser(loginUserRequest)).thenReturn(-3);
        assertEquals(400, controller.loginUser(loginUserRequest).getStatusCode().value());

//        RuntimeException re = assertThrows(RuntimeException.class, () -> controller.loginUser(loginUserRequest));
//        assertTrue(re.getMessage().contains("Invalid input: password must contain a lowercase, uppercase, and number"));
    }

    @Test
    void loginUserSQLException() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("validUsername");
        loginUserRequest.setPassword("Real1");

        when(service.loginUser(loginUserRequest)).thenThrow(new SQLException("Test SQL exception"));
        RuntimeException re = assertThrows(RuntimeException.class, () -> controller.loginUser(loginUserRequest));
        assertTrue(re.getMessage().contains("Error adding User:"));


    }


}