package edu.usc.csci310.project.configuration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DatabaseInitializerTest {

    private DatabaseInitializer dbInitializer;
    private Connection conn;

    @BeforeEach
    public void setUp() {
        conn = mock(Connection.class);
        dbInitializer = new DatabaseInitializer(conn);
    }

    @Test
    void initializeDatabase() throws SQLException {
        String sqlString = "CREATE TABLE IF NOT EXISTS users (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "username TEXT NOT NULL, " +
                "password TEXT NOT NULL, " +
                "placeholder INTEGER NOT NULL)";

        Statement st = mock(Statement.class);
        when(conn.createStatement()).thenReturn(st);

        dbInitializer.initializeDatabase();

        verify(st).executeUpdate(sqlString);
    }

    @Test
    void initializeDatabaseException() throws SQLException {
        String sqlString = "CREATE TABLE IF NOT EXISTS users (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "username TEXT NOT NULL, " +
                "password TEXT NOT NULL, " +
                "placeholder INTEGER NOT NULL)";

        Statement st = mock(Statement.class);
        when(conn.createStatement()).thenThrow(new SQLException("SQL test exception"));

        RuntimeException re = assertThrows(RuntimeException.class, () -> dbInitializer.initializeDatabase());
        assertEquals("Error initializing the database schema", re.getMessage());
    }
}