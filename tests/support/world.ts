import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define custom properties for our Playwright World
export interface PlaywrightWorldOptions extends IWorldOptions {
  browser?: string;
  headless?: boolean;
  slowMo?: number;
}

export class PlaywrightWorld extends World {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  
  // Custom properties to store state between steps
  selectedSurveyName: string | null = null;
  selectedOption: string | null = null;
  lastSubmissionId: string | null = null;
  
  // Add options property
  options: {
    browser?: string;
    headless?: boolean;
    slowMo?: number;
    [key: string]: any;
  };

  constructor(options: PlaywrightWorldOptions) {
    super(options);
    
    // Default options from .env or hardcoded defaults
    this.options = {
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS === 'true',
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
      ...options,
    };
  }

  async init() {
    // Select browser based on configuration
    const browserType = this.options.browser?.toLowerCase();
    
    if (browserType === 'firefox') {
      this.browser = await firefox.launch({
        headless: !!this.options.headless,
        slowMo: this.options.slowMo as number,
      });
    } else if (browserType === 'webkit') {
      this.browser = await webkit.launch({
        headless: !!this.options.headless,
        slowMo: this.options.slowMo as number,
      });
    } else {
      // Default to chromium
      this.browser = await chromium.launch({
        headless: !!this.options.headless,
        slowMo: this.options.slowMo as number,
      });
    }

    // Create a new browser context with device emulation
    this.context = await this.browser.newContext({
      ...devices['Desktop Chrome'],
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      viewport: { width: 1280, height: 720 },
      recordVideo: this.options.headless ? { dir: 'test-results/videos/' } : undefined,
    });
    
    // Enable tracing
    await this.context.tracing.start({
      screenshots: true,
      snapshots: true,
    });
    
    // Create a new page
    this.page = await this.context.newPage();
  }

  async destroy() {
    // Close tracing if context exists
    if (this.context) {
      await this.context.tracing.stop();
    }
    
    // Close page
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    // Close context
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Register the custom world with Cucumber
setWorldConstructor(PlaywrightWorld);

// Add Before/After hooks for World initialization/destruction
import { Before, After } from '@cucumber/cucumber';

Before(async function(this: PlaywrightWorld) {
  await this.init();
});

After(async function(this: PlaywrightWorld) {
  await this.destroy();
});