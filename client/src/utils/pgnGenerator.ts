import type { GameMetadata } from '../types';

export function generatePGN(moves: string[], metadata: GameMetadata): string {
  const lines: string[] = [];

  // Seven Tag Roster (required)
  lines.push(`[Event "${metadata.event || '?'}"]`);
  lines.push(`[Site "${metadata.site || '?'}"]`);
  lines.push(`[Date "${metadata.date || '????.??.??'}"]`);
  lines.push(`[Round "${metadata.round || '?'}"]`);
  lines.push(`[White "${metadata.white || '?'}"]`);
  lines.push(`[Black "${metadata.black || '?'}"]`);
  lines.push(`[Result "${metadata.result || '*'}"]`);
  lines.push('');

  // Movetext
  const movetext: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];

    if (blackMove) {
      movetext.push(`${moveNum}. ${whiteMove} ${blackMove}`);
    } else {
      movetext.push(`${moveNum}. ${whiteMove}`);
    }
  }

  // Wrap at reasonable line length
  let currentLine = '';
  for (const move of movetext) {
    if (currentLine.length + move.length + 1 > 80) {
      lines.push(currentLine.trim());
      currentLine = move + ' ';
    } else {
      currentLine += move + ' ';
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim() + ' ' + (metadata.result || '*'));
  } else {
    lines.push(metadata.result || '*');
  }

  return lines.join('\n');
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
