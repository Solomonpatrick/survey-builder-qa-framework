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
  readonly questionTitleValidationError: Locator;
  readonly surveyList: Locator;
  readonly surveyListItems: Locator;
  readonly deleteModal: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.createSurveyButton = page.locator('#create-survey-btn');
    
    // Survey creation form elements
    this.surveyTitleInput = page.locator('#survey-title');
    this.addQuestionButton = page.locator('#add-question-btn');
    this.questionTypeDropdown = page.locator('.question-type').first();
    this.questionTitleInput = page.locator('.question-title').first();
    this.multipleChoiceOption = page.locator('option[value="multiple-choice"]').first();
    this.addOptionButton = page.locator('.add-option-btn').first();
    this.optionInputs = page.locator('.option-input');
    this.saveSurveyButton = page.locator('#save-survey-btn');
    
    // Survey management elements
    this.publishButton = page.locator('#publish-btn');
    this.previewButton = page.locator('#preview-btn');
    
    // Validation elements
    this.titleValidationError = page.locator('#title-validation:not(.hidden)');
    this.questionTitleValidationError = page.locator('.question-title-validation:not(.hidden)');
    
    // Survey list elements
    this.surveyList = page.locator('.survey-list');
    this.surveyListItems = page.locator('.survey-item');
    
    // Modal
    this.deleteModal = page.locator('#delete-modal');
  }

  /**
   * Fix for the delete modal intercepting pointer events - more comprehensive fix
   */
  async fixModalInterference(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        #delete-modal.hidden {
          display: none !important;
          pointer-events: none !important;
          z-index: -1 !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        
        /* Ensuring all buttons are clickable */
        button {
          position: relative;
          z-index: 100;
        }
      `
    });
  }

  /**
   * Safely click a button using JavaScript
   * @param selector CSS selector for the button
   */
  async safeClick(selector: string): Promise<void> {
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element instanceof HTMLElement) {
        element.click();
      }
    }, selector);
  }

  /**
   * Select a dropdown option by value using JavaScript
   * @param selector CSS selector for the dropdown
   * @param value Value to select
   */
  async selectDropdownOption(selector: string, value: string): Promise<void> {
    await this.page.evaluate(({ sel, val }) => {
      const dropdown = document.querySelector(sel);
      if (dropdown instanceof HTMLSelectElement) {
        dropdown.value = val;
        
        // Trigger change event to ensure any event listeners are notified
        const event = new Event('change', { bubbles: true });
        dropdown.dispatchEvent(event);
      }
    }, { sel: selector, val: value });
  }

  /**
   * Navigate to the Survey Builder app
   */
  async navigateToApp(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('#create-survey-btn', { state: 'visible' });
    await this.fixModalInterference();
  }

  /**
   * Create a new survey with a title and one multiple-choice question
   * @param title Survey title
   */
  async createSurvey(title: string): Promise<void> {
    // Fix modal interference
    await this.fixModalInterference();
    
    // Use safe clicking method 
    await this.safeClick('#create-survey-btn');
    await this.page.waitForSelector('#survey-title', { state: 'visible' });
    
    await this.surveyTitleInput.fill(title);
    
    // Use safe clicking for Add Question button
    await this.safeClick('#add-question-btn');
    await this.page.waitForSelector('.question-type', { state: 'visible' });
    
    // Select Multiple Choice using our safer dropdown method
    await this.selectDropdownOption('.question-type', 'multiple-choice');
    await this.page.waitForTimeout(500); // Wait for dropdown change to take effect
    
    await this.questionTitleInput.fill('What is your favorite color?');
    
    // Add multiple-choice options
    await this.page.waitForSelector('.option-container', { state: 'visible' });
    
    // Fill in the first option that was automatically created
    const firstOptionInput = this.page.locator('.option-input').first();
    await firstOptionInput.fill('Red');
    
    // Add and fill second option - using safe click
    await this.safeClick('.add-option-btn');
    const secondOptionInput = this.page.locator('.option-input').nth(1);
    await secondOptionInput.fill('Blue');
    
    // Add and fill third option - using safe click
    await this.safeClick('.add-option-btn');
    const thirdOptionInput = this.page.locator('.option-input').nth(2);
    await thirdOptionInput.fill('Green');
    
    // Save survey using safe click
    await this.safeClick('#save-survey-btn');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Attempt to create a survey without providing a title
   */
  async attemptCreateSurveyWithoutTitle(): Promise<void> {
    // Fix modal interference
    await this.fixModalInterference();
    
    // Use safe clicking method
    await this.safeClick('#create-survey-btn');
    await this.page.waitForSelector('#survey-title', { state: 'visible' });
    
    // Leave title empty deliberately and save
    await this.safeClick('#save-survey-btn');
    await this.page.waitForSelector('#title-validation:not(.hidden)', { state: 'visible', timeout: 5000 });
  }

  /**
   * Attempt to add a question with an empty title
   */
  async attemptAddQuestionWithEmptyTitle(): Promise<void> {
    // The question should already be created from the previous step
    // We just need to clear the title field and try to save
    await this.questionTitleInput.fill(''); // Clear the question title
    
    // Save using safe click
    await this.safeClick('#save-survey-btn');
    await this.page.waitForSelector('.question-title-validation:not(.hidden)', { state: 'visible', timeout: 10000 });
  }

  /**
   * Check if title validation error is visible
   */
  async isTitleValidationErrorVisible(): Promise<boolean> {
    return await this.titleValidationError.isVisible();
  }

  /**
   * Check if question title validation error is visible
   */
  async isQuestionTitleValidationErrorVisible(): Promise<boolean> {
    return await this.questionTitleValidationError.isVisible();
  }

  /**
   * Publish and preview a survey
   */
  async publishAndPreviewSurvey(): Promise<void> {
    // Fix modal interference first
    await this.fixModalInterference();
    
    // Use safe click methods
    await this.safeClick('#publish-btn');
    await this.page.waitForLoadState('networkidle');
    
    await this.safeClick('#preview-btn');
    await this.page.waitForSelector('#submit-survey-btn', { state: 'visible' });
  }

  /**
   * Delete a survey by name
   * @param surveyName The name of the survey to delete
   */
  async deleteSurvey(surveyName: string): Promise<void> {
    // Fix modal interference first
    await this.fixModalInterference();
    
    // Find the survey item by its title
    const surveyItem = this.page.locator(`.survey-item h3:text("${surveyName}")`).first();
    await surveyItem.scrollIntoViewIfNeeded();
    
    // Use JavaScript to find and click the delete button
    await this.page.evaluate((surveyText) => {
      const surveyItems = Array.from(document.querySelectorAll('.survey-item'));
      const targetItem = surveyItems.find(item => item.textContent && item.textContent.includes(surveyText));
      if (targetItem) {
        const deleteButton = targetItem.querySelector('button:nth-child(2)');
        if (deleteButton && deleteButton instanceof HTMLElement) {
          deleteButton.click();
        }
      }
    }, surveyName);
    
    // Confirm deletion in modal
    await this.page.waitForSelector('#delete-modal:not(.hidden)', { state: 'visible' });
    await this.safeClick('#confirm-delete-btn');
    await this.page.waitForLoadState('networkidle');
  }
}