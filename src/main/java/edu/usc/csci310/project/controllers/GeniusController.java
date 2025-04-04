package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.services.GeniusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/genius")
@CrossOrigin(origins = "*") // Configure this appropriately for production
public class GeniusController {

    private final GeniusService geniusService;

    @Autowired
    public GeniusController(GeniusService geniusService) {
        this.geniusService = geniusService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchArtist(@RequestParam String q) {
        List<Map<String, Object>> results = geniusService.searchArtist(q);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/artists/{artistId}/songs")
    public ResponseEntity<List<Map<String, Object>>> getTopSongs(@PathVariable Long artistId) {
        List<Map<String, Object>> songs = geniusService.getTopSongs(artistId);
        return ResponseEntity.ok(songs);
    }
}
