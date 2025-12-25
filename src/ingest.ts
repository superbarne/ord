import { OpenRouter } from "@openrouter/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import type { Word } from "./types";

const WORDS_FILE = "words.txt";
const OUTPUT_FILE = "public/words.json";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Error: OPENROUTER_API_KEY environment variable is not set");
  process.exit(1);
}

if (!existsSync(WORDS_FILE)) {
  console.error(`Error: ${WORDS_FILE} not found`);
  process.exit(1);
}

const openrouter = new OpenRouter({ apiKey });

// Read existing words to skip duplicates
let existingWords: Word[] = [];
if (existsSync(OUTPUT_FILE)) {
  try {
    existingWords = JSON.parse(readFileSync(OUTPUT_FILE, "utf-8"));
  } catch {
    existingWords = [];
  }
}
const existingWordSet = new Set(existingWords.map((w) => w.word.toLowerCase()));

// Read input words
const inputWords = readFileSync(WORDS_FILE, "utf-8")
  .split("\n")
  .map((line: string) => line.trim())
  .filter((line: string) => line.length > 0);

console.log(`Found ${inputWords.length} words in ${WORDS_FILE}`);
console.log(`${existingWordSet.size} words already processed`);

for (const word of inputWords) {
  if (existingWordSet.has(word.toLowerCase())) {
    console.log(`Skipping "${word}" (already exists)`);
    continue;
  }

  console.log(`Processing "${word}"...`);

  try {
    const response = await openrouter.chat.send({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        {
          role: "system",
          content: `You are a Danish-German translator. For a given Danish word, provide:
1. The German translation (single word if possible)
2. A simple Danish example sentence using the word

Respond ONLY in this exact JSON format, nothing else:
{"translationDE": "german word", "sentence": "Danish sentence using the word"}`,
        },
        {
          role: "user",
          content: word,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error(`  No response for "${word}"`);
      continue;
    }

    // Ensure content is a string
    const contentText =
      typeof content === "string"
        ? content
        : Array.isArray(content) && content[0] && "text" in content[0]
        ? content[0].text
        : "";
    if (!contentText) {
      console.error(`  No text content for "${word}"`);
      continue;
    }

    const parsed = JSON.parse(contentText);
    const newWord: Word = {
      word,
      translationDE: parsed.translationDE,
      sentence: parsed.sentence,
    };

    existingWords.push(newWord);
    existingWordSet.add(word.toLowerCase());

    // Save after each word to avoid data loss
    writeFileSync(OUTPUT_FILE, JSON.stringify(existingWords, null, 2));
    console.log(`  ✓ "${word}" -> "${newWord.translationDE}"`);
  } catch (error) {
    console.error(`  Error processing "${word}":`, error);
  }
}

console.log(`\nDone! ${existingWords.length} words saved to ${OUTPUT_FILE}`);
