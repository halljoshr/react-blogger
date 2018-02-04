const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const port = process.env.PORT || 8080;
const version = require('../package.json').version;
const publicPath = path.join(__dirname, '../public');
const db = path.join(__dirname, '../fakeDB.json');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const fs = require('fs');

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`Started trade reports V${version} on port ${port}`);
});

io.on('connection', (socket) => {
  fs.readFile(db, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data);
      socket.emit('loadingPosts', obj, () => {
        console.log("emitted loadingPosts");
      })
    }
  });

  socket.on('signup', (dataNew, callback) => {
    fs.readFile(db, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        console.log(dataNew);
        obj = JSON.parse(data); 
        console.log(obj);
        obj.users.push({ 
          email: dataNew.email, 
          password: dataNew.password, 
          username: dataNew.username 
        }); 
        json = JSON.stringify(obj); 
        fs.writeFile(db, json, 'utf8', callback); 
      }
    });
    console.log("wrote to file");
    callback();
  });

  socket.on("createPost", (dataNew, callback) => {
    console.log(dataNew);
    fs.readFile(db, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        console.log(dataNew);
        obj = JSON.parse(data);
        console.log(obj);
        obj.posts.push({
          postTitle: dataNew.postTitle,
          postImg: dataNew.postImg,
          postText: dataNew.postText,
          comments: []
        });
        json = JSON.stringify(obj);
        fs.writeFile(db, json, 'utf8', callback);
      }
    });
    callback();
    socket.emit("addingPost", obj, () => {
      console.log("emitted addingPost");
    })
  })

  socket.on('login', (dataNew, callback) => {
    fs.readFile(db, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        console.log(dataNew);
        obj = JSON.parse(data);
        console.log(obj);
        for (let i = 0; i < obj.users.length; i++) {
          console.log(dataNew.email, obj.users[i].email);
          console.log(dataNew.password, obj.users[i].password)
          if (dataNew.email === obj.users[i].email && 
              dataNew.password === obj.users[i].password) {
            console.log('Got Here!');
            callback();
            socket.emit('loggingIn', { username: obj.users[i].username }, () => {
              console.log('Emitted Logging In');
              callback();
            });
            break;
          }
        }
      }
    });
  });

  socket.on("addComment", (dataNew, callback) => {
    console.log(dataNew);
    fs.readFile(db, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        console.log(dataNew);
        obj = JSON.parse(data);
        console.log(obj);
        let comment = { 
          commentUser: dataNew.commentUser, 
          commentMessage: dataNew.commentMessage
        };
        for (let i = 0; i < obj.posts.length; i++) {
          if (obj.posts[i].postTitle === dataNew.postTitle) {
              obj.posts[i].comments.push(comment);
          }
        }
        json = JSON.stringify(obj);
        fs.writeFile(db, json, 'utf8', callback);
        socket.emit('addingComment', comment, () => {
          console.log('emitted addingComment');
          callback();
        });
      }
    });
    callback();
  });




});
