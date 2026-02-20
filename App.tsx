
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
    shuffledEvents,
    isDrawing,
    stateStack,
    validTarget,
    previewPath,
    getYutLabel,
    stopGame,
    goToSetup,
    setTheme
  } = useYutGame();

  if (gameState.status === 'setup') {
    return (
      <SetupScreen
        teamCount={setupConfig.teamCount}
        pieceCount={setupConfig.pieceCount}
        eventCount={setupConfig.eventCount}
        teamNames={setupConfig.teamNames}
        theme={gameState.theme}
        setTheme={setTheme}
        snackMoney={setupConfig.snackMoney}
        setSnackMoney={(val) => setSetupConfig(prev => ({ ...prev, snackMoney: val }))}
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
    <div className={`flex h-screen w-screen text-[#f5f5f5] overflow-hidden transition-colors duration-700 ${gameState.screenShake ? 'shake' : ''} ${gameState.theme === 'cyber' ? 'bg-[#000510]' : 'bg-[#0c0c0c]'}`}>

      {/* Dynamic Background based on Theme */}
      {gameState.theme === 'traditional' ? (
        <div className="absolute inset-0 bg-[#1a120b] opacity-90 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }}></div>
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
          <div className="cyber-scanline"></div>
          {/* Corner HUD accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-blue-500/30 m-4"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-blue-500/30 m-4"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-blue-500/30 m-4"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-blue-500/30 m-4"></div>
        </div>
      )}

      {/* Left Panel: Status */}
      <div className={`w-[28%] max-w-lg h-full border-r-2 ${gameState.theme === 'cyber' ? 'border-blue-500/40 bg-blue-950/10 shadow-[20px_0_50px_rgba(37,99,235,0.1)]' : 'border-[#d4af37]/20 bg-[#1a120b]/40'}`}>
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
            <YutController onInput={inputYutResult} disabled={false} theme={gameState.theme} />
          </div>

          <div className="flex flex-col mt-4 shrink-0">
            {/* 남은 이동 기회 버튼들 (박스 없이 노출) */}
            <div className="flex flex-wrap justify-center gap-2 mb-4 shrink-0 min-h-[50px]">
              {gameState.pendingMoves.map((m, i) => (
                <button key={i} onClick={() => setGameState(p => ({ ...p, activeMoveIndex: i }))} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all border-4 ${i === gameState.activeMoveIndex ? 'bg-[#d4af37] text-black border-white scale-110 shadow-[0_0_20px_white]' : 'bg-black text-[#d4af37]/40 border-[#d4af37]/20 hover:text-[#d4af37]'}`}>
                  {getYutLabel(m)[0]}
                </button>
              ))}
              {gameState.pendingMoves.length === 0 && <span className="text-sm text-white/10 italic py-2">던지기를 기다립니다...</span>}
            </div>

            {/* 브랜드 시그니처: 수직 밸런스 조정 */}
            <div className="flex flex-col items-center group relative py-6 border-t border-white/5">
              <div className="relative mb-4">
                <img
                  src="/Logo.png"
                  alt="ORMA Logo"
                  className="h-20 object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-700 animate-[pulse_5s_infinite]"
                />
              </div>

              <div className="flex flex-col items-center">
                <p className="text-[9px] text-white/30 uppercase tracking-[0.5em] font-bold mb-1">Creativity & Innovation Center</p>
                <h4 className={`text-2xl font-black tracking-[0.1em] text-center ${gameState.theme === 'cyber' ? 'text-blue-400 text-glow-blue' : 'text-[#d4af37] text-glow'}`}>
                  ORMA Science Lab
                </h4>
                <div className={`h-[1px] w-24 ${gameState.theme === 'cyber' ? 'bg-blue-500/20' : 'bg-[#d4af37]/20'} mt-3`}></div>
                <p className="text-[10px] text-white/10 mt-2 font-medium tracking-[0.2em]">PREMIUM DIGITAL ARCHIVE</p>
              </div>
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

      {/* Bonus Turn / Combo Banner */}
      {gameState.showBonusBanner && (
        <div className="absolute inset-0 z-[250] flex items-center justify-center pointer-events-none">
          <div
            className="bg-[#d4af37] text-black px-20 py-12 rounded-[3rem] font-black border-[10px] border-white animate-[bounceIn_0.5s] shadow-[0_0_100px_#d4af37] italic flex flex-col items-center gap-2"
            style={{
              transform: `scale(${1 + (gameState.comboCount - 1) * 0.15})`,
              fontSize: `${4 + gameState.comboCount}rem`
            }}
          >
            <div className="text-4xl opacity-80">{gameState.comboCount > 1 ? `${gameState.comboCount} 연속!` : "앗사!"}</div>
            <div>한 번 더! 🎲</div>
          </div>
        </div>
      )}

      {/* Victory / Finish Banner */}
      {gameState.victoryTeamName && (
        <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-fadeIn">
          <div className="text-center animate-bounce">
            <div className="text-9xl mb-4">🎊🏆🎊</div>
            <div className="text-7xl font-black text-yellow-400 drop-shadow-2xl">
              {gameState.victoryTeamName} 우승!
            </div>
            <div className="text-3xl text-white/80 mt-4 italic">축하합니다! 전설의 탄생!</div>
          </div>
        </div>
      )}

      {/* Game Over Dialog */}
      {gameState.status === 'finished' && !gameState.endingQuote && (
        <div className="absolute inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="flex flex-col items-center gap-10 animate-zoomIn">

            {/* MVP Section */}
            {gameState.mvp && (
              <div className={`p-8 rounded-[3rem] border-4 shadow-2xl transform rotate-[-2deg] ${gameState.theme === 'cyber' ? 'bg-blue-900 border-blue-400 text-white' : 'bg-[#2c1e12] border-[#d4af37] text-[#d4af37]'}`}>
                <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">🎉 오늘의 MVP 🎉</div>
                <div className="text-8xl mb-4">{gameState.mvp.emoji}</div>
                <div className="text-4xl font-black mb-2">{gameState.mvp.name}</div>
                <div className="text-xl italic opacity-90 bg-black/20 p-4 rounded-2xl">{gameState.mvp.reason}</div>
              </div>
            )}

            <div className={`${gameState.theme === 'cyber' ? 'bg-black/90 border-blue-500' : 'bg-[#1a120b] border-[#d4af37]'} border-[8px] p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center max-w-2xl`}>
              <h2 className={`text-6xl font-black mb-8 italic text-glow ${gameState.theme === 'cyber' ? 'text-blue-400' : 'text-[#d4af37]'}`}>게임 종료! <br />한 판 더 하실래예?</h2>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={goToSetup}
                  className={`px-12 py-6 text-3xl font-black rounded-[2rem] hover:scale-110 transition-transform shadow-lg border-4 ${gameState.theme === 'cyber' ? 'bg-blue-600 text-white border-blue-300' : 'bg-[#d4af37] text-black border-white'}`}
                >
                  한번 더!
                </button>
                <button
                  onClick={stopGame}
                  className="px-12 py-6 bg-red-900/60 text-red-200 text-3xl font-black rounded-[2rem] hover:scale-110 transition-transform shadow-lg border-4 border-red-500/50"
                >
                  이제 그만
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Ending Message */}
      {gameState.endingQuote && (
        <div className="absolute inset-0 z-[500] bg-[#0c0c0c] flex items-center justify-center pointer-events-auto animate-fadeIn">
          <div className="text-center space-y-12 px-8">
            <div className="text-9xl animate-bounce">😊✨</div>
            <div className="text-6xl font-black text-[#d4af37] leading-relaxed drop-shadow-2xl animate-pulse">
              {gameState.endingQuote}
            </div>
            <button
              onClick={goToSetup}
              className="mt-12 px-8 py-4 bg-white/5 text-white/30 rounded-full hover:bg-white/10 transition-all italic tracking-widest uppercase"
            >
              Click to home
            </button>
          </div>
        </div>
      )}
      {/* snack Modal */}
      {gameState.showSnackModal && (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className={`${gameState.theme === 'cyber' ? 'bg-blue-900/90 border-blue-400' : 'bg-[#1a120b] border-[#d4af37]'} border-[12px] p-16 rounded-[5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center max-w-3xl w-full relative overflow-hidden animate-zoomIn`}>
            {/* Sparkle effects */}
            <div className="absolute top-10 left-10 text-6xl animate-bounce">✨</div>
            <div className="absolute bottom-10 right-10 text-6xl animate-bounce [animation-delay:0.5s]">✨</div>

            <h2 className={`text-6xl font-black mb-10 italic tracking-widest ${gameState.theme === 'cyber' ? 'text-blue-300' : 'text-[#fcd34d]'} text-glow`}>🍿 간식 타임! 🍿</h2>

            <div className="mb-12">
              <p className="text-3xl text-white/70 mb-4 font-bold">축하합니다! 오늘 간식은</p>
              <p className={`text-6xl font-black mb-8 ${gameState.theme === 'cyber' ? 'text-blue-400' : 'text-white'}`}>
                {gameState.teams[gameState.currentTeamIndex].name}팀
              </p>
              <p className="text-3xl text-white/70 mb-4 font-bold">이 시원하게 쏩니다!</p>

              <div className={`mt-10 p-10 rounded-[3rem] border-4 border-dashed bg-black/40 ${gameState.theme === 'cyber' ? 'border-blue-500/50' : 'border-[#d4af37]/50'}`}>
                <p className="text-2xl text-[#d4af37]/60 mb-2 font-bold uppercase tracking-widest">결정된 간식 메뉴</p>
                <p className="text-5xl font-black text-white italic drop-shadow-md">
                  {gameState.snackMoney || "맛있는 간식 세트"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setGameState(s => ({ ...s, showSnackModal: false }))}
              className={`w-full py-10 rounded-full text-5xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${gameState.theme === 'cyber' ? 'bg-blue-600 text-white border-4 border-blue-300' : 'bg-gradient-to-b from-[#d4af37] to-[#b4941f] text-black border-4 border-white'}`}
            >
              대박! 잘 먹겠습니다 🙏
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
