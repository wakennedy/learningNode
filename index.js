let http = require("http");
let fs = require("fs");
let path = require("path");
let API = require("./api.js");

const ip = "127.0.0.1";
const port = 3000;

//Create Server using http module, and wait for response:
http
  .createServer(function (request, response) {
    //print request object, just for fun
    console.log("request ", request);
    //Add . to URL to convert it to local file path
    let file = "." + request.url;
    // Redirect / to serve index.html
    if (file == "./") file = "./index.html";
    //extract requested file's extensions;
    let extension = String(path.extname(file)).toLowerCase();
    //define acceptable file extensions
    let mime = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
    };
    //if requested file type is not in mime, default
    // to octet-stream which means "arbitrary binary data."
    let type = mime[extension] || "application/octet-stream";

    //read the file from the hard drive
    fs.readFile(file, function (error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          // IS this an API call, or should we serve a file?
          if (API.catchAPIrequest(request.url))
            response.end(API.exec(request.url), "utf-8");
          //Not and API call - file just doesn't exist
          else
            fs.readFile("./404.html", function (error, content) {
              response.writeHead(200, { "Content-Type": type });
              response.end(content, "utf-8");
            });
        } else {
          response.writeHead(500);
          response.end("Error: " + error.code + "\n");
          response.end();
        }
      } else {
        response.writeHead(200, { "Content-Type": type });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(port, ip);

//display the server is runing msg
console.log("Running at " + ip + ":" + port + "/");
