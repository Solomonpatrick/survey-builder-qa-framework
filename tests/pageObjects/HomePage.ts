import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly createSurveyButton: Locator;
  readonly surveyTitleInput: Locator;
  readonly addQuestionButton: Locator;
  readonly questionTypeDropdown: Locator;
  readonly questionTitleInput: Locator;
  readonly multipleChoiceOption: Locator;
  readonly addOptionButton: Locator;
  readonly optionInputs: Locator;
  readonly saveSurveyButton: Locator;
  readonly publishButton: Locator;
  readonly previewButton: Locator;
  readonly titleValidationError: Locator;
  readonly surveyList: Locator;
  readonly surveyListItems: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.createSurveyButton = page.getByRole('button', { name: 'Create New Survey' });
    
    // Survey creation form elements
    this.surveyTitleInput = page.getByLabel('Survey Title');
    this.addQuestionButton = page.getByRole('button', { name: 'Add Question' });
    this.questionTypeDropdown = page.getByLabel('Question Type');
    this.questionTitleInput = page.getByLabel('Question Title');
    this.multipleChoiceOption = page.getByRole('option', { name: 'Multiple Choice' });
    this.addOptionButton = page.getByRole('button', { name: 'Add Option' });
    this.optionInputs = page.getByPlaceholder('Enter an option');
    this.saveSurveyButton = page.getByRole('button', { name: 'Save Survey' });
    
    // Survey management elements
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.previewButton = page.getByRole('button', { name: 'Preview' });
    
    // Validation elements
    this.titleValidationError = page.getByText('Survey title is required');
    
    // Survey list elements
    this.surveyList = page.getByRole('list', { name: 'Survey List' });
    this.surveyListItems = this.surveyList.getByRole('listitem');
  }

  /**
   * Navigate to the Survey Builder app
   */
  async navigateToApp(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create a new survey with a title and one multiple-choice question
   * @param title Survey title
   */
  async createSurvey(title: string): Promise<void> {
    await this.createSurveyButton.click();
    await this.surveyTitleInput.fill(title);
    await this.addQuestionButton.click();
    await this.questionTypeDropdown.click();
    await this.multipleChoiceOption.click();
    await this.questionTitleInput.fill('What is your favorite color?');
    
    // Add multiple-choice options
    await this.addOptionButton.click();
    const optionInputs = await this.optionInputs.all();
    await optionInputs[0].fill('Red');
    await this.addOptionButton.click();
    await optionInputs[1].fill('Blue');
    await this.addOptionButton.click();
    await optionInputs[2].fill('Green');
    
    await this.saveSurveyButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Attempt to create a survey without providing a title
   */
  async attemptCreateSurveyWithoutTitle(): Promise<void> {
    await this.createSurveyButton.click();
    await this.saveSurveyButton.click();
  }

  /**
   * Check if title validation error is visible
   */
  async isTitleValidationErrorVisible(): Promise<boolean> {
    return await this.titleValidationError.isVisible();
  }

  /**
   * Publish and preview a survey
   */
  async publishAndPreviewSurvey(): Promise<void> {
    await this.publishButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.previewButton.click();
  }

  /**
   * Delete a survey by name
   * @param surveyName The name of the survey to delete
   */
  async deleteSurvey(surveyName: string): Promise<void> {
    const surveyItem = this.surveyList.getByText(surveyName).first();
    await surveyItem.hover();
    // Replace the .near() method with a more compatible approach
    const deleteButton = this.page.getByRole('button', { name: 'Delete' }).filter({ hasText: 'Delete' });
    await deleteButton.click();
    
    // Confirm deletion in modal
    const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    await confirmButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}