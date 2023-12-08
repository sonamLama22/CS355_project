const fs = require("fs");
const http = require("http");
const https = require("https");
const port = 3000;
const url = require("url");
const server = http.createServer();

const { omdb_apiKey } = require("./auth/omdb_apikey");
const { watchmode_apiKey } = require("./auth/watchmode_apikey");

server.on("listening", listen_handler);
server.listen(port);
function listen_handler() {
  console.log(`Now listening on port ${port}`);
}

server.on("request", request_handler);
function request_handler(req, res) {
  console.log(`New request for ${req.url} from ${req.socket.remoteAddress}`);

  if (req.url === "/") {
    const main = fs.createReadStream("html/index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    main.pipe(res);
  } else if (req.url.startsWith("/search")) {
    let { movie } = url.parse(req.url, true).query;
    get_info(movie, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(`<h1>404 Not Found</h1>`);
  }
}

function get_info(movie, res) {
  const omdb_endpoint = `https://www.omdbapi.com/?apikey=${omdb_apiKey}&t=${encodeURIComponent(
    movie
  )}`;
  const omdb_request = https.request(omdb_endpoint, {
    method: "GET",
  });

  omdb_request.once("response", process_stream);
  function process_stream(movie_stream) {
    let movie_data = "";
    movie_stream.on("data", (chunk) => {
      movie_data += chunk;
    });
    movie_stream.on("end", () => serve_results(movie_data, res));
  }

  function serve_results(movie_data, res) {
    let movie_object = JSON.parse(movie_data);
    let movie_name = movie_object.Title;
    let movie_year = movie_object.Year;
    let imdbID = movie_object.imdbID;
    let movie_poster = movie_object.Poster;
    let genre = movie_object.Genre;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<img src="${movie_poster}"/>
        <h3> Movie Title: ${movie_name} 
        <br/> Year: ${movie_year}
        <br/> Genre: ${genre}
        <br/> imdbID: ${imdbID} </h3> `
    );
  }

  omdb_request.end();

  const watchmode_endpoint = `https://api.watchmode.com/v1/title/${imdbID}/sources?apiKey=${watchmode_apiKey}`;
  const watchmode_request = https.request(watchmode_endpoint, {
    method: "GET",
  });
}
