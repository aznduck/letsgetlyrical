package edu.usc.csci310.project.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeniusServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private GeniusService geniusService;

    private final String testToken = "test-access-token";
    private final String baseUrl = "https://api.genius.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(geniusService, "clientAccessToken", testToken);
    }

    @Test
    void searchArtist_whenApiReturnsValidArtists_shouldReturnParsedArtists() {
        String query = "Test Artist";
        Map<String, Object> primaryArtist1 = Map.of("id", 123L, "name", "Test Artist One");
        Map<String, Object> result1 = Map.of("primary_artist", primaryArtist1);
        Map<String, Object> hit1 = Map.of("result", result1);

        Map<String, Object> primaryArtist2 = Map.of("id", 456L, "name", "Another Test Artist");
        Map<String, Object> result2 = Map.of("primary_artist", primaryArtist2);
        Map<String, Object> hit2 = Map.of("result", result2);

        Map<String, Object> responseData = Map.of("hits", List.of(hit1, hit2));
        Map<String, Object> responseBody = Map.of("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertEquals(2, artists.size());

        assertEquals(123L, artists.get(0).get("artist_id"));
        assertEquals("Test Artist One", artists.get(0).get("artist_name"));
        assertEquals(456L, artists.get(1).get("artist_id"));
        assertEquals("Another Test Artist", artists.get(1).get("artist_name"));

        ArgumentCaptor<RequestEntity<Void>> requestEntityCaptor = ArgumentCaptor.forClass(RequestEntity.class);
        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));

        RequestEntity<Void> capturedRequest = requestEntityCaptor.getValue();
        assertEquals(HttpMethod.GET, capturedRequest.getMethod());
        assertTrue(capturedRequest.getUrl().toString().startsWith(baseUrl + "/search"));
        assertTrue(capturedRequest.getUrl().toString().contains("q=Test%20Artist"));
        assertEquals("Bearer " + testToken, capturedRequest.getHeaders().getFirst("Authorization"));
        assertEquals("application/json", capturedRequest.getHeaders().getFirst("Accept"));
    }

    @Test
    void searchArtist_whenApiReturnsEmptyHits_shouldReturnEmptyList() {
        String query = "Unknown Artist";
        Map<String, Object> responseData = Map.of("hits", Collections.emptyList());
        Map<String, Object> responseBody = Map.of("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void searchArtist_whenApiReturnsMalformedResponse_shouldReturnEmptyList() {
        String query = "Test Artist";
        Map<String, Object> responseBody = Map.of("unexpected_key", "some_value");
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void searchArtist_whenApiReturnsNon2xxStatus_shouldReturnEmptyList() {
        String query = "Test Artist";
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(null, HttpStatus.NOT_FOUND);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void searchArtist_whenRestTemplateThrowsException_shouldReturnEmptyList() {
        String query = "Test Artist";
        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(new RestClientException("API unreachable"));

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_whenApiReturnsValidSongs_shouldReturnSongsList() {
        Long artistId = 789L;
        int perPage = 5;
        Map<String, Object> song1 = Map.of("id", 101L, "title", "Hit Song 1");
        Map<String, Object> song2 = Map.of("id", 102L, "title", "Hit Song 2");
        List<Map<String, Object>> songsList = List.of(song1, song2);

        Map<String, Object> responseData = Map.of("songs", songsList);
        Map<String, Object> responseBody = Map.of("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(songs);
        assertEquals(2, songs.size());
        assertEquals(song1, songs.get(0));
        assertEquals(song2, songs.get(1));

        ArgumentCaptor<RequestEntity<Void>> requestEntityCaptor = ArgumentCaptor.forClass(RequestEntity.class);
        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));

        RequestEntity<Void> capturedRequest = requestEntityCaptor.getValue();
        URI capturedUri = capturedRequest.getUrl();
        assertEquals(HttpMethod.GET, capturedRequest.getMethod());
        assertTrue(capturedUri.toString().startsWith(baseUrl + "/artists/" + artistId + "/songs"));
        assertTrue(capturedUri.getQuery().contains("sort=popularity"));
        assertTrue(capturedUri.getQuery().contains("per_page=" + perPage));
        assertEquals("Bearer " + testToken, capturedRequest.getHeaders().getFirst("Authorization"));
        assertEquals("application/json", capturedRequest.getHeaders().getFirst("Accept"));
    }

    @Test
    void getTopSongs_whenApiReturnsEmptySongs_shouldReturnEmptyList() {
        Long artistId = 789L;
        int perPage = 5;
        Map<String, Object> responseData = Map.of("songs", Collections.emptyList());
        Map<String, Object> responseBody = Map.of("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_whenApiReturnsMalformedResponse_shouldReturnEmptyList() {
        Long artistId = 789L;
        int perPage = 5;
        Map<String, Object> responseData = Map.of("unexpected_key", "value");
        Map<String, Object> responseBody = Map.of("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_whenApiReturnsNon2xxStatus_shouldReturnEmptyList() {
        Long artistId = 789L;
        int perPage = 5;
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(null, HttpStatus.BAD_GATEWAY);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }

    @Test
    void getTopSongs_whenRestTemplateThrowsException_shouldReturnEmptyList() {
        Long artistId = 789L;
        int perPage = 5;
        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(new RestClientException("Timeout"));

        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(songs);
        assertTrue(songs.isEmpty());
        verify(restTemplate).exchange(any(RequestEntity.class), eq(Map.class));
    }
}
