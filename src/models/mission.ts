import { Point } from '../models/point';

export interface Mission {
  name: string;
  location: string;
  center: Point;
  area: Point[];
  lastUpdated: Date;
  created: Date;
}
