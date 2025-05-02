package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static edu.usc.csci310.project.stepdefinitions.StepdefUtils.*;


public class FavoritesStepDefs {
    private String firstSongBefore;
    private String secondSongBefore;

    @Given("I am logged in for favorites")
    public void iAmLoggedIn() {
        // Code to log in the user// how to check if the user is logged in
        // For example, you might check if a specific element is present on the page
        //if the current page has .logout-button, skip everything
        if (!driver.findElements(By.className("logout-button")).isEmpty()) {
            return;
        }

        driver.get(ROOT_URL + "/login");
        // Enter username and password
        driver.findElement(By.id("username")).sendKeys("testfavsuser");
        driver.findElement(By.id("password")).sendKeys("Real1");
        // Click the login button .submit-button
        driver.findElement(By.className("submit-button")).click();
        waitSeconds(1);
    }

    @When("I click the {int} word on the wordcloud")
    public void iClickTheWordOnTheWordCloud(int i) throws InterruptedException {

    }

    @When("I click the {string} word on the wordcloud")
    public void iClickTheWordOnTheWordCloud(String word) throws InterruptedException {
        WebElement wordElement = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//*[text()='" + word + "']")
                ));

        wordElement.click();
    }

    @When("I hover over the {int} song and add it to favorites")
    public void hoverAndAddSong(int index) {

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // collect the <td class="song-list-song-title"> cells
        List<WebElement> cells = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.cssSelector("td.song-list-song-title")));

        if (index < 1 || index > cells.size()) {
            throw new IllegalArgumentException("Song index out of range: " + index);
        }

        WebElement targetCell = cells.get(index - 1);

        // hover so the "Add to favorites” button appears
        new Actions(driver).moveToElement(targetCell).pause(Duration.ofMillis(200)).perform();

        WebElement addBtn = wait.until(
                ExpectedConditions.elementToBeClickable(
                        targetCell.findElement(By.cssSelector("button.song-list-add-favorite"))));

        addBtn.click();
    }

    @When("I close the songs table")
    public void iCloseTheSongsTable() {
        WebElement wordElement = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//*[text()='" + "✕" + "']")
                ));

        wordElement.click();
    }

    @Then("I see the new song added at the bottom")
    public void iSeeTheNewSongAdded() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement favList = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".favorites-list")));

        String listText = favList.getText();

        Assertions.assertTrue(listText.contains("SICKO MODE"),
                "Favorites list should contain SICKO MODE");
        Assertions.assertTrue(listText.contains("God’s Plan"),
                "Favorites list should contain God’s Plan");
    }

    @When("I click the favorite settings button")
    public void iClickTheFavoriteSettings() {
        WebElement favSettingsBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector("button.favorites-menu-button")));
        favSettingsBtn.click();
    }

    @Then("I see the favorites list is on {string}")
    public void iSeeTheFavoritesListIsOn(String listName) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement selectedButton = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("button.popup-menu-item.selected")));

        String text = selectedButton.getText().trim();

        Assertions.assertEquals(listName, text);
    }

    @Then("I click on {string} toggle button")
    public void iClickOnTheToggleButton(String text) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        List<WebElement> toggleButtons = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.cssSelector("button.popup-menu-item")));

        for (WebElement button : toggleButtons) {
            if (button.getText().trim().equals(text)) {
                wait.until(ExpectedConditions.elementToBeClickable(button)).click();
                return;
            }
        }

        Assertions.fail("No toggle button found with text: " + text);
    }

    @When("I click the {int} favorite song")
    public void iClickThe1FavoriteSong(int index) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        List<WebElement> rows = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.cssSelector(".favorites-list .favorite-item")));

        if (index < 1 || index > rows.size()) {
            Assertions.fail("Invalid index: " + index + ", list size: " + rows.size());
        }
        WebElement targetRow = rows.get(index - 1);

        WebElement title = targetRow.findElement(By.cssSelector(".favorite-title"));
        wait.until(ExpectedConditions.elementToBeClickable(title)).click();
    }

    @Then("I see the additional information of the song")
    public void iSeeTheAdditionalInformationOfTheSong() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.tagName("body"), "Album"));

        String pageText = driver.findElement(By.tagName("body")).getText();

        Assertions.assertTrue(pageText.contains("Album"),
                "Expected to see 'Album' in the song details view.");
    }

    @When("I hover over the {int} favorite song")
    public void iHoverOverTheFavoriteSong(int index) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        List<WebElement> songTitles = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.cssSelector(".favorites-list .favorite-title")));

        if (index < 1 || index > songTitles.size()) {
            Assertions.fail("Invalid song index: " + index);
        }

        WebElement target = songTitles.get(index - 1);

        new Actions(driver).moveToElement(target).pause(Duration.ofMillis(200)).perform();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".song-action-menu")));
    }

    @When("I click on the move down button")
    public void iClickOnTheMoveDownButton() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement moveDownButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".song-action-menu .down-button")));

        moveDownButton.click();
    }

    @When("I click on the move up button")
    public void iClickOnTheMoveUpButton() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement moveDownButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".song-action-menu .up-button")));

        moveDownButton.click();
    }

    @Then("I should see the top item is {string}")
    public void iShouldSeeTheTopItemIs(String expectedTitle) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement firstItem = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".favorites-list .favorite-item .favorite-title")));

        String actualTitle = firstItem.getText().trim();

        Assertions.assertEquals(expectedTitle, actualTitle,
                "Expected the top item in the list to be: " + expectedTitle);
    }

    @When("I hover click on {string}")
    public void iHoverClickOnTheSong(String buttonText) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // wait for the hover menu to appear
        WebElement menu = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".song-action-menu")));

        WebElement targetButton = menu.findElement(
                By.xpath(".//button[normalize-space(text())='" + buttonText + "']"));

        // move to the button and click
        new Actions(driver)
                .moveToElement(targetButton)
                .pause(Duration.ofMillis(100))
                .click()
                .perform();
    }

    @When("I confirm removal")
    public void iConfirmRemoval() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        // wait for the modal overlay
        WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".delete-modal-overlay")));

        // then click the "Remove" button inside it
        WebElement removeBtn = modal.findElement(
                By.xpath(".//button[normalize-space(text())='Remove']"));

        wait.until(ExpectedConditions.elementToBeClickable(removeBtn)).click();
    }

    @When("I record the top two favorite songs")
    public void recordTopTwoFavorites() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        List<WebElement> titles = wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.cssSelector(".favorites-list .favorite-title")
                )
        );

        firstSongBefore  = titles.get(0).getText().trim();
        secondSongBefore = titles.get(1).getText().trim();
    }

    @Then("I should see the recorded second song at the top")
    public void iShouldSeeTheRecordedSecondSongAtTheTop() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement firstItem = wait.until(
                ExpectedConditions
                        .visibilityOfElementLocated(
                                By.cssSelector(".favorites-list .favorite-item .favorite-title")
                        )
        );
        String actual = firstItem.getText().trim();
        Assertions.assertEquals(
                secondSongBefore,
                actual,
                "Expected the song that was second before to be first now"
        );
    }


    @Then("I should see one of those two still present")
    public void iShouldSeeOneOfThoseTwoStillPresent() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement favList = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".favorites-list")));

        String listText = favList.getText();

        boolean hasSicko = listText.contains("SICKO MODE");
        boolean hasGod = listText.contains("God’s Plan");

        Assertions.assertTrue(
                hasSicko || hasGod,
                "Expected either “SICKO MODE” or “God’s Plan” to still be present, but saw: " + listText
        );
    }

    @Then("I should have an empty favorites list")
    public void iShouldHaveAnEmptyFavoritesList() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement emptyState = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".empty-favorites")
                )
        );

        String message = emptyState.getText().trim();
        Assertions.assertEquals("No favorites yet", message);

        List<WebElement> items = driver.findElements(By.cssSelector(".favorites-list .favorite-item"));
        Assertions.assertTrue(items.isEmpty());
    }

    @When("I press on the delete list button")
    public void iPressOnTheDeleteListButton() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement deleteListBtn = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.cssSelector("button.popup-menu-item-delete")
                )
        );

        deleteListBtn.click();
    }

    @When("I confirm list deletion")
    public void iPressOnTheDeleteListButtonASecondTime() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement deleteListBtn = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.cssSelector("button.delete-button")
                )
        );

        deleteListBtn.click();
    }


}
