package edu.usc.csci310.project.stepdefinitions;


import io.cucumber.java.Before;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.By;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.springframework.test.util.AssertionErrors.assertFalse;

public class LoginStepdefs {
    private static final String ROOT_URL = "http://localhost:8080";
    private static final WebDriver driver = new ChromeDriver();
    private final WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    @BeforeEach
    public void setUp() {
        driver.manage().deleteAllCookies();

        // Clear localStorage and sessionStorage via JS
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear(); window.sessionStorage.clear();");

        driver.get("http://localhost:8080/login");

    }

    @Given("I am on the login page")
    public void iAmOnTheLoginPage() {
        driver.get(ROOT_URL + "/login");
        // Wait for the page to load
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
    }

    @When("I leave the username and password fields empty")
    public void iLeaveTheUsernameAndPasswordFieldsEmpty() {
        WebElement usernameField = wait.until(ExpectedConditions.elementToBeClickable(By.id("username")));
        WebElement passwordField = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));
        usernameField.clear();
        passwordField.clear();
    }

    @And("I click on {string}")
    public void iClickOn(String buttonText) throws InterruptedException {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[@type='submit' or contains(text(), '" + buttonText + "')]")));
        button.click();

        Thread.sleep(800);
    }

    @When("I click on Log in")
    public void iClickOnLogin() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement link = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[normalize-space()='Log in']")));
        link.click();
    }

    @When("I click on Sign up")
    public void iClickOnSignUp() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement link = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[normalize-space()='Sign up']")));
        link.click();
    }

    @Then("I should see an error message {string}")
    public void iShouldSeeAnErrorMessage(String errorMsg) {
        WebElement errorElement = wait.until(ExpectedConditions.presenceOfElementLocated(
                By.cssSelector(".error-message")));
        assert errorElement.getText().contains(errorMsg);
    }

    @Then("Registration should fail")
    public void registrationShouldFail() {
        WebElement form = driver.findElement(By.tagName("form"));
        Boolean isValid = (Boolean) ((JavascriptExecutor) driver).executeScript("return arguments[0].checkValidity();", form);
        assertFalse("Form should be invalid", isValid);
    }

    @And("I should remain on the login page")
    public void iShouldRemainOnTheLoginPage() {
        // Wait for any potential redirects to complete
        wait.until(driver -> driver.getCurrentUrl().contains("/login"));
        assert driver.getCurrentUrl().equals(ROOT_URL + "/login");
    }

    @When("I enter {string} for username AND {string} for password")
    public void iEnterForUsernameANDForPassword(String username, String password) {
        WebElement usernameField = wait.until(ExpectedConditions.elementToBeClickable(By.id("username")));
        WebElement passwordField = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));
        usernameField.clear();
        passwordField.clear();
        usernameField.sendKeys(username);
        passwordField.sendKeys(password);
    }

    @Then("I should be redirected to the register page")
    public void iShouldBeRedirectedToTheRegisterPage() {
        wait.until(ExpectedConditions.urlContains("/signup"));
        assert driver.getCurrentUrl().equals(ROOT_URL + "/signup");
    }

    @Then("I should be redirected back to the login page")
    public void iShouldBeRedirectedBackToTheLoginPage() {
        wait.until(ExpectedConditions.urlContains("/login"));
        assert driver.getCurrentUrl().equals(ROOT_URL + "/login");
    }

    @Then("I should see {string} on the screen")
    public void iShouldSeeOnTheScreen(String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), text));
        assert driver.getPageSource().contains(text);
    }

    @And("I press the Enter key")
    public void iPressTheEnterKey() {
        WebElement passwordField = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));
        passwordField.sendKeys("\n");
    }

    @Then("I should be redirected to the landing page")
    public void iShouldBeRedirectedToTheLandingPage() {
        wait.until(ExpectedConditions.urlContains("/landing"));
        assert driver.getCurrentUrl().equals(ROOT_URL + "/landing");
    }

    @And("I log out")
    public void iLogOut() {
        WebElement logoutButton = driver.findElement(By.cssSelector(".logout-text"));
        logoutButton.click();
    }
}

