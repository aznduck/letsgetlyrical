package edu.usc.csci310.project;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UtilsTest {

    @Test
    void createUtils() {
        Utils utils = new Utils();
        assertEquals(utils.getClass(), Utils.class);
    }

    @Test
    void isValidUsername() {

        assertTrue(Utils.isValidUsername("john_doe"));
        assertFalse(Utils.isValidUsername("```"));
        assertFalse(Utils.isValidUsername(null));
        assertFalse(Utils.isValidUsername("john_doe!"));

    }

    @Test
    void isValidPassword() {

        assertTrue(Utils.isValidPassword("Passw0rd"));
        assertFalse(Utils.isValidPassword("```"));
        assertFalse(Utils.isValidPassword(null));
        assertFalse(Utils.isValidPassword("password"));
    }

    @Test
    void hashPassword_shouldReturnNonEmptyString() {
        String password = "TestPassword123";
        String hashedPassword = Utils.hashPassword(password);

        assertNotNull(hashedPassword);
        assertFalse(hashedPassword.isEmpty());
    }


    @Test
    void hashPassword_shouldGenerateDifferentHashesForSamePassword() {
        String password = "TestPassword123";
        String hashedPassword1 = Utils.hashPassword(password);
        String hashedPassword2 = Utils.hashPassword(password);

        assertNotEquals(hashedPassword1, hashedPassword2);
    }

    @Test
    void verifyPassword_shouldReturnTrue() {
        String password = "TestPassword123";
        String hashedPassword = Utils.hashPassword(password);
        assertTrue(Utils.verifyPassword(password, hashedPassword));
    }

    @Test
    void verifyPassword_shouldReturnFalse() {
        String password = "TestPassword123";
        String wrongPassword = "TestPassword456";
        String hashedPassword = Utils.hashPassword(password);
        assertFalse(Utils.verifyPassword(wrongPassword, hashedPassword));
    }

    @Test
    void hashUsername_shouldReturnNonEmptyString() {
        String username = "john_doe";
        String hashedUsername = Utils.hashUsername(username);
        assertNotNull(hashedUsername);
    }

    @Test
    void hashUsername_shouldReturnSameHashesForSameUsername() {
        String username = "john_doe";
        String hashedUsername = Utils.hashUsername(username);
        String hashedUsername2 = Utils.hashUsername(username);
        assertEquals(hashedUsername, hashedUsername2);
    }

    @Test
    void hashUsername_shouldGenerateDifferentHashesForDifferentUsername() {
        String username = "john_doe";
        String username2 = "jane_doe";
        String hashedUsername = Utils.hashUsername(username);
        String hashedUsername2 = Utils.hashUsername(username2);
        assertNotEquals(hashedUsername, hashedUsername2);
    }
}