# Running Cypress testing
This requires multiple terminals open, run `pnpm i` if packages haven't been installed

## In the backend
Switch to the server directory by `cd server`

Run `pnpm run start`

## In the frontend
Switch to the server directory by `cd client`

Run `pnpm start`

## For the database
In my device, but this can vary across different devices. Open Docker and run `docker compose up database-new`

TBD

## For the actual test terminal
Switch to the server directory by `cd client`

Run `pnpm exec cypress open`