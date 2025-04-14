package edu.usc.csci310.project.stepdefinitions;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class LoginStepdefs {
    private static final String ROOT_URL = "http://localhost:8080";
    private static final WebDriver driver = new ChromeDriver();

    @Given("I am on the login page")
    public void iAmOnTheLoginPage() {
        driver.get(ROOT_URL + "/login");
    }

    @When("I leave the username and password fields empty")
    public void iLeaveTheUsernameAndPasswordFieldsEmpty() {
        // No action needed, just ensure fields are empty
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        usernameField.clear();
        passwordField.clear();
    }

    @And("I click on {string}")
    public void iClickOn(String arg0) {
        driver.findElement(By.xpath("//*[normalize-space()='" + arg0 + "']")).click();
    }

    @Then("I should see an error message {string}")
    public void iShouldSeeAnErrorMessage(String arg0) {
       assert driver.getPageSource().contains(arg0);
    }

    @And("I should remain on the login page")
    public void iShouldRemainOnTheLoginPage() {
        assert driver.getCurrentUrl().equals(ROOT_URL + "/login");
    }

    @When("I enter {string} for username AND {string} for password")
    public void iEnterForUsernameANDForPassword(String arg0, String arg1) {
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        usernameField.clear();//clear them, then we enter stuff
        passwordField.clear();
        usernameField.sendKeys(arg0);
        passwordField.sendKeys(arg1);
    }

    @Then("I should be redirected to the register page")
    public void iShouldBeRedirectedToTheRegisterPage() {
        //check if the current URL is the register page
        assert driver.getCurrentUrl().equals(ROOT_URL + "/register");
    }

    @Then("I should be redirected back to the login page")
    public void iShouldBeRedirectedBackToTheLoginPage() {
        iShouldRemainOnTheLoginPage();
    }

    @Then("I should see {string} on the screen")
    public void iShouldSeeOnTheScreen(String arg0) {
        assert driver.getPageSource().contains(arg0);
    }

    @And("I press the Enter key")
    public void iPressTheKey(String arg0) {
        WebElement passwordField = driver.findElement(By.id("password"));
        passwordField.sendKeys("\n");//simulate hit enter
    }

    @Then("I should be redirected to the homepage")
    public void iShouldBeRedirectedToTheHomepage() {
        assert driver.getCurrentUrl().equals(ROOT_URL + "/");
    }



}
