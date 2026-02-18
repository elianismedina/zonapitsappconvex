---
title: Use .env.local for Local Secrets
impact: HIGH
impactDescription: security, prevents secret leaks in git
tags: env, security, secrets
---

## Use .env.local for Local Secrets

Store local development secrets in `.env.local` (gitignored), not in `.env`.
`.env` should only contain non-sensitive defaults.

**Incorrect: secrets in .env (committed)**

```
# .env - DON'T COMMIT SECRETS
EXPO_PUBLIC_API_KEY=sk-1234567890abcdef
EXPO_PUBLIC_SECRET=super-secret-value
```

**Correct: defaults in .env, secrets in .env.local**

```
# .env - committed defaults
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# .env.local - gitignored, local secrets
EXPO_PUBLIC_API_KEY=sk-local-dev-key
```

**Correct: .env.example for documentation**

```
# .env.example - committed, shows what's needed
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_KEY=your-api-key-here
```

Reference: [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)