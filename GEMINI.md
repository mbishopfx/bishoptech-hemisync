# Hemisync Build & Deployment Workflow

- **No Local Builds:** Do NOT run `npm run build` or local build processes for this project. The local machine has memory constraints, and local builds will clog it up.
- **Validation via CI/CD:** To validate your changes, always commit and push them to the GitHub repository (`main` branch).
- **Vercel CLI:** After pushing, use the Vercel CLI (e.g., `vercel ls` or `vercel inspect`) to check the remote deployment status and confirm the build succeeded on Vercel's infrastructure.