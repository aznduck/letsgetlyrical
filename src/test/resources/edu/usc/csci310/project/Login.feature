Feature: login
  Background:
    Given I am on the login page

  Scenario: error-free login
    When I enter in a valid username
    And I enter in the correct password
    And I click the "log in" button
    Then I should be redirected to the main page
    And I should see a success message

  Scenario: username does not exist
    When I enter in a username that does not exist
    And I enter in an invalid password
    And I click the "log in" button
    Then I should see an error message saying "invalid username"

  Scenario: incorrect password
    When I enter in a valid username
    And I enter in an invalid password
    And I click the "log in" button
    Then I should see an error message saying "incorrect password"

  Scenario: empty username field
    When I click the "login in" button
    Then I should see an error message saying "username and password are required"

  Scenario: empty password field
    When I enter in a valid username
    And I click the "log in button"
    Then I should see an error message saying "username and password are required"

  Scenario: user times out after 3 fails
    When I enter in a valid username
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    Then I should see an error message saying "you have been timed out for 30 seconds"
    And I enter in an invalid password
    And I press the "log in" button
    Then I should see an error message saying "you have been timed out. Please try again in 30 seconds"

  Scenario: user account locks after 6 attempts
    When I enter in a valid username
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    Then I wait 30 seconds
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    And I enter in an invalid password
    And I press the "log in" button
    Then I should see an error message saying "password failed too many times. Account locked."

