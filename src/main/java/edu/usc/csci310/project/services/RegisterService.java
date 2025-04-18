package edu.usc.csci310.project.services;



import java.sql.*;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.exception.UsernameNotAvailableException;
import edu.usc.csci310.project.requests.CreateUserRequest;
import org.springframework.stereotype.Service;

import static edu.usc.csci310.project.Utils.hashPassword;

@Service
public class RegisterService {
    private final Connection connection;

    public RegisterService(Connection connection) {
        this.connection = connection;
    }

    public int createUser(CreateUserRequest request) throws SQLException {

        //insert user
        String sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            if(!isUsernameAvailable(request.getUsername())) throw new UsernameNotAvailableException("Username not available.");
            String hashedUsername = hashUsername(request.getUsername());
            String hashedPassword = hashPassword(request.getPassword());
            pst.setString(1, hashedUsername);
            pst.setString(2, hashedPassword);

            int rowsAffected = pst.executeUpdate();

            // Check if insert was successful
            if (rowsAffected > 0) {
                // SQLite specific: Retrieve the last inserted row ID
                try (Statement statement = connection.createStatement();
                     ResultSet rs = statement.executeQuery("SELECT last_insert_rowid()")) {
                    if (rs.next()) {
                        return rs.getInt(1); // Return the generated ID
                    } else {
                        throw new SQLException("Failed to retrieve the generated ID.");
                    }
                }
            } else {
                throw new SQLException("No rows affected during the insert.");
            }
        }
        catch (SQLException e) {
            System.out.println(e.getMessage());
            throw new SQLException(e);
        }
    }

    public String hashUsername(String username) {
        return Utils.hashUsername(username);
    }

    public boolean isUsernameAvailable(String username) {
        String hashedUsername = hashUsername(username);
        String sql = "SELECT * FROM users WHERE username = ?";

        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setString(1, hashedUsername);
            ResultSet rs = pst.executeQuery();
            return !rs.next();
        }
        catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
