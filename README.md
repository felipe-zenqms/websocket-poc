# WebSocket POC 

This POC was created to validate the solution of using a WebSocket + Kafka + JWT Authentication

## HOW TO

### Prepare

- Configure your `.env` if you want

- Create a JWT token with your `SECRET` on https://jwt.io

- run `npm start`

### Test
- go to [`http://localhost:3000`](http://localhost:3000) on your browser

- Set an ID and your `token`

- Click Connect

- Post new messages using the `postman_collection.json`
    - You can post messages using Kafka or directly to the WebSocket
    - Set the ID on params to send message to the correct socket

- Check the messagens on your browser

- You can open different browser tabs connecting with different IDs to validate the sockects communication
