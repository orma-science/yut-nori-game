
import { useState, useCallback, useMemo } from 'react';
import { GameState, Team, TeamId, YutResult, SpecialNodes, EventDraw, SetupConfig } from '../types';
import { YUT_VALUES, TEAM_EMOJIS, calculateTargetNode, getRoutePath, NODE_COORDS } from '../constants';
import { audioService } from '../services/audioService';

const createInitialGameState = (): GameState => ({
    status: 'setup',
    teams: [],
    currentTeamIndex: 0,
    pieces: [],
    isMoving: false,
    history: ['즐거운 윷놀이 마당에 오신 것을 환영합니다.'],
    pendingMoves: [],
    activeMoveIndex: 0,
    screenShake: false,
    eventBanner: null,
    selectedPieceId: null,
    maxPieces: 4,
    specialNodes: { eventNodes: [], hellNode: -1, upNode: -1 },
    skipNextTurnTeamIds: [],
    showExplosion: null,
    showBonusBanner: false,
    comboCount: 0,
    victoryTeamName: null,
    endingQuote: null,
    theme: 'traditional',
    mvp: null,
    snackMoney: '',
    showSnackModal: false,
    animatingPieceId: null,
    caughtPiece: null,
    showDust: null,
    snackPayerTeamId: null,
    cumulativeStats: JSON.parse(localStorage.getItem('yut_stats') || '{}')
});

