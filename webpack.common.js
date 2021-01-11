const path = require('path');
module.exports = {
  entry: './snowview.js',
  output: {
    //path: path.resolve(__dirname, ''),
    path: `${__dirname}`,
    filename: 'snowview.bundle.js'
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

