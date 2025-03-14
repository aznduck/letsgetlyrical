package edu.usc.csci310.project;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class RegistrationStepDefs {
    private static final String ROOT_URL = "http://localhost:8080";
    private static final WebDriver driver = new ChromeDriver();

    @Given("I am on the registration page")
    public void iAmOnTheRegistrationPage() {
        driver.get(ROOT_URL + "/register");
    }

    @When("I enter in the {string} field {string}")
    public void iEnterInTheField(String fieldName, String value) {
        String fieldId = fieldName.toLowerCase().replace(" ", "_");
        WebElement field = driver.findElement(By.id(fieldId));
        field.clear();
        field.sendKeys(value);
    }

    @And("I click the {string} button")
    public void iClickTheButton(String buttonText) {
        driver.findElement(By.xpath("//button[normalize-space()='" + buttonText + "']")).click();
    }

    @Then("I should see a confirmation message")
    public void iShouldSeeAConfirmationMessage() {
        WebElement confirmMessage = driver.findElement(By.className("confirmation-message"));
        assert confirmMessage.isDisplayed();
    }

    @And("I should be redirected to the login page")
    public void iShouldBeRedirectedToTheLoginPage() {
        WebDriverWait wait = new WebDriverWait(driver, java.time.Duration.ofSeconds(3));
        wait.until(webDriver -> webDriver.getCurrentUrl().equals(ROOT_URL + "/login"));
        assert driver.getCurrentUrl().equals(ROOT_URL + "/login");
    }

    @Then("I should see an error message displayed")
    public void iShouldSeeAnErrorMessageDisplayed() {
        WebElement errorMessage = driver.findElement(By.className("error-message"));
        assert errorMessage.isDisplayed();
    }

    @Then("I should see a blank registration form")
    public void iShouldSeeABlankRegistrationForm() {
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement confirmPasswordField = driver.findElement(By.id("confirm_password"));

        assert usernameField.getAttribute("value").isEmpty();
        assert passwordField.getAttribute("value").isEmpty();
        assert confirmPasswordField.getAttribute("value").isEmpty();
    }
}