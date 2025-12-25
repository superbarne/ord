# ord

The goal of this application is a vocabulary trainer for learning foreign languages in my case danish. The application has a database of words, a sentence wich contains the word and a translation of the word. The user can train the words by going through them and typing the translation. The application will then check if the translation is correct and give feedback to the user. If this is correct the word will be marked as learned and will not be shown again. If the translation is incorrect the word will be shown again until the user learns it.
The application shows the word with a sentence in which the word is used to give context. The word is marked in the sentence to make it easier to identify.

## Features

The application should be very simple by design and should only have the following features:

- Ingest a list of words in a text file line by line and save them in a json
- The known words should be saved in the local storage of the browser
- this should be a single page application with no backend
- only the ingestation script should be run outside the browser and use openrouter api to get the translations and example sentences
- the application has only one view where the user sees the sentence with the word to learn, an input field to type the translation and a button to submit the translation
- the application should give feedback if the translation is correct or incorrect
- the application should show the progress of the user (how many words are learned and how many are left to learn)

## design

The application should be designed in a very simple way. The main view should show the sentence with the word to learn, an input field to type the translation and a button to submit the translation. Below that the application should show the progress of the user (how many words are learned and how many are left to learn). The application should use a simple color scheme (only black and white) with a white background and black text. The word to learn should be highlighted in the sentence to make it easier to identify. Do not use any dropshadows or other effects. The input should be autiofocused when the page loads and after each submission. A enter key press should also submit the input. The application is mobile first and should work on all screen sizes.

## Ingestation script

The ingestation script should be a simple nodejs script that reads a text file line by line and for each word it should use the openrouter api to get the translation and an example sentence. The script is not part of the frontend application and is generaly only excuted during development. The resultung json is imported by the frontend applicaiton. The script should save the word, the translation and the example sentence in a json file. The json file should be in the following format:

```json
[
  {
    "word": "hej",
    "translationDE": "hallo",
    "sentence": "Hej, hvordan har du det?"
  },
  {
    "word": "tak",
    "translationDE": "danke",
    "sentence": "Tak for hjælpen!"
  }
]
```

It should also be able to skip words that are already in the json file to avoid duplicates and save the json file after each word to avoid data loss in case of an error.

## technologies

only use the following technologies:

- Use vite and vue3 for the frontend
- use localstorage for saving the known words
- use nodejs for the ingestation script
- use openrouter api for getting translations and example sentences
- use the openrouter sdk for making requests to the openrouter api
- use tailwindcss for styling
- use typescript for type safety

## patterns

- use composition api in vue3
- use single file components in vue3
- do not use classes in typescript
- use async/await for asynchronous code
- use fetch api for making http requests
- use a functional programming style where possible
- keep the code simple and easy to read
