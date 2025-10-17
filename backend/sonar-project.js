const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: 'https://sonarcloud.io',
  options: {
    'sonar.projectKey': 'my-academia-qa-project',
    'sonar.projectName': 'My Academia QA Project',
    'sonar.projectVersion': '1.0',
    'sonar.sources': '.',
    'sonar.exclusions': 'node_modules/**,tests/**,coverage/**',
    'sonar.language': 'js',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
  }
}, () => {
  console.log('SonarQube analysis completed');
});