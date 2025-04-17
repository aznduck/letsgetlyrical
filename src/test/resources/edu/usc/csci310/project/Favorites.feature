Feature: Favorites feature
  Scenario: Add a searched song to favorites
    Given I am logged in on the home page
    When I search for "Drake"
    And I click the 1 word
    And I hover over the 1 song
    And I click the 2 word
    And I hover over the 1 song
    And I click on "Add to favorites list"
    And I am on the home page
    Then I see the new song added at the bottom

  Scenario: List is private by default
    Given I am logged in on the home page
    When I click the favorite settings button
    Then I see the favorites list is on "Private"

  Scenario: List is toggled to public
    Given I am logged in on the home page
    When I click the favorite settings button
    And I click on "Public"
    And I am on the home page
    And I click the favorite settings button
    Then I see the favorites list is on "Public"

  Scenario: Favorite songs can be viewed
    Given I am logged in on the home page
    When I click the 1 favorite song
    Then I see the additional information of the song

  Scenario: List can be reordered
    Given I am logged in on the home page
    When I hover over the 1 favorite song
    And I click on the move down button
    Then I should see the top two favorites switched

  Scenario: Favorite songs can be deleted
    Given I am logged in on the home page
    When I hover over the 1 favorite song
    And I click on "Remove song"
    And I click on "Remove"
    Then I should see the first favorite song at 1

  Scenario: List can be completely deleted
    Given I am logged in on the home page
    When I click on the favorite settings button
    And I click on "Delete"
    And I click on "Delete"
    Then I should an empty favorites list
