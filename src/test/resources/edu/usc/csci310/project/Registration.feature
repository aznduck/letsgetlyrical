Feature: Registering a new user
  # Enter feature description here

  Scenario: Register a user successfully
    Given I am on the registration page
    When I enter in the "username" field "RANDOM_USERNAME"
    And I enter in the "password" field "Real1"
    And I enter in the "confirmpassword" field "Real1"
    And I click the "Create an account" button
    Then I should see a confirmation message
    And I should be redirected to the login page


  Scenario: Error for registration with invalid password
    Given I am on the registration page
    When I enter in the "username" field "johndoe2"
    And I enter in the "password" field "notreal"
    And I enter in the "confirmpassword" field "notreal"
    And I click the "Create an account" button
    Then I should see an error message displayed

  Scenario: Error for registration duplicate username
    Given I am on the registration page
    When I enter in the "username" field "johndoe"
    And I enter in the "password" field "Real1"
    And I enter in the "confirmpassword" field "Real1"
    And I click the "Create an account" button
    Then I should see an registration failure message displayed

  Scenario: Error for registration with non-matching second password
    Given I am on the registration page
    When I enter in the "username" field "johndoe4"
    And I enter in the "password" field "Real1"
    And I enter in the "confirmpassword" field "Real2"
    And I click the "Create an account" button
    Then I should see an error message displayed

  Scenario: Error for registration with blank details
    Given I am on the registration page
    When I enter in the "username" field " "
    And I enter in the "password" field " "
    And I enter in the "confirmpassword" field " "
    And I click the "Create an account" button
    Then I should see an error message displayed

  Scenario: Cancel registration
    Given I am on the registration page
    When I enter in the "username" field "johndoe6"
    And I enter in the "password" field "Real1"
    And I enter in the "confirmpassword" field "Real1"
    And I click the "Cancel" button
    And I click the "Yes, cancel" button
    Then I should see a blank registration form
