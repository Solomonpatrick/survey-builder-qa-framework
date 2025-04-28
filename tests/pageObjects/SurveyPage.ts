import { Page, Locator } from '@playwright/test';

export class SurveyPage {
  readonly page: Page;
  readonly questionTitle: Locator;
  readonly multipleChoiceOptions: Locator;
  readonly submitButton: Locator;
  readonly submissionConfirmation: Locator;
  
  // Store the selected option for later verification
  private selectedOption: string | null = null;

  constructor(page: Page) {
    this.page = page;
    
    // Survey response form elements
    this.questionTitle = page.locator('.preview-question h3');
    this.multipleChoiceOptions = page.locator('input[type="radio"]');
    this.submitButton = page.locator('#submit-survey-btn');
    this.submissionConfirmation = page.locator('#submission-confirmation:not(.hidden)');
  }

  /**
   * Fix for the delete modal intercepting pointer events
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
   * Submit a sample response to the survey
   */
  async submitResponse(): Promise<void> {
    // Fix any modal interference first
    await this.fixModalInterference();
    
    // Wait for the survey to load completely
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.preview-question', { state: 'visible' });
    
    // Select a random option
    const options = await this.multipleChoiceOptions.all();
    if (options.length === 0) {
      throw new Error('No radio options found on the page');
    }
    
    const randomIndex = Math.floor(Math.random() * options.length);
    await options[randomIndex].click();
    
    // Store the selected option label for later verification
    const optionLabel = await this.page.locator('label').nth(randomIndex).textContent();
    this.selectedOption = optionLabel?.trim() || null;
    
    // Submit the response using the safe click method
    await this.safeClick('#submit-survey-btn');
    
    // Wait for submission confirmation
    await this.submissionConfirmation.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get the selected option from the response
   */
  getSelectedOption(): string | null {
    return this.selectedOption;
  }

  /**
   * Check if submission was successful
   */
  async isSubmissionSuccessful(): Promise<boolean> {
    return await this.submissionConfirmation.isVisible();
  }
}