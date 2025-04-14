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
            String createUsersTableSQL = "CREATE TABLE IF NOT EXISTS users (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "username TEXT NOT NULL, " +
                    "password TEXT NOT NULL)";
            stmt.executeUpdate(createUsersTableSQL);
            System.out.println("Table users created");

            String createSongsTableSQL = "CREATE TABLE IF NOT EXISTS songs (" +
                    "songId INTEGER PRIMARY KEY NOT NULL, " +
                    "songName TEXT NOT NULL, " +
                    "songArtist TEXT NOT NULL, " +
                    "fullTitle TEXT NOT NULL, " +
                    "dateReleased TEXT NOT NULL, " +
                    "lyrics TEXT NOT NULL)";
            stmt.executeUpdate(createSongsTableSQL);
            System.out.println("Table songs created");

            String createFavoritesTableSQL = "CREATE TABLE IF NOT EXISTS favorites (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "userId TEXT NOT NULL, " +
                    "songId TEXT NOT NULL)";
            stmt.executeUpdate(createFavoritesTableSQL);
            System.out.println("Table favorites created");
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error initializing the database schema", e);
        }
    }
}

