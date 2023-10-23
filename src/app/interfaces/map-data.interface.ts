import { LatLngTuple } from 'leaflet';

export interface IMapData {
  position?: LatLngTuple;
  boundary?: Array<LatLngTuple>;
  boundaryColor?: string;
  videoUrl?: string;
}
