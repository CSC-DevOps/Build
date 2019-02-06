//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('Building: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

var exec = require('child_process').exec;
var cmd = 'YOUR docker command';

function handleRequest(request, response)
{
	console.log("Request received");

	var child = exec(cmd, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr) 
	{
		if( error )
      	    console.log(error)
	});

	// Stream results
	child.stdout.pipe( response );
	child.stderr.pipe( process.stderr );

	child.on('exit', function()
	{
   	    console.log('built');
   	    return true;
	});
}
