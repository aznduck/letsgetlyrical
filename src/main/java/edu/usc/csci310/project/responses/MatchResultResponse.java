package edu.usc.csci310.project.responses;

import edu.usc.csci310.project.models.FavoriteSong;
import edu.usc.csci310.project.models.MatchResult;

import java.util.List;

public class MatchResultResponse {

    public MatchResult matchResult;
    public MatchResultResponse(MatchResult matchResult) {
        this.matchResult = matchResult;
    }

    public MatchResultResponse(int i, String s, List<FavoriteSong> result) {
    }

    public MatchResult getMatchResult() {
        return matchResult;
    }
    public void setMatchResult(MatchResult matchResult) {
        this.matchResult = matchResult;
    }
}
