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
    get_movieInfo(movie, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(`<h1>404 Not Found</h1>`);
  }
}

function get_movieInfo(movie, res) {
  //base case
  if (movie.Response === "True") {
    console.log("After omdb");
    const imdbID = movie.imdbID;
    // console.log(imdbID);
    const watchmode_endpoint = `https://api.watchmode.com/v1/title/${imdbID}/sources?apiKey=${watchmode_apiKey}`;
    const watchmode_request = https.request(watchmode_endpoint, {
      method: "GET",
    });
    watchmode_request.once("response", (stream) =>
      process_stream(stream, parse_streamingData, res)
    );
    watchmode_request.end();
  } else {
    console.log("1st call to OMDB");
    const omdb_endpoint = `https://www.omdbapi.com/?apikey=${omdb_apiKey}&t=${encodeURIComponent(
      movie
    )}`;
    const omdb_request = https.request(omdb_endpoint, {
      method: "GET",
    });

    omdb_request.once("response", (stream) =>
      process_stream(stream, parse_movieData, res)
    );
    omdb_request.end(); // sends response
  }
}

function process_stream(movie_stream, callback, res) {
  let movie_data = "";
  movie_stream.on("data", (chunk) => {
    movie_data += chunk;
  });
  movie_stream.on("end", () => callback(movie_data, res));
}

function parse_movieData(movie_data, res) {
  let movie_object = JSON.parse(movie_data);
  let movie_name = movie_object.Title;
  let movie_year = movie_object.Year;
  let imdbID = movie_object.imdbID;
  let movie_poster = movie_object.Poster;
  let genre = movie_object.Genre;
  // console.log(movie_object.Response);

  let results = `<img src="${movie_poster}"/>
        <h3> Movie Title: ${movie_name} 
        <br/> Year: ${movie_year}
        <br/> Genre: ${genre}
         `;

  results = `<div style="width:49%; float:left;">${results}</div>`;
  res.write(results.padEnd(1024, " "));
  get_movieInfo(movie_object, res);
}

function parse_streamingData(streaming_data, res) {
  // console.log("received watchmode response");
  let streaming_object = JSON.parse(streaming_data);

  console.log(streaming_object.length);

  let results = streaming_object.map(generate_streaming_info).join("");
  if (streaming_object.length === 0) {
    results = "<h1>Not available for streaming</h1>";
  } else {
    results = `<h1>Available on:</h1><ul>${results}</ul>`;
  }
  results = `<div style="width:49%; float:right;">${results}</div>`;
  res.write(results.padEnd(1024, " "));
  res.end();

  function generate_streaming_info(link) {
    let streaming_platform = link?.name;
    let url = link?.web_url;
    let price = link?.price;
    let format = link?.format;
    let type = link?.type;

    return `<li>
    <a href="${url}" target="_blank" > ${streaming_platform} </a> <p>Type: ${type}, Format: ${format}, Price : ${
      price ? price : "Subscription only"
    } </p> </li>`;
  }
}
