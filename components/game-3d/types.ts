// 3D Scene Types

export type SceneType = 'buckling' | 'truss';

export type BucklingMode = 1 | 2 | 3;

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface TrussNode3D {
  id: string;
  position: Vector3D;
  fixed: boolean;
  load?: number;
}

export interface TrussMember3D {
  id: string;
  nodeA: string;
  nodeB: string;
  tension?: number;
  compression?: number;
}

export interface CameraControl {
  position: Vector3D;
  target: Vector3D;
  zoom: number;
}

export interface JoystickState {
  x: number;
  y: number;
  active: boolean;
}
