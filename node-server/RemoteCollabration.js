// Import necessary modules
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
// const { userRouter } = require("./services/UsersManagement/users.routes");
// const { projectRouter } = require("./services/Projects/projects.routes");
// const { taskRouter } = require("./services/Tasks/tasks.routes");
// const { messageRouter } = require("./services/Message/message.routes");
// const {
//   notificationRouter,
// } = require("./services/Notifications/notification.routes");
// const schedule = require('node-schedule');
// const { notificationCronJob } = require("./CronJobs/Notification.CronJob");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const http = require("http");
var http2 = require("http").Server(app);

const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());

//  ****************************************************************

// cron jobs                         s  m h d mo dow
// let jobs = schedule.scheduleJob('  */5 * * *',()=>{
//   console.log('date', new Date())
//   // notificationCronJob()
// })

let users = {}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for chat messages
  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // Broadcast message to all users
  });
 // Store the user when they join
 socket.on("register_user", (username) => {
  users[username] = socket.id;
  io.emit("update_users", users); // Send updated user list to all clients

  console.log(`User registered: ${username} (ID: ${socket.id})`);
});

// Private message handling
socket.on("private_message", ({ sender, receiver, message }) => {
  const receiverSocketId = users[receiver];
console.log('msg',sender,message,receiver)
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receive_private_message", {
      sender,
      message,
    });
  } else {
    socket.emit("error_message", `User ${receiver} not found.`);
  }
});
  socket.on("disconnect", () => {
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        break;
      }
    }
    io.emit("update_users", users); 
    console.log(`User disconnected: ${socket.id}`);
  });
});
// Use routers
// app.use("/users", userRouter);
// app.use("/projects", projectRouter);
// app.use("/tasks", taskRouter);
// app.use("/messages", messageRouter);
// app.use("/notifications", notificationRouter);
app.get('/*',(req, res)=>{
  res.send('Welcome! to remote collabration')
})
// Start the server
// s
const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
