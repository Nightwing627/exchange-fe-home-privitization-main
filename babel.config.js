const transformRemoveConsolePlugin = [];
if (process.env.NODE_ENV === 'production') {
  transformRemoveConsolePlugin.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
}
module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    ...transformRemoveConsolePlugin,
  ],
};
