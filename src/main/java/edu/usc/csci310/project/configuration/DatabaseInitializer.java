package edu.usc.csci310.project.configuration;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Service
public class DatabaseInitializer {

    private final Connection connection;

    @Autowired
    public DatabaseInitializer(Connection connection) {
        this.connection = connection;
    }

    @PostConstruct
    public void initializeDatabase() {
        try (Statement stmt = connection.createStatement()) {
            String createTableSQL = "CREATE TABLE IF NOT EXISTS users (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "username TEXT NOT NULL, " +
                    "password TEXT NOT NULL)";
            stmt.executeUpdate(createTableSQL);
            System.out.println("Table users created");
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error initializing the database schema", e);
        }
    }
}

