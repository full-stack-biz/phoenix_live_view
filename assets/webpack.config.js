const path = require("path");

module.exports = {
  entry: "./src/phoenix_live_view.ts",
  output: {
    filename: "phoenix_live_view.js",
    path: path.resolve(__dirname, "../priv/static"),
    library: "phoenix_live_view",
    libraryTarget: "umd",
    globalObject: "this",
    umdNamedDefine: true,
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  target: "node",
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: "tsconfig.json",
        },
      },
      {
        test: path.resolve(__dirname, "./js/phoenix_live_view.js"),
        use: [
          {
            loader: "expose-loader",
            options: "Phoenix.LiveView",
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  plugins: [],
};
