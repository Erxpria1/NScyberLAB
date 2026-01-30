// Core Type Definitions for NScyberLab
// Only types used by useTerminalStore are defined here.
// Structural types (SupportType, LoadType) are in utils/structural/reactionCalculator.ts

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
