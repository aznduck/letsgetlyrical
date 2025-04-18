package edu.usc.csci310.project.stepdefinitions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class StepdefUtils {
    public static final String ROOT_URL = "http://localhost:8080";
    public static final WebDriver driver = new ChromeDriver();
    public static void waitUntilElementIsVisible(By by) {
        // Implement a wait until the element is visible
        // This could be done using WebDriverWait
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(driver -> driver.findElement(by).isDisplayed());
    }

    public static void waitSeconds(int seconds)
    {
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
