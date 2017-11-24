var path = require("path");
module.exports = {
  entry: {
    app: ["./main.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
   // publicPath: "/assets/",
    filename: "bundle.js"
  }
};
