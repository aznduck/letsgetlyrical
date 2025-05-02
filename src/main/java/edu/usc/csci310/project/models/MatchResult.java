package edu.usc.csci310.project.models;

public class MatchResult {
    public final String bestUsername;
    public final boolean mutualBest;

    public final String enemyUsername;
    public final boolean mutualEnemy;


    public MatchResult(String bestUsername, boolean mutualBest, String enemyUsername, boolean mutualEnemy) {
        this.bestUsername = bestUsername;
        this.mutualBest = mutualBest;
        this.enemyUsername = enemyUsername;
        this.mutualEnemy = mutualEnemy;
    }

    public MatchResult(){
        this.bestUsername = "maliahotan";
        this.mutualBest = false;
        this.enemyUsername = "alixandrews";
        this.mutualEnemy = false;
    }
}
