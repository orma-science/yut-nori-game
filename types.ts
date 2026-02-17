
export type TeamId = 'A' | 'B' | 'C' | 'D';

export interface Team {
  id: TeamId;
  name: string;
  emoji: string;
  color: string;
  piecesAtHome: number;
  piecesFinished: number;
}

export interface Piece {
  id: string;
  teamId: TeamId;
  position: number; // 0-28 (판 위)
  stackCount: number; // 업힌 말의 개수
}

export type YutResult = 'DO' | 'GAE' | 'GEOL' | 'YUT' | 'MO' | 'BACK_DO';

export interface SpecialNodes {
  eventNodes: number[];
  hellNode: number;
  upNode: number;
}

export interface GameState {
  status: 'setup' | 'playing' | 'finished';
  teams: Team[];
  currentTeamIndex: number;
  pieces: Piece[];
  isMoving: boolean;
  history: string[];
  pendingMoves: YutResult[];
  activeMoveIndex: number;
  screenShake: boolean;
  eventBanner: string | null;
  selectedPieceId: string | null;
  maxPieces: number;
  specialNodes: SpecialNodes;
  skipNextTurnTeamIds: TeamId[];
  showExplosion: { x: number, y: number } | null;
}

export interface EventDraw {
  id: number;
  title: string;
  description: string;
  action: (pieceId: string, state: GameState) => Partial<GameState>;
}
