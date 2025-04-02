package edu.usc.csci310.project.registration;



import java.security.KeyStore;
import java.security.MessageDigest;
import java.sql.*;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.sql.*;
import java.util.Base64;
import static edu.usc.csci310.project.Utils.hashPassword;
import static edu.usc.csci310.project.Utils.hashUsername;

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
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(username.getBytes());
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
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
