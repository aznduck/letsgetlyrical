Feature: Search and Word Cloud Generation

  As a user, I want to be able to search for songs by an artist and generate a word cloud from the lyrics of those songs,
  so that I can visualize the most common words used in their lyrics.

  Background:
    Given I am logged in
    And I am on the Search Page

  Scenario: Valid search with popular songs with default number of songs
    When I enter "Taylor Swift" as the artist name
    And Ensure the number of songs is empty
    And I click the Search button
    And I select "Taylor Swift" from the list of artists
    Then I should see 10 songs listed

  Scenario: Artist has more than N songs
    When I enter "Taylor Swift" as the artist name
    And I enter "11" as the number of songs
    And I click the Search button
    And I select "Taylor Swift" from the list of artists
    Then I should see 11 songs listed

  Scenario: Ambiguous artist name selection
    When I enter "Justin" as the artist name
    And I click the Search button
    And I wait 3 seconds
    Then I should see a list of matching artist names to choose from
    And I should be able to select "Justin Bieber" or "Justin Timberlake"
    And I will select "Justin Bieber"

  Scenario: Empty artist name input
    When I leave the artist name field empty
    And I enter "5" as the number of songs
    And I click the Search button
    Then I should not see "Please pick an artist"

      # Kick back to the login page if not logged in
  Scenario: Not logged in user should not be able to add songs to favorites
    Given I am not logged in
    When I try to access the search page
    Then I should be redirected back to the login page

    ##### TODO lists down below ######
  Scenario: Re-generating a word cloud after modifying search
    Given I have already searched for "Drake" with 5 songs
    When I modify the artist name to "Drake Bell"
    And I click the Search button
    Then a new word cloud should be generated

  Scenario: Adding favorites list to word cloud
    Given I have already generated a word cloud
    When I add my favorites list to the word cloud
    Then the word cloud should include words from both lists

    # Consider feasibility report
  Scenario: Word cloud generation time limit
    When I search for "Beyonce" with 8 songs
    Then the word cloud should be generated in under 1 second

  Scenario: Word cloud excludes common filler words
    When I search for "Katy Perry" with 4 songs
    Then I should not see "the", "and", "it" on word cloud

  Scenario: Word cloud stems similar words
    When I search for "Eminem" with 5 songs
    Then the word cloud should show stemmed words counted together

  Scenario: Word cloud word limit
    When I search for "Taylor Swift" with 20 songs
    Then the word cloud should contain no more than 100 unique words

  Scenario: Add songs to favorites
    Given I have already generated a word cloud
    When I select a song from the word cloud
    And I click the "Add to Favorites" button on search page
    Then the song should be added to my favorites list
    And I should see a confirmation message here
