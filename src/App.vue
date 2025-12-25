<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import type { Word } from './types'

const words = ref<Word[]>([])
const learnedWords = ref<Set<string>>(new Set())
const userInput = ref('')
const lastResult = ref<{ correct: boolean; word: string; answer: string } | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const remainingWords = computed(() => 
  words.value.filter(w => !learnedWords.value.has(w.word))
)

const currentWord = computed(() => remainingWords.value[0] || null)

const progress = computed(() => ({
  learned: learnedWords.value.size,
  total: words.value.length,
}))

const highlightedSentence = computed(() => {
  if (!currentWord.value) return ''
  const { sentence, word } = currentWord.value
  const regex = new RegExp(`(${word})`, 'gi')
  return sentence.replace(regex, '<mark class="bg-black text-white px-1">$1</mark>')
})

async function loadWords() {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('/words.json')
    if (!response.ok) {
      throw new Error('Failed to load words')
    }
    words.value = await response.json()
    
    // Shuffle words for random order
    for (let i = words.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const wordI = words.value[i];
      const wordJ = words.value[j];
      if (wordI && wordJ) {
        words.value[i] = wordJ;
        words.value[j] = wordI;
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load words'
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  loadWords()
})
</script>

<template>
  <div class="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 font-sans">
    <main class="w-full max-w-xl">
      <!-- Loading state -->
      <div v-if="loading" class="text-center">
        <p class="text-lg">Indlæser ord...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center">
        <p class="text-lg mb-4">Fejl: {{ error }}</p>
        <button @click="loadWords" class="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
          Prøv igen
        </button>
      </div>

      <!-- No words loaded -->
      <div v-else-if="words.length === 0" class="text-center">
        <p class="text-lg">Ingen ord fundet i words.json</p>
      </div>

      <!-- Completed state -->
      <div v-else-if="!currentWord" class="text-center">
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

