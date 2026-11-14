"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { AudioSettings } from "./components/audio-settings";
import { GameBoard } from "./components/game-board";
import { GameSetup } from "./components/game-setup";
import { Icon } from "./components/game-icons";
import { LoadingScreen } from "./components/loading-screen";
import { setAudioMutePreference, useAudioMutePreference } from "./audio-preferences";
import { chooseComputerMove, findWinningLine } from "./logic";
import {
  characterSound,
  clampRounds,
  crew,
  getCrew,
  randomCrew,
  tracks,
  type CrewId,
  type GameMode,
  type Mark,
  type RoundResult,
} from "./model";
import { useGameAudio } from "./use-game-audio";

const initialBoard = (): Array<Mark | null> => Array(9).fill(null);

export default function GameClient() {
  const mutePreference = useAudioMutePreference();
  const [ready, setReady] = useState(false);
  const [introExiting, setIntroExiting] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [entered, setEntered] = useState(false);
  const [mode, setMode] = useState<GameMode>("computer");
  const [firstCrew, setFirstCrew] = useState<CrewId>("luffy");
  const [secondCrew, setSecondCrew] = useState<CrewId>("zoro");
  const [roundValue, setRoundValue] = useState("5");
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState<Array<Mark | null>>(initialBoard);
  const [turn, setTurn] = useState<Mark>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [draws, setDraws] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [matchOver, setMatchOver] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [effectsOn, setEffectsOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(28);
  const [effectsVolume, setEffectsVolume] = useState(72);
  const [trackId, setTrackId] = useState(tracks[0].id);
  const didLog = useRef(false);
  const introStarted = useRef(false);
  const entranceCueRequested = useRef(false);
  const muteStorageErrorNotified = useRef(false);
  const muted = mutePreference.muted;

  useEffect(() => {
    if (!mutePreference.storageAvailable && !muteStorageErrorNotified.current) {
      toast.error("This browser could not load or save your audio preference.");
      muteStorageErrorNotified.current = true;
    } else if (mutePreference.storageAvailable) {
      muteStorageErrorNotified.current = false;
    }
  }, [mutePreference.storageAvailable]);

  const maxRounds = clampRounds(Number(roundValue) || 5);
  const playerOne = getCrew(firstCrew);
  const playerTwo = getCrew(secondCrew);
  const seriesWinner: Mark | null = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;
  const selectedTrack = tracks.find((track) => track.id === trackId) ?? tracks[0];
  const { audioUnlocked, audioError, unlockAudio, playEffect, playEntranceEffect } = useGameAudio({
    enabled: mutePreference.loaded && !muted,
    musicOn,
    musicReady: !introVisible,
    effectsOn,
    musicVolume,
    effectsVolume,
    track: selectedTrack,
  });

  useEffect(() => {
    if (!mutePreference.loaded || entranceCueRequested.current) return;
    entranceCueRequested.current = true;
    playEntranceEffect("/audio/sound-effects/luffy.mp3");
  }, [mutePreference.loaded, playEntranceEffect]);

  useEffect(() => {
    if (!didLog.current) {
      console.log("Jhon Almar Yumul | Hello Nakama! Welcome to the Grand Line Nakama Arcade. This is a fan-made project inspired by the One Piece universe. Enjoy the game and may the best crew win!");
      didLog.current = true;
    }

    let cancelled = false;
    const imagePaths = [
      ...crew.map((member) => `/assets/avatars/${member.id}-avatar.svg`),
      ...crew.map((member) => `/assets/icons/${member.symbol}-icon.svg`),
      "/assets/logo.svg",
    ];
    const assetsReady = Promise.all(imagePaths.map((src) => new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => {
        console.error(`Unable to load game asset: ${src}`);
        resolve();
      };
      image.src = src;
    })));
    const minimumIntro = new Promise<void>((resolve) => window.setTimeout(resolve, 900));
    const assetLoadLimit = new Promise<void>((resolve) => window.setTimeout(resolve, 1800));
    Promise.all([Promise.race([assetsReady, assetLoadLimit]), minimumIntro]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || introStarted.current) return;
    const timer = window.setTimeout(() => {
      introStarted.current = true;
      setIntroExiting(true);
      setEntered(true);
      if (mode === "computer") setSecondCrew(randomCrew(firstCrew));
    }, 2);
    return () => window.clearTimeout(timer);
  }, [firstCrew, mode, playEffect, ready]);

  const resetMatch = useCallback((captain: CrewId = firstCrew, rerollRival = mode === "computer") => {
    if (rerollRival && mode === "computer") setSecondCrew(randomCrew(captain));
    setRound(1);
    setBoard(initialBoard());
    setTurn(0);
    setScores([0, 0]);
    setDraws(0);
    setRoundResult(null);
    setMatchOver(false);
  }, [firstCrew, mode]);

  const completeMove = useCallback((index: number, mark: Mark) => {
    if (board[index] !== null || roundResult || matchOver) return;
    const nextBoard = [...board];
    nextBoard[index] = mark;
    setBoard(nextBoard);
    const line = findWinningLine(nextBoard);
    const isDraw = !line.length && nextBoard.every((cell) => cell !== null);
    if (line.length || isDraw) {
      const final = round === maxRounds;
      const nextScores: [number, number] = [scores[0], scores[1]];
      if (line.length) nextScores[mark] += 1;
      setScores(nextScores);
      if (isDraw) setDraws((previous) => previous + 1);
      setRoundResult({ winner: line.length ? mark : null, line, final });
      if (final) setMatchOver(true);
      if (line.length) playEffect("/audio/sound-effects/win.mp3");
      if (final) {
        const winner = nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1;
        if (winner !== null) {
          const winningMember = winner === 0 ? playerOne : playerTwo;
          playEffect(characterSound(winningMember.id));
          if (mode === "computer" && winner === 1) playEffect("/audio/sound-effects/lose.mp3");
        }
      }
      return;
    }
    setTurn(mark === 0 ? 1 : 0);
  }, [board, maxRounds, matchOver, mode, playEffect, playerOne, playerTwo, round, roundResult, scores]);

  useEffect(() => {
    if (!entered || mode !== "computer" || turn !== 1 || roundResult || matchOver) return;
    const timer = window.setTimeout(() => {
      completeMove(chooseComputerMove(board), 1);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [board, completeMove, entered, matchOver, mode, roundResult, turn]);

  const handleModeChange = (nextMode: GameMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (nextMode === "computer") setSecondCrew(randomCrew(firstCrew));
    resetMatch(firstCrew, false);
  };

  const handleFirstCrewChange = (nextCrew: CrewId) => {
    setFirstCrew(nextCrew);
    if (mode === "computer") {
      setSecondCrew(randomCrew(nextCrew));
    } else if (nextCrew === secondCrew) {
      setSecondCrew(randomCrew(nextCrew));
    }
    resetMatch(nextCrew, false);
  };

  const handleSecondCrewChange = (nextCrew: CrewId) => {
    setSecondCrew(nextCrew);
    resetMatch(firstCrew, false);
  };

  const handleRoundsChange = (value: string) => {
    setRoundValue(value);
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 20) {
      resetMatch(firstCrew, false);
    }
  };

  const handleRoundsBlur = () => {
    const normalized = String(clampRounds(Number(roundValue) || 1));
    setRoundValue(normalized);
    resetMatch(firstCrew, false);
  };

  const handleNextRound = () => {
    if (roundResult?.final) {
      resetMatch(firstCrew, true);
      return;
    }
    setRound((previous) => previous + 1);
    setBoard(initialBoard());
    setTurn(mode === "friends" ? (round % 2) as Mark : 0);
    setRoundResult(null);
  };

  const handleMove = (index: number) => {
    unlockAudio();
    completeMove(index, turn);
  };

  const handleMasterAudioToggle = () => {
    const nextMuted = !muted;
    const saved = setAudioMutePreference(nextMuted);
    if (!saved) muteStorageErrorNotified.current = true;
    if (nextMuted) {
      toast.success(saved
        ? "All audio muted."
        : "All audio muted for now.");
    } else {
      unlockAudio(true);
      toast.success(saved
        ? "Audio is back on."
        : "Audio is back on.");
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="voyage-shell relative isolate h-dvh w-full overflow-clip select-none">
        <Toaster position="top-center" richColors />
        <div className="sea-glow sea-glow-left" />
        <div className="sea-glow sea-glow-right" />
        <div className="ocean-pattern" aria-hidden="true" />

        {introVisible && (
          <LoadingScreen
            ready={ready}
            exiting={introExiting}
            onExitTransitionEnd={() => setIntroVisible(false)}
            onAudioUnlock={unlockAudio}
          />
        )}

        <div
          className={cn(
            "game-stage relative z-[1] mx-auto flex h-full max-h-dvh w-[min(1120px,calc(100%-64px))] flex-col overflow-hidden py-[23px] pb-5 min-[1440px]:pt-[30px]",
            "max-[1023px]:w-[min(820px,calc(100%-clamp(24px,6vw,56px)))] max-[900px]:pt-4 max-[900px]:pb-3",
            "max-[650px]:w-[min(520px,calc(100%-24px))] max-[650px]:pt-2 max-[650px]:pb-[max(8px,env(safe-area-inset-bottom))] max-[380px]:w-[calc(100%-18px)]",
            entered && "game-entered",
          )}
          aria-hidden={!entered}
          inert={!entered}
          onPointerDownCapture={(event) => {
            if (event.target instanceof Element && event.target.closest("[data-audio-master]")) return;
            if (!muted) unlockAudio();
          }}
          onKeyDownCapture={(event) => {
            if (event.target instanceof Element && event.target.closest("[data-audio-master]")) return;
            if (!muted) unlockAudio();
          }}
        >
          <header className="topbar relative z-[4] flex min-h-[46px] shrink-0 items-center justify-between max-[650px]:min-h-[37px]">
            <Link className="brand inline-flex items-center gap-[10px] text-inherit no-underline" href="/" aria-label="Grand Line Arcade home">
              <Image
                className="brand-logo h-auto w-24"
                src="/assets/logo.svg"
                alt=""
                width={58}
                height={39}
                loading="eager"
              />
              <span className="brand-copy flex flex-col gap-0.5 tracking-[0.14em]"><strong>GRAND LINE</strong><span>NAKAMA ARCADE</span></span>
            </Link>
            <AudioSettings
              open={settingsOpen}
              musicOn={musicOn}
              effectsOn={effectsOn}
              musicVolume={musicVolume}
              effectsVolume={effectsVolume}
              trackId={trackId}
              muted={muted}
              audioUnlocked={audioUnlocked}
              audioError={audioError}
              onAudioToggle={handleMasterAudioToggle}
              onOpenChange={setSettingsOpen}
              onMusicChange={setMusicOn}
              onEffectsChange={setEffectsOn}
              onMusicVolumeChange={setMusicVolume}
              onEffectsVolumeChange={setEffectsVolume}
              onTrackChange={setTrackId}
            />
          </header>

          <section className="hero flex min-h-[185px] shrink-0 items-center justify-between px-[3px] pt-[25px] pb-5 min-[1440px]:min-h-[204px] max-[900px]:min-h-0 max-[900px]:py-4 max-[650px]:px-0 max-[650px]:pt-2 max-[650px]:pb-2 max-[650px]:my-5" >
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> THE NAKAMA CUP <span className="hero-edition">— GRAND LINE EDITION</span></p>
              <h1>One sea. <span>One winner.</span></h1>
              <p className="hero-description">Pick your crew. Claim the board. Make some memories.</p>
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span className="stamp-top">CREW</span><span className="stamp-icon"><Icon name="anchor" size={24} /></span><span className="stamp-bottom">BATTLE</span>
            </div>
          </section>

          <div className="game-layout grid min-h-0 flex-1 grid-cols-1 items-stretch gap-2 min-[651px]:grid-rows-[auto_minmax(0,1fr)] max-[1023px]:gap-[clamp(8px,1.7vh,14px)] lg:grid-cols-[minmax(295px,0.78fr)_minmax(420px,1.22fr)] lg:grid-rows-1 lg:gap-[17px] max-[650px]:grid-rows-[auto_minmax(0,1fr)] max-[650px]:gap-[7px] max-[650px]:overflow-hidden max-[650px]:pt-5">
            <GameSetup
              mode={mode}
              firstCrew={firstCrew}
              secondCrew={secondCrew}
              rounds={roundValue}
              onModeChange={handleModeChange}
              onFirstCrewChange={handleFirstCrewChange}
              onSecondCrewChange={handleSecondCrewChange}
              onRoundsChange={handleRoundsChange}
              onRoundsBlur={handleRoundsBlur}
            />
            <GameBoard
              firstCrew={firstCrew}
              secondCrew={secondCrew}
              mode={mode}
              round={round}
              maxRounds={maxRounds}
              board={board}
              turn={turn}
              scores={scores}
              draws={draws}
              roundResult={roundResult}
              matchOver={matchOver}
              seriesWinner={seriesWinner}
              onMove={handleMove}
              onReset={() => resetMatch()}
              onNextRound={handleNextRound}
            />
          </div>

          <footer className="site-footer flex shrink-0 flex-wrap items-center justify-center gap-3 pt-[14px] text-[9px] sm:justify-between sm:flex-nowrap lg:pt-[17px] max-[650px]:hidden">
            <p>GOOD GAMES, GREAT NAKAMA.</p>
            <span>Set sail. Make a little chaos.</span>
            <span className="footer-console"><Icon name="spark" size={14} /> Hello Nakama!</span>
            <span className="audio-hint">
              {muted ? "AUDIO MUTED · SAVED" : audioUnlocked ? "SOUND ON" : "TAP TO WAKE THE MUSIC"}
            </span>
          </footer>
        </div>
      </main>
    </MotionConfig>
  );
}
