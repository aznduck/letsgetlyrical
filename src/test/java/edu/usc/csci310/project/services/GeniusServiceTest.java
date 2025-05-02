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

    @Mock
    private Logger logger; // Mock logger if needed for verification, though often not necessary

    @InjectMocks
    private GeniusService geniusService;

    private final String testToken = "test-access-token";
    private final String baseUrl = "https://api.genius.com";
    private final Long songId = 123L;
    private final Long artistId = 456L;
    private final String searchQuery = "Test Artist";
    private final String NEWLINE_PLACEHOLDER = "%%%BR%%%";


    @Captor
    private ArgumentCaptor<RequestEntity<Void>> requestEntityCaptor;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(geniusService, "clientAccessToken", testToken);
        ReflectionTestUtils.setField(geniusService, "baseUrl", baseUrl);
        // Optional: Inject mocked logger if you want to verify logging calls
        // ReflectionTestUtils.setField(GeniusService.class, "logger", logger);
    }

    // --- searchArtist Tests ---

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
        Map<String, Object> responseBody = new HashMap<>(); // Missing 'response' key
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
        Map<String, Object> responseData = new HashMap<>(); // Missing 'hits' key
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
    void testSearchArtist_ParsingError_ClassCastException() {
        String query = searchQuery;
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", "not a map"); // Will cause ClassCastException
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

    // --- getTopSongs Tests ---

    @Test
    void testGetTopSongs_Success() {
        int perPage = 5;
        String sort = "popularity";

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

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertEquals(2, topSongs.size());
        assertEquals(song1, topSongs.get(0));
        assertEquals(song2, topSongs.get(1));

        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));
        RequestEntity<Void> capturedRequest = requestEntityCaptor.getValue();
        URI expectedUri = UriComponentsBuilder.fromUriString(baseUrl + "/artists/" + artistId + "/songs")
                .queryParam("per_page", perPage)
                .queryParam("sort", sort)
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
        String sort = "popularity";
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_NullResponseBody() {
        int perPage = 5;
        String sort = "popularity";
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_MissingResponse() {
        int perPage = 5;
        String sort = "popularity";
        Map<String, Object> responseBody = new HashMap<>(); // Missing 'response'
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_NullResponseData() {
        int perPage = 5;
        String sort = "popularity";
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", null); // Null 'response' data
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }


    @Test
    void testGetTopSongs_ParsingError_MissingSongsKey() {
        int perPage = 5;
        String sort = "popularity";
        Map<String, Object> responseData = new HashMap<>(); // Missing 'songs' key
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ParsingError_SongsNotList() {
        int perPage = 5;
        String sort = "popularity";
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("songs", "this is not a list"); // 'songs' key is not a List
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_RestClientException() {
        int perPage = 5;
        String sort = "popularity";
        RestClientException exception = new RestClientException("Network error");

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenThrow(exception);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    @Test
    void testGetTopSongs_ClassCastException() {
        int perPage = 5;
        String sort = "popularity";
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", "not a map"); // Causes ClassCastException on responseData
        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        List<Map<String, Object>> topSongs = geniusService.getTopSongs(artistId, perPage, sort);

        assertNotNull(topSongs);
        assertTrue(topSongs.isEmpty());
    }

    // --- getSong Tests ---

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
        responseBody.put("response", null); // 'response' data is null
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_noSongKey() {
        Map<String, Object> responseData = new HashMap<>(); // Missing 'song' key
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
        responseBody.put("response", "This is a string, not a Map"); // Causes ClassCastException
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getSong_nullPointerException() {
        // Simulate scenario where responseBody is OK, but responseData is null
        // leading to NPE when accessing responseData.get("song")
        Map<String, Object> responseMap = mock(Map.class);
        when(responseMap.get("response")).thenReturn(null);
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseMap, HttpStatus.OK);

        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        Map<String, Object> result = geniusService.getSong(songId);

        assertTrue(result.isEmpty()); // Expect empty map as the catch block should handle NPE
    }


    @Test
    void getSong_verifyRequestStructure() {
        when(restTemplate.exchange(any(RequestEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(createMockSongResponse(), HttpStatus.OK)); // Return a valid response

        geniusService.getSong(songId);

        verify(restTemplate).exchange(requestEntityCaptor.capture(), eq(Map.class));
        RequestEntity<?> capturedRequest = requestEntityCaptor.getValue();

        URI expectedUri = UriComponentsBuilder.fromUriString(baseUrl + "/songs/" + songId)
                .build().toUri();
        assertEquals(expectedUri, capturedRequest.getUrl());
        assertEquals(HttpMethod.GET, capturedRequest.getMethod());
        assertEquals("Bearer " + testToken, capturedRequest.getHeaders().getFirst("Authorization"));
        assertEquals("application/json", capturedRequest.getHeaders().getFirst("Accept"));
    }

    // --- getLyrics Tests ---

    @Test
    void testGetLyrics_Success_WithLineBreaksAndTrimming() throws IOException {
        String url = "https://genius.com/song-lyrics";
        // Includes extra newlines and surrounding whitespace to test trimming and newline reduction
        String rawLyricsWithPlaceholders = "  \n Line one" + NEWLINE_PLACEHOLDER +
                "Line two" + NEWLINE_PLACEHOLDER + NEWLINE_PLACEHOLDER + NEWLINE_PLACEHOLDER +
                "Line four \n ";
        String expectedLyrics = "Line one\nLine two\n\nLine four"; // Expected final output

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connectionMock = mock(Connection.class);
            Document documentMock = mock(Document.class);
            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connectionMock);
            when(connectionMock.userAgent(anyString())).thenReturn(connectionMock);
            when(connectionMock.timeout(anyInt())).thenReturn(connectionMock);
            when(connectionMock.get()).thenReturn(documentMock);

            Element matchingDivMock = mock(Element.class, "matchingDiv");
            Element brMock1 = mock(Element.class, "br1");
            Element brMock2 = mock(Element.class, "br2");
            Element brMock3 = mock(Element.class, "br3");

            Elements allDivs = new Elements(matchingDivMock);
            when(documentMock.select("div")).thenReturn(allDivs);
            when(matchingDivMock.classNames()).thenReturn(Collections.singleton("Lyrics__Container"));
            when(matchingDivMock.clone()).thenReturn(matchingDivMock);
            when(matchingDivMock.select("div[class*='LyricsHeader']")).thenReturn(new Elements()); // No header
            Elements brElements = new Elements(brMock1, brMock2, brMock3);
            when(matchingDivMock.select("br")).thenReturn(brElements);
            when(matchingDivMock.text()).thenReturn(rawLyricsWithPlaceholders); // Return the text with placeholders

            // --- Execution ---
            String result = geniusService.getLyrics(url);

            // --- Verification ---
            assertEquals(expectedLyrics, result);
            verify(matchingDivMock).clone();
            verify(matchingDivMock).select("div[class*='LyricsHeader']");
            verify(matchingDivMock).select("br");
            verify(brMock1).after(NEWLINE_PLACEHOLDER);
            verify(brMock1).remove();
            verify(brMock2).after(NEWLINE_PLACEHOLDER);
            verify(brMock2).remove();
            verify(brMock3).after(NEWLINE_PLACEHOLDER);
            verify(brMock3).remove();
            verify(matchingDivMock).text();
        }
    }

    @Test
    void testGetLyrics_Success_MultipleContainers() throws IOException {
        String url = "https://genius.com/song-lyrics";
        String expectedLyrics = "Lyrics part 1\n\nLyrics part 2";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connectionMock = mock(Connection.class);
            Document documentMock = mock(Document.class);
            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connectionMock);
            when(connectionMock.userAgent(anyString())).thenReturn(connectionMock);
            when(connectionMock.timeout(anyInt())).thenReturn(connectionMock);
            when(connectionMock.get()).thenReturn(documentMock);

            Element matchingDiv1 = mock(Element.class, "matchingDiv1");
            Element matchingDiv2 = mock(Element.class, "matchingDiv2");

            // Need to return a list for Elements operations
            Elements allDivs = new Elements(Arrays.asList(matchingDiv1, matchingDiv2));
            when(documentMock.select("div")).thenReturn(allDivs);

            when(matchingDiv1.classNames()).thenReturn(Collections.singleton("Lyrics__Container-1"));
            when(matchingDiv2.classNames()).thenReturn(Collections.singleton("Lyrics__Container-2")); // Different class matching pattern

            when(matchingDiv1.clone()).thenReturn(matchingDiv1);
            when(matchingDiv2.clone()).thenReturn(matchingDiv2);

            when(matchingDiv1.select("div[class*='LyricsHeader']")).thenReturn(new Elements());
            when(matchingDiv2.select("div[class*='LyricsHeader']")).thenReturn(new Elements());

            when(matchingDiv1.select("br")).thenReturn(new Elements()); // No <br> tags in this part
            when(matchingDiv2.select("br")).thenReturn(new Elements()); // No <br> tags in this part

            when(matchingDiv1.text()).thenReturn("Lyrics part 1");
            when(matchingDiv2.text()).thenReturn("Lyrics part 2");

            // --- Execution ---
            String result = geniusService.getLyrics(url);

            // --- Verification ---
            assertEquals(expectedLyrics, result);

            // Verify essential interactions for both divs
            verify(matchingDiv1).clone();
            verify(matchingDiv1).select("div[class*='LyricsHeader']");
            verify(matchingDiv1).select("br");
            verify(matchingDiv1).text();

            verify(matchingDiv2).clone();
            verify(matchingDiv2).select("div[class*='LyricsHeader']");
            verify(matchingDiv2).select("br");
            verify(matchingDiv2).text();
        }
    }


    @Test
    void testGetLyrics_NoDivsFound() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);
            Document document = mock(Document.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            when(connection.get()).thenReturn(document);

            Elements emptyDivs = new Elements(); // No divs returned
            when(document.select("div")).thenReturn(emptyDivs);

            String result = geniusService.getLyrics(url);

            assertNull(result, "Should return null when no divs are found");
        }
    }

    @Test
    void testGetLyrics_NoMatchingDivs() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);
            Document document = mock(Document.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            when(connection.get()).thenReturn(document);

            Element div = mock(Element.class);
            Elements allDivs = new Elements(div);
            when(document.select("div")).thenReturn(allDivs);

            // Class name does not match the pattern
            when(div.classNames()).thenReturn(Collections.singleton("non-matching-class"));

            String result = geniusService.getLyrics(url);

            assertNull(result, "Should return null when no divs match the pattern");
        }
    }

    @Test
    void testGetLyrics_IOException() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connection = mock(Connection.class);

            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connection);
            when(connection.userAgent(anyString())).thenReturn(connection);
            when(connection.timeout(anyInt())).thenReturn(connection);
            // Simulate IOException during connection/fetching
            when(connection.get()).thenThrow(new IOException("Connection error"));

            String result = geniusService.getLyrics(url);

            assertEquals("", result, "Should return empty string on IOException");
        }
    }

    @Test
    void testGetLyrics_UnexpectedException() throws IOException {
        String url = "https://genius.com/song-lyrics";

        try (MockedStatic<Jsoup> mockedJsoup = Mockito.mockStatic(Jsoup.class)) {
            Connection connectionMock = mock(Connection.class);
            Document documentMock = mock(Document.class);
            mockedJsoup.when(() -> Jsoup.connect(url)).thenReturn(connectionMock);
            when(connectionMock.userAgent(anyString())).thenReturn(connectionMock);
            when(connectionMock.timeout(anyInt())).thenReturn(connectionMock);
            when(connectionMock.get()).thenReturn(documentMock);

            Element matchingDivMock = mock(Element.class, "matchingDiv");
            Elements allDivs = new Elements(matchingDivMock);
            when(documentMock.select("div")).thenReturn(allDivs);
            when(matchingDivMock.classNames()).thenReturn(Collections.singleton("Lyrics__Container"));

            // Simulate an unexpected RuntimeException during processing
            when(matchingDivMock.clone()).thenThrow(new RuntimeException("Unexpected cloning error"));

            // --- Execution ---
            String result = geniusService.getLyrics(url);

            // --- Verification ---
            assertEquals("", result, "Should return empty string on unexpected Exception");
            // Optional: verify logger.warn call if logger is mocked
        }
    }


    // --- Helper Methods ---

    // Helper method to create a basic valid song response structure
    private Map<String, Object> createMockSongResponse() {
        Map<String, Object> songData = new HashMap<>();
        songData.put("id", songId);
        songData.put("title", "Test Song");
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("song", songData);
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("response", responseData);
        return responseBody;
    }
}