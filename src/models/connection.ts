import { DroneInformation } from "./drone.js";

export interface Client {
  id: string;
  connectionType: ConnectionType;
  drone: DroneInformation | null;
}

export enum ConnectionType {
  WEB = 0,
  DRONE = 1,
  UNKNOWN = 2
}