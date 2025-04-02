package edu.usc.csci310.project.login;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.registration.RegisterService;
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

import static edu.usc.csci310.project.Utils.*;


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
//        System.out.println("username=" + request.getUsername() + " and hash=" + Utils.hashUsername(request.getUsername()));
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
