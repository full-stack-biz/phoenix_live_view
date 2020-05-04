const path = require('path')

module.exports = {
  entry: './js/phoenix_live_view.js',
  output: {
    filename: 'phoenix_live_view.js',
    path: path.resolve(__dirname, '../priv/static'),
    library: 'phoenix_live_view',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
   // Enable sourcemaps for debugging webpack's output.
   devtool: "source-map",
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      {
        test: path.resolve(__dirname, './js/phoenix_live_view.js'),
        use: [{
          loader: 'expose-loader',
          options: 'Phoenix.LiveView'
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  plugins: []
}
