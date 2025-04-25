package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.models.FavoriteSong;
import edu.usc.csci310.project.requests.FavoriteGetRequest;
import edu.usc.csci310.project.requests.FavoriteSongRequest;
import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.responses.UserFavoritesResponse;
import edu.usc.csci310.project.responses.UserResponse;
import edu.usc.csci310.project.services.FavoriteService;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/favorite")
public class FavoriteController {
    private final FavoriteService favoriteService;
    public FavoriteController(FavoriteService favoriteService) { this.favoriteService = favoriteService; }

    @PostMapping("/add")
    public ResponseEntity<UserResponse> addFavorite(@RequestBody FavoriteSongRequest request) {
        try {
            int result = favoriteService.addFavoriteSong(request);
            if(result >= 0) {
                return ResponseEntity.status(200).body(new UserResponse(result, "Added to favorites!", ""));
            }
            else if(result == -1) { // result = -1, userId not found
                return ResponseEntity.status(400).body(new UserResponse(-1, "User not found", ""));
            }
            else { // result = -2, userId has already favorited songId
                return ResponseEntity.status(409).body(new UserResponse(-2, "Song already favorited", ""));
            }

        }
        catch (RuntimeException rte) {
            String exceptionMessage = rte.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new UserResponse(-1, exceptionMessage, ""));
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<UserResponse> removeFavorite(@RequestBody FavoriteRemoveRequest request) {
        try {
            int result = favoriteService.removeFavoriteSong(request);
            if(result >= 0) {
                return ResponseEntity.status(200).body(new UserResponse(result, "Removed from favorites!", ""));
            }
            else { // result = -1, userId not found
                return ResponseEntity.status(400).body(new UserResponse(-2, "User not found", ""));
            }
        }
        catch (RuntimeException rte) {
            String exceptionMessage = rte.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new UserResponse(-1, exceptionMessage, ""));
        }
    }

    @PostMapping("/get")
    public ResponseEntity<UserFavoritesResponse> getFavoriteSong(@RequestBody FavoriteGetRequest request) {
        try {
            List<FavoriteSong> result = favoriteService.getFavoriteSongs(request); // list of user's favorite songIDs
            if (result == null || result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new UserFavoritesResponse(-2, "No favorite songs found.", null));
            }
            else {
                return ResponseEntity.ok(new UserFavoritesResponse(1, "Favorite songs found.", result));
            }
        }
        catch (RuntimeException rte) {
            String exceptionMessage = rte.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new UserFavoritesResponse(-1, exceptionMessage, null));
        }
    }
}
