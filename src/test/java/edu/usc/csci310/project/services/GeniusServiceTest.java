package edu.usc.csci310.project.services;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.util.*;
import org.slf4j.Logger;
import org.springframework.web.util.UriComponentsBuilder;

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
    private final Long songId = 123L;
    private final Long artistId = 456L;
    private final String searchQuery = "Test Artist";

    @Captor
    private ArgumentCaptor<RequestEntity<Void>> requestEntityCaptor;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(geniusService, "clientAccessToken", testToken);
    }

    @Test
    void testSearchArtist_Success() {
        String query = searchQuery;

        Map<String, Object> primaryArtist1 = new HashMap<>();
        primaryArtist1.put("id", 101L);
        primaryArtist1.put("name", "Artist One");

        Map<String, Object> result1 = new HashMap<>();
        result1.put("primary_artist", primaryArtist1);

        Map<String, Object> hit1 = new HashMap<>();
        hit1.put("result", result1);

        Map<String, Object> primaryArtist2 = new HashMap<>();
        primaryArtist2.put("id", 102L);
        primaryArtist2.put("name", "Artist Two");

        Map<String, Object> result2 = new HashMap<>();
        result2.put("primary_artist", primaryArtist2);

        Map<String, Object> hit2 = new HashMap<>();
        hit2.put("result", result2);

        List<Map<String, Object>> hits = Arrays.asList(hit1, hit2);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("hits", hits);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertEquals(2, artists.size());

        assertEquals(101L, artists.get(0).get("artist_id"));
        assertEquals("Artist One", artists.get(0).get("artist_name"));
        assertEquals(102L, artists.get(1).get("artist_id"));
        assertEquals("Artist Two", artists.get(1).get("artist_name"));

        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));
        RequestEntity<Void> capturedRequest = requestEntityCaptor.getValue();
        URI expectedUri = UriComponentsBuilder.fromUriString(baseUrl + "/search")
                .queryParam("q", query)
                .build()
                .toUri();
        assertEquals(expectedUri, capturedRequest.getUrl());
        assertEquals(HttpMethod.GET, capturedRequest.getMethod());
        assertEquals("Bearer " + testToken, capturedRequest.getHeaders().getFirst("Authorization"));
        assertEquals("application/json", capturedRequest.getHeaders().getFirst("Accept"));
    }

    @Test
    void testSearchArtist_Success_NoHits() {
        String query = searchQuery;

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("hits", Collections.emptyList());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testSearchArtist_NonSuccessfulResponse() {
        String query = searchQuery;
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(HttpStatus.NOT_FOUND);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testSearchArtist_NullResponseBody() {
        String query = searchQuery;
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testSearchArtist_ParsingError_MissingResponse() {
        String query = searchQuery;
        Map<String, Object> responseBody = new HashMap<>();

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testSearchArtist_ParsingError_MissingHits() {
        String query = searchQuery;
        Map<String, Object> responseData = new HashMap<>();
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testSearchArtist_RestClientException() {
        String query = searchQuery;
        RestClientException exception = new RestClientException("API unavailable");

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(exception);

        List<Map<String, Object>> artists = geniusService.searchArtist(query);

        assertNotNull(artists);
        assertTrue(artists.isEmpty());
    }

    @Test
    void testGetTopSongs_Success() {
        int perPage = 5;

        Map<String, Object> song1 = new HashMap<>();
        song1.put("id", 201L);
        song1.put("title", "Popular Song 1");

        Map<String, Object> song2 = new HashMap<>();
        song2.put("id", 202L);
        song2.put("title", "Popular Song 2");

        List<Map<String, Object>> songs = Arrays.asList(song1, song2);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("songs", songs);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertEquals(2, topSongs.size());
        assertEquals(song1, topSongs.get(0));
        assertEquals(song2, topSongs.get(1));

        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));
        RequestEntity<Void> capturedRequest = requestEntityCaptor.getValue();
        URI expectedUri = UriComponentsBuilder.fromUriString(baseUrl + "/artists/" + artistId + "/songs")
                .queryParam("sort", "popularity")
                .queryParam("per_page", perPage)
                .build()
                .toUri();
        assertEquals(expectedUri, capturedRequest.getUrl());
        assertEquals(HttpMethod.GET, capturedRequest.getMethod());
        assertEquals("Bearer " + testToken, capturedRequest.getHeaders().getFirst("Authorization"));
        assertEquals("application/json", capturedRequest.getHeaders().getFirst("Accept"));
    }

    @Test
    void testGetTopSongs_NonSuccessfulResponse() {
        int perPage = 5;
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_NullResponseBody() {
        int perPage = 5;
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_MissingResponse() {
        int perPage = 5;
        Map<String, Object> responseBody = new HashMap<>();

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_MissingSongsKey() {
        int perPage = 5;
        Map<String, Object> responseData = new HashMap<>();
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_SongsNotList() {
        int perPage = 5;
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("songs", "this is not a list");
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_RestClientException() {
        int perPage = 5;
        RestClientException exception = new RestClientException("Network error");

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(exception);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ClassCastException() {
        int perPage = 5;
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("songs", Arrays.asList("not a map object"));
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        Map<String, Object> responseBodyCCE = new HashMap<>();
        responseBodyCCE.put("response", "not a map");

        ResponseEntity<Map> mockResponseEntityCCE = new ResponseEntity<>(responseBodyCCE, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntityCCE);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetLyrics_Success_WithLineBreaks() throws IOException {
        String url = "https://genius.com/song-lyrics";
        String expectedLyrics = "Line one\nLine two\n\nLine four";
        String NEWLINE_PLACEHOLDER = "%%%BR%%%";

        String textWithPlaceholders = "Line one" + NEWLINE_PLACEHOLDER +
                "Line two" + NEWLINE_PLACEHOLDER + NEWLINE_PLACEHOLDER + "Line four";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connectionMock = mock(Connection.class);
            Document documentMock = mock(Document.class);
            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connectionMock);
            when(connectionMock.userAgent(anyString())).thenReturn(connectionMock);
            when(connectionMock.timeout(anyInt())).thenReturn(connectionMock);
            when(connectionMock.get()).thenReturn(documentMock);

            Element matchingDivMock = mock(Element.class, "matchingDiv");
            Element nonMatchingDivMock = mock(Element.class, "nonMatchingDiv");
            Element headerDivMock = mock(Element.class, "headerDiv");
            Element brMock1 = mock(Element.class, "br1");
            Element brMock2 = mock(Element.class, "br2");
            Element brMock3 = mock(Element.class, "br3");

            Elements allDivs = new Elements(matchingDivMock, nonMatchingDivMock);
            when(documentMock.select("div")).thenReturn(allDivs);

            Set<String> matchingClassNames = new HashSet<>();
            matchingClassNames.add("Lyrics__Container");
            when(matchingDivMock.classNames()).thenReturn(matchingClassNames);

            Set<String> nonMatchingClassNames = new HashSet<>();
            nonMatchingClassNames.add("some-other-class");
            when(nonMatchingDivMock.classNames()).thenReturn(nonMatchingClassNames);

            when(matchingDivMock.clone()).thenReturn(matchingDivMock);

            Elements headerDivs = new Elements(headerDivMock);
            when(matchingDivMock.select("div[class*='LyricsHeader']")).thenReturn(headerDivs);

            Elements brElements = new Elements(brMock1, brMock2, brMock3);
            when(matchingDivMock.select("br")).thenReturn(brElements);

            when(matchingDivMock.text()).thenReturn(textWithPlaceholders);

            String result = geniusService.getLyrics(url);

            assertEquals(expectedLyrics, result);

        }
    }

    @Test
    public void testGetLyrics_NoDivsFound() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);
            Document document = mock(Document.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            when(connection.get()).thenReturn(document);

            Elements emptyDivs = new Elements();
            when(document.select("div")).thenReturn(emptyDivs);

            String result = geniusService.getLyrics(url);

            assertNull(result);
        }
    }

    @Test
    public void testGetLyrics_NoMatchingDivs() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);
            Document document = mock(Document.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            when(connection.get()).thenReturn(document);

            Element div = mock(Element.class);
            Elements allDivs = new Elements();
            allDivs.add(div);

            when(document.select("div")).thenReturn(allDivs);

            Set<String> classNames = new HashSet<>();
            classNames.add("non-matching-class");
            when(div.classNames()).thenReturn(classNames);

            String result = geniusService.getLyrics(url);

            assertNull(result);
        }
    }

    @Test
    public void testGetLyrics_IOException() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            when(connection.get()).thenThrow(new IOException("Connection error"));

            String result = geniusService.getLyrics(url);

            assertEquals("", result);
        }
    }

    @Test
    void getSong_successful() {
        Map<String, Object> songData = new HashMap<>();
        songData.put("id", songId);
        songData.put("title", "Test Song");

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("song", songData);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertEquals(songData, result);
        assertEquals(songId, result.get("id"));
        assertEquals("Test Song", result.get("title"));
    }

    @Test
    void getSong_nullResponseData() {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", null);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_noSongKey() {
        Map<String, Object> responseData = new HashMap<>();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_nonSuccessfulResponse() {
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(HttpStatus.NOT_FOUND);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_nullResponseBody() {
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_restClientException() {
        RestClientException exception = new RestClientException("Connection refused");

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(exception);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_classCastException() {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", "This is a string, not a Map");

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_nullPointerException() {
        Map<String, Object> responseMap = mock(Map.class);
        when(responseMap.get("response")).thenThrow(new NullPointerException("Simulated NPE"));

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseMap, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_verifyRequestStructure() {
        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenAnswer(invocation -> {
                    RequestEntity<?> requestEntity = invocation.getArgument(0);

                    URI expectedUri = URI.create(baseUrl + "/songs/" + songId);
                    assertEquals(expectedUri, requestEntity.getUrl());

                    assertEquals(HttpMethod.GET, requestEntity.getMethod());

                    HttpHeaders headers = requestEntity.getHeaders();
                    assertEquals("Bearer " + testToken, headers.getFirst("Authorization"));
                    assertEquals("application/json", headers.getFirst("Accept"));

                    Map<String, Object> songData = new HashMap<>();
                    songData.put("title", "Test Song");

                    Map<String, Object> responseData = new HashMap<>();
                    responseData.put("song", songData);

                    Map<String, Object> responseBody = new HashMap<>();
                    responseBody.put("response", responseData);

                    return new ResponseEntity<>(responseBody, HttpStatus.OK);
                });

        geniusService.getSong(songId);
    }
}