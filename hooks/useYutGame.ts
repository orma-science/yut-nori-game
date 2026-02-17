
import { useState, useCallback, useMemo } from 'react';
import { GameState, Team, TeamId, YutResult, SpecialNodes, EventDraw } from '../types';
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
    showExplosion: null
});

export const useYutGame = () => {
    const [gameState, setGameState] = useState<GameState>(createInitialGameState());
    const [stateStack, setStateStack] = useState<GameState[]>([]);

    const [setupConfig, setSetupConfig] = useState({ teamCount: 2, pieceCount: 4 });
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventTargetPieceId, setEventTargetPieceId] = useState<string | null>(null);
    const [drawResult, setDrawResult] = useState<EventDraw | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [shuffledEvents, setShuffledEvents] = useState<EventDraw[]>([]);

    // 이벤트 노드 랜덤 생성 함수
    const getRandomSpecialNodes = useCallback((): SpecialNodes => {
        const available = Array.from({ length: 28 }, (_, i) => i + 1).filter(i => ![5, 10, 15, 22].includes(i));
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return {
            eventNodes: shuffled.slice(0, 5),
            hellNode: shuffled[5],
            upNode: shuffled[6]
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
            let stack = 1;
            if (pid === 'new') {
                nextTeams = nextTeams.map(t => t.id === team.id ? { ...t, piecesAtHome: t.piecesAtHome - 1, piecesFinished: t.piecesFinished + 1 } : t);
            } else {
                const idx = nextPieces.findIndex(p => p.id === pid);
                if (idx !== -1) {
                    stack = nextPieces[idx].stackCount;
                    nextPieces.splice(idx, 1);
                    nextTeams = nextTeams.map(t => t.id === team.id ? { ...t, piecesFinished: t.piecesFinished + stack } : t);
                }
            }
            historyMsg = `${team.name}: ${stack}동이가 완주하였습니다! 🏁`;
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
                        nextTeams = nextTeams.map(t => t.id === targetPiece.teamId ? { ...t, piecesAtHome: t.piecesAtHome + targetPiece.stackCount } : t);
                        nextPieces.splice(existingAtTargetIdx, 1);
                        nextPieces.push({ id: `P-${Date.now()}`, teamId: team.id, position: targetPos, stackCount: 1 });
                        historyMsg = `${team.name}: 상대의 말을 잡아 한 번 더!`;
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
                            nextTeams = nextTeams.map(t => t.id === targetPiece.teamId ? { ...t, piecesAtHome: t.piecesAtHome + targetPiece.stackCount } : t);
                            nextPieces.splice(existingAtTargetIdx, 1);
                            selfPiece.position = targetPos;
                            historyMsg = `${team.name}: 상대의 말을 잡았습니다!`;
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
            screenShake: caughtEnemy
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
                const p = state.pieces.find(x => x.id === pid)!;
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
                specialNodes: getRandomSpecialNodes()
            });
            setStateStack([]);
            audioService.playJump();
        }
    }, [getRandomSpecialNodes]);

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
        const caughtEnemy = updates.history?.[0]?.includes("잡았습니다") || updates.history?.[0]?.includes("한 번 더");

        let newState = { ...gameState, ...updates, isMoving: false, selectedPieceId: null };
        const nextMoves = currentMoves.filter((_, i) => i !== gameState.activeMoveIndex);
        newState.pendingMoves = nextMoves;
        newState.activeMoveIndex = 0;

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

            newState.eventBanner = "💥 대폭발! 모두 집으로! 💥";
            newState.screenShake = true;
            newState.history = ["⚠️ 폭약을 밟았습니다! 콰광!!!", ...newState.history];
        } else if (isSupport) {
            audioService.playPowerUp();
            const p = newState.pieces.find(pc => pc.position === target && pc.teamId === gameState.teams[gameState.currentTeamIndex].id);
            if (p && newState.teams[gameState.currentTeamIndex].piecesAtHome > 0) {
                p.stackCount += 1;
                newState.teams = newState.teams.map(t => t.id === p.teamId ? { ...t, piecesAtHome: t.piecesAtHome - 1 } : t);
                newState.eventBanner = "💑 춘향이 업고 놀자! 💑";
            }
        }

        const shouldSwitch = newState.pendingMoves.length === 0 && !caughtEnemy && !isEvent;

        if (shouldSwitch) {
            let nextIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
            let skipList = [...(newState.skipNextTurnTeamIds || [])];

            // Skip turn logic
            while (skipList.includes(gameState.teams[nextIndex].id)) {
                const idx = skipList.indexOf(gameState.teams[nextIndex].id);
                if (idx > -1) skipList.splice(idx, 1);

                newState.history = [`${gameState.teams[nextIndex].name}: 동면 중이라 턴을 건너뜁니다.`, ...(newState.history || [])];

                nextIndex = (nextIndex + 1) % gameState.teams.length;
            }
            newState.skipNextTurnTeamIds = skipList;
            newState.currentTeamIndex = nextIndex;
        }

        if (isEvent) {
            setShuffledEvents([...eventListWithActions].sort(() => Math.random() - 0.5));
            let targetPid = gameState.selectedPieceId!;
            if (targetPid === 'new') {
                const lastAdded = (updates.pieces || gameState.pieces)[(updates.pieces || gameState.pieces).length - 1];
                targetPid = lastAdded.id;
            }
            setEventTargetPieceId(targetPid);
            setShowEventModal(true);
            audioService.playEvent();
        }

        pushState(newState);
        setTimeout(() => setGameState(s => ({ ...s, eventBanner: null, screenShake: false, showExplosion: null })), 2000);
    }, [gameState, executeMove, eventListWithActions, pushState, getPrediction]);

    const finalizeEvent = useCallback(() => {
        if (!drawResult || !eventTargetPieceId) return;

        const updates = drawResult.action(eventTargetPieceId, gameState);
        let newState = { ...gameState, ...updates };
        const caughtInEvent = updates.history?.[0]?.includes("한 번 더") || updates.history?.[0]?.includes("잡았습니다");
        const bonusThrowInEvent = drawResult.id === 3;

        const shouldSwitch = newState.pendingMoves.length === 0 && !caughtInEvent && !bonusThrowInEvent;
        if (shouldSwitch) {
            let nextIndex = (gameState.currentTeamIndex + 1) % gameState.teams.length;
            let skipList = [...(newState.skipNextTurnTeamIds || [])];

            while (skipList.includes(gameState.teams[nextIndex].id)) {
                const idx = skipList.indexOf(gameState.teams[nextIndex].id);
                if (idx > -1) skipList.splice(idx, 1);
                newState.history = [`${gameState.teams[nextIndex].name}: 동면 중이라 턴을 건너뜁니다.`, ...(newState.history || [])];
                nextIndex = (nextIndex + 1) % gameState.teams.length;
            }
            newState.skipNextTurnTeamIds = skipList;
            newState.currentTeamIndex = nextIndex;
        }

        setShowEventModal(false); setDrawResult(null); setEventTargetPieceId(null);
        pushState(newState);
        setTimeout(() => setGameState(s => ({ ...s, eventBanner: null, screenShake: false, showExplosion: null })), 2000);
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
            name: `${i + 1}팀`,
            emoji: TEAM_EMOJIS[i % TEAM_EMOJIS.length],
            color: ['#E11D48', '#2563EB', '#D97706', '#059669'][i],
            piecesAtHome: setupConfig.pieceCount,
            piecesFinished: 0
        }));
        setGameState({
            ...createInitialGameState(),
            status: 'playing',
            teams,
            maxPieces: setupConfig.pieceCount,
            specialNodes: getRandomSpecialNodes(),
            history: ['정겨운 윷놀이가 시작되었습니다.']
        });
        setStateStack([]);
        audioService.init();
    }, [setupConfig, getRandomSpecialNodes]);

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
        isDrawing,
        stateStack,
        validTarget,
        previewPath,
        getYutLabel
    };
};
