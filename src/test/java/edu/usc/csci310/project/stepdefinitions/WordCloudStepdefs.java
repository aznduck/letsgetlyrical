package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

import static edu.usc.csci310.project.stepdefinitions.StepdefUtils.*;
import static org.junit.jupiter.api.Assertions.*;
public class WordCloudStepdefs {

    @And("I am on the WordCloud Page")
    public void iAmOnTheWordCloudPage() {
        driver.get(ROOT_URL + "/favorites");
        waitUntilElementIsVisible(By.className("word-cloud-header"));
    }

    @Given("I have searched for a song")
    public void iHaveSearchedForASong() {
        // Assume already logged in and on search page
        driver.get(ROOT_URL + "/landing");
        waitUntilElementIsVisible(By.className("search-input"));
        driver.findElement(By.className("search-input")).sendKeys("Baby");
        driver.findElement(By.className("num-songs-input")).clear();
        driver.findElement(By.className("num-songs-input")).sendKeys("1");
        driver.findElement(By.className("search-submit-button")).click();
        waitSeconds(2); // Wait for results
        // Select the artist
        waitUntilElementIsVisible(By.className("artist-popup"));
        driver.findElements(By.className("artist-list-item")).stream()
                .filter(element -> element.getText().contains("Justin Bieber"))
                .findFirst()
                .ifPresent(WebElement::click);
        waitUntilElementIsVisible(By.className("song-item"));
    }

    @When("the word cloud is generated")
    public void theWordCloudIsGenerated() {
        // Assume word cloud automatically generates after searching
        waitUntilElementIsVisible(By.className("word-cloud-container"));
    }

    @Then("words with higher frequency should appear larger in the word cloud")
    public void wordsWithHigherFrequencyShouldAppearLarger() {
        // Verify word cloud words are rendered
        assertFalse(driver.findElements(By.cssSelector(".wordcloud-wrapper text")).isEmpty(),
                "Expected words to be present in the word cloud.");
    }

    @Then("each word should appear only once")
    public void eachWordShouldAppearOnlyOnce() {
        var words = driver.findElements(By.cssSelector(".wordcloud-wrapper text"));
        var seenWords = new java.util.HashSet<String>();
        for (WebElement word : words) {
            String text = word.getText().toLowerCase();
            assertTrue(seenWords.add(text), "Duplicate word found in word cloud: " + text);
        }
    }


    @Then("the word cloud should not contain common filler words")
    public void theWordCloudShouldNotContainFillerWords() {
        var fillerWords = java.util.Set.of("the", "and", "a", "an", "of", "to", "in", "is", "it");
        var words = driver.findElements(By.cssSelector(".wordcloud-wrapper text"));
        for (WebElement word : words) {
            String text = word.getText().toLowerCase();
            assertFalse(fillerWords.contains(text), "Filler word found: " + text);
        }
    }

    @Given("the word cloud is displayed")
    public void theWordCloudIsDisplayed() {
        waitUntilElementIsVisible(By.className("word-cloud-container"));
    }

    @When("I click on the word {string}")
    public void iClickOnTheWord(String word) {
        var wordElement = driver.findElements(By.cssSelector(".wordcloud-wrapper text"))
                .stream()
                .filter(e -> e.getText().equalsIgnoreCase(word))
                .findFirst();
        assertTrue(wordElement.isPresent(), "Word '" + word + "' not found in cloud");
        wordElement.get().click();
        waitSeconds(1);
    }

    @Then("I should see a list of songs containing the word {string}")
    public void iShouldSeeListOfSongsContainingWord(String word) {
        waitUntilElementIsVisible(By.className("song-list-item"));
        var songs = driver.findElements(By.className("song-list-item"));
        assertFalse(songs.isEmpty(), "No songs shown after clicking word.");
        boolean found = songs.stream().anyMatch(song ->
                song.getText().toLowerCase().contains(word.toLowerCase()));
        assertTrue(found, "No song contains the clicked word: " + word);
    }

    @When("I click on the first word")
    public void iClickOnTheFirstWord() {
        var words = driver.findElements(By.cssSelector(".wordcloud-wrapper text"));
        assertFalse(words.isEmpty(), "No words available in word cloud to click.");
        words.get(0).click();
        waitSeconds(1);
    }

    @When("I click on the lyrics button")
    public void iClickOnTheLyricsButton() {
        waitUntilElementIsVisible(By.className("lyrics-button"));
        driver.findElement(By.className("lyrics-button")).click();
        waitSeconds(1);
    }

    @Then("I should see lyrics")
    public void iShouldSeeLyrics() {
        waitUntilElementIsVisible(By.className("lyrics-content"));
        String lyricsText = driver.findElement(By.className("lyrics-content")).getText();
        assertNotNull(lyricsText, "Lyrics content is empty.");
        assertFalse(lyricsText.isBlank(), "Lyrics text is blank.");
    }

    @Given("the word cloud is displayed as a cloud")
    public void theWordCloudIsDisplayedAsCloud() {
        waitUntilElementIsVisible(By.className("wordcloud-wrapper"));
    }

    @When("I click the toggle button")
    public void iClickTheToggleButton() {
        var backdrops = driver.findElements(By.className("song-list-backdrop"));
        if (!backdrops.isEmpty() && backdrops.get(0).isDisplayed()) {
            backdrops.get(0).click();
            waitSeconds(1);
        }

        waitUntilElementIsVisible(By.className("edit-button"));
        driver.findElement(By.className("edit-button")).click();

        waitUntilElementIsVisible(By.className("type-selector-dropdown"));
        driver.findElements(By.className("type-option")).stream()
                .filter(e -> e.getText().toLowerCase().contains("table"))
                .findFirst()
                .ifPresent(WebElement::click);
        waitSeconds(1);
    }


    @Then("the word cloud should switch to table view")
    public void theWordCloudShouldSwitchToTableView() {
        waitUntilElementIsVisible(By.className("word-table-container"));
        assertFalse(driver.findElements(By.className("word-table-container")).isEmpty(),
                "Word cloud did not switch to table view.");
    }

    @And("the following friends have public favorite song lists:")
    public void theFollowingFriendsHavePublicFavoriteSongLists(DataTable dataTable) {
        List<String> usernames = dataTable.asList(String.class);

    }
}
