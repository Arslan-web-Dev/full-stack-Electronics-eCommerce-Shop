# Security and Ownership Checklist

Use this checklist when taking over or rebranding the project.

## Access Control

- Confirm the Git remote points to your repository:

```bash
git remote -v
```

- Remove old collaborators from the GitHub repository settings if they should not have access.
- Rotate any shared database, Supabase, email, payment, storage, or deployment keys.
- Create your own MongoDB database and use your own `DATABASE_URL`.
- Create your own Supabase project and use your own Supabase URL and keys.
- Do not commit real `.env` files.

## Local Files

- Keep `.env.example` files as placeholders only.
- Check that `.env` and `server/.env` are ignored by Git.
- Run a secret search before pushing:

```bash
rg -n "mongodb\\+srv|supabase\\.co|service_role|secret|token|password|DATABASE_URL|SUPABASE" -g "!node_modules" -g "!*.lock"
```

## GitHub Repository

- Set the repository owner to your GitHub account or organization.
- Update repository description, topics, and README.
- Review branch protection, deploy keys, GitHub Actions secrets, and webhooks.

## Deployment

- Use your own Vercel/hosting project.
- Replace all environment variables in the hosting dashboard.
- Remove old deployment integrations and webhooks that belong to another account.

## License

- This project contains an MIT license. Keep required copyright notices.
- Add your own copyright/notice only for your own changes.
