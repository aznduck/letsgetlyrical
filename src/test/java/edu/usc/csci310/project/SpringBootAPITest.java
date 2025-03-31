package edu.usc.csci310.project;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SpringBootAPITest {
    private SpringBootAPI api;

    @BeforeEach
    void setUp() {
        api = new SpringBootAPI();
    }

    @Test
    void testMain() throws SQLException {
        Connection conn = mock(Connection.class);
        Statement st = mock(Statement.class);
        when(conn.createStatement()).thenReturn(st);

        try (MockedStatic<DriverManager> mockedDM = mockStatic(DriverManager.class)) {
            mockedDM.when(() -> DriverManager.getConnection(anyString())).thenReturn(conn);
            SpringBootAPI.main(new String[0]);
        }
    }

    @Test
    void redirect() {
        assertEquals("forward:/", api.redirect());
    }
}