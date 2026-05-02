# Contributing to Profanity Guard

First off, thank you for considering contributing! It’s people like you who make `profanity-guard` a reliable tool for everyone.

### How Can I Contribute?

#### 1. Adding New Words

Since we support 9+ languages, we rely on the community to keep our dictionaries accurate. If you notice a missing term:

- Locate the relevant file in `src/locales/` (e.g., `es.ts` for Spanish).
- Add the word to the array in alphabetical order.
- Ensure the word is "canonical" (lowercase, no extra symbols unless necessary).

#### 2. Reporting Bugs

If you find a "Scunthorpe problem" (a safe word being flagged) or a bypass that isn't caught:

- Open an Issue.
- Provide the specific string that caused the issue.
- Mention the language code used.

#### 3. Improving the Engine

If you have ideas to make the filter even faster or more accurate:

- Fork the repo.
- Create a new branch (`feat/your-feature-name`).
- **Important:** Run benchmarks before and after your changes. We prioritize O(1) performance.
- Submit a Pull Request.

### Development Setup

1. Install dependencies: `pnpm install`
2. Run tests: `pnpm run test`
3. Build the project: `pnpm run build`

### Pull Request Process

- Ensure all tests pass.
- Update the README if you are changing the API.
- The PR will be reviewed by maintainers before merging.
