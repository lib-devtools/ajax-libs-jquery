  let selectedItems = new Set();

  function speak(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; 
    speechSynthesis.speak(utterance);
  }

  document.querySelectorAll("#followers .item .img img").forEach(img => {
    img.addEventListener("click", () => {
      const item = img.closest(".item");
      const title = item.querySelector(".txt").textContent.trim();

      if (item.classList.contains("selected")) {
        item.classList.remove("selected");
        selectedItems.delete(item);
      } else {
        if (selectedItems.size >= 3) {
          speak("Only 3 items allowed. Deselect one to choose another.");
          return;
        }
        item.classList.add("selected");
        selectedItems.add(item);
        speak(title);
      }
    });
  });
