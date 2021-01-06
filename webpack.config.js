const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

let config = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|src/,
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  node: {
    __dirname: false
  },
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: { 
       output: {
          ascii_only: true
        }
      }
    })]
  },
  mode: 'production'
};

let baseConfig = Object.assign({}, config, {
  entry: path.resolve(__dirname, 'ts/index.ts'),
  target:'node',
  output: {
    filename: 'sretest.js',
    library: 'sretest',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.join(__dirname, 'dist'),
  }
});


let convertConfig = Object.assign({}, config, {
  entry: path.resolve(__dirname, 'ts/frontend/braille_convert.ts'),
  // devtool: false,
  target: 'web',
  output: {
    filename: 'braille-convert.js',
    library: 'Convert',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.join(__dirname, 'harvest/public'),
  }
});

let updateConfig = Object.assign({}, config, {
  entry: path.resolve(__dirname, 'ts/frontend/firebase_update.ts'),
  devtool: false,
  target: 'web',
  output: {
    filename: 'firebase-update.js',
    library: 'Fireup',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.join(__dirname, 'harvest/public'),
  }
});

let documentSelection = Object.assign({}, config, {
  entry: path.resolve(__dirname, 'ts/frontend/selection.ts'),
  devtool: false,
  target: 'web',
  output: {
    filename: 'document-selection.js',
    library: 'Select',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.join(__dirname, 'harvest/public'),
  }
});



module.exports = [baseConfig, convertConfig, updateConfig, documentSelection]; 
