import { Point } from './point';

export interface DroneEvent {
  eventID: string,
  droneID: string,
  position: Point,
  content: string,
  type: string,
  imageArray: any
  image?: Buffer,
}

export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2
}

export enum EventType {
  UNDEFINED = 0,
  DRONE = 1,
  MISSION = 2
}