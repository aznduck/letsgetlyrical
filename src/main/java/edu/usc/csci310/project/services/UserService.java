// UserService.java
package edu.usc.csci310.project.services;

import edu.usc.csci310.project.models.User;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import static edu.usc.csci310.project.Utils.unhashUsername;

@Service
public class UserService {

    private final Connection conn;

    public UserService(Connection conn) {
        this.conn = conn;
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        try {
            String query = "SELECT id, username FROM users";
            PreparedStatement stmt = conn.prepareStatement(query);
            ResultSet rs = stmt.executeQuery();


            while (rs.next()) {
                int id = rs.getInt("id");
                String encodedUsername = rs.getString("username");
                String displayUsername;


                try {
                    displayUsername = unhashUsername(encodedUsername);
                } catch (Exception e) {
                    displayUsername = "User " + id;
                    System.out.println("Failed to decode username for user ID " + id + ": " + e.getMessage());
                }

                users.add(new User(id, displayUsername, "hidden"));
            }


        } catch (SQLException e) {
            System.out.println("SQL Exception in getAllUsers: " + e.getMessage());
            e.printStackTrace();
        }
        return users;
    }
}
