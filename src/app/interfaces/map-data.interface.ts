import { LatLngTuple } from 'leaflet';

export interface IMapData {
  position?: LatLngTuple;
  zoom?: number;
  boundary?: Array<LatLngTuple>;
  boundaryColor?: string;
  videoUrl?: string;
}
