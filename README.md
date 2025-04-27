# Survey Builder QA Framework

This repository contains a Playwright + Cucumber JS + TypeScript test framework for the [Survey Builder](https://github.com/r-wa/survey-builder) application.

## Features

- Page Object Model design pattern
- Cucumber BDD scenarios
- TypeScript for type safety
- Automated API verification
- Screenshot, trace, and video capture on failures

## Test Scenarios

The framework includes two main test scenarios:

1. **Happy Path** - Create a survey, publish it, submit a response, verify via API, and delete the survey
2. **Validation** - Verify that validation errors are displayed when creating a survey without a title

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
```

## Configuration

The `.env` file can be used to configure:
- API endpoints
- Browser selection (chromium, firefox, webkit)
- Headless mode
- Slow motion delay