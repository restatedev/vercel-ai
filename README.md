This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
## Run the app
npm run dev

## Check you can see the UI in http://localhost:3000

## Register Restate services, in app/restate/[[...services]]/route.ts
restate deployments register http://localhost:3000/restate/v1 --use-http1.1

## Test the service
curl localhost:8080/Greeter/greet -H 'content-type: application/json' -d '"NextJS!"'
```
