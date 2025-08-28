Feature: Module Management
  As a student
  I want to manage my academic modules
  So that I can track my progress effectively

  Scenario: Create a new module successfully
    Given I am logged in as a student
    When I create a module with name "Database Systems" and code "CS2040"
    Then the module should be created successfully
    And I should see "Database Systems" in my modules list

  Scenario: Fail to create module with duplicate code
    Given I have a module with code "CS2040"
    When I try to create another module with code "CS2040"
    Then I should get a duplicate module error

  Scenario: View all my modules
    Given I have created multiple modules
    When I request my modules list
    Then I should see all my modules