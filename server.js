const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

const port = process.env.PORT || 3003;

const sqlite3Functions = require("./api/sqlite3Generic");
const routes = require('./routes/routes.js');


// ---------------------
// Static files
// ---------------------
app.use(express.json());
app.use("/css", express.static(path.join(__dirname, "server/css")));
app.use("/html", express.static(path.join(__dirname, "server/html")));
app.use("/images", express.static(path.join(__dirname, "server/images")));

(async () => {
  try {

    // ---------------------
    // Socket.io - optional
    // ---------------------
    io.on("connection", (socket) => {
      console.log("Neuer Client verbunden:", socket.id);

      // Latest Versions
      socket.on("updateLatestVersions", async (data) => {
        console.log("Received updateLatestVersions:", data);
        socket.broadcast.emit("sendLatestVersionsUpdateConfirmation", data);
      });

      socket.on("disconnect", () => {
        console.log("Client getrennt:", socket.id);
      });
    });

    // Connect to database
    const db = await sqlite3Functions.connectToDatabase(path.join(__dirname, "server/db/main.db"));

    app.get('/', (req, res) => {
      res.send('Hello World')
    })


    server.listen(port, () => {
      console.log(`Server läuft auf localhost:3003`);
    });
  } catch (err) {
    console.error("Server-Init Fehler:", err);
  }
})();