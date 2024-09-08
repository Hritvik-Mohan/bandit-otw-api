const express = require('express');
const { Server } = require('socket.io');
const pty = require('node-pty');
const ssh2 = require('ssh2');

const app = express();
const server = require('http').createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    let sshConn;

    // Create SSH connection
    socket.on('startSSH', (data) => {
        sshConn = new ssh2.Client();
        sshConn.on('ready', () => {
            sshConn.exec('bash', (err, stream) => {
                if (err) throw err;

                // Send terminal output to the frontend
                stream.on('data', (data) => {
                    socket.emit('output', data.toString());
                });

                // Recieve terminal input from frontend and pass to SSH session
                socket.on('input', (inputData) => {
                    stream.write(inputData);
                });
            });
        }).connect({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password, // Password for the Bandit level
        })

        socket.on('disconnect', () => {
            if (sshConn) sshConn.end();
        })
    });


})


server.listen(3000, () => console.log("Server running at port 3000"))