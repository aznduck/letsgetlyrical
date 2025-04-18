Feature: Word Cloud Generation

  Scenario: Word cloud displays most frequent words by size
    Given I have searched for a song
    When the word cloud is generated
    Then words with higher frequency should appear larger in the word cloud

  Scenario: Word cloud should not contain duplicate words
    Given I have searched for a song
    When the word cloud is generated
    Then each word should appear only once

  Scenario: Word cloud should not contain filler words
    Given I have searched for a song
    When the word cloud is generated
    Then the word cloud should not contain common filler words

  Scenario: Word cloud should be generated in less than a second
    Given I have searched for a song
    When I generate the word cloud
    Then the word cloud should appear within 1 second

  Scenario: Clicking on a word brings up relevant songs
    Given the word cloud is displayed
    When I click on the word "BABY"
    Then I should see a list of songs containing the word "BABY"

  Scenario: Relevant songs should have lyrics
    Given the word cloud is displayed
    When I click on the word "BABY"
    And I click on the lyrics button
    Then I should see lyrics

  Scenario: Clicking toggle switches between cloud and table
    Given the word cloud is displayed as a cloud
    When I click the toggle button
    Then the word cloud should switch to table view
