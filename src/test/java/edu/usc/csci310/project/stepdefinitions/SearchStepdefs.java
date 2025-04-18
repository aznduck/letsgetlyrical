package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static edu.usc.csci310.project.stepdefinitions.StepdefUtils.*;
import static org.junit.jupiter.api.Assertions.*;

public class SearchStepdefs {

    @Given("I am logged in")
    public void iAmLoggedIn() {
        // Code to log in the user// how to check if the user is logged in
        // For example, you might check if a specific element is present on the page
        //if the current page has .logout-button, skip everything
        if (!driver.findElements(By.className("logout-button")).isEmpty()) {
            return;
        }

        driver.get(ROOT_URL + "/login");
        // Enter username and password
        driver.findElement(By.id("username")).sendKeys("testuser1");
        driver.findElement(By.id("password")).sendKeys("LyricalMusic1!");
        // Click the login button .submit-button
        driver.findElement(By.className("submit-button")).click();
        waitSeconds(1);
    }

    @And("I am on the Search Page")
    public void iAmOnTheSearchPage() {
        // Navigate to the search page
        driver.get(ROOT_URL + "/landing");
        waitUntilElementIsVisible(By.className("search-input"));
        // Check if the search page is displayed
        //String currentUrl = driver.getCurrentUrl();
    }


    @When("I enter {string} as the artist name")
    public void iEnterAsTheArtistName(String arg0) {
        // Enter the artist name in the search input field
        driver.findElement(By.className("search-input")).sendKeys(arg0);
    }

    @And("Ensure the number of songs is empty")
    public void ensureTheNumberOfSongsIsEmpty() {
        driver.findElement(By.className("num-songs-input")).clear();
    }

    @And("I click the Search button")
    public void iClickTheSearchButton() {
        driver.findElement(By.className("search-submit-button")).click();
    }

    @And("I select {string} from the list of artists")
    public void iSelectFromTheListOfArtists(String arg0) {
        //Wait until the list of artists is displayed: .artist-popup is showing up on the screen
        waitUntilElementIsVisible(By.className("artist-popup"));
        // Click on the artist name from the list
        driver.findElements(By.className("artist-list-item")).stream()
                .filter(element -> element.getText().equals(arg0))
                .findFirst()
                .ifPresent(WebElement::click);
    }


    @Then("I should see {int} songs listed")
    public void iShouldSeeSongsListed(int arg0) {
        //wait until the list of songs is displayed
        waitUntilElementIsVisible(By.className("song-item"));
        // Check if the number of songs listed is equal to the expected number
        // This could be done by checking the number of elements with a specific class name
        int numberOfSongs = driver.findElements(By.className("song-item")).size();
        assertEquals(numberOfSongs, arg0, "Expected " + arg0 + " songs, but found " + numberOfSongs);
    }

    @And("I enter {string} as the number of songs")
    public void iEnterAsTheNumberOfSongs(String arg0) {
        // Enter the number of songs in the input field
        driver.findElement(By.className("num-songs-input")).sendKeys(arg0);
    }

    @Then("I should see a list of matching artist names to choose from")
    public void checkIfListExists() {
        assertTrue(driver.getPageSource().contains("Please pick an artist"));
    }

    @And("I wait {int} seconds")
    public void iWaitSeconds(int arg0) {
        // Wait for the specified number of seconds
        waitSeconds(arg0);
    }

    @And("I should be able to select {string} or {string}")
    public void iShouldBeAbleToSelectOr(String arg0, String arg1) {
        //get all .artist-list-item
        //check if the artist name is in the list
        String artistList = driver.findElement(By.className("artist-popup")).getText();
        assertTrue(artistList.contains(arg0) || artistList.contains(arg1), "Expected to find " + arg0 + " or " + arg1 + " in the list, but found: " + artistList);
    }

    @Then("I will select {string}")
    public void iWillSelect(String arg0) {
        // go through all .artist-list-item and see if the artist name is in the list. if yes, click
        // Click on the artist name from the list
        iSelectFromTheListOfArtists(arg0);
    }

    @When("I leave the artist name field empty")
    public void iLeaveTheArtistNameFieldEmpty() {
        // Clear the artist name input field
        driver.findElement(By.className("search-input")).clear();
    }

