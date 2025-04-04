Feature: Landing Page

  Scenario: User visits the landing page
    Given the user is on the home page
    When the user navigates to the landing page
    Then the user should see the landing page
    And the heading should display "Landing Page"

  Scenario: Landing page loads correctly
    Given the application is running
    When the landing page is loaded
    Then it should load within 3 seconds
    And no error messages should be displayed