package edu.usc.csci310.project.requests;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteGetRequestTest {

    @Test
    void getPassword() {
        FavoriteGetRequest request = new FavoriteGetRequest();
        request.setPassword("testPassword123");
        assertEquals("testPassword123", request.getPassword());
    }

    @Test
    void setPassword() {
        FavoriteGetRequest request = new FavoriteGetRequest();
        request.setPassword("testPassword123");
        assertEquals("testPassword123", request.getPassword());

        request.setPassword("newPassword456");
        assertEquals("newPassword456", request.getPassword());
    }

    @Test
    void getUsername() {
        FavoriteGetRequest request = new FavoriteGetRequest();
        request.setUsername("testUser123");
        assertEquals("testUser123", request.getUsername());
    }

    @Test
    void setUsername() {
        FavoriteGetRequest request = new FavoriteGetRequest();
        request.setUsername("testUser123");
        assertEquals("testUser123", request.getUsername());

        request.setUsername("newUser456");
        assertEquals("newUser456", request.getUsername());
    }
}