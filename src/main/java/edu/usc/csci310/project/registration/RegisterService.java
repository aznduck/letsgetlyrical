package edu.usc.csci310.project.registration;

import org.springframework.stereotype.Service;

import java.security.KeyStore;
import java.security.MessageDigest;
import java.sql.*;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.spec.KeySpec;

@Service
public class RegisterService {
    private final Connection connection;

    public RegisterService(Connection connection) {
        this.connection = connection;
    }

    public int createUser(CreateUserRequest request) throws SQLException {
        String sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            if(!isUsernameAvailable(request.getUsername())) throw new UsernameNotAvailableException("Username not available.");
            String hashedUsername = hashUsername(request.getPassword());
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
        }
        catch(Exception e) {
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
