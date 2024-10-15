const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/script.js',  // Entry point where you import the SCSS

  output: {
    filename: 'bundle.js',  // Name for the JS file
    path: path.resolve(__dirname, 'dist'),  // Output directory for the compiled files
  },

  module: {
    rules: [
        {
            test: /\.js$/,  // Target .js files
            exclude: /node_modules/,  // Don't process files in node_modules
            use: {
              loader: 'babel-loader',  // Use Babel to transpile JS
              options: {
                presets: ['@babel/preset-env'],  // Preset for modern JavaScript
              },
            },
          },
      {
        test: /\.scss$/,  // Match SCSS files
        use: [
          MiniCssExtractPlugin.loader,  // Extract CSS to a separate file
          'css-loader',  // Turn CSS into JS modules
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',  // Output CSS file name
    }),
  ],

  mode: 'development',  // Or 'production'
};
