
import { YutResult } from './types';

export const YUT_VALUES: Record<YutResult, number> = {
  'DO': 1, 'GAE': 2, 'GEOL': 3, 'YUT': 4, 'MO': 5, 'BACK_DO': -1
};

export const TEAM_EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐯', '🦁', '🐸', '🐷', '역', '🐝', '🦖', '🐙', '🦋', '🐥'];

/**
 * 윷판 노드 좌표 (0~28)
 */
export const NODE_COORDS: Record<number, { x: number, y: number }> = {
  0:  { x: 90, y: 90 }, 1:  { x: 90, y: 74 }, 2:  { x: 90, y: 58 }, 3:  { x: 90, y: 42 }, 4:  { x: 90, y: 26 },
  5:  { x: 90, y: 10 }, 
  6:  { x: 74, y: 10 }, 7:  { x: 58, y: 10 }, 8:  { x: 42, y: 10 }, 9:  { x: 26, y: 10 }, 
  10: { x: 10, y: 10 }, 
  11: { x: 10, y: 26 }, 12: { x: 10, y: 42 }, 13: { x: 10, y: 58 }, 14: { x: 10, y: 74 }, 
  15: { x: 10, y: 90 }, 
  16: { x: 26, y: 90 }, 17: { x: 42, y: 90 }, 18: { x: 58, y: 90 }, 19: { x: 74, y: 90 },
  20: { x: 76.6, y: 23.3 }, 21: { x: 63.3, y: 36.6 }, 22: { x: 50, y: 50 },
  23: { x: 36.6, y: 63.3 }, 24: { x: 23.3, y: 76.6 },
  25: { x: 23.3, y: 23.3 }, 26: { x: 36.6, y: 36.6 }, 27: { x: 63.3, y: 63.3 }, 28: { x: 76.6, y: 76.6 }
};

const PATH_OUTER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 0];
const PATH_DIAG_5 = [20, 21, 22, 23, 24, 15, 16, 17, 18, 19, 0];
const PATH_DIAG_10 = [25, 26, 22, 27, 28, 0];
const PATH_DIAG_EXIT = [27, 28, 0]; 

const getPathArray = (currentPos: number, isNew: boolean): number[] => {
  if (isNew) return PATH_OUTER;
  if (currentPos === 5) return PATH_DIAG_5;
  if (currentPos === 10) return PATH_DIAG_10;
  if (currentPos === 22) return PATH_DIAG_EXIT;
  
  if (PATH_DIAG_5.includes(currentPos)) {
    const idx = PATH_DIAG_5.indexOf(currentPos);
    return PATH_DIAG_5.slice(idx + 1);
  }
  if (PATH_DIAG_10.includes(currentPos)) {
    const idx = PATH_DIAG_10.indexOf(currentPos);
    return PATH_DIAG_10.slice(idx + 1);
  }
  
  const idx = PATH_OUTER.indexOf(currentPos);
  if (idx !== -1) {
    return PATH_OUTER.slice(idx + 1);
  }
  return [];
};

const getPreviousNode = (pos: number): number => {
  if (pos === 1) return 0;
  if (pos === 0) return 19;
  if (pos === 20) return 5;
  if (pos === 25) return 10;
  if (pos === 22) return 21;
  if (pos === 23) return 22;
  if (pos === 27) return 22;
  if (pos === 24) return 23;
  if (pos === 15) return 24;
  if (pos === 21) return 20;
  if (pos === 26) return 25;
  if (pos === 28) return 27;
  return pos > 0 ? pos - 1 : 19;
};

export const getRoutePath = (currentPos: number, moveSteps: number, isNew: boolean = false): number[] => {
  if (moveSteps === 0) return [];
  if (moveSteps < 0) {
    if (isNew) return [];
    const path: number[] = [];
    let curr = currentPos;
    for (let i = 0; i < Math.abs(moveSteps); i++) {
      curr = getPreviousNode(curr);
      path.push(curr);
    }
    return path;
  }
  const fullPath = getPathArray(currentPos, isNew);
  const targetIdx = moveSteps - 1;
  return targetIdx < fullPath.length ? fullPath.slice(0, targetIdx + 1) : fullPath;
};

export const calculateTargetNode = (currentPos: number, moveSteps: number, isNew: boolean = false): number | 'GOAL' => {
  if (moveSteps === 0) return currentPos;
  if (moveSteps < 0) {
    if (isNew) return currentPos;
    let target = currentPos;
    for (let i = 0; i < Math.abs(moveSteps); i++) {
      target = getPreviousNode(target);
    }
    return target;
  }
  const fullPath = getPathArray(currentPos, isNew);
  const targetIdx = moveSteps - 1;
  if (targetIdx < 0) return currentPos;
  return targetIdx < fullPath.length ? fullPath[targetIdx] : 'GOAL';
};
