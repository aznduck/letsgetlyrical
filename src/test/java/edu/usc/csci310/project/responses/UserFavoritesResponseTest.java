//package edu.usc.csci310.project.responses;
//
//import org.junit.jupiter.api.Test;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//class UserFavoritesResponseTest {
//
//    @Test
//    void getId() {
//        UserFavoritesResponse response = new UserFavoritesResponse(5, "Test message", "Test favorites");
//        assertEquals(5, response.getId());
//
//        UserFavoritesResponse negativeIdResponse = new UserFavoritesResponse(-2, "Error message", null);
//        assertEquals(-2, negativeIdResponse.getId());
//    }
//
//    @Test
//    void getFavorites() {
//        String favoritesString = "Test favorites string";
//        UserFavoritesResponse stringResponse = new UserFavoritesResponse(1, "Message", favoritesString);
//        assertEquals(favoritesString, stringResponse.getFavorites());
//
//        UserFavoritesResponse nullResponse = new UserFavoritesResponse(1, "Message", null);
//        assertNull(nullResponse.getFavorites());
//    }
//
//    @Test
//    void getMessage() {
//        UserFavoritesResponse response = new UserFavoritesResponse(1, "Test message", null);
//        assertEquals("Test message", response.getMessage());
//
//        UserFavoritesResponse emptyResponse = new UserFavoritesResponse(1, "", null);
//        assertEquals("", emptyResponse.getMessage());
//    }
//}