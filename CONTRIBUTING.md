# Contributing to SE2-Zendata-HopePMS 🤝

Thank you for your interest in contributing to the **HopePMS** project! We welcome contributions from the Zendata team and other students.

## How to Contribute

### 1. Branching Strategy
We follow a feature-branching workflow. Please create a new branch for every feature or bug fix:
- `feature/your-feature-name`
- `fix/your-bug-fix-name`
- `chore/maintenance-tasks`

### 2. Development Workflow
1.  **Pull the latest changes:** Always start by pulling from the main development branch (`dev` or `main`).
    ```bash
    git pull origin dev
    ```
2.  **Create your branch:**
    ```bash
    git checkout -b feature/my-new-feature
    ```
3.  **Implement your changes:** Write clean, modular, and well-documented code.
4.  **Lint and Format:** Ensure your code follows the project's standards.
    ```bash
    npm run lint
    ```
5.  **Test your changes:** Run existing tests and add new ones if applicable.
    ```bash
    npm test
    ```
6.  **Commit your changes:** Use descriptive commit messages.
    ```bash
    git commit -m "feat: add audit trail to product updates"
    ```
7.  **Push and Create a Pull Request:** Push your branch and open a PR for review.

## Code Standards
- **TypeScript:** Use strict types. Avoid `any` whenever possible.
- **Components:** Keep components small and focused. Use functional components with hooks.
- **Styling:** Use Tailwind CSS utility classes. Follow the established design system.
- **Naming:** Use PascalCase for components and camelCase for functions/variables.

## Testing Guidelines
- We use **Vitest** for unit and integration testing.
- Ensure that new features have corresponding test cases.
- Run `npm run test:ui` to see a visual representation of your tests.

## Pull Request Guidelines
- Provide a clear description of the changes.
- Link any related issues or tasks.
- Include screenshots for UI changes if possible.
- Ensure all CI checks (linting, tests) pass before requesting a review.
