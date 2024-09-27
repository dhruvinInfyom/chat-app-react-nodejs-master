const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: ["https://66f4fd8f9656ac6dbc583306--charming-bunny-b6774f.netlify.app", "http://192.168.10.74:5000", "http://localhost:3000", "https://db62-219-91-180-233.ngrok-free.app"],
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});




// const { google } = require('googleapis');

// // Load service account credentials
// const SERVICE_ACCOUNT = require('./notification-cf86e-firebase-adminsdk-oplmi-7debcde1f8.json');

// // Create an OAuth2 client
// const client = new google.auth.JWT(
//   SERVICE_ACCOUNT.client_email,
//   null,
//   SERVICE_ACCOUNT.private_key,
//   ['https://www.googleapis.com/auth/firebase.messaging']
// );

// // Get the token
// client.authorize((err, tokens) => {
//   if (err) {
//     console.error('Error getting OAuth2 token:', err);
//     return;
//   }
//   console.log('OAuth2 Token:', tokens.access_token);
// });
