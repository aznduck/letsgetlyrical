package edu.usc.csci310.project.login;

import edu.usc.csci310.project.registration.CreateUserRequest;
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

    public String hashPassword(String password) {
        try {
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[16];
            random.nextBytes(salt);

            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");

            byte[] hash = factory.generateSecret(spec).getEncoded();

            String encodedSalt = Base64.getEncoder().encodeToString(salt);
            String encodedHash = Base64.getEncoder().encodeToString(hash);

            return encodedSalt + "$" + encodedHash;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    public boolean verifyPassword(String password, String hashedPassword) {
        try {
            String[] saltAndHash = hashedPassword.split("\\$");

            byte[] salt = Base64.getDecoder().decode(saltAndHash[0]);
            byte[] hash = Base64.getDecoder().decode(saltAndHash[1]);

            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);

            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
            byte[] reverseHash = factory.generateSecret(spec).getEncoded();

            return java.util.Arrays.equals(hash, reverseHash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
