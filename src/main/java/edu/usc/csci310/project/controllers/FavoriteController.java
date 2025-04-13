package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.requests.FavoriteSongRequest;
import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.responses.UserResponse;
import edu.usc.csci310.project.services.FavoriteService;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            else { // result = -1, userId not found
                return ResponseEntity.status(400).body(new UserResponse(-2, "User not found", ""));
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
}
