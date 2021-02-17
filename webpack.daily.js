const path = require('path');
module.exports = {
  entry: './daily.js',
  mode: 'production',
  devtool: 'source-map',
  output: {
    //path: path.resolve(__dirname, ''),
    path: `${__dirname}`,
    filename: 'daily.bundle.js'
  },
  target: ["web", "es5"],
  module: {
    rules: [
      { 
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', {
                  targets: {
                    ie: 11,
                  },
                  useBuiltIns: "usage",
                  corejs: 3
                }
              ]
            ]
          }
        }
      }
    ]
  },
};

