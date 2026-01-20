import express from "express";
import { createServer } from "http";
import { StatusCodes } from "http-status-codes";
import { Server } from "socket.io";
import { Client, ConnectionType } from "./models/connection.js";
import {
  DroneGoToLocationCommand,
  DroneInformation,
  DroneReturnToHomeCommand,
  DroneStopCommand,
  DroneVideoCommand,
  DroneWayPointMissionCommand
} from "./models/drone.js";
import { Error } from "./models/error.js";
import { DRONE, DRONE_DISCONNECT, DRONE_VIDEO_DATA, DRONE_GOTO_LOCATION, DRONE_REQUEST_GOTO_LOCATION, DRONE_REQUEST_RTH, DRONE_REQUEST_STOP, DRONE_REQUEST_WAYPOINT_MISSION, DRONE_RTH, DRONE_STOP, DRONE_WAYPOINT_MISSION, ERROR, EVENT, ADD_DRONE_TO_VIDEOSCREEN, REMOVE_DRONE_TO_VIDEOSCREEN, DRONE_CONTROLLER_COLOR, WEBRTC } from "./utils/socket-names.js";
import { acquireColor, getColor, releaseColor } from "./models/color.js";
import bodyParser from "body-parser";
import cors from "cors";
import appConfig from "../config/app.json" assert { type: "json" };

const PORT = process.env.PORT || appConfig.app_port;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req: any, resp: any, next: any) => {
  resp.header("Access-Control-Allow-Origin", "*");
  resp.header("Access-Control-Allow-Headers", "X-Requested-With, privatekey");
  resp.header("Access-Control-Allow-Methods", "GET, POST", "PUT", "DELETE");
  resp.setHeader('content-type', 'application/json; charset=utf-8');
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let clients: Client[] = [];

io.on("connection", (socket) => {
  console.log("Client connected: " + socket.id);
  // We assume its a normal client in the start
  clients.push({
    id: socket.id,
    connectionType: ConnectionType.WEB,
    drone: null,
  });
  console.log("Current clients", clients);

  // DISCONNECT
  socket.on("disconnect", () => {
    let connection = clients.find((e) => e.id === socket.id);
    if (!connection) return;
    console.log(`Client ${connection.id} (${connection.connectionType}) disconnected`);
    clients = clients.filter((e) => e !== connection);

    if (connection.connectionType === ConnectionType.DRONE) {
      // We need to let the clients known that the drone has gone offline
      socket.broadcast.emit(DRONE_DISCONNECT, JSON.stringify(connection));
      releaseColor(connection.drone?.id);
    }
  });

  socket.on(WEBRTC, (receiver: string, msg: object) => {
    let from_id = socket.id;
    socket.to(receiver).emit(WEBRTC, from_id, msg);
    console.log("webrtc_msg: " + msg + " from " + from_id + " to " + receiver);
  });

  // ERROR SOCKETS
  socket.on(ERROR, (error: string) => {
    const drone = clients.find((e) => e.id === socket.id)?.drone || null;
    socket.broadcast.emit(
      ERROR,
      JSON.stringify({
        content: error,
        droneId: drone?.id,
      } as Error)
    );
  });

  // EVENT SOCKET
  socket.on(EVENT, (event: any) => {
    try {      
      // Convert imageArray to Buffer if it exists
      if (event.imageArray) {
        const imageBuffer = Buffer.from(event.imageArray, 'base64');
        // Replace imageArray with the buffer for broadcasting
        event.imageBuffer = imageBuffer;
        delete event.imageArray; // Remove the base64 string to save bandwidth
      }
      
      console.log("Event received and processed");
      socket.broadcast.emit(EVENT, JSON.stringify(event));
    } catch (err) {
      console.error("Failed to process event:", err);
    }
  });

  // DRONE SOCKETS
  // Drone information
  socket.on(DRONE, (drone: string) => {
    let droneInformation = JSON.parse(drone) as DroneInformation;
    // Find the corresponding connection and mark it as a drone
    let connection = clients.find((e) => e.id === socket.id);

    if (connection && connection.connectionType != ConnectionType.DRONE) {
      connection.connectionType = ConnectionType.DRONE;
      droneInformation.droneColor = acquireColor(droneInformation.id);

      // Emit color to controller
      socket.emit(DRONE_CONTROLLER_COLOR, {"droneColor": "#" + droneInformation.droneColor});

      connection.drone = droneInformation;
      console.log(`Client ${connection.id} has been marked as drone with color: ${connection.drone.droneColor}`);
      console.log(droneInformation);
    }

    // Overwrite leader status from server
    if (connection) {
      droneInformation.isLeader = connection.drone!.isLeader;
    }

    const targetClient = clients.find(
      (e) => e.drone?.id === droneInformation.id
    );

    droneInformation.socketId = targetClient?.id;

    // Fetch and set drone color
    droneInformation.droneColor = getColor(droneInformation.id);

    // Brodcast the new drone information to all clients
    socket.broadcast.emit(DRONE, JSON.stringify(droneInformation));
  });

  // Go to location 
  socket.on(DRONE_REQUEST_GOTO_LOCATION, (droneCommand: string) => {
    const command = JSON.parse(droneCommand) as DroneGoToLocationCommand;
    console.log(
      `Drone #${command.targetDroneId}: Received go-to command request: ${command.location} `
    );
    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );
    if (targetClient) {
      io.to(targetClient.id).emit(DRONE_GOTO_LOCATION, droneCommand);
      console.log(`Sent go-to command to client: #${targetClient.id}`);
    }
  });

  // Waypoint Mission
  socket.on(DRONE_REQUEST_WAYPOINT_MISSION, (droneCommand: string) => {
    const command = JSON.parse(droneCommand) as DroneWayPointMissionCommand;
    console.log(
      `Drone #${command.targetDroneId}: Received waypoint mission command request`
    );
    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );
    if (targetClient) {
      io.to(targetClient.id).emit(DRONE_WAYPOINT_MISSION, droneCommand);
      console.log(`Sent go-to command to client: #${targetClient.id}`);
    }
  });

  // Stop drones
  socket.on(DRONE_REQUEST_STOP, (droneCommand: string) => {
    const command = JSON.parse(droneCommand) as DroneStopCommand;
    console.log(
      `Drone #${command.targetDroneId}: Received stop command request`
    );
    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );
    if (targetClient) {
      io.to(targetClient.id).emit(DRONE_STOP, droneCommand);
      console.log(`Sent stop command to client: #${targetClient.id}`);
    }
  });

  // Return to home
  socket.on(DRONE_REQUEST_RTH, (droneCommand: string) => {
    const command = JSON.parse(droneCommand) as DroneReturnToHomeCommand;
    console.log(
      `Received RTH command request: ${command.return} Drone #${command.targetDroneId}`
    );
    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );

    if (targetClient) {
      io.to(targetClient.id).emit(DRONE_RTH, droneCommand);
      console.log(`Sent RTH command to client: #${targetClient.id}`);
    }
  });

