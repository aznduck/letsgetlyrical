package edu.usc.csci310.project.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeniusServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private GeniusService geniusService;

    private final String dummyToken = "test-access-token";
    private final String baseUrl = "https://api.genius.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(geniusService, "clientAccessToken", dummyToken);
    }

    @Test
    void searchArtist_Success() {
        String query = "Test Artist";
        String expectedUrl = baseUrl + "/search?q=Test%20Artist";

        Map<String, Object> mockArtist1 = new HashMap<>();
        mockArtist1.put("id", 123L);
        mockArtist1.put("name", "Test Artist Name");

        Map<String, Object> mockResult1 = new HashMap<>();
        mockResult1.put("primary_artist", mockArtist1);

        Map<String, Object> mockHit1 = new HashMap<>();
        mockHit1.put("result", mockResult1);

        List<Map<String, Object>> hits = List.of(mockHit1);

        Map<String, Object> mockResponseData = new HashMap<>();
        mockResponseData.put("hits", hits);

        Map<String, Object> mockResponseBody = new HashMap<>();
        mockResponseBody.put("response", mockResponseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                any(RequestEntity.class),
                eq(Map.class)
        )).thenAnswer(invocation -> {
            RequestEntity<?> request = invocation.getArgument(0);
            assertEquals(HttpMethod.GET, request.getMethod());
            assertTrue(request.getUrl().toString().startsWith(baseUrl + "/search"));
            assertEquals("Bearer " + dummyToken, request.getHeaders().getFirst("Authorization"));
            assertEquals(query, request.getUrl().getQuery().split("=")[1]);
            return mockResponseEntity;
        });


        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertEquals(1, artists.size());
        Map<String, Object> artistInfo = artists.get(0);
        assertEquals(123L, artistInfo.get("artist_id"));
        assertEquals("Test Artist Name", artistInfo.get("artist_name"));

        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void searchArtist_ApiError() {
        String query = "Error Artist";
        ResponseEntity<Map> mockErrorResponse = new ResponseEntity<>(null, HttpStatus.NOT_FOUND);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockErrorResponse);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void searchArtist_RestClientException() {
        String query = "Exception Artist";

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(new RestClientException("Network Error"));

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_Success() {
        Long artistId = 456L;
        String expectedUrl = baseUrl + "/artists/" + artistId + "/songs?sort=popularity&per_page=10";

        Map<String, Object> mockSong1 = new HashMap<>();
        mockSong1.put("id", 789L);
        mockSong1.put("title", "Popular Song");
        List<Map<String, Object>> songsList = List.of(mockSong1);

        Map<String, Object> mockResponseData = new HashMap<>();
        mockResponseData.put("songs", songsList);

        Map<String, Object> mockResponseBody = new HashMap<>();
        mockResponseBody.put("response", mockResponseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                any(RequestEntity.class),
                eq(Map.class)
        )).thenAnswer(invocation -> {
            RequestEntity<?> request = invocation.getArgument(0);
            assertEquals(HttpMethod.GET, request.getMethod());
            assertEquals(expectedUrl, request.getUrl().toString());
            assertEquals("Bearer " + dummyToken, request.getHeaders().getFirst("Authorization"));
            return mockResponseEntity;
        });

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId);

        assertNotNull(songs);
        assertEquals(1, songs.size());
        assertEquals(789L, songs.get(0).get("id"));
        assertEquals("Popular Song", songs.get(0).get("title"));

        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_ApiError() {
        Long artistId = 456L;
        ResponseEntity<Map> mockErrorResponse = new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockErrorResponse);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_RestClientException() {
        Long artistId = 456L;

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(new RestClientException("Timeout"));

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_Success_NoSongsInData() {
        Long artistId = 457L;
        String expectedUrl = baseUrl + "/artists/" + artistId + "/songs?sort=popularity&per_page=10";

        Map<String, Object> mockResponseData = new HashMap<>();

        Map<String, Object> mockResponseBody = new HashMap<>();
        mockResponseBody.put("response", mockResponseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(mockResponseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());

        verify(restTemplate, times(1)).exchange(any(RequestEntity.class), eq(Map.class));
    }
}