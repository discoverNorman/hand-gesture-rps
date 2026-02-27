let speechSupported = null;

function isSpeechSupported() {
  if (speechSupported === null) {
    speechSupported = 'speechSynthesis' in window;
  }
  return speechSupported;
}

export function speakCountdown(word) {
  if (!isSpeechSupported()) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 1.2;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;
  window.speechSynthesis.cancel(); // cancel any pending
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
