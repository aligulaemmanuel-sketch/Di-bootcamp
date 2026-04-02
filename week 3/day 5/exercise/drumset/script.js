function playSound(e) {
  // Use keyCode or e.key depending on your preference
  const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
  
  if (!audio) return; // Ignore keys that don't have audio

  key.classList.add('playing');
  audio.currentTime = 0; // Reset sound to start if pressed repeatedly
  audio.play();
}

function removeTransition(e) {
  if (e.propertyName !== 'transform') return; // Only trigger on transform
  this.classList.remove('playing');
}

// Add click support for mouse/touch interaction
function handleMouseClick(e) {
    const keyElement = e.currentTarget;
    const keyCode = keyElement.getAttribute('data-key');
    playSound({ keyCode });
}

const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    key.addEventListener('transitionend', removeTransition);
    key.addEventListener('click', handleMouseClick);
});
window.addEventListener('keydown', playSound);