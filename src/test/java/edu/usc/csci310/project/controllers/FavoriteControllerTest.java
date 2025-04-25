//package edu.usc.csci310.project.controllers;
//
//import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
//import edu.usc.csci310.project.requests.FavoriteSongRequest;
//import edu.usc.csci310.project.requests.FavoriteGetRequest;
//import edu.usc.csci310.project.services.FavoriteService;
//import edu.usc.csci310.project.services.LoginService;
//import org.junit.jupiter.api.Test;
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import org.springframework.http.HttpStatus;
//
//import java.util.Arrays;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.mock;
//import static org.mockito.Mockito.when;
//
//import edu.usc.csci310.project.responses.UserFavoritesResponse;
//import org.springframework.http.ResponseEntity;
//
//import java.util.Collections;
//
//
//
//class FavoriteControllerTest {
//    FavoriteService favoriteService = mock(FavoriteService.class);
//    FavoriteController favoriteController = new FavoriteController(favoriteService);
//
//    FavoriteSongRequest generateValidFavoriteSongRequest() {
//        FavoriteSongRequest request = new FavoriteSongRequest();
//        request.setUsername("testuser2");
//        request.setPassword("testpassword2");
//        request.setSongId(42);
//        request.setSongName("Test Song 2");
//        request.setSongArtist("Test Artist 2");
//        request.setFullTitle("Test Song by Test Artist 2");
//        request.setDateReleased("1969-01-02");
//        request.setLyrics("Test lyrics 2");
//        return request;
//    }
//
//    FavoriteRemoveRequest generateValidFavoriteRemoveRequest() {
//        FavoriteRemoveRequest request = new FavoriteRemoveRequest();
//        request.setUsername("testuser2");
//        request.setPassword("testpassword2");
//        request.setSongId(42);
//        return request;
//    }
//
//    FavoriteGetRequest generateValidFavoriteGetRequest() {
//        FavoriteGetRequest request = new FavoriteGetRequest();
//        request.setUsername("testuser2");
//        request.setPassword("testpassword2");
//        return request;
//    }
//
//    @Test
//    void addFavoriteValid() {
//        FavoriteSongRequest request = generateValidFavoriteSongRequest();
//        when(favoriteService.addFavoriteSong(request)).thenReturn(1);
//        assertEquals(200, favoriteController.addFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void addFavoriteUserIdNotFound() {
//        FavoriteSongRequest request = generateValidFavoriteSongRequest();
//        when(favoriteService.addFavoriteSong(request)).thenReturn(-1);
//        assertEquals(400, favoriteController.addFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void addFavoriteException() {
//        FavoriteSongRequest request = generateValidFavoriteSongRequest();
//        when(favoriteService.addFavoriteSong(request)).thenThrow(new RuntimeException("Test Exception"));
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), favoriteController.addFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void removeFavoriteValid() {
//        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
//        when(favoriteService.removeFavoriteSong(request)).thenReturn(1);
//        assertEquals(200, favoriteController.removeFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void removeFavoriteUserIdNotFound() {
//        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
//        when(favoriteService.removeFavoriteSong(request)).thenReturn(-1);
//        assertEquals(400, favoriteController.removeFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void removeFavoriteException() {
//        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
//        when(favoriteService.removeFavoriteSong(request)).thenThrow(new RuntimeException("Test Exception"));
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), favoriteController.removeFavorite(request).getStatusCode().value());
//    }
//
//    @Test
//    void getFavoriteSongValid() {
//        FavoriteGetRequest request = generateValidFavoriteGetRequest();
//        when(favoriteService.getFavoriteSongs(request)).thenReturn(Arrays.asList(1, 2, 3));
//        ResponseEntity<UserFavoritesResponse> response = favoriteController.getFavoriteSong(request);
//        assertEquals(200, response.getStatusCode().value());
//        assertEquals("Favorite songs found.", response.getBody().getMessage());
//    }
//
//    @Test
//    void getFavoriteSongEmpty() {
//        FavoriteGetRequest request = generateValidFavoriteGetRequest();
//        when(favoriteService.getFavoriteSongs(request)).thenReturn(Collections.emptyList());
//        ResponseEntity<UserFavoritesResponse> response = favoriteController.getFavoriteSong(request);
//        assertEquals(404, response.getStatusCode().value());
//        assertEquals(-2, response.getBody().getId());
//        assertEquals("No favorite songs found.", response.getBody().getMessage());
//    }
//
//    @Test
//    void getFavoriteSongNull() {
//        FavoriteGetRequest request = generateValidFavoriteGetRequest();
//        when(favoriteService.getFavoriteSongs(request)).thenReturn(null);
//        ResponseEntity<UserFavoritesResponse> response = favoriteController.getFavoriteSong(request);
//        assertEquals(404, response.getStatusCode().value());
//        assertEquals(-2, response.getBody().getId());
//        assertEquals("No favorite songs found.", response.getBody().getMessage());
//    }
//
//    @Test
//    void getFavoriteSongException() {
//        FavoriteGetRequest request = generateValidFavoriteGetRequest();
//        when(favoriteService.getFavoriteSongs(request)).thenThrow(new RuntimeException("Test Exception"));
//        ResponseEntity<UserFavoritesResponse> response = favoriteController.getFavoriteSong(request);
//        assertEquals(500, response.getStatusCode().value());
//        assertEquals(-1, response.getBody().getId());
//        assertEquals("Test Exception", response.getBody().getMessage());
//    }
//}