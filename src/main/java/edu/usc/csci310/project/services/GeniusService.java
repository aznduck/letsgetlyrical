package edu.usc.csci310.project.services;
import org.jsoup.HttpStatusException;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Service
public class GeniusService {

    private static final Logger logger = LoggerFactory.getLogger(GeniusService.class);

    private final RestTemplate restTemplate;
    private final String baseUrl = "https://api.genius.com";

    @Value("${genius.client.access.token}")
    private String clientAccessToken;

    public GeniusService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, Object>> searchArtist(String query) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/search")
                    .queryParam("q", query)
                    .build()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clientAccessToken);
            headers.set("Accept", "application/json");

            RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, uri);
            ResponseEntity<Map> response = restTemplate.exchange(requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");
                if (responseData != null && responseData.containsKey("hits")) {
                    List<Map<String, Object>> hits = (List<Map<String, Object>>) responseData.get("hits");
                    if (hits != null) {
                        List<Map<String, Object>> artists = new ArrayList<>();
                        for (Map<String, Object> hit : hits) {
                            if (hit != null && hit.containsKey("result")) {
                                Map<String, Object> result = (Map<String, Object>) hit.get("result");
                                if (result != null && result.containsKey("primary_artist")) {
                                    Map<String, Object> primaryArtist = (Map<String, Object>) result.get("primary_artist");
                                    if (primaryArtist != null && primaryArtist.containsKey("id") && primaryArtist.containsKey("name")) {
                                        Map<String, Object> artistInfo = new HashMap<>();
                                        artistInfo.put("artist_id", primaryArtist.get("id"));
                                        artistInfo.put("artist_name", primaryArtist.get("name"));
                                        artists.add(artistInfo);
                                    }
                                }
                            }
                        }
                        logger.info("Found {} potential artists for query '{}'", artists.size(), query);
                        logger.info(String.valueOf(artists));
                        return artists;
                    }
                }
            }
            logger.warn("Received non-successful response or empty body from Genius API search: Status {}", response.getStatusCode());

        } catch (RestClientException e) {
            logger.error("Error searching for artists via Genius API: {}", e.getMessage(), e);
        } catch (ClassCastException | NullPointerException e) {
            logger.error("Error parsing Genius API search response: {}", e.getMessage(), e);
        }

        return Collections.emptyList();
    }

    public List<Map<String, Object>> getTopSongs(Long artistId, int perPage) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/artists/" + artistId + "/songs")
                    .queryParam("sort", "popularity")
                    .queryParam("per_page", perPage)
                    .build()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clientAccessToken);
            headers.set("Accept", "application/json");

            RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, uri);
            ResponseEntity<Map> response = restTemplate.exchange(requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");

                if (responseData != null && responseData.containsKey("songs")) {
                    Object songsObject = responseData.get("songs");
                    if (songsObject instanceof List) {
                        List<Map<String, Object>> songs = (List<Map<String, Object>>) songsObject;
                        logger.info("Fetched {} songs for artist ID {}", songs.size(), artistId);
                        logger.info(String.valueOf(songs));
                        return songs;
                    } else {
                        logger.warn("Genius API returned 'songs' but it was not a List for artist ID {}", artistId);
                    }
                } else {
                    logger.warn("Genius API response for songs did not contain 'songs' key or responseData was null for artist ID {}", artistId);
                }
            } else {
                logger.warn("Received non-successful response or empty body from Genius API songs endpoint: Status {}", response.getStatusCode());
            }
        } catch (RestClientException e) {
            logger.error("Error fetching top songs from Genius API for artist ID {}: {}", artistId, e.getMessage(), e);
        } catch (ClassCastException | NullPointerException e) {
            logger.error("Error parsing Genius API songs response: {}", e.getMessage(), e);
        }

        return Collections.emptyList();
    }

    public Map<String, Object> getSong(Long songId) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/songs/" + songId).build().toUri();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clientAccessToken);
            headers.set("Accept", "application/json");

            RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, uri);
            ResponseEntity<Map> response = restTemplate.exchange(requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");

                if (responseData != null && responseData.containsKey("song")) {
                    Map<String, Object> songData = (Map<String, Object>) responseData.get("song");
                    return songData;
                } else {
                    logger.warn("Genius API response for songs did not contain 'songs' key or responseData was null for song ID {}", songId);
                }
            } else {
                logger.warn("Received non-successful response or empty body from Genius API song endpoint: Status {}", response.getStatusCode());
            }
        } catch (RestClientException e) {
            logger.error("Error fetching Genius API song data for ID: {}, {}", songId, e.getMessage(), e);
        } catch (ClassCastException | NullPointerException e) {
            logger.error("Error parsing Genius API song response: {}", e.getMessage(), e);
        }
        return Collections.emptyMap();
    }

    public String getLyrics(String url) {
        logger.info("Looking for lyrics using Jsoup (revised) for url: {}", url);
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(15000) // 15 seconds timeout
                    .get();

            Element lyricsContainer = doc.selectFirst("div[data-lyrics-container=true]");
            if (lyricsContainer == null) {
                logger.error("Error: Could not find the lyrics container div[data-lyrics-container=true]");
                return "Error: Could not find the lyrics container div[data-lyrics-container=true]";
            }
            logger.debug("Successfully found lyrics container.");
            // logger.info("Container HTML: {}", lyricsContainer.html());

            Element containerClone = lyricsContainer.clone();

            Element header = containerClone.selectFirst("div[data-exclude-from-selection=true]");
            if (header != null) {
                header.remove();
                logger.debug("Removed header element (data-exclude-from-selection=true) from cloned container.");
            } else {
                logger.warn("Could not find header element (div[data-exclude-from-selection=true]) to remove within the container clone. Proceeding without removal.");
            }

            String lyricsHtml = containerClone.html();

            if (lyricsHtml.trim().isEmpty()) {
                logger.error("Error: Extracted lyrics HTML (after potential header removal) is empty for URL: {}", url);
                return "Error: Extracted lyrics HTML is empty after header removal.";
            }
            logger.debug("Lyrics HTML (post-header removal): {}", lyricsHtml.substring(0, Math.min(lyricsHtml.length(), 100)) + "...");


            Safelist safelist = Safelist.none().addTags("br");
            String cleanedHTML = Jsoup.clean(lyricsHtml, "", safelist, new Document.OutputSettings().prettyPrint(false));
            logger.debug("HTML after cleaning (allowing only <br>): {}", cleanedHTML.substring(0, Math.min(cleanedHTML.length(), 100)) + "...");

            String lyricsWithNewlines = cleanedHTML.replaceAll("(?i)<br\\s*/?>", "\n");

            String finalText = Jsoup.parse(lyricsWithNewlines).text();

            if (finalText.trim().isEmpty()){
                logger.error("Error: Final lyrics text is empty after processing for URL: {}", url);
                return "Error: Final lyrics text is empty after processing.";
            }

            logger.info("Successfully extracted lyrics using Jsoup (revised) for URL: {}", url);
            // logger.debug("Final lyrics: {}", finalText.trim());

            return finalText.trim();

        } catch (HttpStatusException e) {
            logger.error("HTTP Error fetching URL {}: Status={}, Message={}", url, e.getStatusCode(), e.getMessage());
            return "Error fetching URL: HTTP Status " + e.getStatusCode() + ". Check if the URL is correct and accessible.";
        } catch (IOException e) {
            logger.error("IOException during Jsoup scraping for URL: {}", url, e);
            return "Error during scraping (Connection/IO): " + e.getMessage();
        } catch (Exception e) {
            logger.error("Unexpected error during Jsoup scraping for URL: {}", url, e);
            return "Error during scraping: " + e.getMessage();
        }
    }
}
