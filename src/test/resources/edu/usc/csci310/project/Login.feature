Feature: Login to the app

  Scenario: User logs in successfully and logs out
    Given I am on the login page
    When I enter "testuser1" for username AND "LyricalMusic1!" for password
    And I click on "Sign in"
    Then I should be redirected to the landing page
    And I log out
    Then I should be redirected back to the login page

  Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter "invaliduser" for username AND "invalidPassword1" for password
    And I click on "Sign in"
    Then I should see an error message "User not found"
    And I should remain on the login page

  Scenario: Login with invalid password requirements
    Given I am on the login page
    When I enter "User1" for username AND "abc" for password
    And I click on "Sign in"
    Then I should see an error message "Invalid input: password must contain a lowercase, uppercase, and number"
    And I should remain on the login page

  Scenario: Login with empty fields
    Given I am on the login page
    When I leave the username and password fields empty
    And I click on "Sign in"
    Then Registration should fail
    And I should remain on the login page

  Scenario: Three failed logins within 1 minute
    Given I am on the login page
    When I enter "testuser1" for username AND "LyricalMusic1" for password
    And I click on "Sign in"
    And I click on "Sign in"
    And I click on "Sign in"
      And I click on "Sign in"
    Then I should see an error message "Account locked."

  Scenario: Toggle between login and register
    Given I am on the login page
    When I click on Sign up
    Then I should be redirected to the register page
    When I click on Log in
    Then I should be redirected back to the login page