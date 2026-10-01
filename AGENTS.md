# Repository Instructions & Workflow Rules

## Git & Deployment Rules
- **NEVER run `git commit` or `git push`**: Committing and pushing to git is ALWAYS performed manually by the user. The assistant must never execute `git commit` or `git push`.
- **Always Run Build Validation**: Running the build (`npm run build:all`) after making changes is mandatory to verify that both `apps/api` and `apps/web` compile cleanly with 0 TypeScript/Next.js errors.
