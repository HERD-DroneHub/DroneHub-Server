export const POLYGON = "polygon";
export const POLYGON_DELETE = "polygon-delete";
export const ERROR = "errors";

export const EVENT = "events"; // The channel for drone events. Events are messages sent by drones either manually or automatically.

export const DRONE = "drones"; // The channel for drone information updates. Every time a drone updates, it will be broadcasted to this channel.
export const DRONE_DISCONNECT = "drone-disconnect";

export const DRONE_REQUEST_GOTO_LOCATION = "drone-request-goto";
export const DRONE_GOTO_LOCATION = "drone-goto";
export const DRONE_REQUEST_RTH = "drone-request-rth";
export const DRONE_RTH = "drone-rth";
export const DRONE_REQUEST_STOP = "drone-request-stop";
export const DRONE_STOP = "drone-stop";
export const DRONE_REQUEST_LEADER = "drone-request-leader";
export const DRONE_UNSET_LEADER = "drone-unset-leader";
export const MISSION = "missions";
export const DRONE_REQUEST_WAYPOINT_MISSION = "drone-request-waypoint";
export const DRONE_WAYPOINT_MISSION = "drone-waypoint";

export const DRONE_VIDEO_START = "drone-video-start";
export const DRONE_VIDEO_DATA = "drone-video-data";
export const ADD_DRONE_TO_VIDEOSCREEN = "add-drone-to-videoscreen";
export const REMOVE_DRONE_TO_VIDEOSCREEN = "remove-drone-to-videoscreen";
export const DRONE_CONTROLLER_COLOR = "drone-controller-color";
export const WEBRTC = "webrtc_msg";