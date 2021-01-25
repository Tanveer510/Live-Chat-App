var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket = require('socket.io');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Socket Functioning
var io = socket();
app.io = io;


let liveUsers = [];

function formatMessage(user,text){
  return {
    user,
    text
  }
}

//Function to make the list of live users
function addUser(username,id){
  let x = {username,id}
  liveUsers.push(x); 
  return liveUsers;
}

//Function for User Leaving
function userLeave(id) {
  const index = liveUsers.findIndex(user => user.id === id);

  if (index !== -1) {
    return liveUsers.splice(index, 1)[0];
  }
}

const botname = "ChatBot";

io.on('connection',(socket)=>{

  //For the Live User
  socket.on("joinedUser",(liveUser)=>{

    let lu = addUser(liveUser,socket.id);

    //Welcome Message
    socket.emit('message',formatMessage(botname,`Welcome Sir, ${liveUser}`));

    //For telling that the other user is online
    socket.broadcast.emit('message',formatMessage(botname,`${liveUser} is also online right now`));

    //Emitting the liveUsersArray i.e, the list of users who are active
    io.emit("liveUserArray",liveUsers);

    //For the Entered Message
    socket.on("chatMsg",(theMsg)=>{
      socket.emit("message",formatMessage("You",theMsg));
      socket.broadcast.emit("message",formatMessage(liveUser,theMsg));
    });

  });  

  //For Disconnecting
    socket.on('disconnect',()=>{
      const user = userLeave(socket.id);
      if (user) {
      io.emit(
        'message',
        formatMessage(botname, `${user.username} has left the chat`)
      );

      //Emitting the liveUsersArray i.e, the list of users who are active
      io.emit("liveUserArray",liveUsers);

  }
});

});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
