export interface Word {
  word: string;
  translationDE: string;
  sentence: string;
}

export interface WordStats {
  word: string;
  wrongGuesses: number;
  lastWrongGuess: number; // timestamp
}
