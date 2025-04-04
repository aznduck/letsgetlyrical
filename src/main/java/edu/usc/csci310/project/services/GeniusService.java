package edu.usc.csci310.project.services;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeniusService {

    private final RestTemplate restTemplate;
    private final String baseUrl = "https://api.genius.com";

    @Value("${genius.client.access.token}")
    private String clientAccessToken;

    public GeniusService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate; // Assign injected RestTemplate
    }

    public List<Map<String, Object>> searchArtist(String query) {
        List<Map<String, Object>> artists = new ArrayList<>();

        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/search")
                    .queryParam("q", query)
                    .build()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clientAccessToken);

            RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, uri);
            ResponseEntity<Map> response = restTemplate.exchange(requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");

                if (responseData != null && responseData.containsKey("hits")) {
                    List<Map<String, Object>> hits = (List<Map<String, Object>>) responseData.get("hits");

                    for (Map<String, Object> hit : hits) {
                        Map<String, Object> result = (Map<String, Object>) hit.get("result");
                        Map<String, Object> primaryArtist = (Map<String, Object>) result.get("primary_artist");

                        Map<String, Object> artistInfo = new HashMap<>();
                        artistInfo.put("artist_id", primaryArtist.get("id"));
                        artistInfo.put("artist_name", primaryArtist.get("name"));

                        artists.add(artistInfo);
                    }
                }
            }
        } catch (RestClientException e) {
            // Log the error
            System.err.println("Error searching for artists: " + e.getMessage());
        }

        return artists;
    }

    public List<Map<String, Object>> getTopSongs(Long artistId) {
        List<Map<String, Object>> songs = new ArrayList<>();

        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl + "/artists/" + artistId + "/songs")
                    .queryParam("sort", "popularity")
                    .queryParam("per_page", 10)
                    .build()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clientAccessToken);

            RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, uri);
            ResponseEntity<Map> response = restTemplate.exchange(requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> responseData = (Map<String, Object>) responseBody.get("response");

                if (responseData != null && responseData.containsKey("songs")) {
                    songs = (List<Map<String, Object>>) responseData.get("songs");
                }
            }
        } catch (RestClientException e) {
            // Log the error
            System.err.println("Error fetching top songs: " + e.getMessage());
        }

        return songs;
    }
}