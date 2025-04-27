Feature: Survey workflow

  Scenario: Happy Path
    Given I open the app
    When I create a survey named "QA Demo" with one multiple‑choice question
    And I publish and preview the survey
    And I submit a sample response
    Then the survey's response list via API contains that submission
    And I delete the survey

  Scenario: Validation
    Given I open the app
    When I attempt to create a survey without a title
    Then I see an inline validation error