# Current Deployment Status
- **Live URL**: https://play-qzv3.vercel.app
- **Platform**: Vercel
- **Repository**: https://github.com/vibeai-casv/PlayQzv3
- **Supabase Project**: PlayQz (hkqafdmneiwjgaijieac)
- **Last Updated**: 2025-11-29

# Deployment Guide

This guide outlines the steps to deploy the AI Quiz Application to production.
 
## 1. Environment Variables

Ensure the following environment variables are set in your deployment environment (e.g., Vercel, Netlify).

### Client (`client/.env`)
These are required for the React application to connect to Supabase.
- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.

### Supabase Edge Functions
These are managed via the Supabase CLI or Dashboard.
- `ANTHROPIC_API_KEY`: Required for the `generate-questions` function.

To set the secret for Edge Functions:
```bash
npx supabase secrets set ANTHROPIC_API_KEY=your_api_key
```

## 2. Build Process

The application is built using Vite. The build process includes:
1.  **Type Checking**: `tsc` ensures type safety.
2.  **Linting**: `eslint` checks for code quality issues.
3.  **Bundling**: Vite bundles the application into the `dist` directory.

To build locally:
```bash
cd client
npm run build
```

## 3. Deployment Options

### Vercel (Recommended)
1.  Push your code to a GitHub repository.
2.  Log in to Vercel and "Add New Project".
3.  Import your repository.
4.  Configure the project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `client`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Add Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
6.  Click **Deploy**.

### Netlify
1.  Push your code to GitHub.
2.  Log in to Netlify and "New site from Git".
3.  Connect your repository.
4.  Configure build settings:
    *   **Base directory**: `client`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  Add Environment Variables in "Site settings" > "Build & deploy" > "Environment".
6.  Deploy site.

## 4. Post-Deployment

### Custom Domain
*   Configure your custom domain in your hosting provider's dashboard (Vercel/Netlify).
*   Update the DNS records as instructed by the provider.

### Supabase CORS
*   Go to your Supabase Dashboard > Authentication > URL Configuration.
*   Add your production URL (e.g., `https://your-app.vercel.app`) to "Site URL" and "Redirect URLs".

### Monitoring
*   **Vercel Analytics**: Enable in the Vercel dashboard for performance insights.
*   **Supabase Monitoring**: Check the "Reports" section in Supabase for database and API usage.

### Database Backups
*   Supabase provides automatic daily backups for Pro plans.
*   For manual backups, use the CLI:
    ```bash
    npx supabase db dump -f backup.sql
    ```

## 5. CI/CD Pipeline

A GitHub Actions workflow has been set up in `.github/workflows/ci.yml`.

*   **Triggers**: Pushes and Pull Requests to the `main` branch.
*   **Jobs**:
    *   Installs dependencies.
    *   Runs Linting (`npm run lint`).
    *   Runs Type Checking (`npx tsc`).
    *   Builds the application (`npm run build`).

This ensures that no broken code is merged into the main branch. Deployments to Vercel/Netlify are typically handled automatically via their GitHub integrations upon merging to `main`.
