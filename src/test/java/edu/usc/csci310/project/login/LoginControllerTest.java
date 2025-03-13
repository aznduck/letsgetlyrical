package edu.usc.csci310.project.login;

import edu.usc.csci310.project.registration.CreateUserRequest;
import org.junit.jupiter.api.Test;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginControllerTest {

    LoginService service = mock(LoginService.class);
    LoginController controller = new LoginController(service);

    @Test
    void loginUser() throws SQLException {
        LoginUserRequest loginUserRequest = new LoginUserRequest();
        loginUserRequest.setUsername("john_doe");
        loginUserRequest.setPassword("Passw0rd");
        when(service.loginUser(loginUserRequest)).thenReturn(1);
        assertEquals(200, controller.loginUser(loginUserRequest).getStatusCode().value());
    }

    @Test
    void isValidUsername() {

        assertTrue(controller.isValidUsername("john_doe"));
        assertFalse(controller.isValidUsername("john_doe!"));

    }

    @Test
    void isValidPassword() {

        assertTrue(controller.isValidPassword("Passw0rd"));
        assertFalse(controller.isValidPassword("password"));
    }
}