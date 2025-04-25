package edu.usc.csci310.project;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

public class Utils {
    public static boolean isValidUsername(String username) {
        return username != null && username.matches("^[a-zA-Z0-9 _-]+$");
    }

    public static boolean isValidPassword(String password) {
        return password != null && password.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*");
    }

    public static String hashPassword(String password) {
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

    public static boolean verifyPassword(String password, String hashedPassword) {
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

    public static String hashUsername(String username) {
        try {
            byte[] bytes = username.getBytes("UTF-8");
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public static String unhashUsername(String hashedUsername) {
        try {
            byte[] bytes = Base64.getDecoder().decode(hashedUsername);
            return new String(bytes, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
