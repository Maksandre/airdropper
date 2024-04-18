const path = require('path');
// const nodeExternals = require('webpack-node-externals'); // Optional, see note below

module.exports = {
  target: 'node', // Ensures that Webpack will compile for usage in a Node.js environment
  entry: './src/send_tokens.js', // Path to your script
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  externalsPresets: { node: true }, // Ignore built-in modules like path, fs, etc.
  externals: [], // You can comment this out if you want absolutely no externals
  resolve: {
    fallback: {
      "crypto": false // Add fallbacks if necessary
    }
  },
  mode: 'production'
};
