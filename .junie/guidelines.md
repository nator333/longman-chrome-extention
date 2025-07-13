# Longman Dictionary Chrome Extension Development Guidelines

## TypeScript Development Workflow

### Core Principles
- **Always edit TypeScript (.ts) files**, never edit JavaScript (.js) files directly
- JavaScript files in the `dist/` directory are automatically generated from TypeScript source files
- Any manual changes to JavaScript files will be overwritten when you run `npm run build`

### Development Workflow
1. Make changes to TypeScript source files in the `src/` directory
2. Run `npm run build` to compile and bundle TypeScript to JavaScript using Webpack
3. Test the extension to verify your changes work as expected
4. If needed, use `npm run lint` and `npm run format` to ensure code quality

### Common Commands
- `npm run build` - Compile and bundle TypeScript files to JavaScript using Webpack
- `npm run watch` or `npm run dev` - Watch for changes and recompile automatically
- `npm run build:prod` - Create a production build (optimized for size and performance)
- `npm run build:tsc` - Compile TypeScript files to JavaScript without bundling (for debugging)
- `npm run lint` - Check for code issues
- `npm run lint:fix` - Automatically fix linting issues
- `npm run format` - Format code using Prettier
- `npm run zip` - Create a distribution zip file

## Chrome Extension Specifics

### Module Compatibility
- The extension uses ES modules (configured in tsconfig.json)
- Webpack is used to bundle the modules into browser-compatible JavaScript
- The webpack configuration is written in TypeScript (webpack.config.ts)
- Use ES module syntax (import/export) in your TypeScript files
- No need for compatibility shims as Webpack handles module bundling

### Content Security Policy
- The extension has a strict Content Security Policy that only allows scripts from 'self'
- Avoid inline scripts in HTML files
- Use external script files loaded with `<script src="..."></script>` tags

### Testing Changes
- After building, load the extension in Chrome from the `dist/` directory
- Use Chrome's developer tools to debug issues
- Check the console for any errors

## Troubleshooting

### Common Issues
- **Webpack build errors**: Check the console output for specific error messages
- **CSP violations**: Avoid inline scripts; use external script files instead
- **Module import errors**: Make sure you're using the correct ES module import syntax (import/export)
- **Missing dependencies**: If you get errors about missing modules, make sure they're installed with npm

### Best Practices
- Keep TypeScript files small and focused on a single responsibility
- Use TypeScript's type system to catch errors at compile time
- Follow the existing code style and patterns
- Test thoroughly after making changes
