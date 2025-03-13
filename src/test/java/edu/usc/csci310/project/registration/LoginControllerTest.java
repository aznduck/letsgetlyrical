package edu.usc.csci310.project.registration;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginControllerTest {

    LoginService service = mock(LoginService.class);
    LoginController controller = new LoginController(service);

    @Test
    void loginUser() throws SQLException {
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("john_doe");
        createUserRequest.setPassword("Passw0rd");
        when(service.loginUser(createUserRequest)).thenReturn(1);
        assertEquals(200, controller.loginUser(createUserRequest).getStatusCode().value());
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