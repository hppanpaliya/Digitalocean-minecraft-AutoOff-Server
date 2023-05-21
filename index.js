require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const socketIo = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
const defaultDropletId = process.env.DEFAULT_DROPLET_ID || "";

let timerId = null;
let remainingTime = 0;

app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const dropletId = req.query.dropletId || defaultDropletId;
  let status = "";
  let lastBootTime = "";
  if (dropletId) {
    status = await getDropletStatus(dropletId, process.env.DIGITALOCEAN_TOKEN);
    lastBootTime = await getDropletBootTime(dropletId, process.env.DIGITALOCEAN_TOKEN);
  }
  res.render("home", { dropletId, status, remainingTime, lastBootTime });
});

app.post("/control-droplet", (req, res) => {
  const dropletId = req.body.dropletId;
  const state = req.body.state;
  const timer = parseFloat(req.body.timer) || 60;

  if (state === "on") {
    turnOnDroplet(dropletId, process.env.DIGITALOCEAN_TOKEN);
    startTimer(timer);
  } else if (state === "off") {
    turnOffDroplet(dropletId, process.env.DIGITALOCEAN_TOKEN);
    stopTimer();
  }

  res.redirect(`/?dropletId=${dropletId}`);
});

app.post("/cancel", (req, res) => {
  const password = req.body.password;
  if (password === process.env.CANCEL_PASSWORD) {
    stopTimer();
  }
  res.redirect("/");
});
app.post("/increase", (req, res) => {
  // Increase the remainingTime by 15 minutes (900 seconds)
  remainingTime += 900;

  // Send the updated remaining time to the client
  io.emit("timer", remainingTime);

  // Redirect to the home page or any other desired page
  res.redirect("/");
});

app.post("/decrease", (req, res) => {
  // Decrease the remainingTime by 15 minutes (900 seconds)
  remainingTime -= 900;

  // Make sure the remainingTime does not go below zero
  remainingTime = Math.max(remainingTime, 0);

  // Send the updated remaining time to the client
  io.emit("timer", remainingTime);

  // Redirect to the home page or any other desired page
  res.redirect("/");
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

async function getDropletStatus(dropletId, token) {
  try {
    const response = await axios.get(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.droplet.status;
  } catch (error) {
    console.error("Error getting droplet status:", error);
  }
}

async function turnOnDroplet(dropletId, token) {
  try {
    const response = await axios.post(
      `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
      { type: "power_on" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Turned on droplet:", dropletId);
  } catch (error) {
    console.error("Error turning on droplet:", error);
  }
}

async function turnOffDroplet(dropletId, token) {
  try {
    const response = await axios.post(
      `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
      { type: "power_off" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Turned off droplet:", dropletId);
  } catch (error) {
    console.error("Error turning off droplet:", error);
  }
}

async function getDropletBootTime(dropletId, token) {
  try {
    const eventsResponse = await axios.get(`https://api.digitalocean.com/v2/droplets/${dropletId}/actions`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const actions = eventsResponse.data.actions;
    const rebootActions = actions.filter((action) => action.type === "power_off" || action.type === "power_on");

    if (rebootActions.length > 0) {
      const lastRebootAction = rebootActions[0];
      const bootStartTime = new Date(lastRebootAction.started_at);

      console.log(`Droplet ${dropletId} last booted at: ${bootStartTime}`);
      return bootStartTime;
    } else {
      console.log(`Droplet ${dropletId} has no reboot actions.`);
    }
  } catch (error) {
    console.error("Error retrieving droplet boot time:", error);
  }
}

function startTimer(hours) {
  remainingTime = hours * 60 * 60;
  timerId = setInterval(() => {
    remainingTime--;
    io.emit("timer", remainingTime);
    if (remainingTime <= 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
    remainingTime = 0;
    io.emit("timer", remainingTime);
  }
}
