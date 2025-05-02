package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.services.GeniusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/genius")
public class GeniusController {

    private final GeniusService geniusService;

    @Autowired
    public GeniusController(GeniusService geniusService) {
        this.geniusService = geniusService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchArtist(@RequestParam String q) {
        try {
            List<Map<String, Object>> results = geniusService.searchArtist(q);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error in searchArtist controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search artists"));
        }
    }

    @GetMapping("/artists/{artistId}/songs")
    public ResponseEntity<?> getTopSongs(
                                          @PathVariable Long artistId,
                                          @RequestParam(value = "per_page", defaultValue = "10") int perPage,
                                          @RequestParam(value = "sort", defaultValue = "popularity") String sort
    ) {
        try {
            if (perPage < 1) perPage = 1;
            if (perPage > 50) perPage = 50;

            List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage, sort);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            System.err.println("Error in getTopSongs controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch top songs"));
        }
    }

    @GetMapping("/songs/{songId}")
    public ResponseEntity<Map<String, Object>> getSong(@PathVariable Long songId) {
        try {
            Map<String, Object> result = geniusService.getSong(songId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error in getSong controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get song"));
        }
    }

    @GetMapping("/lyrics")
    public ResponseEntity<?> getLyrics(@RequestParam String url) {
        try {
            String result = geniusService.getLyrics(url);
            return ResponseEntity.ok(Map.of("lyrics", result));
        } catch (Exception e) {
            System.err.println("Error in getLyrics controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get lyrics"));
        }
    }
}