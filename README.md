# Grand Line Arcade

A responsive Straw Hat crew tic-tac-toe game built with Next.js, React, Tailwind CSS, Motion, and shadcn/ui primitives.

## Features

- Player vs. computer or local pass-and-play.
- Ten playable Straw Hat characters, each with a portrait and themed board symbol.
- A randomly selected computer rival; duplicate characters are prevented.
- Computer rivals prioritize wins and blocks, but occasionally miss a block and can be beaten.
- Number-of-rounds input from 1 to 20, score tracking, draws, match results, and reset.
- Background music selection, mute controls, and independent music/effects volume.
- A persistent master mute toggle, plus independent music/effects settings.
- A loading-screen credit, automatic animated entrance, responsive setup dialog, and reduced-motion support.
- Motion-powered board and entrance animations, with desktop setup kept in the main layout.
- Search-engine and social sharing metadata in the root layout.

## Interface map

```text
Header: brand, online status, quick sound toggle, audio settings
Intro: cup title, headline, and crew artwork
Game area:
  Setup panel: game mode, 1-20 rounds, player character, randomized rival
  Play panel: score, round status, fixed 3x3 board, match result
Footer: short game prompt and audio-unlock hint
```


## Getting started

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
app/
  globals.css               Theme tokens, decorative effects, and game animations
  layout.tsx                Fonts and SEO metadata
  page.tsx                  Server-rendered route entry
components/
  game/
    components/              Audio, crew, setup, board, and intro UI
    audio-preferences.ts      Persistent master-mute preference
    game-client.tsx           Game state, audio, and composition
    logic.ts                  Win detection and computer move strategy
    model.ts                  Crew, tracks, and shared types
    use-game-audio.ts         Audio playback and mute handling
  ui/                        shadcn Avatar, Dialog, DropdownMenu, Popover, Select, Sonner
lib/
  utils.ts                   Shared class-name merging helper
public/
  assets/                    Logo, crew portraits, and board symbols
  audio/                     Music and character effects in MP3 format
```


## Development

```bash
npm run lint
npm run build
npm run start
```

