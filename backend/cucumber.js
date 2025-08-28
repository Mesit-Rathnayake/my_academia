module.exports = {
  default: {
    require: ['tests/bdd/step-definitions/**/*.js'],
    format: ['progress'],
    paths: ['tests/bdd/features/**/*.feature']
  }
};