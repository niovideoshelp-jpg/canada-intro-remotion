// Tempos da narracao palavra a palavra (transcricao Whisper em src/videos/<video>/words.json).
// T('palavra', n) = inicio (s) da n-esima ocorrencia; T.end('palavra', n) = fim. Compara sem caixa/pontuacao:
// "Tu-95" vira os tokens "tu" e "95"; "162,000" vira "162" e "000"; "U.S." vira "u" e "s" (veja o words.json).
export type Word = {w: string; s: number; e: number};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export type WordTimes = ((word: string, n?: number) => number) & {
  end: (word: string, n?: number) => number;
  /**
   * So as palavras faladas dentro de [a, b] (s, com 0.6 s de folga). Palavras comuns ("for", "back", "position",
   * "canada") aparecem varias vezes na narracao: T('for') pega a PRIMEIRA do video inteiro. Nas cenas use sempre
   * TS('sNN') de timing.ts (= T.within(SCENES.sNN)).
   */
  within: (range: readonly [number, number]) => WordTimes;
};

export const makeT = (words: readonly Word[], scope = 'narration'): WordTimes => {
  const keys = words.map((w) => norm(w.w));
  const find = (word: string, n = 1) => {
    const key = norm(word);
    let k = 0;
    for (let i = 0; i < keys.length; i++) if (keys[i] === key && ++k === n) return words[i];
    throw new Error(`word "${word}" (#${n}) not found in ${scope}`);
  };
  const T = ((word: string, n = 1) => find(word, n).s) as WordTimes;
  T.end = (word: string, n = 1) => find(word, n).e;
  T.within = (range) =>
    makeT(
      words.filter((w) => w.s >= range[0] - 0.6 && w.s <= range[1] + 0.6),
      `${range[0]}–${range[1]} s`,
    );
  return T;
};
