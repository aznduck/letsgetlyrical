package edu.usc.csci310.project.registration;

import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


@Service
public class LoginService {

    private final Connection conn;

    public LoginService(Connection conn) {
        this.conn = conn;
    }

    public int loginUser(CreateUserRequest request) throws SQLException {
        String query = "SELECT * FROM users WHERE username = ? AND password = ?";
        PreparedStatement stmt = conn.prepareStatement(query);
        stmt.setString(1, request.getUsername());
        stmt.setString(2, request.getPassword());
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            return rs.getInt("id");
        } else {
            throw new RuntimeException("Invalid username or password");
        }
    }
}
