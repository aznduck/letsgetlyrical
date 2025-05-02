package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.services.GeniusService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString; // Keep if needed, but eq() is often better
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GeniusController.class)
class GeniusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeniusService geniusService;

    // --- searchArtist Tests (Unaffected) ---
    @Test
    void searchArtist_whenServiceReturnsArtists_shouldReturnOkWithArtists() throws Exception {
        String query = "Queen";
        List<Map<String, Object>> mockResults = List.of(
                Map.of("artist_id", 1L, "artist_name", "Queen")
        );
        when(geniusService.searchArtist(query)).thenReturn(mockResults);

        mockMvc.perform(get("/api/genius/search").param("q", query))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].artist_id", is(1)))
                .andExpect(jsonPath("$[0].artist_name", is("Queen")));

        verify(geniusService).searchArtist(query);
    }

    @Test
    void searchArtist_whenServiceReturnsEmptyList_shouldReturnOkWithEmptyList() throws Exception {
        String query = "NonExistent";
        when(geniusService.searchArtist(query)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/genius/search").param("q", query))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(geniusService).searchArtist(query);
    }

    @Test
    void searchArtist_whenServiceThrowsException_shouldReturnInternalServerError() throws Exception {
        String query = "ErrorCase";
        when(geniusService.searchArtist(query)).thenThrow(new RuntimeException("Service layer error"));

        mockMvc.perform(get("/api/genius/search").param("q", query))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error", is("Failed to search artists")));

        verify(geniusService).searchArtist(query);
    }

    @Test
    void getTopSongs_withValidArtistIdAndDefaultParams_shouldReturnOkWithSongs() throws Exception {
        Long artistId = 123L;
        int defaultPerPage = 10;
        String defaultSort = "popularity";
        List<Map<String, Object>> mockSongs = List.of(
                Map.of("id", 101L, "title", "Song A"),
                Map.of("id", 102L, "title", "Song B")
        );
        when(geniusService.getTopSongs(eq(artistId), eq(defaultPerPage), eq(defaultSort))).thenReturn(mockSongs);

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Song A")))
                .andExpect(jsonPath("$[1].title", is("Song B")));

        verify(geniusService).getTopSongs(artistId, defaultPerPage, defaultSort);
    }

    @Test
    void getTopSongs_withValidArtistIdAndSpecificPerPage_shouldReturnOkWithSongs() throws Exception {
        Long artistId = 123L;
        int perPage = 5;
        String defaultSort = "popularity";
        List<Map<String, Object>> mockSongs = List.of(
                Map.of("id", 101L, "title", "Song A")
        );
        when(geniusService.getTopSongs(eq(artistId), eq(perPage), eq(defaultSort))).thenReturn(mockSongs);

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId)
                        .param("per_page", String.valueOf(perPage)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(101)));

        verify(geniusService).getTopSongs(artistId, perPage, defaultSort);
    }

    @Test
    void getTopSongs_withSpecificSortParameter_shouldCallServiceWithCorrectSort() throws Exception {
        Long artistId = 123L;
        int defaultPerPage = 10;
        String specificSort = "title";
        List<Map<String, Object>> mockSongs = List.of(
                Map.of("id", 103L, "title", "Alphabet Song")
        );
        when(geniusService.getTopSongs(eq(artistId), eq(defaultPerPage), eq(specificSort))).thenReturn(mockSongs);

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId)
                        .param("sort", specificSort))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Alphabet Song")));

        verify(geniusService).getTopSongs(artistId, defaultPerPage, specificSort);
    }


    @Test
    void getTopSongs_withPerPageTooLow_shouldCallServiceWithPerPageOne() throws Exception {
        Long artistId = 123L;
        int expectedPerPage = 1;
        String defaultSort = "popularity";
        List<Map<String, Object>> mockSongs = List.of(Map.of("id", 101L, "title", "Song A"));
        when(geniusService.getTopSongs(eq(artistId), eq(expectedPerPage), eq(defaultSort))).thenReturn(mockSongs);

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId)
                        .param("per_page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(geniusService).getTopSongs(artistId, expectedPerPage, defaultSort);
    }

    @Test
    void getTopSongs_withPerPageTooHigh_shouldCallServiceWithPerPageFifty() throws Exception {
        Long artistId = 123L;
        int expectedPerPage = 50;
        String defaultSort = "popularity";
        List<Map<String, Object>> mockSongs = List.of(Map.of("id", 101L, "title", "Song A"));
        when(geniusService.getTopSongs(eq(artistId), eq(expectedPerPage), eq(defaultSort))).thenReturn(mockSongs);

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId)
                        .param("per_page", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(geniusService).getTopSongs(artistId, expectedPerPage, defaultSort);
    }

    @Test
    void getTopSongs_whenServiceReturnsEmptyList_shouldReturnOkWithEmptyList() throws Exception {
        Long artistId = 456L;
        int defaultPerPage = 10;
        String defaultSort = "popularity";
        when(geniusService.getTopSongs(eq(artistId), anyInt(), eq(defaultSort))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(geniusService).getTopSongs(artistId, defaultPerPage, defaultSort);
    }

    @Test
    void getTopSongs_whenServiceThrowsException_shouldReturnInternalServerError() throws Exception {
        Long artistId = 789L;
        int defaultPerPage = 10;
        String defaultSort = "popularity";
        when(geniusService.getTopSongs(eq(artistId), anyInt(), eq(defaultSort))).thenThrow(new RuntimeException("Service layer error"));

        mockMvc.perform(get("/api/genius/artists/{artistId}/songs", artistId))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error", is("Failed to fetch top songs")));

        verify(geniusService).getTopSongs(artistId, defaultPerPage, defaultSort);
    }

    @Test
    void getSong_withValidSongId_shouldReturnOkWithSong() throws Exception {
        Long songId = 101L;
        Map<String, Object> mockSong = Map.of(
                "id", songId,
                "title", "Bohemian Rhapsody",
                "artist_names", "Queen"
        );
        when(geniusService.getSong(eq(songId))).thenReturn(mockSong);

        mockMvc.perform(get("/api/genius/songs/{songId}", songId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(songId.intValue())))
                .andExpect(jsonPath("$.title", is("Bohemian Rhapsody")))
                .andExpect(jsonPath("$.artist_names", is("Queen")));

        verify(geniusService).getSong(songId);
    }

    @Test
    void getSong_whenServiceThrowsException_shouldReturnInternalServerError() throws Exception {
        Long songId = 999L;
        when(geniusService.getSong(eq(songId))).thenThrow(new RuntimeException("Service layer error"));

        mockMvc.perform(get("/api/genius/songs/{songId}", songId))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error", is("Failed to get song")));

        verify(geniusService).getSong(songId);
    }

    @Test
    void getLyrics_withValidUrl_shouldReturnOkWithLyrics() throws Exception {
        String url = "https://genius.com/Queen-bohemian-rhapsody-lyrics";
        String mockLyrics = "Sample lyrics content";
        // Simulate the service returning the raw lyrics string
        when(geniusService.getLyrics(eq(url))).thenReturn(mockLyrics);

        mockMvc.perform(get("/api/genius/lyrics").param("url", url))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.lyrics", is(mockLyrics)));

        verify(geniusService).getLyrics(url);
    }

    @Test
    void getLyrics_whenServiceThrowsException_shouldReturnInternalServerError() throws Exception {
        String url = "https://genius.com/invalid-url";
        when(geniusService.getLyrics(eq(url))).thenThrow(new RuntimeException("Service layer error"));

        mockMvc.perform(get("/api/genius/lyrics").param("url", url))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error", is("Failed to get lyrics")));


        verify(geniusService).getLyrics(url);
    }
}