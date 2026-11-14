import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { CrewAvatar } from "./crew-avatar";
import { Icon } from "./game-icons";
import {
  getCrew,
  type CrewId,
  type GameMode,
  type Mark,
  type RoundResult,
} from "../model";

type GameBoardProps = {
  firstCrew: CrewId;
  secondCrew: CrewId;
  mode: GameMode;
  round: number;
  maxRounds: number;
  board: Array<Mark | null>;
  turn: Mark;
  scores: [number, number];
  draws: number;
  roundResult: RoundResult | null;
  matchOver: boolean;
  seriesWinner: Mark | null;
  onMove: (index: number) => void;
  onReset: () => void;
  onNextRound: () => void;
};

export function GameBoard({
  firstCrew,
  secondCrew,
  mode,
  round,
  maxRounds,
  board,
  turn,
  scores,
  draws,
  roundResult,
  matchOver,
  seriesWinner,
  onMove,
  onReset,
  onNextRound,
}: GameBoardProps) {
  const playerOne = getCrew(firstCrew);
  const playerTwo = getCrew(secondCrew);
  const activeCrew = turn === 0 ? playerOne : playerTwo;

  return (
    <section className="play-card panel" aria-label="Tic-tac-toe game">
      <div className="scoreboard">
        <div className={`score-player ${turn === 0 && !roundResult ? "score-active" : ""}`}>
          <CrewAvatar id={firstCrew} size={48} />
          <div className="score-copy"><span className="score-player-label">PLAYER ONE</span><strong>{playerOne.shortName}</strong></div>
          <span className="score-number">{scores[0]}</span>
        </div>
        <div className="score-divider"><span>VS</span><i /></div>
        <div className={`score-player score-player-right ${turn === 1 && !roundResult ? "score-active" : ""}`}>
          <span className="score-number">{scores[1]}</span>
          <div className="score-copy"><span className="score-player-label">{mode === "computer" ? "CPU" : "PLAYER TWO"}</span><strong>{playerTwo.shortName}</strong></div>
          <CrewAvatar id={secondCrew} size={48} />
        </div>
      </div>

      <div className="round-status">
        <span className="round-pill"><i /> ROUND {String(round).padStart(2, "0")} <span>/ {String(maxRounds).padStart(2, "0")}</span></span>
        {matchOver ? (
          <span className="turn-message" role="status" aria-live="polite">{seriesWinner === null ? "A perfect tie" : `${(seriesWinner === 0 ? playerOne : playerTwo).shortName} takes the cup`}</span>
        ) : roundResult ? (
          <span className="turn-message" role="status" aria-live="polite">{roundResult.winner === null ? "A draw. Well played." : `${(roundResult.winner === 0 ? playerOne : playerTwo).shortName} wins the round`}</span>
        ) : (
          <span className="turn-message" role="status" aria-live="polite"><i style={{ backgroundColor: activeCrew.color }} />{mode === "computer" && turn === 1 ? "The rival is thinking…" : `${activeCrew.shortName}’s turn`}</span>
        )}
        <button className="reset-button" onClick={onReset} aria-label="Reset match"><Icon name="refresh" size={16} /><span>Reset</span></button>
      </div>

      <div className="board-frame">
        <div className="board-grid" role="group" aria-label={`Round ${round} tic-tac-toe board`}>
          {board.map((mark, index) => {
            const character = mark === null ? null : mark === 0 ? playerOne : playerTwo;
            const winningCell = roundResult?.line.includes(index) ?? false;
            return (
              <motion.button
                key={index}
                className={`board-cell ${mark !== null ? "cell-filled" : ""} ${winningCell ? "cell-winner" : ""}`}
                onClick={() => onMove(index)}
                disabled={mark !== null || !!roundResult || matchOver || (mode === "computer" && turn === 1)}
                aria-label={character ? `${character.name} played ${character.symbol.replace("-", " ")} in square ${index + 1}${winningCell ? ", winning move" : ""}` : `Empty square ${index + 1}`}
                whileHover={mark === null ? { scale: 1.035 } : undefined}
                whileTap={mark === null ? { scale: 0.96 } : undefined}
                transition={{ type: "spring", stiffness: 430, damping: 24 }}
              >
                {character && (
                  <motion.span
                    className="board-symbol-wrap"
                    initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    <Image
                      src={`/assets/icons/${character.symbol}-icon.svg`}
                      alt=""
                      width={58}
                      height={58}
                      className="board-symbol"
                      style={{ color: character.color }}
                      unoptimized
                    />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {(roundResult || matchOver) && (
          <motion.div
            className="round-overlay"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="result-spark"><Icon name="spark" size={23} /></div>
            <p className="eyebrow">{matchOver ? "VOYAGE COMPLETE" : `ROUND ${String(round).padStart(2, "0")} COMPLETE`}</p>
            <h3>{matchOver
              ? seriesWinner === null ? "A legendary tie." : `${(seriesWinner === 0 ? playerOne : playerTwo).shortName} takes the cup!`
              : roundResult?.winner === null ? "A worthy draw." : `${(roundResult?.winner === 0 ? playerOne : playerTwo).shortName} wins!`}
            </h3>
            <p>{matchOver ? "The Grand Line will remember this one." : `${scores[0]} — ${scores[1]} · ${draws} ${draws === 1 ? "draw" : "draws"}`}</p>
            <button className="button button-primary result-button" onClick={onNextRound}>
              {roundResult?.final ? "Sail again" : "Next round"} <Icon name="arrow" size={16} />
            </button>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="board-footer">
        <span><i className="legend-dot legend-first" />{playerOne.shortName}</span>
        <span className="draw-count">{draws} {draws === 1 ? "draw" : "draws"}</span>
        <span><i className="legend-dot legend-second" />{playerTwo.shortName}</span>
      </div>
    </section>
  );
}
