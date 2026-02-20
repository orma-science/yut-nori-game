
import React from 'react';
import { useYutGame } from './hooks/useYutGame';
import { SetupScreen } from './components/SetupScreen';
import { GameStatus } from './components/GameStatus';
import { YutBoard } from './components/YutBoard';
import { YutController } from './components/YutController';
import { EventModal } from './components/EventModal';

const App: React.FC = () => {
  const {
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
    getYutLabel
  } = useYutGame();

  if (gameState.status === 'setup') {
    return (
      <SetupScreen
        teamCount={setupConfig.teamCount}
        pieceCount={setupConfig.pieceCount}
        eventCount={setupConfig.eventCount}
        teamNames={setupConfig.teamNames}
        setTeamCount={(n) => setSetupConfig(prev => ({ ...prev, teamCount: n }))}
        setPieceCount={(n) => setSetupConfig(prev => ({ ...prev, pieceCount: n }))}
        setEventCount={(n) => setSetupConfig(prev => ({ ...prev, eventCount: n }))}
        setTeamNames={(names) => setSetupConfig(prev => ({ ...prev, teamNames: names }))}
        onStart={startGame}
      />
    );
  }

  const currentTeam = gameState.teams[gameState.currentTeamIndex];

  return (
    <div className={`flex h-screen w-screen bg-[#0c0c0c] text-[#f5f5f5] overflow-hidden ${gameState.screenShake ? 'shake' : ''}`}>
      <div className="absolute inset-0 bg-[#1a120b] opacity-90 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }}></div>

      {/* Left Panel: Status (Wider for TV visibility) */}
      <div className="w-[28%] max-w-lg h-full">
        <GameStatus gameState={gameState} onReset={handleReset} />
      </div>

      {/* Center: Board */}
      <div className="flex-1 relative flex items-center justify-center p-4 z-10" onClick={() => setGameState(p => ({ ...p, selectedPieceId: null }))}>
        <YutBoard
          gameState={gameState}
          validTarget={validTarget}
          previewPath={previewPath}
          onNodeClick={handleNodeClick}
          onPieceClick={(id) => setGameState(p => ({ ...p, selectedPieceId: id }))}
        />
      </div>

      {/* Right Panel: Controls */}
      <div className="w-[28%] max-w-lg p-6 flex flex-col z-20 backdrop-blur-md bg-black/40 border-l-2 border-[#d4af37]/20 shadow-2xl">
        <h3 className="text-3xl font-black text-[#d4af37] text-center mb-6 tracking-[0.2em] uppercase italic text-glow">명령 관리</h3>
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-3 shrink-0">
            <button
              disabled={currentTeam.piecesAtHome === 0 || gameState.pendingMoves.length === 0}
              onClick={() => setGameState(p => ({ ...p, selectedPieceId: 'new' }))}
              className={`w-full py-5 rounded-[2rem] text-3xl font-black border-4 transition-all shadow-xl ${gameState.selectedPieceId === 'new' ? 'bg-[#d4af37] border-white text-black scale-105' : 'bg-black/60 border-[#d4af37]/40 text-[#d4af37] hover:border-white disabled:opacity-20'}`}
            >
              말 올리기 ({currentTeam.piecesAtHome})
            </button>

            <button
              onClick={handleUndo}
              disabled={stateStack.length === 0}
              className="w-full py-3 bg-indigo-950/60 text-indigo-200 rounded-2xl border-2 border-indigo-700/50 text-xl font-bold hover:bg-indigo-800/80 transition-all active:scale-95 shadow-md disabled:opacity-10"
            >
              입력 취소 ↶
            </button>
          </div>

          <div className="py-2 border-t border-white/5 flex-1 overflow-y-auto min-h-0">
            {/* New Graphic Controller */}
            <YutController onInput={inputYutResult} disabled={false} />
          </div>

          <div className="bg-black/80 rounded-[2rem] p-4 border-2 border-[#d4af37]/10 flex flex-col mt-2 shadow-inner h-[25vh] shrink-0">
            <p className="text-center text-xs text-[#d4af37]/60 mb-2 font-bold uppercase tracking-widest italic">남은 이동 기회</p>
            <div className="flex flex-wrap justify-center gap-2 mb-3 shrink-0">
              {gameState.pendingMoves.map((m, i) => (
                <button key={i} onClick={() => setGameState(p => ({ ...p, activeMoveIndex: i }))} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all border-4 ${i === gameState.activeMoveIndex ? 'bg-[#d4af37] text-black border-white scale-110 shadow-[0_0_20px_white]' : 'bg-black text-[#d4af37]/40 border-[#d4af37]/20 hover:text-[#d4af37]'}`}>
                  {getYutLabel(m)[0]}
                </button>
              ))}
              {gameState.pendingMoves.length === 0 && <span className="text-sm text-white/10 italic py-2">던지기를 기다립니다...</span>}
            </div>
            <div className="flex-1 overflow-y-auto text-[13px] space-y-1 opacity-50 border-t border-white/5 pt-2 scrollbar-hide">
              {gameState.history.map((h, i) => <div key={i} className="pl-2 border-l-2 border-[#d4af37]/40 leading-relaxed italic animate-[fadeIn_0.3s]">{h}</div>)}
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <EventModal
          drawResult={drawResult}
          isDrawing={isDrawing}
          onSelect={handleEventSelection}
          onFinalize={finalizeEvent}
          giftCount={shuffledEvents.length}
        />
      )}

      {/* Banner */}
      {gameState.eventBanner && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="bg-[#1a120b]/98 text-[#fcd34d] px-24 py-16 rounded-[4rem] text-8xl font-black border-[14px] border-[#d4af37] animate-[zoomIn_0.4s_ease-out] shadow-[0_0_200px_rgba(0,0,0,1)] italic text-glow">
            {gameState.eventBanner}
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
