<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Word } from './types'

// Mock data
const words: Word[] = [
  { word: 'hej', translationDE: 'hallo', sentence: 'Hej, hvordan har du det?' },
  { word: 'tak', translationDE: 'danke', sentence: 'Tak for hjælpen!' },
  { word: 'god', translationDE: 'gut', sentence: 'Det er en god ide.' },
  { word: 'dag', translationDE: 'tag', sentence: 'God dag, min ven!' },
  { word: 'ja', translationDE: 'ja', sentence: 'Ja, det er rigtigt.' },
]

const learnedWords = ref<Set<string>>(new Set())
const userInput = ref('')
const lastResult = ref<{ correct: boolean; word: string; answer: string } | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const remainingWords = computed(() => 
  words.filter(w => !learnedWords.value.has(w.word))
)

const currentWord = computed(() => remainingWords.value[0] || null)

const progress = computed(() => ({
  learned: learnedWords.value.size,
  total: words.length,
}))

const highlightedSentence = computed(() => {
  if (!currentWord.value) return ''
  const { sentence, word } = currentWord.value
  const regex = new RegExp(`(${word})`, 'gi')
  return sentence.replace(regex, '<mark class="bg-black text-white px-1">$1</mark>')
})

async function checkAnswer() {
  if (!currentWord.value || !userInput.value.trim()) return
  
  const isCorrect = userInput.value.trim().toLowerCase() === currentWord.value.translationDE.toLowerCase()
  
  lastResult.value = {
    correct: isCorrect,
    word: currentWord.value.word,
    answer: currentWord.value.translationDE,
  }
  
  if (isCorrect) {
    learnedWords.value.add(currentWord.value.word)
  }
  
  userInput.value = ''
  await nextTick()
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    checkAnswer()
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 font-sans">
    <main class="w-full max-w-xl">
      <!-- Completed state -->
      <div v-if="!currentWord" class="text-center">
        <h1 class="text-2xl font-bold mb-4">Tillykke!</h1>
        <p>Du har lært alle ordene.</p>
        <p class="mt-2">{{ progress.learned }} / {{ progress.total }} ord lært</p>
      </div>

      <!-- Learning state -->
      <div v-else>
        <!-- Last result feedback -->
        <div class="h-8 mb-4 text-center">
          <p v-if="lastResult?.correct" class="text-lg">
            ✓ Korrekt!
          </p>
          <p v-else-if="lastResult && !lastResult.correct" class="text-lg">
            ✗ Forkert. "{{ lastResult.word }}" = <strong>{{ lastResult.answer }}</strong>
          </p>
        </div>

        <!-- Sentence with highlighted word -->
        <div class="text-center mb-8">
          <p class="text-xl leading-relaxed" v-html="highlightedSentence"></p>
        </div>

        <!-- Input and submit -->
        <div class="flex gap-2 mb-6">
          <input
            ref="inputRef"
            v-model="userInput"
            type="text"
            placeholder="Skriv oversættelsen..."
            class="flex-1 border border-black px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-black"
            @keydown="handleKeydown"
            autofocus
          />
          <button
            @click="checkAnswer"
            class="border border-black px-6 py-2 text-lg hover:bg-black hover:text-white transition-colors"
          >
            Tjek
          </button>
        </div>

        <!-- Progress -->
        <div class="text-center text-sm border-t border-black pt-4">
          <p>{{ progress.learned }} / {{ progress.total }} ord lært</p>
        </div>
      </div>
    </main>
  </div>
</template>

