# To run the project:

## Frontend:
Terminal 1 - auth-microfrontend:
```bash
cd client/auth-app/
npm install
npm run deploy
```
Terminal 2 - engage-microfrontend:
```bash
cd client/engage-app/
npm install
npm run deploy
```
Terminal 3 - shell-app:
```bash
cd client/shell-app/
npm install
npm run dev
```

## Backend
Terminal 4 - auth-microservice:
```bash
cd server/microservice/auth-service/
npm install
node auth-microservice.js
```
Terminal 5 - engage-microfrontend:
```bash
cd server/microservice/engage-service/
npm install
node engage-microservice.js
```
Terminal 6 - shell-app:
```bash
cd server/
npm install
node gateway.js
```

## In case you got stuck with a Port being occupied:
```cmd
netstat -ano | findstr :<Port number>
```
it will return something like
```cmd
TCP    0.0.0.0:<Port number>    0.0.0.0:0    LISTENING    <PID>
```
then, using the PID to force it to stop
```cmd
taskkill /PID <PID> /F
```
