var static = require('node-static');
var http = require('http');
var file = new (static.Server)();
var app = http.createServer(function(req, res) {
	file.serve(req, res);
}).listen(8080);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {

	function log() {
		var array = [">>> "];
		for (var i = 0; i < arguments.length; i++) {
			array.push(arguments[i]);
		}
		socket.emit('log', array);
	}


	socket.on('message', function(data) {
		log('Got message: ', data);
		socket.broadcast.to(data.room).emit('message', data.message);
		// should be room only
	});

	socket.on('overandout', function(room) {
		log('Left room: ', room);
		socket.broadcast.to(room).emit('message', 'overandout');
		socket.leave(room);
	});

	socket.on('create or join', function(room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0) {
			socket.join(room);
			socket.emit('created', room);
		} else if (numClients == 1) {
			io.sockets.in (room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} else {// max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});

