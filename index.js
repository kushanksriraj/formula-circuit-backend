const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
app.use(cors());
 
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', function(socket) {
  console.log("Connected")
});

app.use(bodyParser.json());

const PORT = 3000;

const connectDB = require('./db/db.connect');
const userRouter = require('./router/user.router');
const postRouter = require('./router/post.router');
const feedRouter = require("./router/feed.router");
const notificationRouter = require("./router/notification.router");
const searchRouter = require("./router/search.router");

connectDB();

const { Notification } = require("./model/notification.model")
const changeStream = Notification.watch();

changeStream.on("change", async (change) => {

  const id = change.fullDocument._id
  const notif = await Notification.findById(id).populate({ path: "actionCreatorId", select: "_id name username" });

  io.emit("changeData", notif)
})

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/feed", feedRouter);
app.use("/notification", notificationRouter);
app.use("/search", searchRouter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Refer to the API docs at github.com/kushanksriraj/formula-circuit"
  });
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Undefined endpoint!"
  });
})

server.listen(PORT, () => {
  console.log('Server started');
});
