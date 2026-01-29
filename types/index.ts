// Core Type Definitions for NScyberLab

export type TerminalCommand = 'BEAM' | 'TRUSS' | 'PDF' | 'CALC' | '3D' | 'HELP' | 'CLEAR' | 'STATUS';

export interface CommandHistory {
  id: string;
  command: string;
  output?: string;
  timestamp: Date;
}

export interface SystemStatus {
  memory: number;
  battery: number;
  connection: 'ONLINE' | 'OFFLINE';
  mode: TerminalCommand | 'IDLE';
}

export interface BeamInput {
  length: number;
  supports: SupportType[];
  loads: Load[];
}

export type SupportType = 'pin' | 'roller' | 'fixed';

export interface Load {
  type: 'point' | 'udl';
  position: number;
  magnitude: number;
}

export interface TrussNode {
  id: string;
  x: number;
  y: number;
  fixed: boolean;
}

export interface TrussMember {
  id: string;
  nodeA: string;
  nodeB: string;
  force?: number;
}

export interface CalculationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
