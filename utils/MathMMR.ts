export default function MathMMR(
  MMR: number,
  coeffMMR: number,
  winner: number,
  ProbaToWin: number,
  ScoreDiff: number
): number {
  const newMMR = Math.round(
    MMR + coeffMMR * 2 * (winner - ProbaToWin) * (1 + ScoreDiff * 0.05)
  );
  return newMMR;
}
