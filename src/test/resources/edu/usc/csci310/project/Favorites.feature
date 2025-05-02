Feature: Favorites feature
  Background:
    Given I am logged in for favorites
    And I am on the Search Page

  Scenario: Add a searched song to favorites
    When I enter "Drake" as the artist name
    And I click the Search button
    And I wait 3 seconds
    And I select "Drake" from the list of artists
    And I wait 10 seconds
    And I click the "yeah" word on the wordcloud
    And I hover over the 1 song and add it to favorites
    And I hover over the 2 song and add it to favorites
    And I am on the Search Page
    Then I see the new song added at the bottom

  Scenario: List is private by default
    When I click the favorite settings button
    Then I see the favorites list is on "Private"

  Scenario: List is toggled to public
    When I click the favorite settings button
    And I click on "Public" toggle button
    Then I see the favorites list is on "Public"

  Scenario: Favorite songs can be viewed
    When I click the 1 favorite song
    Then I see the additional information of the song

  Scenario: List can be reordered
    When I record the top two favorite songs
    When I hover over the 1 favorite song
    And I click on the move down button
    Then I should see the recorded second song at the top


  Scenario: Favorite songs can be deleted
    When I record the top two favorite songs
    And I hover over the 1 favorite song
    And I hover click on "Remove song"
    And I confirm removal
    Then I should see one of those two still present

  Scenario: List can be completely deleted
    When I enter "Drake" as the artist name
    And I click the Search button
    And I wait 3 seconds
    And I select "Drake" from the list of artists
    And I wait 10 seconds
    And I click the "yeah" word on the wordcloud
    And I hover over the 1 song and add it to favorites
    And I hover over the 2 song and add it to favorites
    And I am on the Search Page
    Then I see the new song added at the bottom

    Given I am on the Search Page
    When I click the favorite settings button
    And I press on the delete list button
    And I confirm list deletion
    Then I should have an empty favorites list
