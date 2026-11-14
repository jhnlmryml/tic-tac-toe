"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "./game-icons";
import { CrewAvatar } from "./crew-avatar";
import { CrewSelect } from "./crew-select";
import { clampRounds, getCrew, type CrewId, type GameMode } from "../model";

const desktopQuery = "(min-width: 1024px)";

function subscribeToDesktopChange(callback: () => void) {
  const mediaQuery = window.matchMedia(desktopQuery);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsDesktopSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktopChange,
    getIsDesktopSnapshot,
    () => false,
  );
}

type GameSetupProps = {
  mode: GameMode;
  firstCrew: CrewId;
  secondCrew: CrewId;
  rounds: string;
  onModeChange: (mode: GameMode) => void;
  onFirstCrewChange: (id: CrewId) => void;
  onSecondCrewChange: (id: CrewId) => void;
  onRoundsChange: (value: string) => void;
  onRoundsBlur: () => void;
};

function SetupFields({
  mode,
  firstCrew,
  secondCrew,
  rounds,
  onModeChange,
  onFirstCrewChange,
  onSecondCrewChange,
  onRoundsChange,
  onRoundsBlur,
}: GameSetupProps) {
  const rival = getCrew(secondCrew);
  const adjustRounds = (delta: -1 | 1) => {
    const currentRounds = clampRounds(Number(rounds) || 1);
    onRoundsChange(String(clampRounds(currentRounds + delta)));
  };

  return (
    <>
      <div className="section-rule" />
      <div className="form-section mode-section">
        <span className="field-label">CHOOSE YOUR MODE</span>
        <div className="mode-tabs" role="group" aria-label="Game mode">
          <button
            className={`mode-option ${mode === "computer" ? "mode-selected" : ""}`}
            onClick={() => onModeChange("computer")}
            aria-pressed={mode === "computer"}
          >
            <span className="mode-icon mode-bot"><Icon name="spark" size={16} /></span>
            <span><strong>vs computer</strong><small>Test your skills</small></span>
          </button>
          <button
            className={`mode-option ${mode === "friends" ? "mode-selected" : ""}`}
            onClick={() => onModeChange("friends")}
            aria-pressed={mode === "friends"}
          >
            <span className="mode-icon mode-duo"><span /><span /></span>
            <span><strong>vs friend</strong><small>Pass & play</small></span>
          </button>
        </div>
      </div>

      <div className="form-section round-section">
        <label className="field-label" htmlFor="round-count">ROUNDS IN YOUR VOYAGE</label>
        <div className="round-input-wrap rounded-md">
          <span className="round-symbol" aria-hidden="true">✳</span>
          <input
            id="round-count"
            className="round-input"
            type="number"
            min={1}
            max={20}
            step={1}
            inputMode="numeric"
            value={rounds}
            onChange={(event) => onRoundsChange(event.target.value)}
            onBlur={onRoundsBlur}
            aria-describedby="round-hint"
          />
          <span className="round-input-limit">MAX 20</span>
          <div className="round-input-controls" role="group" aria-label="Adjust round count">
            <button
              className="round-step-button"
              type="button"
              aria-label="Increase rounds"
              aria-controls="round-count"
              disabled={Number(rounds) >= 20}
              onClick={() => adjustRounds(1)}
            >
              <Icon name="chevron-up" size={13} />
            </button>
            <button
              className="round-step-button"
              type="button"
              aria-label="Decrease rounds"
              aria-controls="round-count"
              disabled={Number(rounds) <= 1}
              onClick={() => adjustRounds(-1)}
            >
              <Icon name="chevron-down" size={13} />
            </button>
          </div>
        </div>
        <p id="round-hint" className="field-hint">The most wins after {rounds || 1} {rounds === "1" ? "round" : "rounds"} takes the cup.</p>
      </div>

      <div className="section-rule crew-rule" />
      <div className="form-section crew-section">
        <div className="crew-section-heading"><span className="field-label">PICK YOUR CREW</span></div>
        <div className="character-choice">
          <label className="field-label character-label" htmlFor="player-one">PLAYER ONE <span className="player-turn-dot" /></label>
          <CrewSelect
            id="player-one"
            value={firstCrew}
            onChange={onFirstCrewChange}
            unavailable={[secondCrew]}
            label="Player one character"
          />
        </div>
        {mode === "friends" ? (
          <div className="character-choice">
            <label className="field-label character-label second-player-label" htmlFor="player-two">PLAYER TWO</label>
            <CrewSelect
              id="player-two"
              value={secondCrew}
              onChange={onSecondCrewChange}
              unavailable={[firstCrew]}
              label="Player two character"
            />
          </div>
        ) : (
          <div className="character-choice">
            <span className="field-label character-label">YOUR RIVAL <span className="cpu-badge">CPU</span></span>
            <div className="cpu-profile rounded-md">
              <CrewAvatar id={secondCrew} size={38} />
              <span className="crew-option-copy"><strong>{rival.name}</strong><small>{rival.role} · picked at random</small></span>
            </div>
          </div>
        )}
      </div>

      <div className="setup-footnote"><Icon name="spark" size={15} /><span>Every pirate has their own lucky charm.</span></div>
    </>
  );
}

export function GameSetup(props: GameSetupProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <aside className="setup-card panel flex min-h-0 flex-col px-[22px] pt-[21px] pb-4">
        <div className="panel-heading">
          <div><p className="eyebrow">YOUR VOYAGE</p><h2>Set the rules</h2></div>
        </div>
        <SetupFields {...props} />
      </aside>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="setup-dialog-trigger" type="button">
          <Icon name="settings" size={17} />
          <span>Game setup</span>
          <span className="setup-trigger-summary">
            {props.mode === "computer" ? "VS CPU" : "VS FRIEND"} · {props.rounds} ROUNDS
          </span>
          <Icon name="arrow" size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="game-setup-dialog">
        <DialogHeader className="setup-dialog-header">
          <p className="eyebrow">YOUR VOYAGE</p>
          <DialogTitle className="setup-dialog-title">Set the rules</DialogTitle>
          <DialogDescription className="setup-dialog-description">
            Choose a mode, round count, and crew for your match.
          </DialogDescription>
        </DialogHeader>
        <div className="setup-dialog-fields">
          <SetupFields {...props} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
