package edu.usc.csci310.project.requests;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteSongRequestTest {

    @Test
    void getPassword() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setPassword("password");
        assertEquals("password", fr.getPassword());
    }
}