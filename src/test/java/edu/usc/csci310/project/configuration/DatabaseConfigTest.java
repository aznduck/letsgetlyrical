package edu.usc.csci310.project.configuration;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;

class DatabaseConfigTest {
    @Test
    void sqliteConnection() throws SQLException {
        Connection mockedConnection = mock(Connection.class);
        try(MockedStatic<DriverManager> mockedDM = mockStatic(DriverManager.class)) {
            mockedDM.when(() -> DriverManager.getConnection("jdbc:sqlite:dataUsers.db")).thenReturn(mockedConnection);

            DatabaseConfig dbConfig = new DatabaseConfig();
            Connection conn = dbConfig.sqliteConnection();

            assertNotNull(conn);
            assertEquals(mockedConnection, conn);

            mockedDM.verify(() -> DriverManager.getConnection("jdbc:sqlite:dataUsers.db"));
        }
    }

}