import * as path from 'path';
import * as glob from 'glob';
import * as webpack from 'webpack';

// Find all TypeScript files in src directory
const entries: { [key: string]: string } = glob.sync('./src/**/*.ts').reduce((acc: { [key: string]: string }, file: string) => {
  // Extract the filename without extension
  const name = path.basename(file, '.ts');
  // Skip the module-compat, content-exports-shim, and content-require-shim files
  // as they will be included by the files that need them
  if (name === 'module-compat' || name === 'content-exports-shim' || name === 'content-require-shim') {
    return acc;
  }
  // Create an entry point for each file
  acc[name] = './' + file;
  return acc;
}, {});

const config: webpack.Configuration = {
  mode: 'production', // or 'development' for debugging
  entry: entries,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/js')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};

export default config;