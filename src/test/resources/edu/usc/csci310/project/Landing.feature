Feature: Landing Page


  Scenario: User visits favorites page
    Given User is on the landing page
    When User clicks on "Generate favorites cloud"
    Then User should be redirected to the "favscloud" page

  Scenario: Landing page loads correctly
    Given the application is running
    When the landing page is loaded
    Then no error messages should be displayed

  Scenario: User logs out correctly
    Given User is on the landing page
    When User clicks on "Log out"
    Then User should be redirected to the "login" page