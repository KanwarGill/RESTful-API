// Imports 
var http = require('http');
var fs   = require('fs');
var path = require('path');
var url  = require('url');


// Set PORT number for server
var PORT = 41205;

// Load JSON file
var file = JSON.parse(fs.readFileSync('favs.json','utf8'));

var mime = {
  'html': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'txt': 'text/plain'
};


// This function doesn't do much. It really is the "identity" function
// Object -> Object
function getTweets(json) { return json; }

// Gets a specific tweet by given id in the url
// String -> Object -> Object
function getTweet(json, url) {
    if (url.query.id) {
	return json.filter(function (obj){ return obj.id == url.query.id; });
    }
}

// Gets all the users.
// Object -> Object
function getUsers(json) {  return json.map(function (obj){ return obj.user; } ); }

// Gets a specific tweet by given id in the url
// String -> Object -> Object
function getUser(json, url) {
    if (url.query.id) {
	return getUsers(json).filter(function (obj){ return obj.id == url.query.id; });
    }
}

// Gets Extlinks
// Object -> Object
function getExtlinks(json) {

    var links = json.map(
	function (obj) {
	    return obj.entities.urls.map(
		function (el) { 
		    el.tweet_id = obj.id; 
		    el.user_id = obj.user.id;
		    el.profile_image_url = obj.user.profile_image_url;
		    el.screen_name = obj.user.screen_name;
		    return el;
		});
	}); 
    return  [].concat.apply([], links);
}

//Get a file specified by url
// String -> Object -> Object 
function getFile(json, url) {

    try { 
	return fs.readFileSync("." + url.pathname);
    } catch (err) {
	//Don't do anything
	console.log("Coudnt read file" + err);
    }
}

// For every tweet get location of if available
// String -> Object -> [String]
function getLocation(json, url){
    
    var validTweets = json.filter(function (obj) {return obj.geo != null;});
    return validTweets.map(
	function(obj){ 
	    var coord = obj.geo.coordinates;
	    return {url: "https://maps.google.ca/maps?q=" + coord[0] + "," + coord[1],
		    user_id: obj.user.id,
		    profile_image_url: obj.user.profile_image_url,
		    screen_name: obj.user.screen_name};
	});

}

// End of Controller Functions


// A JSON wrapper for various functions above.
// [function] -> [function]
function json(func) {  
    return function(json, url){ 
	return JSON.stringify(func(json, url), null, 2); 
    }; 
}

// Routes for our handler
var routes = { GET: { api: { tweets: json(getTweets),
			     tweet: json(getTweet) ,
			     users:  json(getUsers) ,   
			     user:   json(getUser) ,
			     extlinks:  json(getExtlinks),
			     location: json(getLocation)
			   },
		      js:  getFile,
		      css:  getFile,
		      "index.html":  getFile
		    }};



// Takes url and routes and return the appropriate function to execute otherwise undefined
// String -> Object -> Object
function handler(url, routes) {
    if (typeof routes == 'function' || !routes){
	return routes;
    } 
    return handler(url.slice(1), routes[url[0]]);
}



// Now we start the server
http.createServer(function (req, res) {
    
    console.log(req.method + " " + req.url);
    
    if (req.url == "/") {
	req.url += "index.html";
    }

    var parsedUrl = url.parse(req.url, true);
    var urlArray = parsedUrl.pathname.split('/').slice(1);
    var mimeType = mime[parsedUrl.pathname.split('.').slice(-1)];
    

    var func = handler(urlArray, routes[req.method]);
    var data;


    if (func) { 
	data = func(file,parsedUrl);
	if (data) {
	    res.writeHead(200, {"Content-Type": mimeType});
	    res.write(data);
	    res.end();
	    return;
	}
    }
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");       
    res.end();
	
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT + '/');
