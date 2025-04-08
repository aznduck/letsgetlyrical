package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.requests.LoginUserRequest;
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

    public int loginUser(LoginUserRequest request) throws SQLException {
        String query = "SELECT * FROM users WHERE username = ?";
        PreparedStatement stmt = conn.prepareStatement(query);
        stmt.setString(1, Utils.hashUsername(request.getUsername()));
       ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            if(Utils.verifyPassword(request.getPassword(), rs.getString("password"))) {
                return rs.getInt("id");
            }
            else {
                return -2; // -2 represents failed password
            }
        }
        else {
            return -1; // represents that the username did not exist
        }
    }


}
