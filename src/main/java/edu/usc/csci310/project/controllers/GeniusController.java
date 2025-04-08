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
    public ResponseEntity<List<Map<String, Object>>> searchArtist(@RequestParam String q) {
        try {
            List<Map<String, Object>> results = geniusService.searchArtist(q);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error in searchArtist controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(List.of(Map.of("error", "Failed to search artists")));
        }
    }

    @GetMapping("/artists/{artistId}/songs")
    public ResponseEntity<List<Map<String, Object>>> getTopSongs(
            @PathVariable Long artistId,
            @RequestParam(value = "per_page", defaultValue = "10") int perPage
    ) {
        try {
            if (perPage < 1) perPage = 1;
            if (perPage > 50) perPage = 50;

            List<Map<String, Object>> songs = geniusService.getTopSongs(artistId, perPage);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            System.err.println("Error in getTopSongs controller: " + e.getMessage());
            return ResponseEntity.internalServerError().body(List.of(Map.of("error", "Failed to fetch top songs")));
        }
    }
}
