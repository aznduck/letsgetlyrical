package edu.usc.csci310.project.services;
import org.jsoup.HttpStatusException;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.jsoup.select.Elements;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        try {
            Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                        .timeout(15000)
                        .get();

            Pattern pattern = Pattern.compile("^(Lyrics-\\w{2}.\\w+.[1])|Lyrics__Container");

            Elements divs = new Elements();

            // Find all <div> elements and filter those whose one or more class names match the regex pattern.
            for (Element div : doc.select("div")) {
                // Check each class of the div against the pattern.
                for (String cls : div.classNames()) {
                    Matcher matcher = pattern.matcher(cls);
                    if (matcher.find()) {
                        divs.add(div);
                        break;
                    }
                }
            }

            if (divs.isEmpty()) {
                return null;
            }

            StringBuilder lyricsBuilder = new StringBuilder();
            for (Element container : divs) {
                // Remove nested elements that have a class containing "LyricsHeader"
                container.select("div[class*='LyricsHeader']").remove();
                lyricsBuilder.append(container.text()).append("\n");
                logger.info("Div text: " + container.text() + "\n");
            }
            String lyrics = lyricsBuilder.toString();

            return lyrics.trim();
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
}
