const http = require("http");
const WebSocketServer = require("websocket").server;

const fs = require("fs"); // Allows for reading from your file system
const path = require("path"); // Allows for constructing file paths

const port = process.env.PORT || process.env.NODE_PORT || 3000;
//const port = 3000;

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    // if the upload stream errors out, throw an error
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });


    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      // combine our byte array (using Buffer.concat) and convert it to a string value 
      const bodyString = Buffer.concat(body).toString();
      // Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);
      // pass to our addUser function
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  // route to correct method based on url

  // grab the 'accept' headers (comma delimited) and split them into an array
  const acceptedTypes = request.headers.accept.split(',');

  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else {
    jsonHandler.notFound(request, response, acceptedTypes);
  }
};

const onRequest = (request, response) => {
  // parse url into individual parts
  // returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  // check if method was POST
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};


// Create the Node HTTP server environment and listen for connections on port 1234
const server = http.createServer(function(request, response) {
// Handle HTTP GET method requests
if (request.method === "GET") {
  // Handle requests to the / URL
  if (request.url === "/") {
   // Read in HTML file from the file system to be sent to the client
   fs.readFile(path.join(__dirname, "client/client.html"), function(error, file) {
    // Handle possible error in reading file
    if (error) {
     response.statusCode = 500;
     response.statusMessage = "Internal Server Error";
     response.end(`${response.statusCode}: ${response.statusMessage}`);
     return;
    }
    // If no error, send the file
    response.end(file);
   });
  // Handle requests to URLs that don't exist
  } else {
   response.statusCode = 404;
   response.statusMessage = "Not Found";
   response.end(`${response.statusCode}: ${response.statusMessage}`);
  }
// Handle requests to HTTP methods not supported
} else if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });
    
} else {
  response.statusCode = 405;
  response.statusMessage = "Method Not Allowed";
  response.end(`${response.statusCode}: ${response.statusMessage}`);
}
    
});


// Create the Web Socket server from the Node HTTP server.
const wsServer = new WebSocketServer({httpServer : server});

// Keep track of the clients connected to the server.
let count = 0;
let clients = {};

// Listen for Events emitted from clients.
// Handle when a client requests for a connection to the server.
wsServer.on("request", function(request) {

	const connection = request.accept(null, request.origin);

	// use the count for the ID of the client connecting client.
	const clientId = count++;

	// store the connection
	clients[clientId] = connection;
	console.log(`${new Date()}: Active User: ${clientId}`);
    
    //document.getElementById("manyUsers") = clientID;
    //manyUser(clientId);
	// On Message event
	// When a client sends a message.
	connection.on("message", function(message) {
		// Extract the message text from the data sent from the client.
		const msgString = message.utf8Data;
		
		// Forward on that message to each of the other clients connected to the server.
		for (const clientId in clients) {
			clients[clientId].sendUTF(msgString);
		}
	});

	// On Close event
	// When a client disconnects, remove them from the list of connected clients.
	connection.on("close", function(reasonCode, description) {
		delete clients[clientId];
		console.log(`${new Date()}: Connection closed by user ${clientId} from ${connection.remoteAddress}`);
	});
});


server.listen(port, function() { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	console.info(`Listening on 127.0.0.1: ${port}`);
});



//http.createServer(onRequest).listen(port);

//console.log(`Listening on 127.0.0.1: ${port}`);
