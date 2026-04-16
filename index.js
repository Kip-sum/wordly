const form = document.getElementById("form");
const input = document.getElementById("input");
const result = document.getElementById("result");
const errorDiv = document.getElementById("error");
const themeBtn = document.getElementById("themeBtn");
const favoritesList = document.getElementById("favorites");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

renderFavorites();

// FORM SUBMIT
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const word = input.value.trim();

  if (!word) {
    showError("Please enter a word");
    return;
  }

  fetchWord(word);
  input.value = "";
});

// FETCH DATA
function fetchWord(word) {
  result.innerHTML = "<p class='loading'>Loading...</p>";
  errorDiv.textContent = "";

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => {
      if (!res.ok) throw new Error("Word not found");
      return res.json();
    })
    .then(data => displayWord(data))
    .catch(() => {
      showError("Word not found or API error");
      result.innerHTML = "";
    });
}

// DISPLAY DATA
function displayWord(data) {
  const wordData = data[0];

  const word = wordData.word;
  const phonetic = wordData.phonetic || "N/A";
  const audio = wordData.phonetics.find(p => p.audio)?.audio;

  let meaningsHTML = "";

  wordData.meanings.forEach(m => {
    const def = m.definitions[0];

    meaningsHTML += `
      <p><b>Part of Speech:</b> ${m.partOfSpeech}</p>
      <p><b>Definition:</b> ${def.definition}</p>
      <p><b>Example:</b> ${def.example || "No example available"}</p>
      <p><b>Synonyms:</b> ${
        def.synonyms.length ? def.synonyms.join(", ") : "None"
      }</p>
      <hr>
    `;
  });

  const isSaved = favorites.includes(word);

  result.innerHTML = `
    <h2 class="${isSaved ? "saved-word" : ""}">${word}</h2>
    <p><b>Pronunciation:</b> ${phonetic}</p>
    
    ${audio ? `<audio controls src="${audio}"></audio>` : ""}

    ${meaningsHTML}

    <button onclick="saveWord('${word}')">
      ${isSaved ? "Saved ✅" : "Save ⭐"}
    </button>

    <p><b>Source:</b> 
      <a href="${wordData.sourceUrls[0]}" target="_blank">
        ${wordData.sourceUrls[0]}
      </a>
    </p>
  `;
}

// SAVE WORD
function saveWord(word) {
  if (!favorites.includes(word)) {
    favorites.push(word);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  }
}

// RENDER FAVORITES
function renderFavorites() {
  favoritesList.innerHTML = "";

  favorites.forEach(word => {
    const card = document.createElement("div");
    card.classList.add("favorite-card");

    const title = document.createElement("span");
    title.textContent = word;

    // SEARCH BUTTON
    const searchBtn = document.createElement("button");
    searchBtn.textContent = "🔍";
    searchBtn.classList.add("card-btn");
    searchBtn.addEventListener("click", () => {
      fetchWord(word);
    });

    // DELETE BUTTON
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("card-btn");
    deleteBtn.addEventListener("click", () => {
      removeWord(word);
    });

    card.appendChild(title);
    card.appendChild(searchBtn);
    card.appendChild(deleteBtn);

    favoritesList.appendChild(card);
  });
}

// ERROR HANDLING
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add("error");
}

// THEME TOGGLE
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
function removeWord(word) {
  favorites = favorites.filter(w => w !== word);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}