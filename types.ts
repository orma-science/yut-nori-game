
export type TeamId = 'A' | 'B' | 'C' | 'D';

export interface Team {
  id: TeamId;
  name: string;
  emoji: string;
  color: string;
  piecesAtHome: number;
  piecesFinished: number;
  rank?: number; // 완주 순위 (1등, 2등 등)
  catchCount: number; // 잡기 횟수 기록
  snackPayerCount: number; // 간식 걸린 횟수
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
  showBonusBanner: boolean; // "앗사! 한 번 더" 배너 표시 여부
  selectedPieceId: string | null;
  maxPieces: number;
  specialNodes: SpecialNodes;
  skipNextTurnTeamIds: TeamId[];
  showExplosion: { x: number, y: number } | null;
  comboCount: number; // 연속 획득 횟수 (잡기, 윷, 모)
  victoryTeamName: string | null; // 우승 축하 배너용 팀 이름
  endingQuote: string | null; // 게임 종료 후 보여줄 긍정 메시지
  theme: 'traditional' | 'cyber'; // 게임 테마
  mvp: { name: string, emoji: string, reason: string } | null; // MVP 정보
  snackMoney: string; // 간식비
  showSnackModal: boolean; // 간식비 모달 표시 여부
  animatingPieceId: string | null; // 현재 점프 애니메이션 중인 말 ID
  caughtPiece: (Piece & { emoji: string }) | null; // 튕겨나가는 말 정보
  showDust: { x: number, y: number } | null; // 먼지 효과 위치
  snackPayerTeamId: TeamId | null; // 오늘 간식 쏜 팀 ID
  cumulativeStats: Record<string, number>; // 팀 이름별 누적 우승 횟수
}

export interface SetupConfig {
  teamCount: number;
  pieceCount: number;
  eventCount: number;
  teamNames: string[];
  snackMoney: string; // 간식비
}

export interface EventDraw {
  id: number;
  title: string;
  description: string;
  action: (pieceId: string, state: GameState) => Partial<GameState>;
}