export const useYutGame = () => {
    const [gameState, setGameState] = useState<GameState>(createInitialGameState());
    const [stateStack, setStateStack] = useState<GameState[]>([]);

    const [setupConfig, setSetupConfig] = useState<SetupConfig>({
        teamCount: 2,
        pieceCount: 4,
        teamNames: ['', '', '', ''],
        eventCount: 3,
        snackMoney: ''
    });
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventTargetPieceId, setEventTargetPieceId] = useState<string | null>(null);
    const [drawResult, setDrawResult] = useState<EventDraw | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [shuffledEvents, setShuffledEvents] = useState<EventDraw[]>([]);

    // 이벤트 노드 랜덤 생성 함수
    const getRandomSpecialNodes = useCallback((eCount: number = 3): SpecialNodes => {
        // 블랙홀 후보: 판의 맨 왼쪽 노드 (11, 12, 13, 14)
        // 시작(0번)에서 어느 정도 나아가야 만날 수 있는 위치로 제한하여 초반 잦은 리셋 방지
        const hellCandidates = [11, 12, 13, 14];
        const hellNode = hellCandidates[Math.floor(Math.random() * hellCandidates.length)];

        const available = Array.from({ length: 28 }, (_, i) => i + 1)
            .filter(i => ![5, 10, 15, 22].includes(i) && i !== hellNode);

        const shuffled = [...available].sort(() => Math.random() - 0.5);

        return {
            eventNodes: shuffled.slice(0, eCount),
            hellNode: hellNode,
            upNode: shuffled[eCount]
        };
    }, []);

    const pushState = useCallback((nextState: GameState) => {
        setStateStack(prev => [...prev, gameState].slice(-10));
        setGameState(nextState);
    }, [gameState]);

    const executeMove = useCallback((pid: string | 'new', target: number | 'GOAL', stateRef: GameState): Partial<GameState> => {
        const team = stateRef.teams[stateRef.currentTeamIndex];
        let nextPieces = [...stateRef.pieces.map(p => ({ ...p }))];
        let nextTeams = [...stateRef.teams.map(t => ({ ...t }))];
        let caughtEnemy = false;
        let historyMsg = "";

        if (target === 'GOAL') {
            audioService.playWin();
            const finishedCount = nextTeams.filter(t => t.piecesFinished > 0 || (t.rank !== undefined)).length;
            let stack = 1;
            let victoryName = null;
            if (pid === 'new') {
                nextTeams = nextTeams.map(t => {
                    if (t.id === team.id) {
                        const newFinished = t.piecesFinished + 1;
                        const isAllFinished = newFinished >= stateRef.maxPieces;
                        const currentMaxRank = Math.max(0, ...nextTeams.map(tt => tt.rank || 0));
                        const assignedRank = isAllFinished ? currentMaxRank + 1 : undefined;
                        if (assignedRank === 1) victoryName = t.name;
                        return {
                            ...t,
                            piecesAtHome: t.piecesAtHome - 1,
                            piecesFinished: newFinished,
                            rank: assignedRank
                        };
                    }
                    return t;
                });
            } else {
                const idx = nextPieces.findIndex(p => p.id === pid);
                if (idx !== -1) {
                    stack = nextPieces[idx].stackCount;
                    nextPieces.splice(idx, 1);
                    nextTeams = nextTeams.map(t => {
                        if (t.id === team.id) {
                            const newFinished = t.piecesFinished + stack;
                            const isAllFinished = newFinished >= stateRef.maxPieces;
                            const currentMaxRank = Math.max(0, ...nextTeams.map(tt => tt.rank || 0));
                            const assignedRank = isAllFinished ? currentMaxRank + 1 : undefined;
                            if (assignedRank === 1) victoryName = t.name;
                            return {
                                ...t,
                                piecesFinished: newFinished,
                                rank: assignedRank
                            };
                        }
                        return t;
                    });
                }
            }
            historyMsg = `${team.name}: ${stack}동이가 완주하였습니다! 🏁`;
            return {
                pieces: nextPieces,
                teams: nextTeams,
                history: [historyMsg, ...stateRef.history].slice(0, 30),
                victoryTeamName: victoryName
            };
        } else {
            const targetPos = target as number;
            const existingAtTargetIdx = nextPieces.findIndex(p => p.position === targetPos);

            if (pid === 'new') {
                nextTeams = nextTeams.map(t => t.id === team.id ? { ...t, piecesAtHome: t.piecesAtHome - 1 } : t);
                if (existingAtTargetIdx !== -1) {
                    const targetPiece = nextPieces[existingAtTargetIdx];
                    if (targetPiece.teamId === team.id) {
                        targetPiece.stackCount += 1;
                        historyMsg = `${team.name}: 동료를 업고 나아갑니다.`;
                    } else {
                        caughtEnemy = true;
                        const enemyTeam = stateRef.teams.find(t => t.id === targetPiece.teamId);
                        nextTeams = nextTeams.map(t => {
                            if (t.id === targetPiece.teamId) return { ...t, piecesAtHome: t.piecesAtHome + targetPiece.stackCount };
                            if (t.id === team.id) return { ...t, catchCount: t.catchCount + 1 };
                            return t;
                        });
                        // Set caught piece for animation
                        const caughtPieceData = { ...targetPiece, emoji: enemyTeam?.emoji || '❓' };
                        nextPieces.splice(existingAtTargetIdx, 1);
                        nextPieces.push({ id: `P-${Date.now()}`, teamId: team.id, position: targetPos, stackCount: 1 });
                        historyMsg = `${team.name}: 상대의 말을 잡아 한 번 더!`;
                        return {
                            pieces: nextPieces,
                            teams: nextTeams,
                            history: [historyMsg, ...stateRef.history].slice(0, 30),
                            screenShake: false,
                            victoryTeamName: null,
                            caughtPiece: caughtPieceData
                        };
                    }
                } else {
                    nextPieces.push({ id: `P-${Date.now()}`, teamId: team.id, position: targetPos, stackCount: 1 });
                    historyMsg = `${team.name}: 새로운 말을 투입했습니다.`;
                }
            } else {
                const selfIdx = nextPieces.findIndex(p => p.id === pid);
                if (selfIdx !== -1) {
                    const selfPiece = nextPieces[selfIdx];
                    if (existingAtTargetIdx !== -1) {
                        const targetPiece = nextPieces[existingAtTargetIdx];
                        if (targetPiece.teamId === team.id) {
                            targetPiece.stackCount += selfPiece.stackCount;
                            nextPieces.splice(selfIdx, 1);
                            historyMsg = `${team.name}: 세력을 합쳤습니다.`;
                        } else {
                            caughtEnemy = true;
                            const enemyTeam = stateRef.teams.find(t => t.id === targetPiece.teamId);
                            nextTeams = nextTeams.map(t => {
                                if (t.id === targetPiece.teamId) return { ...t, piecesAtHome: t.piecesAtHome + targetPiece.stackCount };
                                if (t.id === team.id) return { ...t, catchCount: t.catchCount + 1 };
                                return t;
                            });
                            const caughtPieceData = { ...targetPiece, emoji: enemyTeam?.emoji || '❓' };
                            nextPieces.splice(existingAtTargetIdx, 1);
                            selfPiece.position = targetPos;
                            historyMsg = `${team.name}: 상대의 말을 잡았습니다!`;
                            return {
                                pieces: nextPieces,
                                teams: nextTeams,
                                history: [historyMsg, ...stateRef.history].slice(0, 30),
                                screenShake: false,
                                victoryTeamName: null,
                                caughtPiece: caughtPieceData
                            };
                        }
                    } else {
                        selfPiece.position = targetPos;
                        historyMsg = `${team.name}: ${targetPos}번 칸으로 이동했습니다.`;
                    }
                }
            }
        }

        return {
            pieces: nextPieces,
            teams: nextTeams,
            history: [historyMsg, ...stateRef.history].slice(0, 30),
            screenShake: false, // Point 4: 잡았을 때 흔들림 제거
            victoryTeamName: null
        };
    }, []);

    // Re-define EVENT_LIST properly with access to executeMove
    const eventListWithActions: EventDraw[] = useMemo(() => [
        {
            id: 1, title: "🔙 전략적 후퇴", description: "2칸 뒤로! 상대를 잡으면 한 번 더!", action: (pid, state) => {
                const p = state.pieces.find(x => x.id === pid);
                if (!p) return {};
                audioService.playRegret();
                const target = calculateTargetNode(p.position, -2);
                return executeMove(pid, target, state);
            }
        },
        {
            id: 2, title: "🚀 급행 열차", description: "3칸 전진! 상대를 잡으면 한 번 더!", action: (pid, state) => {
                const p = state.pieces.find(x => x.id === pid);
                if (!p) return {};
                audioService.playBoost();
                const target = calculateTargetNode(p.position, 3);
                return executeMove(pid, target, state);
            }
        },
        {
            id: 3, title: "✨ 황금 윷가락", description: "한 번 더 던질 기회를 얻었습니다!", action: (pid, state) => {
                audioService.playTwinkle();
                return {
                    history: ["이벤트: 보너스 턴 획득!", ...state.history]
                };
            }
        },
        {
            id: 4, title: "😱 강제 귀가 조치", description: "말이 집으로 강제 소환됩니다.", action: (pid, state) => {
                const p = state.pieces.find(x => x.id === pid);
                if (!p) return {};
                audioService.playFail();
                return {
                    pieces: state.pieces.filter(x => x.id !== pid),
                    teams: state.teams.map(t => t.id === p.teamId ? { ...t, piecesAtHome: t.piecesAtHome + p.stackCount } : t),
                    history: ["이벤트: 강제 귀가당했습니다...", ...state.history],
                    screenShake: true
                };
            }
        },
        {
            id: 5, title: "💤 강제 동면", description: "너무 피곤해서 다음 한 턴을 쉽니다.", action: (pid, state) => {
                const p = state.pieces.find(x => x.id === pid);
                if (!p) return {};
                audioService.playSnore();
                return {
                    skipNextTurnTeamIds: [...(state.skipNextTurnTeamIds || []), p.teamId],
                    history: ["이벤트: 동면에 빠져 다음 턴을 쉽니다.", ...state.history]
                };
            }
        },
        {
            id: 6, title: "🔄 운명의 장난", description: "가장 앞서가는 상대 말과 위치를 바꿉니다!", action: (pid, state) => {
                const myPiece = state.pieces.find(x => x.id === pid);
                if (!myPiece) return {};

                // 내 팀을 제외한 다른 팀들의 말 중 가장 앞선 것(position이 가장 큰 것, 0 제외 - 0은 골이거나 시작전일수있는데 로직상 판위에만 있음)
                // 윷놀이판 번호 체계상 1-28까지 있으며 0은 골지점이므로, 0이 아닌 것 중 가장 앞선 것을 찾음
                // 실제 골에 가까운 순서는 경로에 따라 다르지만, 여기서는 단순 position 값으로 판단하거나 
                // 더 정확하게는 calculateTargetNode가 사용되는 경로 인덱스로 판단해야 함.
                // 편의상 position이 높은 순으로 하되 20번대 노드(지름길) 고려
                const opponents = state.pieces.filter(p => p.teamId !== myPiece.teamId);
                if (opponents.length === 0) {
                    return { history: ["교환할 상대가 없어 보너스 점프를 얻었습니다!", ...state.history], pendingMoves: [...state.pendingMoves, 'DO'] };
                }

                const target = opponents.sort((a, b) => b.position - a.position)[0];
                const myPrevPos = myPiece.position;
                const targetPrevPos = target.position;

                audioService.playTwinkle();
                return {
                    pieces: state.pieces.map(p => {
                        if (p.id === pid) return { ...p, position: targetPrevPos };
                        if (p.id === target.id) return { ...p, position: myPrevPos };
                        return p;
                    }),
                    history: [`이벤트: ${target.teamId}팀의 말과 위치를 교환했습니다!`, ...state.history],
                    eventBanner: "🔄 위치 대전환! 🔄"
                };
            }
        },
        {
            id: 7, title: "🚀 오르마 워프", description: "가장 뒤처진 팀을 중앙으로 불러옵니다!", action: (pid, state) => {
                audioService.playPowerUp();
                // 가장 뒤처진 팀 = 집에 말이 가장 많은 팀
                const maxHome = Math.max(...state.teams.filter(t => t.rank === undefined).map(t => t.piecesAtHome));
                if (maxHome === 0) return { history: ["모든 팀이 이미 출발했습니다!", ...state.history] };

                // 해당되는 팀들 (동점자 포함)
                let laggingTeams = state.teams.filter(t => t.rank === undefined && t.piecesAtHome === maxHome);

                // 내 팀 다음 순서부터 정렬 (순차적 배치 위해)
                const myIdx = state.currentTeamIndex;
                laggingTeams.sort((a, b) => {
                    const aIdx = state.teams.findIndex(t => t.id === a.id);
                    const bIdx = state.teams.findIndex(t => t.id === b.id);
                    const aDist = (aIdx - myIdx + state.teams.length) % state.teams.length;
                    const bDist = (bIdx - myIdx + state.teams.length) % state.teams.length;
                    return aDist - bDist;
                });

                const newPieces = [...state.pieces];
                const newTeams = state.teams.map(t => {
                    const lagIdx = laggingTeams.findIndex(lt => lt.id === t.id);
                    if (lagIdx !== -1) {
                        // 중앙 위치: 22(정중앙), 23, 24...(순차적으로)
                        const targetPos = 22 + lagIdx;
                        newPieces.push({ id: `WARP-${Date.now()}-${t.id}`, teamId: t.id, position: targetPos, stackCount: 1 });
                        return { ...t, piecesAtHome: t.piecesAtHome - 1 };
                    }
                    return t;
                });

                return {
                    pieces: newPieces,
                    teams: newTeams,
                    eventBanner: "🚀 워프 가동! 🚀",
                    history: ["이벤트: 뒤처진 팀들이 전략적 요충지로 워프했습니다!", ...state.history]
                };
            }
        },
        {
            id: 8, title: "🍿 간식 쏜다!", description: "게임의 흥을 돋우기 위해 간식비를 냅니다.", action: (pid, state) => {
                audioService.playTwinkle();
                const teamId = state.teams[state.currentTeamIndex].id;
                const nextTeams = state.teams.map(t => t.id === teamId ? { ...t, snackPayerCount: t.snackPayerCount + 1 } : t);
                return {
                    showSnackModal: true,
                    snackPayerTeamId: teamId,
                    teams: nextTeams,
                    history: [`이벤트: 오늘 간식은 ${state.teams[state.currentTeamIndex].name}팀이 쏘기로 했습니다!`, ...state.history]
                };
            }
        }
    ], [executeMove]);

    // Helper for prediction
    const getPrediction = useCallback((currentState: GameState) => {
        if (!currentState.selectedPieceId || currentState.pendingMoves.length === 0) return { validTarget: null, previewPath: [] };
        const move = currentState.pendingMoves[currentState.activeMoveIndex];
        if (currentState.selectedPieceId === 'new' && move === 'BACK_DO') return { validTarget: null, previewPath: [] };
        const isNew = currentState.selectedPieceId === 'new';
        const curPos = isNew ? 0 : (currentState.pieces.find(p => p.id === currentState.selectedPieceId)?.position ?? 0);
        const target = calculateTargetNode(curPos, YUT_VALUES[move], isNew);
        const path = getRoutePath(curPos, YUT_VALUES[move], isNew);
        return { validTarget: target, previewPath: path };
    }, []);

    const handleUndo = useCallback(() => {
        if (stateStack.length === 0) {
            alert("취소할 이전 기록이 없습니다.");
            return;
        }
        const prevState = stateStack[stateStack.length - 1];
        setGameState(prevState);
        setStateStack(prev => prev.slice(0, -1));
        audioService.playJump();
    }, [stateStack]);

    const handleReset = useCallback(() => {
        if (window.confirm("정말로 게임을 초기화하고 판을 다시 짭니까?\n(모든 진행 상황과 이벤트 위치가 초기화됩니다.)")) {
            const freshState = createInitialGameState();
            setGameState({
                ...freshState,
                history: ['판을 다시 차렸습니다. 새로운 마음으로 시작하세요!'],
                specialNodes: getRandomSpecialNodes(setupConfig.eventCount)
            });
            setStateStack([]);
            audioService.playJump();
        }
    }, [getRandomSpecialNodes, setupConfig.eventCount]);

    const inputYutResult = useCallback((result: YutResult) => {
        if (gameState.isMoving || showEventModal) return;
        audioService.playJump();

        const team = gameState.teams[gameState.currentTeamIndex];
        const hasOnBoard = gameState.pieces.some(p => p.teamId === team.id);

        let nextState = { ...gameState, history: [...gameState.history], pendingMoves: [...gameState.pendingMoves] };
        if (result === 'BACK_DO' && !hasOnBoard && gameState.pendingMoves.length === 0) {
            nextState.currentTeamIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
            nextState.history = [`${team.name}: 빽도! (무를 칸이 없음)`, ...gameState.history];
        } else {
            nextState.pendingMoves.push(result);
            nextState.activeMoveIndex = nextState.pendingMoves.length - 1;
            nextState.history = [`${team.name}: ${getYutLabel(result)}를 던졌습니다.`, ...gameState.history];

            // Point 8: 첫 번째 말은 자동 선택 ('말 올리기' 생략)
            if (!hasOnBoard && nextState.pendingMoves.length === 1) {
                nextState.selectedPieceId = 'new';
            }

            // 윷이나 모가 나오면 보너스 배너 표시 및 콤보 증가
            if (result === 'YUT' || result === 'MO') {
                const nextCombo = nextState.comboCount + 1;
                nextState.comboCount = nextCombo;
                nextState.showBonusBanner = true;
                audioService.playCombo(nextCombo);
                setTimeout(() => setGameState(s => ({ ...s, showBonusBanner: false })), 2000);
            }
        }
        pushState(nextState);
    }, [gameState, showEventModal, pushState]);

    const handleNodeClick = useCallback((target: number | 'GOAL') => {
        const { validTarget } = getPrediction(gameState);

        if (validTarget === null || target !== validTarget || gameState.isMoving) return;

        const currentMoves = [...gameState.pendingMoves];
        const moveResult = currentMoves[gameState.activeMoveIndex];
        const updates = executeMove(gameState.selectedPieceId!, target, gameState);

        const isTrial = target === gameState.specialNodes.hellNode;
        const isSupport = target === gameState.specialNodes.upNode;
        const isEvent = typeof target === 'number' && gameState.specialNodes.eventNodes.includes(target);
        const historyMsg = updates.history?.[0] || "";
        const caughtEnemy = historyMsg.includes("잡았습니다") || historyMsg.includes("한 번 더");

        const nextMoves = currentMoves.filter((_, i) => i !== gameState.activeMoveIndex);
        let newState = { ...gameState, ...updates, isMoving: false, selectedPieceId: null };

        // 점프 애니메이션 시작
        const animatingId = gameState.selectedPieceId;
        newState.animatingPieceId = animatingId;
        newState.pendingMoves = nextMoves;
        newState.activeMoveIndex = 0;

        // 도착 위치 먼지 효과 예약
        const coord = NODE_COORDS[target as number];

        setTimeout(() => {
            setGameState(prev => ({ ...prev, animatingPieceId: null, showDust: coord }));
            setTimeout(() => setGameState(prev => ({ ...prev, showDust: null })), 500);
        }, 400);

        // 튕겨나가는 말 애니메이션 클린업 예약
        if (updates.caughtPiece) {
            setTimeout(() => setGameState(prev => ({ ...prev, caughtPiece: null })), 800);
        }

        if (isTrial) {
            audioService.playExplosion();
            const coord = NODE_COORDS[target as number];
            newState.showExplosion = { x: coord.x, y: coord.y };

            // All pieces on board go back home (excluding finished)
            const piecesToReturn = [...newState.pieces];
            const returns: Record<string, number> = {};
            piecesToReturn.forEach(p => {
                returns[p.teamId] = (returns[p.teamId] || 0) + p.stackCount;
            });

            newState.pieces = [];
            newState.teams = newState.teams.map(t => ({
                ...t,
                piecesAtHome: t.piecesAtHome + (returns[t.id] || 0)
            }));

            newState.eventBanner = "🕳️ 블랙홀! 모두 집으로! 🕳️";
            newState.screenShake = true;
            newState.history = ["🕳️ 블랙홀에 빨려들어갔다! 모두 집으로!", ...newState.history];
        } else if (isSupport) {
            audioService.playPowerUp();
            const p = newState.pieces.find(pc => pc.position === target && pc.teamId === gameState.teams[gameState.currentTeamIndex].id);
            if (p && newState.teams[gameState.currentTeamIndex].piecesAtHome > 0) {
                p.stackCount += 1;
                newState.teams = newState.teams.map(t => t.id === p.teamId ? { ...t, piecesAtHome: t.piecesAtHome - 1 } : t);
                newState.eventBanner = " 아싸! 업고 가자 💑"; // Point 7: 메시지 변경
            }
        }

        const currentTeamAfterMove = newState.teams[gameState.currentTeamIndex];
        const hasFinished = currentTeamAfterMove.rank !== undefined || currentTeamAfterMove.piecesFinished >= gameState.maxPieces;

        if (hasFinished) {
            newState.pendingMoves = [];
            newState.history = [`${currentTeamAfterMove.name} 팀이 게임을 완주했습니다! 🏁 (남은 기회 소멸)`, ...newState.history];
        }

        const shouldSwitch = (newState.pendingMoves.length === 0 && !caughtEnemy && !isEvent) || hasFinished;

        if (shouldSwitch) {
            let nextIndex = (gameState.currentTeamIndex + 1) % newState.teams.length;
            let skipList = [...(newState.skipNextTurnTeamIds || [])];

            let attempts = 0;
            while (attempts < newState.teams.length) {
                const nextTeam = newState.teams[nextIndex];
                if (nextTeam && nextTeam.rank !== undefined) {
                    nextIndex = (nextIndex + 1) % newState.teams.length;
                    attempts++;
                    continue;
                }
                if (nextTeam && skipList.includes(nextTeam.id)) {
                    const idx = skipList.indexOf(nextTeam.id);
                    if (idx > -1) skipList.splice(idx, 1);
                    newState.history = [`${nextTeam.name}: 동면 중이라 턴을 건너뜁니다.`, ...(newState.history || [])];
                    nextIndex = (nextIndex + 1) % newState.teams.length;
                    attempts++;
                    continue;
                }
                break;
            }
            newState.skipNextTurnTeamIds = skipList;
            newState.currentTeamIndex = nextIndex;
            newState.comboCount = 0; // 턴 전환 시 콤보 초기화
        }

        // 게임 종료 체크: 한 팀 빼고 모두 완주했는가?
        const activeTeams = newState.teams.filter(t => t.rank === undefined);
        if (activeTeams.length <= 1) {
            // 마지막 남은 팀에게 꼴찌 등수 부여
            if (activeTeams.length === 1) {
                const lastTeamId = activeTeams[0].id;
                const maxRank = Math.max(0, ...newState.teams.map(t => t.rank || 0));
                newState.teams = newState.teams.map(t =>
                    t.id === lastTeamId ? { ...t, rank: maxRank + 1 } : t
                );
            }
            newState.status = 'finished';

            // 전적 업데이트 및 저장
            const winner = newState.teams.find(t => t.rank === 1);
            if (winner) {
                const nextStats = { ...newState.cumulativeStats };
                nextStats[winner.name] = (nextStats[winner.name] || 0) + 1;
                newState.cumulativeStats = nextStats;
                localStorage.setItem('yut_stats', JSON.stringify(nextStats));
            }

            // MVP 선정 (잡기 횟수 기준)
            const sortedByCatch = [...newState.teams].sort((a, b) => b.catchCount - a.catchCount);
            const topCatcher = sortedByCatch[0];
            if (topCatcher && topCatcher.catchCount > 0) {
                newState.mvp = {
                    name: topCatcher.name,
                    emoji: topCatcher.emoji,
                    reason: `상대 팀 말을 ${topCatcher.catchCount}번이나 잡은 명사수!`
                };
            }
        }

        if (caughtEnemy) {
            const nextCombo = newState.comboCount + 1;
            newState.comboCount = nextCombo;
            newState.showBonusBanner = true;
            audioService.playCombo(nextCombo);
            setTimeout(() => setGameState(s => ({ ...s, showBonusBanner: false })), 2000);
        }

        if (isEvent) {
            // 전체 6개 이벤트 중 무작위로 3개만 선정
            const selected = [...eventListWithActions].sort(() => Math.random() - 0.5).slice(0, 3);
            setShuffledEvents(selected);
            // Point: 이벤트 대상 말 찾기 (합쳐졌을 수도 있으므로 위치 기반으로 탐색)
            const currentTeamId = newState.teams[gameState.currentTeamIndex].id;
            const pieceAtTarget = newState.pieces.find(p => p.position === target && p.teamId === currentTeamId);

            if (pieceAtTarget) {
                setEventTargetPieceId(pieceAtTarget.id);
                setShowEventModal(true);
                audioService.playEvent();
            }
        }

        pushState(newState);

        if (newState.victoryTeamName) {
            setTimeout(() => setGameState(s => ({ ...s, victoryTeamName: null })), 4000);
        }

        // 폭발(블랙홀) 이벤트: 화면 흔들림 3.5초, 배너/폭발 효과 4초
        setTimeout(() => setGameState(s => ({ ...s, screenShake: false })), 3500);
        setTimeout(() => setGameState(s => ({ ...s, eventBanner: null, showExplosion: null })), 4000);
    }, [gameState, executeMove, eventListWithActions, pushState, getPrediction]);

    const finalizeEvent = useCallback(() => {
        if (!drawResult || !eventTargetPieceId) return;

        const updates = drawResult.action(eventTargetPieceId, gameState);
        let newState = { ...gameState, ...updates };

        const movedPiece = newState.pieces.find(p => p.id === eventTargetPieceId);
        const newPos = movedPiece?.position;

        if (typeof newPos === 'number') {
            const isTrial = newPos === gameState.specialNodes.hellNode;
            const isSupport = newPos === gameState.specialNodes.upNode;
            const isEvent = gameState.specialNodes.eventNodes.includes(newPos);

            if (isTrial) {
                audioService.playExplosion();
                const coord = NODE_COORDS[newPos];
                newState.showExplosion = { x: coord.x, y: coord.y };
                const piecesToReturn = [...newState.pieces];
                const returns: Record<string, number> = {};
                piecesToReturn.forEach(p => {
                    returns[p.teamId] = (returns[p.teamId] || 0) + p.stackCount;
                });
                newState.pieces = [];
                newState.teams = newState.teams.map(t => ({
                    ...t,
                    piecesAtHome: t.piecesAtHome + (returns[t.id] || 0)
                }));
                newState.eventBanner = "🕳️ 블랙홀! 모두 집으로! 🕳️";
                newState.screenShake = true;
                newState.history = ["🕳️ 블랙홀에 빨려들어갔다! 모두 집으로!", ...newState.history];
            } else if (isSupport) {
                audioService.playPowerUp();
                const p = newState.pieces.find(pc => pc.position === newPos && pc.teamId === gameState.teams[gameState.currentTeamIndex].id);
                if (p && newState.teams[gameState.currentTeamIndex].piecesAtHome > 0) {
                    p.stackCount += 1;
                    newState.teams = newState.teams.map(t => t.id === p.teamId ? { ...t, piecesAtHome: t.piecesAtHome - 1 } : t);
                    newState.eventBanner = "아싸! 업고 가자 💑"; // Point 7: 메시지 변경
                }
            }
        }

        const currHistoryMsg = gameState.history[0] || "";
        const nextHistoryMsg = updates.history?.[0] || "";

        const originalCatch = currHistoryMsg.includes("잡았습니다") || currHistoryMsg.includes("한 번 더");
        const caughtInEvent = nextHistoryMsg.includes("한 번 더") || nextHistoryMsg.includes("잡았습니다");
        const bonusThrowInEvent = drawResult.id === 3;

        const currentTeamAfterMove = newState.teams[gameState.currentTeamIndex];
        const hasFinished = currentTeamAfterMove.rank !== undefined || currentTeamAfterMove.piecesFinished >= gameState.maxPieces;

        if (hasFinished) {
            newState.pendingMoves = [];
            newState.history = [`${currentTeamAfterMove.name} 팀이 게임을 완주했습니다! 🏁 (남은 기회 소멸)`, ...newState.history];
        }

        // 턴 전환 여부 결정
        // 완주한 경우 무조건 턴을 넘깁니다. (caughtInEvent 등 무시)
        const shouldSwitch = hasFinished || (newState.pendingMoves.length === 0 && !originalCatch && !caughtInEvent && !bonusThrowInEvent);

        if (shouldSwitch) {
            let nextIndex = (gameState.currentTeamIndex + 1) % newState.teams.length;
            let skipList = [...(newState.skipNextTurnTeamIds || [])];

            let attempts = 0;
            while (attempts < newState.teams.length) {
                const nextTeam = newState.teams[nextIndex];
                if (nextTeam && nextTeam.rank !== undefined) {
                    nextIndex = (nextIndex + 1) % newState.teams.length;
                    attempts++;
                    continue;
                }
                if (nextTeam && skipList.includes(nextTeam.id)) {
                    const idx = skipList.indexOf(nextTeam.id);
                    if (idx > -1) skipList.splice(idx, 1);
                    newState.history = [`${nextTeam.name}: 동면 중이라 턴을 건너뜁니다.`, ...(newState.history || [])];
                    nextIndex = (nextIndex + 1) % newState.teams.length;
                    attempts++;
                    continue;
                }
                break;
            }
            newState.skipNextTurnTeamIds = skipList;
            newState.currentTeamIndex = nextIndex;
            newState.comboCount = 0; // 턴 전환 시 콤보 초기화
        }

        // 게임 종료 체크 (이벤트 완주 시)
        const activeTeams = newState.teams.filter(t => t.rank === undefined);
        if (activeTeams.length <= 1) {
            if (activeTeams.length === 1) {
                const lastTeamId = activeTeams[0].id;
                const maxRank = Math.max(0, ...newState.teams.map(t => t.rank || 0));
                newState.teams = newState.teams.map(t =>
                    t.id === lastTeamId ? { ...t, rank: maxRank + 1 } : t
                );
            }
            newState.status = 'finished';

            // 전적 업데이트 및 저장
            const winner = newState.teams.find(t => t.rank === 1);
            if (winner) {
                const nextStats = { ...newState.cumulativeStats };
                nextStats[winner.name] = (nextStats[winner.name] || 0) + 1;
                newState.cumulativeStats = nextStats;
                localStorage.setItem('yut_stats', JSON.stringify(nextStats));
            }
        }

        if (caughtInEvent) {
            const nextCombo = newState.comboCount + 1;
            newState.comboCount = nextCombo;
            newState.showBonusBanner = true;
            audioService.playCombo(nextCombo);
            setTimeout(() => setGameState(s => ({ ...s, showBonusBanner: false })), 2000);
        }

        setShowEventModal(false);
        setDrawResult(null);
        setEventTargetPieceId(null);

        pushState(newState);

        if (newState.victoryTeamName) {
            setTimeout(() => setGameState(s => ({ ...s, victoryTeamName: null })), 4000);
        }

        // 폭발(블랙홀) 이벤트: 화면 흔들림 3.5초, 배너/폭발 효과 4초
        setTimeout(() => setGameState(s => ({ ...s, screenShake: false })), 3500);
        setTimeout(() => setGameState(s => ({ ...s, eventBanner: null, showExplosion: null })), 4000);
    }, [drawResult, eventTargetPieceId, gameState, pushState]);

    const handleEventSelection = useCallback((index: number) => {
        if (isDrawing || drawResult) return;
        setIsDrawing(true);
        setTimeout(() => {
            setDrawResult(shuffledEvents[index]);
            setIsDrawing(false);
        }, 800);
    }, [isDrawing, drawResult, shuffledEvents]);

    const startGame = useCallback(() => {
        const teams: Team[] = Array.from({ length: setupConfig.teamCount }).map((_, i) => ({
            id: ['A', 'B', 'C', 'D'][i] as TeamId,
            name: setupConfig.teamNames[i] || `${i + 1}팀`,
            emoji: TEAM_EMOJIS[i % TEAM_EMOJIS.length],
            color: ['#E11D48', '#2563EB', '#D97706', '#059669'][i],
            piecesAtHome: setupConfig.pieceCount,
            piecesFinished: 0,
            catchCount: 0,
            snackPayerCount: 0
        }));
        setGameState({
            ...createInitialGameState(),
            status: 'playing',
            teams,
            maxPieces: setupConfig.pieceCount,
            specialNodes: getRandomSpecialNodes(setupConfig.eventCount),
            history: ['정겨운 윷놀이가 시작되었습니다.'],
            endingQuote: null,
            theme: gameState.theme,
            snackMoney: setupConfig.snackMoney
        });
        setStateStack([]);
        audioService.init();
    }, [setupConfig, getRandomSpecialNodes, gameState.theme]);

    const stopGame = useCallback(() => {
        const quotes = [
            "웃으면 복이 와요! 😊",
            "웃음은 최고의 보약입니다. ❤️",
            "오늘 하루도 웃음 가득한 날 되세요! ✨",
            "당신의 웃음이 세상을 밝게 만듭니다. 🌟",
            "한 번 웃으면 한 번 젊어져요! (일소일소 일로일로) 🍀"
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setGameState(s => ({ ...s, endingQuote: randomQuote }));
        audioService.playLaugh();
    }, []);

    const goToSetup = useCallback(() => {
        setGameState(s => ({ ...createInitialGameState(), theme: s.theme }));
    }, []);

    const setTheme = useCallback((theme: 'traditional' | 'cyber') => {
        setGameState(s => ({ ...s, theme }));
    }, []);

    const getYutLabel = (res: YutResult): string => {
        const labels: Record<YutResult, string> = {
            'DO': '도', 'GAE': '개', 'GEOL': '걸', 'YUT': '윷', 'MO': '모', 'BACK_DO': '빽도'
        };
        return labels[res];
    };

    const { validTarget, previewPath } = useMemo(() => getPrediction(gameState), [gameState, getPrediction]);

    return {
        gameState,
        setGameState,
        setupConfig,
        setSetupConfig,
        startGame,
        inputYutResult,
        handleNodeClick,
        handleReset,
        handleUndo,
        handleEventSelection,
        finalizeEvent,
        showEventModal,
        drawResult,
        shuffledEvents, // 추가
        isDrawing,
        stateStack,
        validTarget,
        previewPath,
        getYutLabel,
        stopGame,
        goToSetup,
        setTheme
    };
};
