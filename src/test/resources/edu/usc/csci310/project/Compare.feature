Feature: Compare favorite song lists with friends
  As a registered user
  I want to compare my favorite song list with friends
  So that I can discover shared music interests

  Background:
    Given I am logged in

  Scenario: Compare my favorites with public friends' lists
    Given I have a favorite song list
    And the following friends have public favorite song lists:
      | testuser1   |
      | aznduck   |
      | david    |
    When I navigate to the compare favorites page
    And I enter the friends "testuser1, aznduck" to compare
    And I click the "Compare" button compare
    Then I should see a list of songs that appear in at least one friend's list
    And each song should display how many friends have it in their list
    And the list should be sorted from most to least frequent

#  Scenario: Display error when friend list is private
#    Given "friendX" has a private favorite song list
#    When I attempt to compare with "friendX"
#    Then I should see an error message saying "friendX's list is private"
#
#  Scenario: Display error when entering invalid username
#    When I enter the non-existent username "ghostUser"
#    And I click the "Compare" button
#    Then I should see an error message saying "User not found"

#  Scenario: Show tooltip of users per song
#    Given "testuser1" and "aznduck" both have the song "Imagine" in their list
#    When I hover over the frequency number next to "Imagine"
#    Then I should see a tooltip showing:
#      | testuser1     |
#      | aznduck  |
#      | david  |

  Scenario: View song details from comparison list
    Given the song "Fighting My Demons" appears in the comparison list
    When I click on "Fighting My Demons" compare
    Then I should see a pop-up with song details including title, artist, and year

  Scenario: Reverse sorting of comparison list
    Given the comparison list is sorted from most to least frequent
    When I click the "Reverse Sort" button compare
    Then the list should be sorted from least to most frequent

#  Scenario: Celebrate soulmate match
#    Given "testuser1" and I have the most similar word clouds to each other
#    When I click "Compare"
#    Then I should see a celebratory animated overlay indicating a soulmate match
#
#  Scenario: Show enemy match
#    Given "aznduck" and I have the least similar word clouds to each other
#    When I click "Compare"
#    Then I should see a sinister animated overlay indicating an enemy match