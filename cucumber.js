module.exports = {
  default: {
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publish: false
  },
  playwright: {
    paths: ['tests/features/*.feature'],
    require: ['tests/step-definitions/*.ts', 'tests/support/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1 // Adjust based on your needs
  }
};