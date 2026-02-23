
import React from 'react';
import { useYutGame } from './hooks/useYutGame';
import { SetupScreen } from './components/SetupScreen';
import { GameStatus } from './components/GameStatus';
import { YutBoard } from './components/YutBoard';
import { YutController } from './components/YutController';
import { EventModal } from './components/EventModal';

const App: React.FC = () => {
  const [scale, setScale] = React.useState(1);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // 스케일링을 고려한 마우스 좌표 보정
    const moveX = (e.clientX - window.innerWidth / 2) / 40;
    const moveY = (e.clientY - window.innerHeight / 2) / 40;
    setMousePos({ x: moveX, y: moveY });
  };

  React.useEffect(() => {
    const handleResize = () => {
      const baseW = 1920;
      const baseH = 1080;
      const scaleW = window.innerWidth / baseW;
      const scaleH = window.innerHeight / baseH;
      // 가로/세로 비율 중 더 작은 쪽에 맞춰 비율 유지
      setScale(Math.min(scaleW, scaleH));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const renderContent = () => {
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
      <div
        onMouseMove={handleMouseMove}
        className={`flex h-[1080px] w-[1920px] text-[#f5f5f5] overflow-hidden transition-colors duration-700 relative ${gameState.screenShake ? 'shake' : ''} ${gameState.theme === 'cyber' ? 'bg-[#000510]' : 'bg-[#0c0c0c]'}`}
      >

        {/* Dynamic Background based on Theme */}
        {gameState.theme === 'traditional' ? (
          <div
            className="absolute inset-[--bg-padding] bg-[#1a120b] opacity-90 pointer-events-none"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
              ['--bg-padding' as any]: '-20px',
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px) scale(1.05)`
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-x-[-50px] inset-y-[-50px] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent animate-pulse"
              style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
            ></div>
            <div
              className="absolute inset-x-[-100px] inset-y-[-100px] opacity-10"
              style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`
              }}
            ></div>
            <div className="cyber-scanline"></div>
            {/* Corner HUD accents - 고정된 느낌을 주면서 미세하게 반응 */}
            <div
              className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-blue-500/30 m-4"
              style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}
            ></div>
            <div
              className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-blue-500/30 m-4"
              style={{ transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * 0.8}px)` }}
            ></div>
            <div
              className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-blue-500/30 m-4"
              style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * -0.8}px)` }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-blue-500/30 m-4"
              style={{ transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px)` }}
            ></div>
          </div>
        )}

        {/* Left Panel: Status */}
        <div className={`w-[28%] max-w-lg h-full border-r-2 ${gameState.theme === 'cyber' ? 'border-blue-500/40 bg-blue-950/10 shadow-[20px_0_50px_rgba(37,99,235,0.1)]' : 'border-[#d4af37]/20 bg-[#1a120b]/40'}`}>
          <GameStatus gameState={gameState} onReset={handleReset} onGoHome={goToSetup} />
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
                {gameState.pendingMoves.length === 0 && <div className="h-4"></div>}
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

                <h4 className={`text-2xl font-black tracking-[0.1em] text-center ${gameState.theme === 'cyber' ? 'text-blue-400 text-glow-blue' : 'text-[#d4af37] text-glow'}`}>
                  ORMA Science Lab
                </h4>
              </div>
            </div>
          </div>
        </div>

        {
          showEventModal && (
            <EventModal
              drawResult={drawResult}
              isDrawing={isDrawing}
              onSelect={handleEventSelection}
              onFinalize={finalizeEvent}
              giftCount={shuffledEvents.length}
            />
          )
        }

        {/* Banner */}
        {
          gameState.eventBanner && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
              <div className="bg-[#1a120b]/98 text-[#fcd34d] px-24 py-16 rounded-[4rem] text-8xl font-black border-[14px] border-[#d4af37] animate-[zoomIn_0.4s_ease-out] shadow-[0_0_200px_rgba(0,0,0,1)] italic text-glow">
                {gameState.eventBanner}
              </div>
            </div>
          )
        }

        {/* Bonus Turn / Combo Banner */}
        {
          gameState.showBonusBanner && (
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
          )
        }

        {/* Confetti Celebration */}
        {gameState.status === 'finished' && (
          <div className="absolute inset-0 pointer-events-none z-[1000] overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#fcd34d', '#3b82f6', '#ef4444', '#10b981', '#ffffff'][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 15 + 5}px`,
                  height: `${Math.random() * 15 + 5}px`,
                  clipPath: i % 2 === 0 ? 'circle(50%)' : 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Victory / Finish Banner */}
        {
          gameState.victoryTeamName && (
            <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-fadeIn">
              <div className="text-center animate-bounce">
                <div className="text-9xl mb-4">🎊🏆🎊</div>
                <div className="text-7xl font-black text-yellow-400 drop-shadow-2xl">
                  {gameState.victoryTeamName} 우승!
                </div>
                <div className="text-3xl text-white/80 mt-4 italic">축하합니다! 전설의 탄생!</div>
              </div>
            </div>
          )
        }

        {/* Game Over Dialog - 최종 등수 상황판 */}
        {
          gameState.status === 'finished' && !gameState.endingQuote && (
            <div className="absolute inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center pointer-events-auto overflow-hidden">
              <div className="flex flex-col items-center gap-8 animate-zoomIn w-full max-w-4xl px-6">

                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className={`text-7xl font-black italic tracking-tighter ${gameState.theme === 'cyber' ? 'text-blue-400 text-glow-blue' : 'text-[#d4af37] text-glow'}`}>
                    FINAL RANKING
                  </h2>
                  <p className="text-white/40 uppercase tracking-[0.5em] font-bold">종료된 게임 결과</p>
                </div>

                {/* Ranking Board */}
                <div className={`w-full overflow-hidden rounded-[3rem] border-4 ${gameState.theme === 'cyber' ? 'bg-blue-950/20 border-blue-500/50' : 'bg-[#1a120b] border-[#d4af37]/50'} shadow-2xl`}>
                  <div className="divide-y divide-white/10">
                    {[...gameState.teams].sort((a, b) => (a.rank || 99) - (b.rank || 99)).map((team, idx) => {
                      const isFirst = team.rank === 1;
                      const medals = ['🥇', '🥈', '🥉', '🏅'];
                      const messages = [
                        "윷판의 절대 지배자! 👑",
                        "아쉬운 한 끗 차이! 🔥",
                        "동메달도 값진 투혼! ✨",
                        "다음 판엔 복수하리라! ⚔️"
                      ];
                      const message = team.rank ? (messages[team.rank - 1] || "윷판의 수호자 🛡️") : "게임 진행 중...";
                      const isSnackPayer = team.snackPayerCount > 0;

                      return (
                        <div key={team.id} className={`flex items-center p-6 transition-colors ${isFirst ? 'bg-white/5' : ''}`}>
                          <div className="w-20 text-5xl flex justify-center">
                            {team.rank ? (team.rank <= 4 ? medals[team.rank - 1] : team.rank) : '-'}
                          </div>
                          <div className="flex-1 flex items-center gap-4">
                            <div className="relative">
                              <span className="text-5xl">{team.emoji}</span>
                              {isSnackPayer && (
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-1 rounded border border-black animate-bounce">
                                  BEST PAYER 🍿
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-white">{team.name}</span>
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50 font-bold">통산 {gameState.cumulativeStats[team.name] || 0}승</span>
                              </div>
                              <span className={`text-sm font-bold tracking-tight ${isFirst ? 'text-yellow-400' : 'opacity-50'}`}>{message}</span>
                            </div>
                          </div>
                          <div className="text-right space-x-6 flex items-center">
                            {isSnackPayer && (
                              <div className="flex flex-col items-end mr-4 animate-pulse">
                                <span className="text-[10px] text-yellow-500 font-black uppercase">오늘의 물주</span>
                                <span className="text-sm font-bold text-yellow-200">간식 {team.snackPayerCount}번 당첨!</span>
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs opacity-40 uppercase font-bold">완주</span>
                              <span className="text-2xl font-black text-white">{team.piecesFinished}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-6">
                              <span className="text-xs opacity-40 uppercase font-bold">잡기</span>
                              <span className="text-2xl font-black text-white">{team.catchCount}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-6">
                              <span className="text-xs text-yellow-500/80 uppercase font-bold">간식</span>
                              <span className="text-2xl font-black text-yellow-400">{team.snackPayerCount}번</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {gameState.teams.some(t => t.snackPayerCount > 0) && (
                    <div className="bg-yellow-400/10 p-4 border-t border-yellow-400/20 text-center">
                      <span className="text-yellow-400 font-bold italic">
                        📢 오늘 간식 당첨자: {gameState.teams.filter(t => t.snackPayerCount > 0).map(t => `${t.name}팀(${t.snackPayerCount}번)`).join(', ')} 쏘세요! (메뉴: {gameState.snackMoney || "맛있는 것"})
                      </span>
                    </div>
                  )}
                </div>

                {/* MVP Highlight Footer */}
                {gameState.mvp && (
                  <div className={`w-full p-6 rounded-[2rem] flex items-center gap-6 border-2 transform rotate-[-1deg] ${gameState.theme === 'cyber' ? 'bg-blue-900/40 border-blue-400/50 text-white' : 'bg-[#2c1e12] border-[#d4af37]/30 text-[#d4af37]'}`}>
                    <div className="text-5xl animate-bounce">{gameState.mvp.emoji}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                        <span>🌟 오늘의 MVP</span>
                        <span className="h-px flex-1 bg-current opacity-20"></span>
                      </div>
                      <div className="text-2xl font-black mt-1">{gameState.mvp.name}</div>
                      <p className="text-sm italic opacity-80 mt-1">{gameState.mvp.reason}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-6 w-full mt-4">
                  <button
                    onClick={goToSetup}
                    className={`flex-1 py-6 text-3xl font-black rounded-3xl hover:scale-105 transition-all shadow-lg border-4 active:scale-95 ${gameState.theme === 'cyber' ? 'bg-blue-600 text-white border-blue-300' : 'bg-[#d4af37] text-black border-white'}`}
                  >
                    새 게임 시작하기
                  </button>
                  <button
                    onClick={stopGame}
                    className="flex-1 py-6 bg-red-900/40 text-red-200 text-3xl font-black rounded-3xl hover:scale-105 transition-all shadow-lg border-4 border-red-500/30 active:scale-95"
                  >
                    게임 종료
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Final Ending Message */}
        {
          gameState.endingQuote && (
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
          )
        }
        {/* snack Modal */}
        {
          gameState.showSnackModal && (
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
          )
        }
      </div >
    );
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          flexShrink: 0
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
