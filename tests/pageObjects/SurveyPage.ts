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
    this.questionTitle = page.getByRole('heading').filter({ hasText: 'What is your favorite color?' });
    this.multipleChoiceOptions = page.getByRole('radio');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.submissionConfirmation = page.getByText('Thank you for your submission!');
  }

  /**
   * Submit a sample response to the survey
   */
  async submitResponse(): Promise<void> {
    // Wait for the survey to load completely
    await this.page.waitForLoadState('networkidle');
    await this.questionTitle.waitFor({ state: 'visible' });
    
    // Select a random option
    const options = await this.multipleChoiceOptions.all();
    const randomIndex = Math.floor(Math.random() * options.length);
    await options[randomIndex].click();
    
    // Store the selected option label for later verification
    const optionLabel = await this.page.locator('label').nth(randomIndex).textContent();
    this.selectedOption = optionLabel?.trim() || null;
    
    // Submit the response
    await this.submitButton.click();
    
    // Wait for submission confirmation
    await this.submissionConfirmation.waitFor({ state: 'visible' });
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