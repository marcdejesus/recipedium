const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  optimization: { minimize: false },
  externals: [nodeExternals()],
  mode: 'production',
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.join(__dirname, 'functions-dist')
  }
}; 