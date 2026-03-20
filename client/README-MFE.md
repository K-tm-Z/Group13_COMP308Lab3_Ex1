# Micro frontends (Module Federation)

## URLs

| App        | Dev port | Role                          |
|-----------|----------|-------------------------------|
| shell-app | 3000     | Host: loads remotes + router  |
| auth-app  | 3001     | Remote: signup / login / logout |
| engage-app| 3002     | Remote: news, discussions, help requests |

GraphQL (all apps): `http://localhost:4000/graphql` (API gateway)

Override with env: `VITE_GRAPHQL_URL`

## Run order

1. MongoDB + **auth** microservice (`4001`) + **engage** microservice (`4002`) + **gateway** (`4000`)
2. **auth-app**: `npm run dev` (in `client/auth-app`)
3. **engage-app**: `npm run dev` (in `client/engage-app`)
4. **shell-app**: `npm run dev` (in `client/shell-app`)

Open **http://localhost:3000**.

## Build

```bash
cd client/auth-app && npm install && npm run build
cd ../engage-app && npm install && npm run build
cd ../shell-app && npm install && npm run build
```
