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
}