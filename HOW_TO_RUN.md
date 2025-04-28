# How to Run Survey Builder QA Tests

This guide explains how to run the Survey Builder application and its automated tests.

## Step 1: Start the Mock Server

The mock server provides the backend API for the Survey Builder application. To start it, open a terminal window and run:

```bash
# Navigate to the project directory
cd c:\Users\solom\OneDrive\Desktop\survey-builder-qa-task

# Start the mock server
node mock-server.js
```

You should see output similar to:
```
Server running at http://localhost:3000/
Demo survey created: {...}
```

Leave this terminal window open while you run the tests.

## Step 2: Run the Automated Tests

In a new terminal window, run the BDD tests:

```bash
# Navigate to the project directory
cd c:\Users\solom\OneDrive\Desktop\survey-builder-qa-task

# Run the tests
npm run bdd
```

This will execute all the Cucumber scenarios defined in the `tests/features` directory.

## Step 3: View Test Results

After the tests complete, you can view the HTML report:

```bash
# Open the HTML report
npm run report
```

This will open the Cucumber HTML report in your default browser.

## Additional Commands

### Generate Test Evidence

```bash
node generate-evidence.js
```

### Run in Debug Mode

```bash
npm run bdd:debug
```

### Generate Test Code

```bash
npm run codegen
```

## Troubleshooting

If the tests fail to run:

1. Make sure the mock server is running on port 3000
2. Ensure all dependencies are installed with `npm install`
3. Check for any error messages in the terminal output
4. Verify that no other process is using port 3000