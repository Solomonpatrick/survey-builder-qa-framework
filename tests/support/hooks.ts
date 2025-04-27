import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

// Create directories for artifacts
BeforeAll(async function() {
  const dirs = ['test-results', 'test-results/screenshots', 'test-results/videos', 'test-results/traces'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('Test run started');
});

// Clean up after all tests complete
AfterAll(async function() {
  console.log('Test run completed');
});

// Before each scenario
Before(async function(this: PlaywrightWorld, { pickle }) {
  console.log(`Starting scenario: ${pickle.name}`);
  // Additional setup can be added here
});

// After each scenario
After(async function(this: PlaywrightWorld, { pickle, result }) {
  const world = this;
  
  // Take screenshot on failure
  if (result?.status === Status.FAILED && world.page) {
    const screenshotPath = path.join('test-results/screenshots', `${pickle.name.replace(/\s+/g, '-')}-failed.png`);
    await world.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Save trace on failure
    if (world.context) {
      const tracePath = path.join('test-results/traces', `${pickle.name.replace(/\s+/g, '-')}-trace.zip`);
      await world.context.tracing.stop({ path: tracePath });
      console.log(`Trace saved to ${tracePath}`);
    }
  }
  
  // Clean up any API resources
  if (world.lastSubmissionId) {
    try {
      // Here we would call an API cleanup method to delete test data
      console.log(`Cleaning up submission with ID: ${world.lastSubmissionId}`);
      // await apiHelper.deleteSubmission(world.lastSubmissionId);
      world.lastSubmissionId = null;
    } catch (error) {
      console.error(`Failed to clean up submission: ${error}`);
    }
  }
  
  console.log(`Finished scenario: ${pickle.name} (${result?.status})`);
});