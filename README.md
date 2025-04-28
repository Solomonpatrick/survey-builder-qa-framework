# Survey Builder QA Framework

This repository contains a Playwright + Cucumber JS + TypeScript test framework for the Survey Builder application.

## Features

- Page Object Model design pattern
- Cucumber BDD scenarios
- TypeScript for type safety
- Automated API verification
- Screenshot, trace, and video capture on failures
- DOM manipulation for robust test execution

## Test Scenarios

The framework includes three main test scenarios:

1. **Happy Path** - Create a survey, publish it, submit a response, verify via API, and delete the survey
2. **Validation** - Verify that validation errors are displayed when creating a survey without a title
3. **Question with Empty Title** - Verify that validation errors are displayed when adding a question without a title

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Solomonpatrick/survey-builder-qa-framework.git

# Navigate to the project folder
cd survey-builder-qa-framework

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests with Cucumber
npm run bdd

# Generate Playwright code for new scenarios
npm run codegen

# View HTML test reports
npm run report
```

## Project Structure

```
tests/
  features/           # Cucumber feature files
    survey.feature
  step-definitions/   # Cucumber step definitions
    survey.steps.ts
  pageObjects/        # Page Object classes
    HomePage.ts
    SurveyPage.ts
  support/            # Support files
    world.ts          # Cucumber-Playwright integration
    hooks.ts          # Before/After hooks
    utils.ts          # Utility functions
evidence/             # Test evidence screenshots
  empty_question_title.png
  # Other evidence files
```

## Technical Implementation

### Key Components

1. **Page Objects**: 
   - `HomePage.ts` - Handles survey creation, management, and deletion
   - `SurveyPage.ts` - Handles survey response submission and verification

2. **Step Definitions**:
   - `survey.steps.ts` - Implements the steps defined in the feature files
   
3. **Support Files**:
   - `world.ts` - Sets up the Playwright browser context
   - `hooks.ts` - Implements before/after hooks for test setup/teardown
   - `utils.ts` - Contains helper functions for API interaction

### Resilient Testing Techniques

This framework implements several advanced techniques to ensure test reliability:

1. **Modal Interference Handling**: 
   - Uses CSS manipulation to prevent hidden modals from intercepting pointer events
   - Implements `safeClick()` method to bypass event interception issues

2. **Dropdown Selection Optimization**: 
   - Uses direct JavaScript manipulation via `selectDropdownOption()` method
   - Avoids timeouts when interacting with dropdown options

3. **DOM Manipulation**:
   - Uses JavaScript evaluation for direct DOM manipulation when UI interactions are unreliable
   - Provides consistent behavior across different browser environments

4. **API Verification**:
   - Implements comprehensive API checks to verify end-to-end functionality
   - Supports both UI validation and backend data verification

## Configuration

The `.env` file can be used to configure:
- API endpoints
- Browser selection (chromium, firefox, webkit)
- Headless mode
- Slow motion delay