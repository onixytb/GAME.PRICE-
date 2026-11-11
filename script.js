
const games = [
  {
    id: 1,
    name: "Grand Theft Auto VI",
    shortName: "GTA VI",
    platforms: ["PlayStation", "Xbox"],
    image: "https://placehold.co/400x550/17152c/a98aff?text=GTA+VI",
    description: "Découvre les informations et les offres disponibles pour Grand Theft Auto VI.",
    offers: []
  },
  {
    id: 2,
    name: "Minecraft",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo"],
    image: "https://placehold.co/400x550/18351e/ffffff?text=Minecraft",
    description: "Explore un monde composé de blocs et construis ce que tu imagines.",
    offers: []
  },
  {
    id: 3,
    name: "Red Dead Redemption 2",
    platforms: ["PC", "PlayStation", "Xbox"],
    image: "https://placehold.co/400x550/54251e/ffffff?text=Red+Dead+2",
    description: "Une aventure en monde ouvert dans l'univers du Far West.",
    offers: []
  },
  {
    id: 4,
    name: "Cyberpunk 2077",
    platforms: ["PC", "PlayStation", "Xbox"],
    image: "https://placehold.co/400x550/302b17/f7df45?text=Cyberpunk+2077",
    description: "Un jeu de rôle en monde ouvert dans une ville futuriste.",
    offers: []
  },
  {
    id: 5,
    name: "Rocket League",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo"],
    image: "https://placehold.co/400x550/123454/ffffff?text=Rocket+League",
    description: "Du football avec des voitures propulsées par des fusées.",
    offers: []
  },
  {
    id: 6,
    name: "EA SPORTS FC 26",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo"],
    image: "https://placehold.co/400x550/173b29/ffffff?text=EA+FC+26",
    description: "Retrouve le football avec EA SPORTS FC 26.",
    offers: []
  }
];

const results = document.getElementById("gameResults");
const searchInput = document.getElementById("gameSearch");
const searchForm = document.getElementById("searchForm");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const resultsSection = document.getElementById("results");
const detailsSection = document.getElementById("gameDetails");
const detailsContent = document.getElementById("detailsContent");

let currentGames = [...games];
let currentPlatform = "all";

function renderGames(list) {
  results.innerHTML = "";

  resultCount.textContent = list.length + (list.length > 1 ? " JEUX" : " JEU");

  emptyState.style.display = list.length ? "none" : "block";

  list.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const cover = document.createElement("img");
    cover.className = "game-cover";
    cover.src = game.image;
    cover.alt = "Jaquette de " + game.name;
    cover.loading = "lazy";

    cover.onerror = () => {
      cover.src = "https://placehold.co/400x550/17152c/ffffff?text=GAME";
    };

    const info = document.createElement("div");
    info.className = "game-info";

    const title = document.createElement("h3");
    title.textContent = game.name;

    const tags = document.createElement("div");

    game.platforms.forEach(platform => {
      const tag = document.createElement("span");
      tag.className = "platform-tag";
      tag.textContent = platform;
      tags.appendChild(tag);
    });

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    bottom.innerHTML = "<span>GAME.DEALS</span><span>VOIR →</span>";

    info.append(title, tags, bottom);
    card.append(cover, info);

    card.addEventListener("click", () => openGame(game.id));

    results.appendChild(card);
  });
}

function searchGames() {
  const query = searchInput.value.trim().toLowerCase();

  currentGames = games.filter(game => {
    const matchesName =
      game.name.toLowerCase().includes(query) ||
      (game.shortName && game.shortName.toLowerCase().includes(query));

    const matchesPlatform =
      currentPlatform === "all" ||
      game.platforms.includes(currentPlatform);

    return matchesName && matchesPlatform;
  });

  renderGames(currentGames);

  detailsSection.style.display = "none";
  resultsSection.style.display = "block";
}

function openGame(id) {
  const game = games.find(item => item.id === id);

  if (!game) return;

  resultsSection.style.display = "none";
  detailsSection.style.display = "block";

  detailsContent.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "detail-layout";

  const cover = document.createElement("img");
  cover.className = "detail-cover";
  cover.src = game.image;
  cover.alt = game.name;

  const info = document.createElement("div");
  info.className = "detail-info";

  const title = document.createElement("h2");
  title.textContent = game.name;

  const description = document.createElement("p");
  description.className = "detail-description";
  description.textContent = game.description;

  const platforms = document.createElement("div");

  game.platforms.forEach(platform => {
    const tag = document.createElement("span");
    tag.className = "platform-tag";
    tag.textContent = platform;
    platforms.appendChild(tag);
  });

  info.append(title, platforms, description);
  layout.append(cover, info);

  const offersTitle = document.createElement("h3");
  offersTitle.className = "offers-title";
  offersTitle.textContent = "Comparer les offres";

  const offers = document.createElement("div");

  if (!game.offers.length) {
    const message = document.createElement("p");
    message.className = "no-offers";
    message.textContent =
      "Les offres des boutiques seront bientôt disponibles.";
    offers.appendChild(message);
  } else {
    game.offers.forEach(offer => {
      const row = document.createElement("div");
      row.className = "offer-card";

      const shop = document.createElement("strong");
      shop.textContent = offer.shop;

      const price = document.createElement("span");
      price.textContent = offer.price;

      const link = document.createElement("a");
      link.href = offer.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "VOIR L'OFFRE";

      row.append(shop, price, link);
      offers.appendChild(row);
    });
  }

  detailsContent.append(layout, offersTitle, offers);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchGames();
  resultsSection.scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentPlatform = button.dataset.platform;
    searchGames();
  });
});

document.getElementById("backButton").addEventListener("click", () => {
  detailsSection.style.display = "none";
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth" });
});

renderGames(games);
    
