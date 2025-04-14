package edu.usc.csci310.project.controllers;

import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.requests.FavoriteSongRequest;
import edu.usc.csci310.project.services.FavoriteService;
import edu.usc.csci310.project.services.LoginService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FavoriteControllerTest {
    FavoriteService favoriteService = mock(FavoriteService.class);
    FavoriteController favoriteController = new FavoriteController(favoriteService);

    FavoriteSongRequest generateValidFavoriteSongRequest() {
        FavoriteSongRequest request = new FavoriteSongRequest();
        request.setUsername("testuser2");
        request.setPassword("testpassword2");
        request.setSongId(42);
        request.setSongName("Test Song 2");
        request.setSongArtist("Test Artist 2");
        request.setFullTitle("Test Song by Test Artist 2");
        request.setDateReleased("1969-01-02");
        request.setLyrics("Test lyrics 2");
        return request;
    }

    FavoriteRemoveRequest generateValidFavoriteRemoveRequest() {
        FavoriteRemoveRequest request = new FavoriteRemoveRequest();
        request.setUsername("testuser2");
        request.setPassword("testpassword2");
        request.setSongId(42);
        return request;
    }

    @Test
    void addFavoriteValid() {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        when(favoriteService.addFavoriteSong(request)).thenReturn(1);
        assertEquals(200, favoriteController.addFavorite(request).getStatusCode().value());
    }

    @Test
    void addFavoriteUserIdNotFound() {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        when(favoriteService.addFavoriteSong(request)).thenReturn(-1);
        assertEquals(400, favoriteController.addFavorite(request).getStatusCode().value());
    }

    @Test
    void addFavoriteException() {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        when(favoriteService.addFavoriteSong(request)).thenThrow(new RuntimeException("Test Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), favoriteController.addFavorite(request).getStatusCode().value());
    }

    @Test
    void removeFavoriteValid() {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        when(favoriteService.removeFavoriteSong(request)).thenReturn(1);
        assertEquals(200, favoriteController.removeFavorite(request).getStatusCode().value());
    }

    @Test
    void removeFavoriteUserIdNotFound() {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        when(favoriteService.removeFavoriteSong(request)).thenReturn(-1);
        assertEquals(400, favoriteController.removeFavorite(request).getStatusCode().value());
    }

    @Test
    void removeFavoriteException() {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        when(favoriteService.removeFavoriteSong(request)).thenThrow(new RuntimeException("Test Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), favoriteController.removeFavorite(request).getStatusCode().value());
    }
}