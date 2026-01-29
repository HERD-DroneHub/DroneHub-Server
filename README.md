# DroneHub-Server
This repository is for the DroneHub server that connects a drone with a controller running with a compatible app and the DroneHub Website.

# Setup
To install all necessary packages please run the command:

```bash
npm install
```

To run the server, run the command:

```bash
npm start
```

The application is running correctly if it prints out "Listening on 1337".

# Usage
In order to connect a drone to the server, it is important that you know the IP address of the network as it is necessary to know the specific IP to establish a connection with sockets. You can use the command:

```bash
ipconfig getifaddr en0
```

If you want to use your custom software to connect a drone to the server, it is important that the data sent through the sockets are consistent with the format used in the server.
Please look in the ``models`` folder to see the correct data format for the different data types.

