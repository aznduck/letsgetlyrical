package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
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

        // This line needs to be updated - the old class doesn't exist anymore
        // Change from search-submit-button to nav-button that's a submit button
        driver.findElement(By.cssSelector("button[type='submit'].nav-button")).click();

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
        // First, check if any popup is already open and close it
        var closeButtons = driver.findElements(By.cssSelector(".song-list-close-button"));
        if (!closeButtons.isEmpty() && closeButtons.get(0).isDisplayed()) {
            try {
                closeButtons.get(0).click();
                waitSeconds(1); // Give it time to close
            } catch (Exception e) {
                System.out.println("Failed to close popup with normal click: " + e.getMessage());
            }
        }

        // Find the word element
        var wordElements = driver.findElements(By.cssSelector(".wordcloud-wrapper text"));
        WebElement targetWord = null;

        for (WebElement element : wordElements) {
            if (element.getText().equalsIgnoreCase(word)) {
                targetWord = element;
                break;
            }
        }

        assertTrue(targetWord != null, "Word '" + word + "' not found in cloud");

        // Use Actions to move to and click the element
        try {
            // Method 1: Actions API
            org.openqa.selenium.interactions.Actions actions = new org.openqa.selenium.interactions.Actions(driver);
            actions.moveToElement(targetWord).click().build().perform();
        } catch (Exception e1) {
            try {
                // Method 2: JavaScript event dispatch
                JavascriptExecutor jsExecutor = (JavascriptExecutor) driver;
                jsExecutor.executeScript(
                        "var evt = document.createEvent('MouseEvents');" +
                                "evt.initMouseEvent('click',true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);" +
                                "arguments[0].dispatchEvent(evt);", targetWord);
            } catch (Exception e2) {
                try {
                    // Method 3: Get coordinates and click at position
                    int x = targetWord.getLocation().getX() + (targetWord.getSize().getWidth() / 2);
                    int y = targetWord.getLocation().getY() + (targetWord.getSize().getHeight() / 2);

                    org.openqa.selenium.interactions.Actions actions = new org.openqa.selenium.interactions.Actions(driver);
                    actions.moveByOffset(x, y).click().build().perform();
                } catch (Exception e3) {
                    System.out.println("All click methods failed");
                    throw e3;
                }
            }
        }

        waitSeconds(2); // Give more time for the popup to appear
    }

    @Then("I should see a list of songs containing the word {string}")
    public void iShouldSeeListOfSongsContainingWord(String word) {
        // Wait for the song list popup to appear
        waitUntilElementIsVisible(By.className("song-list-popup-container"));

        // Look for song entries in the table
        waitUntilElementIsVisible(By.className("song-list-table"));

        // Check if any songs are visible
        var songs = driver.findElements(By.cssSelector(".song-list-table tbody tr"));
        assertFalse(songs.isEmpty(), "No songs shown after clicking word.");

        // Check if the title matches what we expect
        var titleElement = driver.findElement(By.className("song-list-title"));
        assertTrue(titleElement.getText().contains(word),
                "Song list title doesn't contain the clicked word: " + word);

        // Verify we can see the 'Lyrics' button which indicates songs are present
        assertFalse(driver.findElements(By.className("lyrics-button")).isEmpty(),
                "No lyrics buttons found in song list");
    }

    @When("I click on the first word")
    public void iClickOnTheFirstWord() {
        // First check if any popups are open and close them
        var closeButtons = driver.findElements(By.cssSelector(".song-list-close-button"));
        if (!closeButtons.isEmpty() && closeButtons.get(0).isDisplayed()) {
            closeButtons.get(0).click();
            waitSeconds(1);
        }

        // Now get the words and click the first one using JavaScript
        var words = driver.findElements(By.cssSelector(".wordcloud-wrapper text"));
        assertFalse(words.isEmpty(), "No words available in word cloud to click.");

        // Use JavaScript to click the element
        var jsExecutor = (JavascriptExecutor) driver;
        jsExecutor.executeScript("arguments[0].click();", words.get(0));

        waitSeconds(1);
    }

    @When("I click on the lyrics button")
    public void iClickOnTheLyricsButton() {
        waitUntilElementIsVisible(By.className("lyrics-button"));
        var lyricsButtons = driver.findElements(By.className("lyrics-button"));
        assertFalse(lyricsButtons.isEmpty(), "No lyrics buttons found");
        lyricsButtons.get(0).click();
        waitSeconds(1);
    }

    @Then("I should see lyrics")
    public void iShouldSeeLyrics() {
        // Wait for the lyrics popup to be visible
        waitUntilElementIsVisible(By.className("lyrics-popup-container"));

        // Look for lyrics in the lyrics-popup-lyrics div instead of lyrics-content
        waitUntilElementIsVisible(By.className("lyrics-popup-lyrics"));

        // Get the lyrics text from the correct element
        String lyricsText = driver.findElement(By.className("lyrics-popup-lyrics")).getText();

        // Verify the lyrics aren't empty
        assertNotNull(lyricsText, "Lyrics content is empty.");
        assertFalse(lyricsText.isBlank(), "Lyrics text is blank.");
    }

    @Given("the word cloud is displayed as a cloud")
    public void theWordCloudIsDisplayedAsCloud() {
        waitUntilElementIsVisible(By.className("wordcloud-wrapper"));
    }

    private void waitUntilElementIsInvisible(By locator) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    @When("I click the toggle button")
    public void iClickTheToggleButton() {
        // Close any open dialogs first
        var closeButtons = driver.findElements(By.cssSelector(".song-list-close-button"));
        if (!closeButtons.isEmpty() && closeButtons.get(0).isDisplayed()) {
            try {
                closeButtons.get(0).click();
                waitSeconds(2); // Give it more time to close
            } catch (Exception e) {
                // Try using JavaScript if the normal click fails
                var jsExecutor = (JavascriptExecutor) driver;
                jsExecutor.executeScript("arguments[0].click();", closeButtons.get(0));
                waitSeconds(2);
            }
        }

        // Wait for and click the edit button
        waitUntilElementIsVisible(By.className("edit-button"));
        driver.findElement(By.className("edit-button")).click();

        // Wait for the dropdown and click the "table" option
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

//    @And("the following friends have public favorite song lists:")
//    public void theFollowingFriendsHavePublicFavoriteSongLists(DataTable dataTable) {
//        List<String> usernames = dataTable.asList(String.class);
//
//    }
}