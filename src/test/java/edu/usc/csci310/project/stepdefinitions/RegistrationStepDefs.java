package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import org.openqa.selenium.support.ui.WebDriverWait;

import static edu.usc.csci310.project.stepdefinitions.StepdefUtils.ROOT_URL;
import static edu.usc.csci310.project.stepdefinitions.StepdefUtils.driver;

public class RegistrationStepDefs {

    private static final String ROOT_URL = "http://localhost:8080";
    private static final WebDriver driver = new ChromeDriver();
    private final WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    @Given("I am on the registration page")
    public void iAmOnTheRegistrationPage() {
        driver.get(ROOT_URL + "/signup");
    }

    @When("I enter in the {string} field {string}")
    public void iEnterInTheField(String fieldName, String value) {
        String finalValue = value;

        if (value.equals("RANDOM_USERNAME")) {
            finalValue = "testuser_" + System.currentTimeMillis(); // or use UUID
        }

        WebElement field = new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> d.findElement(By.id(fieldName)));

        field.clear();
        field.sendKeys(finalValue);
    }


    @And("I click the {string} button")
    public void iClickTheButton(String buttonText) {
        driver.findElement(By.xpath("//button[normalize-space()='" + buttonText + "']")).click();
    }

    @Then("I should see a confirmation message")
    public void iShouldSeeAConfirmationMessage() {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "Account Created!"));
        assert driver.getPageSource().contains("Account Created!");
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

    @Then("I should see an registration failure message displayed")
    public void iShouldSeeAnRegistrationFailureMessageDisplayed() {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "Registration failed. Please try again."));
        assert driver.getPageSource().contains("Registration failed. Please try again.");
    }

    @Then("I should see a blank registration form")
    public void iShouldSeeABlankRegistrationForm() {
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement confirmPasswordField = driver.findElement(By.id("confirmpassword"));

        assert usernameField.getAttribute("value").isEmpty();
        assert passwordField.getAttribute("value").isEmpty();
        assert confirmPasswordField.getAttribute("value").isEmpty();
    }
}