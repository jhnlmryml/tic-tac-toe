import { Icon } from "./game-icons";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tracks } from "../model";

export type AudioSettingsProps = {
  open: boolean;
  musicOn: boolean;
  effectsOn: boolean;
  musicVolume: number;
  effectsVolume: number;
  trackId: string;
  muted: boolean;
  audioUnlocked: boolean;
  audioError: boolean;
  onOpenChange: (open: boolean) => void;
  onMusicChange: (enabled: boolean) => void;
  onEffectsChange: (enabled: boolean) => void;
  onMusicVolumeChange: (volume: number) => void;
  onEffectsVolumeChange: (volume: number) => void;
  onTrackChange: (id: string) => void;
  onAudioToggle: () => void;
};

export function AudioSettings({
  open,
  musicOn,
  effectsOn,
  musicVolume,
  effectsVolume,
  trackId,
  muted,
  audioUnlocked,
  audioError,
  onAudioToggle,
  onOpenChange,
  onMusicChange,
  onEffectsChange,
  onMusicVolumeChange,
  onEffectsVolumeChange,
  onTrackChange,
}: AudioSettingsProps) {
  return (
    <div className="topbar-right">
      <button
        className={`sound-toggle ${!muted ? "sound-toggle-active" : ""}`}
        onClick={onAudioToggle}
        aria-label={muted ? "Unmute all audio" : "Mute all audio"}
        aria-pressed={!muted}
        title={muted ? "Unmute all audio" : "Mute music and effects"}
        data-audio-master
      >
        <Icon name={muted ? "mute" : "volume"} size={15} />
        
      </button>
      <Popover open={open} onOpenChange={onOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <button
            className={`icon-button ${open ? "icon-button-active" : ""}`}
            aria-label={open ? "Close audio settings" : "Open audio settings"}
          >
            <Icon name="music" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="settings-popover" align="end" sideOffset={9}>
          <section aria-label="Audio settings">
            <div className="settings-heading">
              <div>
                <p className="eyebrow">ON DECK</p>
                <PopoverTitle className="settings-popover-title">Sound & music</PopoverTitle>
              </div>
              <button className="text-button" onClick={() => onOpenChange(false)}>Done</button>
            </div>
            {(muted || !audioUnlocked) && (
              <p className="audio-note">
                {muted
                  ? "Unmute all audio to resume music and crew effects."
                  : "Enable sound or make a move to start the music and crew effects."}
              </p>
            )}
            <label className="setting-toggle">
              <span>
                <Icon name="music" size={17} />
                <span><strong>Background music</strong><small>Set the voyage mood</small></span>
              </span>
              <input type="checkbox" checked={musicOn} onChange={(event) => onMusicChange(event.target.checked)} />
            </label>
            <label className="field-label" htmlFor="track">NOW PLAYING</label>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button id="track" className="select-control settings-select" type="button" aria-label="Choose background music">
                  {tracks.find((track) => track.id === trackId)?.name ?? tracks[0].name}
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="audio-track-menu" align="end">
                <DropdownMenuRadioGroup value={trackId} onValueChange={onTrackChange}>
                  {tracks.map((track) => (
                    <DropdownMenuRadioItem key={track.id} value={track.id} className="audio-track-item">
                      {track.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <label className="range-label" htmlFor="music-volume">
              <span>Music volume</span><strong>{musicVolume}%</strong>
            </label>
            <input
              id="music-volume"
              className="volume-range"
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
            />
            <label className="setting-toggle effects-toggle">
              <span>
                <Icon name={effectsOn ? "volume" : "mute"} size={17} />
                <span><strong>Sound effects</strong><small>Round wins & crew calls</small></span>
              </span>
              <input type="checkbox" checked={effectsOn} onChange={(event) => onEffectsChange(event.target.checked)} />
            </label>
            <label className="range-label" htmlFor="effects-volume">
              <span>Effects volume</span><strong>{effectsVolume}%</strong>
            </label>
            <input
              id="effects-volume"
              className="volume-range"
              type="range"
              min="0"
              max="100"
              value={effectsVolume}
              onChange={(event) => onEffectsVolumeChange(Number(event.target.value))}
            />
            {audioError && (
              <p className="audio-error" role="status">
                Audio playback failed. Check your browser’s audio support and device volume.
              </p>
            )}
          </section>
        </PopoverContent>
      </Popover>
    </div>
  );
}
