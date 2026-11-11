
const API = "https://www.cheapshark.com/api/1.0";

const elements = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("gameSearch"),
  results: document.getElementById("gameResults"),
  count: document.getElementById("resultCount"),
  empty: document.getElementById("emptyState"),
  status: document.getElementById("statusMessage"),
  section: document.getElementById("results"),
  details: document.getElementById("gameDetails"),
  detailsContent: document.getElementById("detailsContent"),
  back: document.getElementById("backButton")
};

let stores = {};
let searchNumber = 0;

async function apiRequest(endpoint) {
  const response = await fetch(API + endpoint);

  if (response.status === 429) {
    throw new Error("Trop de recherches en peu de temps. Réessaie plus tard.");
  }

  if (!response.ok) {
    throw new Error("Le service de recherche est momentanément indisponible.");
  }

  return response.json();
}

async function loadStores() {
  try {
    const data = await apiRequest("/stores");

    data.forEach(store => {
      stores[store.storeID] = store.storeName;
    });
  } catch (error) {
    console.warn("Liste des boutiques indisponible", error);
  }
}

function setStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.className = "status-message " + type;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function showEmpty(show) {
  elements.empty.style.display = show ? "block" : "none";
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Prix indisponible";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD"
  }).format(number);
}

function renderGames(games) {
  elements.results.innerHTML = "";

  elements.count.textContent =
    games.length + (games.length > 1 ? " JEUX" : " JEU");

  showEmpty(games.length === 0);

  games.forEach(game => {
    const card = createElement("article", "game-card");

    const image = createElement("img", "game-cover");
    image.src = game.thumb || "https://placehold.co/400x550/17152c/ffffff?text=GAME";
    image.alt = "Jaquette de " + game.external;
    image.loading = "lazy";

    image.onerror = () => {
      image.src = "https://placehold.co/400x550/17152c/ffffff?text=GAME";
    };

    const info = createElement("div", "game-info");
    const title = createElement("h3", "", game.external);
    const platform = createElement("span", "platform-tag", "PC");

    const bottom = createElement("div", "card-bottom");
    const cheapest = createElement(
      "span",
      "",
      game.cheapest ? "Dès " + formatPrice(game.cheapest) : "Prix indisponible"
    );

    const view = createElement("span", "", "VOIR →");

    bottom.append(cheapest, view);
    info.append(title, platform, bottom);
    card.append(image, info);

    card.addEventListener("click", () => openGame(game.gameID));

    elements.results.appendChild(card);
  });
}

async function searchGames() {
  const query = elements.input.value.trim();

  if (query.length < 2) {
    setStatus("Entre au moins deux caractères.", "error");
    return;
  }

  const requestId = ++searchNumber;

  elements.details.style.display = "none";
  elements.section.style.display = "block";
  elements.results.innerHTML = "";
  elements.count.textContent = "RECHERCHE...";
  showEmpty(false);
  setStatus("Recherche des jeux en cours...");

  elements.section.scrollIntoView({ behavior: "smooth" });

  try {
    const data = await apiRequest(
      "/games?title=" + encodeURIComponent(query) + "&limit=30"
    );

    if (requestId !== searchNumber) return;

    const games = Array.isArray(data) ? data : [];

    renderGames(games);

    if (games.length) {
      setStatus(games.length + " résultat(s) trouvé(s).", "success");
    } else {
      setStatus("Aucun jeu correspondant dans la base de prix PC.");
    }
  } catch (error) {
    if (requestId !== searchNumber) return;

    elements.count.textContent = "ERREUR";
    showEmpty(false);
    setStatus(error.message, "error");
  }
}

async function openGame(gameId) {
  elements.section.style.display = "none";
  elements.details.style.display = "block";
  elements.detailsContent.innerHTML = "";
  elements.detailsContent.append(
    createElement("p", "no-offers", "Chargement des offres...")
  );

  window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    const game = await apiRequest("/games?id=" + encodeURIComponent(gameId));

    if (!game || !game.info) {
      throw new Error("Informations du jeu introuvables.");
    }

    renderGameDetails(game);
  } catch (error) {
    elements.detailsContent.innerHTML = "";
    elements.detailsContent.append(
      createElement("p", "no-offers", error.message)
    );
  }
}

function renderGameDetails(game) {
  const info = game.info;
  const deals = Array.isArray(game.deals) ? game.deals : [];

  elements.detailsContent.innerHTML = "";

  const layout = createElement("div", "detail-layout");

  const cover = createElement("img", "detail-cover");
  cover.src = info.thumb || "https://placehold.co/400x550/17152c/ffffff?text=GAME";
  cover.alt = info.title;

  const description = createElement(
    "p",
    "detail-description",
    "Comparaison des offres PC actuellement répertoriées pour " +
    info.title + "."
  );

  const content = createElement("div", "detail-info");
  const title = createElement("h2", "", info.title);
  const platform = createElement("span", "platform-tag", "PC");

  content.append(title, platform, description);
  layout.append(cover, content);

  elements.detailsContent.append(layout);

  const heading = createElement("h3", "offers-title", "Comparer les boutiques");
  elements.detailsContent.append(heading);

  deals.sort((a, b) => Number(a.price) - Number(b.price));

  if (deals.length === 0) {
    elements.detailsContent.append(
      createElement(
        "p",
        "no-offers",
        "Aucune offre actuellement répertoriée pour ce jeu."
      )
    );
  }

  deals.forEach(deal => {
    const row = createElement("div", "offer-card");

    const storeName =
      stores[deal.storeID] || "Boutique partenaire";

    const store = createElement("strong", "", storeName);

    const priceBox = createElement("div");
    const price = createElement("span", "", formatPrice(deal.price));

    priceBox.append(price);

    const savings = Number(deal.savings);

    if (Number.isFinite(savings) && savings > 0) {
      priceBox.append(
        createElement(
          "small",
          "discount-label",
          "-" + Math.round(savings) + "%"
        )
      );
    }

    const link = createElement("a", "", "VOIR L'OFFRE");
    link.href =
      "https://www.cheapshark.com/redirect?dealID=" +
      encodeURIComponent(deal.dealID);

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    row.append(store, priceBox, link);
    elements.detailsContent.append(row);
  });

  const source = createElement("p", "source-credit");
  const sourceLink = createElement("a", "", "Données fournies par CheapShark");

  sourceLink.href = "https://www.cheapshark.com/";
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";

  source.append(sourceLink);
  elements.detailsContent.append(source);
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();
  searchGames();
});

elements.back.addEventListener("click", () => {
  elements.details.style.display = "none";
  elements.section.style.display = "block";
  elements.section.scrollIntoView({ behavior: "smooth" });
});

loadStores();
showEmpty(false);
  
