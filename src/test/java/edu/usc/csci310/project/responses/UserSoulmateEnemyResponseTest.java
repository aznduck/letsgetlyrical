package edu.usc.csci310.project.responses;

import static org.junit.jupiter.api.Assertions.*;

class UserSoulmateEnemyResponseTest {

    @org.junit.jupiter.api.Test
    void testUserSoulmateEnemyResponse() {
        UserSoulmateEnemyResponse response = new UserSoulmateEnemyResponse(1, 2, "testuser", true);
        assertEquals(1, response.getFromId());
        assertEquals(2, response.getTargetUserId());
        assertEquals("testuser", response.getTargetUsername());
        assertTrue(response.isEachOther());
    }

}