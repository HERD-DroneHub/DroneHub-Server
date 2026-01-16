import { Point } from './point';

export interface DroneInformation {
  id: string;
  name: string;
  droneColor?: string;
  version: string;
  battery: number;
  position: Point;
  altitude: number;
  target: Point | null;
  yaw: number;
  liveFeed: string;
  flightMode: string;
  searchMode: number;
  isLeader: boolean;
  isReturning: boolean;
  isStreaming: boolean;
  socketId?: string;
}

export enum SearchMode {
  DEFAULT = 0,
  MANUAL = 1
}

export interface DroneGoToLocationCommand {
  targetDroneId: string;
  location: Point;
  distance: number;
  altitude: number;
  speed: number;
}

export interface DroneStopCommand {
  targetDroneId: string;
}

export interface DroneReturnToHomeCommand {
  targetDroneId: string;
  return: boolean;
}

export interface DroneSetLeaderCommand {
  targetDroneId: string;
  leader: boolean;
}

export interface DroneEvent {
  targetDroneId: string;
  position: Point | null;
  content: string;
  priority: DroneEventPriority;
  type: DroneEventType;
}

export enum DroneEventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2
}

export enum DroneEventType {
  UNDEFINED = 0,
  DRONE = 1,
  MISSION = 2
}

export interface DroneWayPointMissionCommand {
  targetDroneId: string;
  coordinates: Point[];
  distance: number;
  altitude: number;
  speed: number;
}

export interface DroneVideoCommand {
  targetDroneId: string;
  targetDroneName: string;
  droneColor?: string;
  socketId?: string;
}