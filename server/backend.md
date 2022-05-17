# Backend docs

## Welcome to the backend docs 💯

Stuff to know:

- Backend is built with [Nest.js](https://nestjs.com/)
- Nest.js is basically what Django is to Python. Like a thicc-er version of Express.
- Nest has 3 main types of files:
  - [Controller](https://docs.nestjs.com/controllers)
  - [Service (which are a type of Provider)](https://docs.nestjs.com/providers)
  - [Module](https://docs.nestjs.com/modules)
- We have 3 main modules, each containing at least 1 of each of the above types of files.
  - `src/sum` (The example one to look at if you haven't used Nest before.)
  - `src/auth` (Handles authentication with our )
  - `src/auto` (Handles auto-timetabling)

## Running the app

```bash
`npm run start:dev`
```

## Enviornment variables Required

```bash
OAUTH2_CLIENT_ID
OAUTH2_CLIENT_SECRET
OIDC_ISSUER_BASE_URL
OAUTH2_REDIRECT_URI
OAUTH2_SCOPES
SESSION_SECRET
PORT
```
