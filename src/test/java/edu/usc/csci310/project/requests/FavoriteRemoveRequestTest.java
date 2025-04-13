package edu.usc.csci310.project.requests;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteRemoveRequestTest {

    @Test
    void getPassword() {
        FavoriteRemoveRequest fr = new FavoriteRemoveRequest();
        fr.setPassword("password");
        assertEquals("password", fr.getPassword());
    }
}