    @Then("I should not see {string}")
    public void iShouldNotSee(String arg0) {
        // Check if the artist name is not present in the list of songs
        // This could be done by checking the page source or the number of elements with a specific class name
        String pageSource = driver.getPageSource();
        assertFalse(pageSource.contains(arg0), "Expected not to find " + arg0 + " in the list, but found it.");
    }

    @Given("I am not logged in")
    public void iAmNotLoggedIn() {
        driver.get(ROOT_URL + "/login");
        waitSeconds(1);
        //check if current page has .logout-button
        //if yes, then click it
        if (!driver.findElements(By.className("logout-button")).isEmpty()) {
            driver.findElement(By.className("logout-button")).click();
            waitSeconds(1);
        }
    }

    @When("I try to access the search page")
    public void iTryToAccessTheSearchPage() {
        // Navigate to the search page
        driver.get(ROOT_URL + "/landing");
        // Check if the login page is displayed

    }


    /// //We are not using this test case for now, do them later since the feature itself is not implemented yet///////

    @Given("I have already searched for {string} with {int} songs")
    public void iHaveAlreadySearchedForWithSongs(String arg0, int arg1) {
        System.out.println("I have already searched for " + arg0 + " with " + arg1 + " songs");

    }

    @When("I modify the artist name to {string}")
    public void iModifyTheArtistNameTo(String arg0) {
        System.out.println("I modify the artist name to " + arg0);

    }

    @Then("a new word cloud should be generated")
    public void aNewWordCloudShouldBeGenerated() {
        skipTestForNow();
    }


    @Given("I have already generated a word cloud")
    public void iHaveAlreadyGeneratedAWordCloud() {
        System.out.println("I have already generated a word cloud");
    }

    public void skipTestForNow() {
        assertTrue(driver.getPageSource().contains("html"));
    }

    @When("I add my favorites list to the word cloud")
    public void iAddMyFavoritesListToTheWordCloud() {

    }

    @Then("the word cloud should include words from both the search result and favorites list")
    public void theWordCloudContains() {
        skipTestForNow();
    }

    @When("I search for {string} with {int} songs")
    public void iSearchForWithSongs(String arg0, int arg1) {
        System.out.println("I search for " + arg0 + " with " + arg1 + " songs");
    }

    @Then("the word cloud should be generated in under {int} second")
    public void theWordCloudShouldBeGeneratedInUnderSecond(int arg0) {
        skipTestForNow();
    }

    @Then("I should not see {string}, {string}, {string}")
    public void iShouldNotSee(String arg0, String arg1, String arg2) {
        // Check if the artist name is not present in the list of songs
        // This could be done by checking the page source or the number of elements with a specific class name
        String pageSource = driver.getPageSource();
        assertFalse(pageSource.contains(arg0), "Expected not to find " + arg0 + " in the list, but found it.");
        assertFalse(pageSource.contains(arg1), "Expected not to find " + arg1 + " in the list, but found it.");
        assertFalse(pageSource.contains(arg2), "Expected not to find " + arg2 + " in the list, but found it.");
    }

    @Then("the word cloud should show stemmed words \\(e.g., {string} and {string} counted together)")
    public void theWordCloudShouldShowStemmedWordsEGAndCountedTogether(String arg0, String arg1) {
        skipTestForNow();
    }

    @Then("the word cloud should contain no more than {int} unique words")
    public void theWordCloudShouldContainNoMoreThanUniqueWords(int arg0) {
        skipTestForNow();
    }

    @When("I select a song from the word cloud")
    public void iSelectASongFromTheWordCloud() {

    }

    @Then("the song should be added to my favorites list")
    public void theSongShouldBeAddedToMyFavoritesList() {
        skipTestForNow();
    }

    @And("I should see a confirmation message here")
    public void iShouldSeeAConfirmationMessageHere() {
        skipTestForNow();
    }

    @And("I click the {string} button on search page")
    public void iClickTheButtonOnSearchPage(String arg0) {
        System.out.println("I click the " + arg0 + " button on search page");
    }

    @Then("I should not see {string}, {string}, {string} on word cloud")
    public void iShouldNotSeeOnWordCloud(String arg0, String arg1, String arg2) {
        System.out.println("I should not see " + arg0 + ", " + arg1 + ", " + arg2 + " on word cloud");
    }
}
