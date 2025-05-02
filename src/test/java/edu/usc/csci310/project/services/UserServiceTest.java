package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    private UserService userService;
    private Connection conn;
    private PreparedStatement pst;
    private ResultSet rs;

    @BeforeEach
    void setUp() {
        conn = mock(Connection.class);
        pst = mock(PreparedStatement.class);
        rs = mock(ResultSet.class);
        userService = new UserService(conn);
    }

    @Test
    void testGetAllUsersSuccess() throws SQLException {
        when(conn.prepareStatement("SELECT id, username FROM users")).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);

        when(rs.next()).thenReturn(true, true, true, false);
        when(rs.getInt("id")).thenReturn(1, 2, 3);
        when(rs.getString("username")).thenReturn("encodedUser1", "encodedUser2", "encodedUser3");

        try (MockedStatic<Utils> mockedUtils = Mockito.mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser1")).thenReturn("User One");
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser2")).thenReturn("User Two");
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser3")).thenReturn("User Three");

            List<User> users = userService.getAllUsers();

            assertEquals(3, users.size());
            assertEquals("User One", users.get(0).getUsername());
            assertEquals("User Two", users.get(1).getUsername());
            assertEquals("User Three", users.get(2).getUsername());

            verify(conn, times(1)).prepareStatement(anyString());
            verify(pst, times(1)).executeQuery();
            verify(rs, times(4)).next();
        }
    }

    @Test
    void testGetAllUsersEmpty() throws SQLException {
        when(conn.prepareStatement("SELECT id, username FROM users")).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertTrue(users.isEmpty());

        verify(conn, times(1)).prepareStatement(anyString());
        verify(pst, times(1)).executeQuery();
        verify(rs, times(1)).next();
    }

    @Test
    void testGetAllUsersWithUnhashException() throws SQLException {
        when(conn.prepareStatement("SELECT id, username FROM users")).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);

        when(rs.next()).thenReturn(true, true, true, false);
        when(rs.getInt("id")).thenReturn(1, 2, 3);
        when(rs.getString("username")).thenReturn("encodedUser1", "encodedUser2", "encodedUser3");

        try (MockedStatic<Utils> mockedUtils = Mockito.mockStatic(Utils.class)) {
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser1")).thenReturn("User One");
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser2")).thenThrow(new RuntimeException("Decoding error"));
            mockedUtils.when(() -> Utils.unhashUsername("encodedUser3")).thenReturn("User Three");

            List<User> users = userService.getAllUsers();

            assertEquals(3, users.size());
            assertEquals("User One", users.get(0).getUsername());
            assertEquals("User 2", users.get(1).getUsername()); // Should use fallback name
            assertEquals("User Three", users.get(2).getUsername());
        }
    }

    @Test
    void testGetAllUsersSQLException() throws SQLException {
        when(conn.prepareStatement("SELECT id, username FROM users")).thenThrow(new SQLException("Database error"));

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertTrue(users.isEmpty());

        verify(conn, times(1)).prepareStatement(anyString());
    }
}