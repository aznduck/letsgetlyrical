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
        createUserRequest.setUsername("testuser");
        createUserRequest.setPassword("testpassword");
        when(service.loginUser(createUserRequest)).thenReturn(1);
        assertEquals(1, controller.loginUser(createUserRequest));
    }

    @Test
    void isValidUsername() {

        assertTrue(controller.isValidUsername("testuser"));
        assertFalse(controller.isValidUsername("testuser!"));

    }

    @Test
    void isValidPassword() {

        assertTrue(controller.isValidPassword("testpassword"));
        assertFalse(controller.isValidPassword("testpassword!"));
    }
}