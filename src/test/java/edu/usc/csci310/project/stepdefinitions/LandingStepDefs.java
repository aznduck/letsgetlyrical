package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.java.After;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import io.cucumber.java.Before;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LandingStepDefs {
    private static final String ROOT_URL = "http://localhost:8080";
    private static final WebDriver driver = new ChromeDriver();
    private long startTime;
    private final WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    @Before
    public void loginBeforeScenario() {
        driver.manage().deleteAllCookies(); // good first step

        // Load the login page first
        driver.get(ROOT_URL + "/login");

        // THEN clear local/session storage (now it's safe)
        ((JavascriptExecutor) driver).executeScript("localStorage.clear(); sessionStorage.clear();");

        // Wait for username/password fields to be interactable
        WebElement usernameField = wait.until(ExpectedConditions.elementToBeClickable(By.id("username")));
        WebElement passwordField = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));

        usernameField.clear();
        passwordField.clear();
        usernameField.sendKeys("testuser1");
        passwordField.sendKeys("LyricalMusic1!");

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Sign in']")));
        loginButton.click();

        wait.until(ExpectedConditions.urlContains("/landing"));
    }



    @Given("User is on the landing page")
    public void userIsOnTheLandingPage() {
        driver.get(ROOT_URL + "/landing");
    }

    @When("User clicks on {string}")
    public void userClicksOn(String buttonText) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(normalize-space(.), '" + buttonText + "')]")));
        button.click();
    }


    @Then("User should be redirected to the {string} page")
    public void userShouldBeRedirectedToThePage(String pageName) {
        // Wait for URL to change
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(ExpectedConditions.urlContains("/" + pageName));

        // Verify current URL contains the expected page
        assert driver.getCurrentUrl().contains("/" + pageName);
    }

    @Given("the application is running")
    public void theApplicationIsRunning() {
        // Just ensure the server is accessible
        driver.get(ROOT_URL);
    }

    @When("the landing page is loaded")
    public void theLandingPageIsLoaded() {
        // Record start time for performance measurement
        startTime = System.currentTimeMillis();

        // Navigate to landing page
        driver.get(ROOT_URL + "/");
    }


    @And("no error messages should be displayed")
    public void noErrorMessagesShouldBeDisplayed() {
        // Check for common error message elements or text
        assert driver.findElements(By.xpath("//*[contains(text(), 'error')]")).isEmpty() : "Error message found on page";
        assert driver.findElements(By.xpath("//*[contains(text(), 'Error')]")).isEmpty() : "Error message found on page";
        assert driver.findElements(By.xpath("//*[contains(@class, 'error')]")).isEmpty() : "Error element found on page";
    }

    @After
    public void logoutAfterScenario() {
        try {
            WebElement logoutButton = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector(".logout-button")));
            logoutButton.click();

            wait.until(ExpectedConditions.urlContains("/login"));
        } catch (Exception e) {
            System.out.println("Logout failed or was already logged out: " + e.getMessage());
        }
    }
}