const drones: DroneInformation[] = [];

  // Video stream
  socket.on(ADD_DRONE_TO_VIDEOSCREEN, (...args) => {
    console.log("ADD DRONE TO VIDEO SOCKET ID: " + socket.id);
    const command = JSON.parse(args[0]) as DroneVideoCommand;

    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );
    command.socketId = targetClient?.id;

    console.log("Adding drone to videoscreen: " + command.socketId);
    socket.broadcast.emit(ADD_DRONE_TO_VIDEOSCREEN, JSON.stringify(command));
    socket.broadcast.emit(DRONE, JSON.stringify(targetClient?.drone));
  });

  socket.on(REMOVE_DRONE_TO_VIDEOSCREEN, (...args) => {
    console.log("REMOVING DRONE TO VIDEO SOCKET ID: " + socket.id);
    const command = JSON.parse(args[0]) as DroneVideoCommand;

    const targetClient = clients.find(
      (e) => e.drone?.id === command.targetDroneId
    );
    command.socketId = targetClient?.id;

    console.log("Removing drone to videoscreen: " + command.socketId);
    socket.broadcast.emit(REMOVE_DRONE_TO_VIDEOSCREEN, JSON.stringify(command));
    socket.broadcast.emit(DRONE, JSON.stringify(targetClient?.drone));
  });

});

httpServer.listen(PORT, () => console.log(`Listening on ${PORT}`));
