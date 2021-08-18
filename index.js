var express = require('express')
const http = require("http");
const multer = require('multer')
const connectDb = require('./src/config/connectDb');
var app = express()
const bodyParser = require("body-parser");
const UserController = require('./src/controllers/user.controller');
const middlewareAuthen = require('./src/middleware/middlewareAuthen');
const UploadImagesController = require('./src/controllers/upload-image.controller');
const server = http.createServer(app);
const chatModel = require('./src/models/test.model');

app.use(bodyParser.json());
require('dotenv').config();
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
connectDb()
var cors = require('cors');
const initSockets = require('./src/sockets');
app.use(cors())


const socketIo = require("socket.io")(server,{
  cors: {
    origin: "https://next-js-example-drab.vercel.app", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

initSockets(socketIo);

socketIo.on("connection", async  (socket) => {
  console.log("New client connected" + socket.id);
  socket.emit("sendId", socket.id);
  socket.emit("sendDataServer",  await chatModel.getChat());

  socket.on("sendDataClient", async function (data) {
    await chatModel.createChat(data);
    socketIo.emit("sendDataServer", await chatModel.getChat());
  })

  socket.on("sendUser", function (data) {
    socketIo.emit("sever_send_newuser", data);
  })

  socket.on("UserOnTyping", function (data) {
    socket.broadcast.emit("OnTyping", data);
  })

  socket.on("UserOffTyping", function (data) {
    console.log('off')
    socket.broadcast.emit("OffTyping", data);
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

socketIo.on('ping', () =>{
  console.log('ping')
})



// cloudinary.config({ 
//   cloud_name: 'dbatx6njd', 
//   api_key: '663658835846632', 
//   api_secret: '_aGORhENXP01KWy64f_h8hJAgeA' 
// });

app.get('/images/:name', UploadImagesController.pathImages);

const imageUploader = multer({ dest: 'images/' })

app.post('/uploadImages', imageUploader.single('images'), UploadImagesController.UploadImages)

app.post('/signup', UserController.signup)
app.post('/loginFb', UserController.loginFb)
app.post('/login', UserController.login)
app.post('/sendGmail', UserController.sendGmail)
app.put('/checkOTP', UserController.checkOTP)
app.put('/updateuser',middlewareAuthen.authenToken, UserController.UpdateUser)
app.post('/resetPassword', UserController.resetPassword)
app.post('/findUser', UserController.findUser)

server.listen(process.env.PORT || 5000, () => {
  console.log('Server đang chay tren cong 5000');
});
