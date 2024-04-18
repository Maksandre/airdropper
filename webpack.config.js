const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/send_tokens.js',
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
  externalsPresets: { node: true },
  externals: [], 
  resolve: {
    fallback: {
      "crypto": false
    }
  },
  mode: 'production'
};
