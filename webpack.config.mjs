import * as path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

let harvestConfig = Object.assign({}, config, {
  entry: path.resolve(__dirname, 'ts/frontend/fire_frontend.ts'),
  // devtool: false,
  target: 'web',
  output: {
    filename: 'nemeth-project.js',
    library: 'Nemeth',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.join(__dirname, 'harvest/public'),
  }
});

export default [harvestConfig]; 
