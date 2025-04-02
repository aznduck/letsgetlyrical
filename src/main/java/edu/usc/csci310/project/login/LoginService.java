package edu.usc.csci310.project.login;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Base64;
import static edu.usc.csci310.project.Utils.hashPassword;


@Service
public class LoginService {

    private final Connection conn;

    public LoginService(Connection conn) {
        this.conn = conn;
    }

    public int loginUser(LoginUserRequest request) throws SQLException {
        String query = "SELECT * FROM users WHERE username = ? AND password = ?";
        PreparedStatement stmt = conn.prepareStatement(query);
        stmt.setString(1, hashPassword(request.getUsername()));
        stmt.setString(2, hashPassword(request.getPassword()));
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            return rs.getInt("id");
        } else {
            throw new RuntimeException("Invalid username or password");
        }
    }


}
