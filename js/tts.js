// Function to update button states dynamically
function updateButtonState(state) {
  document.getElementById("id_pause").disabled = (state === "paused");
  document.getElementById("id_resume").disabled = (state !== "paused");
  document.getElementById("id_stop").disabled = (state === "stopped");
}

// Event listener for TTS events to manage button states
chrome.tts.onEvent.addListener((event) => {
  if (event.type === "start") updateButtonState("speaking");
  if (event.type === "pause") updateButtonState("paused");
  if (event.type === "resume") updateButtonState("speaking");
  if (event.type === "end") updateButtonState("stopped");
});

// Button click handlers
document.getElementById("id_speech").addEventListener("click", function () {
  let text = document.getElementById("id_text").value;
  let lang = document.getElementById("id_lang").value || "en";
  let rate = parseFloat(document.getElementById("id_rate").value) || 1.0;

  if (!text) {
      alert("Please enter text to speak.");
      return;
  }

  chrome.tts.speak(text, {
      lang: lang,
      rate: rate,
      onEvent: function (event) {
          console.log("TTS event:", event);
      },
  });
});

document.getElementById("id_pause").addEventListener("click", function () {
  chrome.tts.pause();
  console.log("TTS paused.");
});

document.getElementById("id_resume").addEventListener("click", function () {
  chrome.tts.resume();
  console.log("TTS resumed.");
});

document.getElementById("id_stop").addEventListener("click", function () {
  chrome.tts.stop();
  console.log("TTS stopped.");
});

// Initialize button states
updateButtonState("stopped");
