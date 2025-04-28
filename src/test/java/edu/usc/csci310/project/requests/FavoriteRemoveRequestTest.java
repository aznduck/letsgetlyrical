package edu.usc.csci310.project.requests;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteRemoveRequestTest {
    @Test
    void getUsername() {
        FavoriteRemoveRequest fr = new FavoriteRemoveRequest();
        fr.setUsername("testUser");
        assertEquals("testUser", fr.getUsername());
    }

    @Test
    void setUsername() {
        FavoriteRemoveRequest fr = new FavoriteRemoveRequest();
        fr.setUsername("testUser");
        assertEquals("testUser", fr.getUsername());

        fr.setUsername("newUser");
        assertEquals("newUser", fr.getUsername());
    }

    @Test
    void getSongId() {
        FavoriteRemoveRequest fr = new FavoriteRemoveRequest();
        fr.setSongId(123);
        assertEquals(123, fr.getSongId());
    }

    @Test
    void setSongId() {
        FavoriteRemoveRequest fr = new FavoriteRemoveRequest();
        fr.setSongId(123);
        assertEquals(123, fr.getSongId());

        fr.setSongId(456);
        assertEquals(456, fr.getSongId());
    }
}