package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.services.GeniusService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeniusControllerTest {

    @Mock
    private GeniusService geniusService;

    @InjectMocks
    private GeniusController geniusController;

    @Test
    void searchArtist_Success() {
        String query = "Queen";
        List<Map<String, Object>> mockResults = List.of(
                Map.of("artist_id", 1L, "artist_name", "Queen"),
                Map.of("artist_id", 2L, "artist_name", "Queen Latifah")
        );
        when(geniusService.searchArtist(query)).thenReturn(mockResults);

        ResponseEntity<List<Map<String, Object>>> response = geniusController.searchArtist(query);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(mockResults, response.getBody());
        assertEquals(1L, response.getBody().get(0).get("artist_id"));
        assertEquals("Queen", response.getBody().get(0).get("artist_name"));

        verify(geniusService, times(1)).searchArtist(query);
        verifyNoMoreInteractions(geniusService);
    }

    @Test
    void searchArtist_ServiceReturnsEmpty() {
        String query = "NonExistentBand123";
        List<Map<String, Object>> emptyList = new ArrayList<>();
        when(geniusService.searchArtist(query)).thenReturn(emptyList);

        ResponseEntity<List<Map<String, Object>>> response = geniusController.searchArtist(query);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verify(geniusService, times(1)).searchArtist(query);
        verifyNoMoreInteractions(geniusService);
    }

    @Test
    void searchArtist_ServiceThrowsException() {
        String query = "ProblematicQuery";
        RuntimeException serviceException = new RuntimeException("Service layer error");
        when(geniusService.searchArtist(query)).thenThrow(serviceException);

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            geniusController.searchArtist(query);
        }, "Expected searchArtist to throw RuntimeException, but it didn't");

        assertEquals(serviceException, thrown);

        verify(geniusService, times(1)).searchArtist(query);
        verifyNoMoreInteractions(geniusService);
    }


    @Test
    void getTopSongs_Success() {
        Long artistId = 123L;
        List<Map<String, Object>> mockSongs = List.of(
                Map.of("id", 101L, "title", "Bohemian Rhapsody"),
                Map.of("id", 102L, "title", "Another One Bites the Dust")
        );
        when(geniusService.getTopSongs(artistId)).thenReturn(mockSongs);

        ResponseEntity<List<Map<String, Object>>> response = geniusController.getTopSongs(artistId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(mockSongs, response.getBody());
        assertEquals("Bohemian Rhapsody", response.getBody().get(0).get("title"));

        verify(geniusService, times(1)).getTopSongs(artistId);
        verifyNoMoreInteractions(geniusService);
    }

    @Test
    void getTopSongs_ServiceReturnsEmpty() {
        Long artistId = 404L;
        List<Map<String, Object>> emptyList = new ArrayList<>();
        when(geniusService.getTopSongs(artistId)).thenReturn(emptyList);

        ResponseEntity<List<Map<String, Object>>> response = geniusController.getTopSongs(artistId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verify(geniusService, times(1)).getTopSongs(artistId);
        verifyNoMoreInteractions(geniusService);
    }

    @Test
    void getTopSongs_ServiceThrowsException() {
        Long artistId = 999L;
        RuntimeException serviceException = new RuntimeException("Song retrieval error");
        when(geniusService.getTopSongs(artistId)).thenThrow(serviceException);

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            geniusController.getTopSongs(artistId);
        });

        assertEquals(serviceException, thrown);

        verify(geniusService, times(1)).getTopSongs(artistId);
        verifyNoMoreInteractions(geniusService);
    }
}