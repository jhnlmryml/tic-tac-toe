import type { Mark } from "./model";

export const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function findWinningLine(board: Array<Mark | null>): number[] {
  return winningLines.find(([a, b, c]) => (
    board[a] !== null && board[a] === board[b] && board[a] === board[c]
  )) ?? [];
}

export function chooseComputerMove(board: Array<Mark | null>): number {
  const open = board.flatMap((cell, index) => cell === null ? [index] : []);
  const finishMove = (mark: Mark) => open.find((index) => {
    const next = [...board];
    next[index] = mark;
    return findWinningLine(next).length > 0;
  });
  const winningMove = finishMove(1);
  if (winningMove !== undefined) return winningMove;
  const blockingMove = finishMove(0);
  if (blockingMove !== undefined) {
    if (Math.random() >= 0.3) return blockingMove;
    const alternatives = open.filter((index) => index !== blockingMove);
    return alternatives[Math.floor(Math.random() * alternatives.length)] ?? blockingMove;
  }
  if (open.includes(4)) return 4;
  const corners = open.filter((index) => [0, 2, 6, 8].includes(index));
  const options = corners.length ? corners : open;
  return options[Math.floor(Math.random() * options.length)] ?? 0;
}
