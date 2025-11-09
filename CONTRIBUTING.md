# Contributing to AI Customer Support

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test changes
   - `chore:` Build/tooling changes

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Add screenshots for UI changes

## Development Setup

See [GETTING_STARTED.md](docs/GETTING_STARTED.md) for detailed setup instructions.

## Code Style

- Use TypeScript for type safety
- Follow existing patterns and conventions
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### TypeScript

```typescript
// Good
interface User {
  id: string;
  email: string;
  name?: string;
}

async function getUser(id: string): Promise<User> {
  // Implementation
}

// Avoid
function getUser(id) {
  // No types
}
```

### React Components

```typescript
// Good
interface Props {
  title: string;
  onClick?: () => void;
}

export function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}

// Avoid
export function Button(props) {
  return <button onClick={props.onClick}>{props.title}</button>;
}
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases
- Test error handling

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Update relevant documentation files
- Include examples where helpful

## Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer review required
3. Address review feedback
4. Maintainer will merge when approved

## Questions?

- Open a Discussion on GitHub
- Email: support@yourapp.com
- Check existing documentation

Thank you for contributing! 🎉
