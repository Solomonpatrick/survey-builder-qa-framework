import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import { HomePage } from '../pageObjects/HomePage';
import { SurveyPage } from '../pageObjects/SurveyPage';
import { apiHelper, generateRandomName } from '../support/utils';

// Initialize page objects
let homePage: HomePage;
let surveyPage: SurveyPage;

// Given steps
Given('I open the app', async function(this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  
  homePage = new HomePage(this.page);
  await homePage.navigateToApp();
});

// When steps
When('I create a survey named {string} with one multiple‑choice question', async function(this: PlaywrightWorld, surveyName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  
  // Generate a unique survey name if provided with "QA Demo"
  const uniqueSurveyName = surveyName === "QA Demo" 
    ? `${surveyName} - ${generateRandomName()}` 
    : surveyName;
  
  // Store the survey name for later use
  this.selectedSurveyName = uniqueSurveyName;
  
  await homePage.createSurvey(uniqueSurveyName);
});

When('I publish and preview the survey', async function(this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  
  await homePage.publishAndPreviewSurvey();
  
  // Initialize the survey page since we're now on the preview page
  surveyPage = new SurveyPage(this.page);
});

When('I submit a sample response', async function(this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  
  await surveyPage.submitResponse();
  
  // Store the selected option for API verification
  this.selectedOption = surveyPage.getSelectedOption();
  
  // Verify the submission was successful
  expect(await surveyPage.isSubmissionSuccessful()).toBeTruthy();
});

When('I attempt to create a survey without a title', async function(this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  
  await homePage.attemptCreateSurveyWithoutTitle();
});

// Then steps
Then('the survey\'s response list via API contains that submission', async function(this: PlaywrightWorld) {
  if (!this.selectedSurveyName || !this.selectedOption) {
    throw new Error('Survey name or selected option is missing');
  }
  
  // Get the survey ID from the name
  const surveyId = await apiHelper.getSurveyIdByName(this.selectedSurveyName);
  
  if (!surveyId) {
    throw new Error(`Could not find survey with name: ${this.selectedSurveyName}`);
  }
  
  // Check if the response exists in the API
  const responseExists = await apiHelper.responseExists(surveyId, this.selectedOption);
  expect(responseExists).toBeTruthy();
});

Then('I delete the survey', async function(this: PlaywrightWorld) {
  if (!this.page || !this.selectedSurveyName) {
    throw new Error('Page or survey name is not initialized');
  }
  
  // Navigate back to the home page if not already there
  await homePage.navigateToApp();
  
  // Delete the survey
  await homePage.deleteSurvey(this.selectedSurveyName);
  this.selectedSurveyName = null;
});

Then('I see an inline validation error', async function(this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  
  const isErrorVisible = await homePage.isTitleValidationErrorVisible();
  expect(isErrorVisible).toBeTruthy();
});