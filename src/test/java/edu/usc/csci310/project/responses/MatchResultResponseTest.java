package edu.usc.csci310.project.responses;

import edu.usc.csci310.project.models.MatchResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MatchResultResponseTest {

    @Test
    void getMatchResult() {
        // Create a MatchResult object
        MatchResult matchResult = new MatchResult();

        // Create a MatchResultResponse object
        MatchResultResponse response = new MatchResultResponse(matchResult);

        // Assert that the getMatchResult method returns the correct MatchResult object
        assertEquals(matchResult, response.getMatchResult());
    }

    @Test
    void setMatchResult() {
        // Create a MatchResult object
        MatchResult matchResult = new MatchResult();

        // Create a MatchResultResponse object
        MatchResultResponse response = new MatchResultResponse(matchResult);

        // Create a new MatchResult object
        MatchResult newMatchResult = new MatchResult();

        // Set the new MatchResult object
        response.setMatchResult(newMatchResult);

        // Assert that the getMatchResult method returns the new MatchResult object
        assertEquals(newMatchResult, response.getMatchResult());
    }
}