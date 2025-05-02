package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.models.User;
import edu.usc.csci310.project.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @Test
    void testGetAllUsers() {
        List<User> mockUsers = new ArrayList<>();
        mockUsers.add(new User(1, "testuser1", "hidden"));
        mockUsers.add(new User(2, "aznduck", "hidden"));
        mockUsers.add(new User(3, "testuser", "hidden"));

        when(userService.getAllUsers()).thenReturn(mockUsers);

        List<User> result = userController.getAllUsers();

        verify(userService, times(1)).getAllUsers();
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("testuser1", result.get(0).getUsername());
        assertEquals("aznduck", result.get(1).getUsername());
        assertEquals("testuser", result.get(2).getUsername());
    }

    @Test
    void testGetAllUsersEmpty() {
        List<User> emptyList = new ArrayList<>();

        when(userService.getAllUsers()).thenReturn(emptyList);

        List<User> result = userController.getAllUsers();

        verify(userService, times(1)).getAllUsers();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAllUsersServiceThrowsException() {
        when(userService.getAllUsers()).thenThrow(new RuntimeException("Database error"));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            userController.getAllUsers();
        });

        assertTrue(exception.getMessage().contains("Database error"));
        verify(userService, times(1)).getAllUsers();
    }
}