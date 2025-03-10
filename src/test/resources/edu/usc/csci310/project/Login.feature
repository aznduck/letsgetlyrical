Feature: Login to the app

  Scenario:
    Given I am on the login page
    When I enter "testuser" for username AND "testpassword" for password
    And I click on "login"
    Then I should be redirected to the homepage

    Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter "invaliduser" for username AND "invalidpassword" for password
    And I click on "login"
    Then I should see an error message "Invalid username or password"
    And I should remain on the login page

    Scenario: Login with empty fields
    Given I am on the login page
    When I leave the username and password fields empty
    And I click on "login"
    Then I should see an error message "Username and password cannot be empty"
    And I should remain on the login page

    Scenario: Three failed logins within 1 minute
    Given I am on the login page
    When I enter "testuser" for username AND "wrongpassword" for password
    And I click on "login"
    And I enter "testuser" for username AND "wrongpassword" for password
    And I click on "login"
    And I enter "testuser" for username AND "wrongpassword" for password
    And I click on "login"
    Then I should see an error message "Too many failed login attempts. Try again in 1 minute"

    Scenario: Toggle between login and register
    Given I am on the login page
    When I click on "Register"
    Then I should be redirected to the register page
    When I click on "Login"
    Then I should be redirected back to the login page

    Scenario: App name and team name
    Given I am on the login page
    Then I should see "Let's Get Lyrical" on the screen
    And I should see "Team 23" on the screen

    Scenario: Test for keyboard accessibility
    Given I am on the login page
    When I enter "testuser" for username AND "testpassword" for password
    And I press the Enter key
    Then I should be redirected to the homepage