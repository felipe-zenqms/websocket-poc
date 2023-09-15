
require('dotenv').config()

const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const path = require('path')
const { Kafka } = require('kafkajs')
const { runConsumer } = require('./consumer')
const jwt = require('jsonwebtoken');

const kafka = new Kafka({
  clientId: 'websocket-poc',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
})

const consumer = kafka.consumer({ groupId: 'websocket-poc' })
const producer = kafka.producer()

const notify = (id, message) => {
  console.warn(`${new Date().toISOString()} - Emitting message to socket with id: ${id} and value: ${JSON.stringify(message)}`)
  io.emit(id, message)
}

runConsumer(consumer, notify).catch(err => console.log(err))

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, `index.html`));
});

// Produces a message on kafka which will be resposible to emit the message to the socket
app.post('/kafka/:id', async (req, res) => {
  try {
    const msg = { id: req.params.id, value: req.body }

    console.warn(`${new Date().toISOString()} - Posting message to Kafka! id: ${msg.id} value: ${JSON.stringify(msg.value)}`)

    await producer.connect()
    await producer.send({
      topic: 'websocket-poc',
      messages: [
        { value: JSON.stringify(msg) },
      ],
    })

    return res.send(msg).status(200)
  }
  catch(err) {
    console.error(err)

    return res.send(err).status(500)
  }
});

// Recieve the post request and emits the message to the socket directly
app.post('/:id', async (req, res) => {  
  try{
    const msg = { id: req.params.id, value: req.body }
    console.warn(`${new Date().toISOString()} - Posting message directly! id: ${msg.id} value: ${JSON.stringify(msg.value)}`)

    notify(msg.id, msg.value)

    return res.send(msg).status(200) 
  }
  catch(err) {
    console.error(err)

    return res.send(err).status(500)
  }
});

const getAuthToken = (headers) => {
  return headers?.authorization?.split(' ')?.[1]
}

io.use((socket, next) => {
  const token = getAuthToken(socket.handshake.headers)
  if (token){
    jwt.verify(token, process.env.SECRET || 'websocketsecret', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }    
})
.on('connection', (socket) => {
  console.log('New socket connected')
});

http.listen(port, host, () => {
  console.warn(`WebSocket up and is Running`);
  console.warn(`You can access the UI by going to http://${host}:${port}`)
});
