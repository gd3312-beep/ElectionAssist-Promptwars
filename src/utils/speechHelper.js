export function speakText(text, language = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn("Text-to-speech not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  
  // Optional: try to find a voice that matches the language better
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function startSpeechRecognition(language = 'en-US', onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  recognition.start();
  return recognition;
}
