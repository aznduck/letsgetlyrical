package edu.usc.csci310.project.models;

import static org.junit.jupiter.api.Assertions.*;

class MatchResultTest {

    @org.junit.jupiter.api.Test
    void testMatchResult() {
        MatchResult matchResult = new MatchResult("bestUser", true, "enemyUser", false);
        assertEquals("bestUser", matchResult.bestUsername);
        assertTrue(matchResult.mutualBest);
        assertEquals("enemyUser", matchResult.enemyUsername);
        assertFalse(matchResult.mutualEnemy);
    }

    @org.junit.jupiter.api.Test
    void testDefaultConstructor() {
        MatchResult matchResult = new MatchResult();
        assertEquals("maliahotan", matchResult.bestUsername);
        assertFalse(matchResult.mutualBest);
        assertEquals("alixandrews", matchResult.enemyUsername);
        assertFalse(matchResult.mutualEnemy);
    }

}