Feature: Registering a new user
  # Enter feature description here

  Scenario: Register a user successfully
    Given I am on the registration page
    When I enter in the "Username" field "johndoe"
    And I enter in the "Password" field "Real1"
    And I enter in the "Confirm Password" field "Real1"
    And I click the "Register" button
    Then I should see a confirmation message
    And I should be redirected to the login page

  Scenario: Error for registration with invalid password
    Given I am on the registration page
    When I enter in the "Username" field "johndoe2"
    And I enter in the "Password" field "notreal"
    And I enter in the "Confirm Password" field "notreal"
    And I click the "Register" button
    Then I should see an error message displayed

  Scenario: Error for registration duplicate username
    Given I am on the registration page
    When I enter in the "Username" field "johndoe"
    And I enter in the "Password" field "Real1"
    And I enter in the "Confirm Password" field "Real1"
    And I click the "Register" button
    Then I should see an error message displayed

  Scenario: Error for registration with non-matching second password
    Given I am on the registration page
    When I enter in the "Username" field "johndoe4"
    And I enter in the "Password" field "Real1"
    And I enter in the "Confirm Password" field "Real2"
    And I click the "Register" button
    Then I should see an error message displayed

  Scenario: Error for registration with blank details
    Given I am on the registration page
    When I enter in the "Username" field " "
    And I enter in the "Password" field " "
    And I enter in the "Confirm Password" field " "
    And I click the "Register" button
    Then I should see an error message displayed

  Scenario: Cancel registration
    Given I am on the registration page
    When I enter in the "Username" field "johndoe6"
    And I enter in the "Password" field "Real1"
    And I enter in the "Confirm Password" field "Real1"
    And I click the "Cancel" button
    Then I should see a blank registration form
