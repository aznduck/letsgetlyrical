package edu.usc.csci310.project.requests;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteSongRequestTest {

    @Test
    void getPassword() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setPassword("Password123");
        assertEquals("Password123", fr.getPassword());
    }

    @Test
    void setPassword() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setPassword("Password123");
        assertEquals("Password123", fr.getPassword());

        fr.setPassword("newPassword123");
        assertEquals("newPassword123", fr.getPassword());
    }

    @Test
    void getUsername() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setUsername("testUser");
        assertEquals("testUser", fr.getUsername());
    }

    @Test
    void setUsername() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setUsername("testUser");
        assertEquals("testUser", fr.getUsername());

        fr.setUsername("newUser");
        assertEquals("newUser", fr.getUsername());
    }

    @Test
    void getSongId() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongId(123);
        assertEquals(123, fr.getSongId());
    }

    @Test
    void setSongId() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongId(123);
        assertEquals(123, fr.getSongId());

        fr.setSongId(456);
        assertEquals(456, fr.getSongId());
    }

    @Test
    void getSongName() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongName("Test Song");
        assertEquals("Test Song", fr.getSongName());
    }

    @Test
    void setSongName() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongName("Test Song");
        assertEquals("Test Song", fr.getSongName());

        // Test updating songName
        fr.setSongName("New Song");
        assertEquals("New Song", fr.getSongName());
    }

    @Test
    void getSongArtist() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongArtist("Test Artist");
        assertEquals("Test Artist", fr.getSongArtist());
    }

    @Test
    void setSongArtist() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setSongArtist("Test Artist");
        assertEquals("Test Artist", fr.getSongArtist());

        fr.setSongArtist("New Artist");
        assertEquals("New Artist", fr.getSongArtist());
    }

    @Test
    void getFullTitle() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setFullTitle("Test Song by Test Artist");
        assertEquals("Test Song by Test Artist", fr.getFullTitle());
    }

    @Test
    void setFullTitle() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setFullTitle("Test Song by Test Artist");
        assertEquals("Test Song by Test Artist", fr.getFullTitle());

        fr.setFullTitle("New Song by New Artist");
        assertEquals("New Song by New Artist", fr.getFullTitle());
    }

    @Test
    void getDateReleased() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setDateReleased("2023-01-01");
        assertEquals("2023-01-01", fr.getDateReleased());
    }

    @Test
    void setDateReleased() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setDateReleased("2023-01-01");
        assertEquals("2023-01-01", fr.getDateReleased());

        fr.setDateReleased("2023-02-15");
        assertEquals("2023-02-15", fr.getDateReleased());
    }

    @Test
    void getLyrics() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setLyrics("Test lyrics");
        assertEquals("Test lyrics", fr.getLyrics());
    }

    @Test
    void setLyrics() {
        FavoriteSongRequest fr = new FavoriteSongRequest();
        fr.setLyrics("Test lyrics");
        assertEquals("Test lyrics", fr.getLyrics());

        fr.setLyrics("New lyrics");
        assertEquals("New lyrics", fr.getLyrics());
    }
}