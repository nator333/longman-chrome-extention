import * as path from 'path';
import * as glob from 'glob';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

// Define entry points for React components
const entries: { [key: string]: string } = {
  // Content script
  content: './src/content.tsx',
  // Popup
  popup: './src/popup.tsx',
  // Options
  options: './src/options.tsx',
  // Background script (if any)
  // background: './src/background.ts',
};

// Add any additional TypeScript files that aren't React components
glob.sync('./src/**/*.ts').forEach((file: string) => {
  const name = path.basename(file, '.ts');
  // Skip files that are already defined as entry points or are utility files
  if (
    !entries[name] && 
    name !== 'module-compat' && 
    name !== 'content-exports-shim' && 
    name !== 'content-require-shim' &&
    !name.includes('.d')
  ) {
    entries[name] = './' + file;
  }
});

const config: webpack.Configuration = {
  mode: 'production', // or 'development' for debugging
  entry: entries,
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'pages/popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: './src/options.html',
      filename: 'pages/options.html',
      chunks: ['options']
    }),
    new CopyPlugin({
      patterns: [
        { from: 'dist/manifest.json', to: 'manifest.json' },
        { from: 'dist/icons', to: 'icons' },
        { from: 'src/css', to: 'css' }
      ]
    })
  ]
};

export default config;
