const productGrid = document.querySelector("#productGrid");

const heroBackgrounds = [...document.querySelectorAll(".hero-background")];
const coordinateX = document.querySelector("[data-coordinate-x]");
const coordinateY = document.querySelector("[data-coordinate-y]");
const systemPanelGroups = [...document.querySelectorAll("[data-system-panels]")];
const imageGalleries = [...document.querySelectorAll("[data-product-gallery], [data-system-note-gallery]")];
const scrollRevealItems = [...document.querySelectorAll(".scroll-reveal")];

if (heroBackgrounds.length > 1) {
  let activeHeroBackground = 0;

  window.setInterval(() => {
    heroBackgrounds[activeHeroBackground].classList.remove("is-active");
    activeHeroBackground = (activeHeroBackground + 1) % heroBackgrounds.length;
    heroBackgrounds[activeHeroBackground].classList.add("is-active");
  }, 15000);
}

if (scrollRevealItems.length) {
  if ("IntersectionObserver" in window) {
    const scrollRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          scrollRevealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    scrollRevealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
      scrollRevealObserver.observe(item);
    });
  } else {
    scrollRevealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
}

if (productGrid) {
  const productCards = [...productGrid.querySelectorAll(".product-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const shopSort = document.querySelector("#shopSort");
  const shopCount = document.querySelector("#shopCount");
  const loadMoreProducts = document.querySelector("#loadMoreProducts");
  const productsPerPage = 4;
  let activeFilter = "all";
  let visibleLimit = productsPerPage;

  function getCategoryRank(category) {
    return {
      clothing: 1,
      furniture: 2,
      design: 3,
    }[category] || 0;
  }

  function renderProducts() {
    const sortedCards = [...productCards].sort((a, b) => {
      if (shopSort.value === "price-low") {
        return Number(a.dataset.price) - Number(b.dataset.price);
      }

      if (shopSort.value === "price-high") {
        return Number(b.dataset.price) - Number(a.dataset.price);
      }

      return (
        getCategoryRank(a.dataset.category) - getCategoryRank(b.dataset.category) ||
        Number(a.dataset.featured) - Number(b.dataset.featured)
      );
    });

    const matchingCards = sortedCards.filter((card) => {
      return activeFilter === "all" || card.dataset.category === activeFilter;
    });
    let visibleCount = 0;

    sortedCards.forEach((card) => {
      const isMatching = matchingCards.includes(card);
      const isVisible = isMatching && visibleCount < visibleLimit;

      if (isVisible) {
        visibleCount += 1;
        card.classList.remove("is-hidden");
        card.classList.add("is-entering");
        card.style.transitionDelay = `${(visibleCount - 1) * 85}ms`;
      } else {
        card.classList.remove("is-entering");
        card.classList.add("is-hidden");
        card.style.transitionDelay = "";
      }

      productGrid.append(card);
    });

    window.requestAnimationFrame(() => {
      sortedCards.forEach((card) => {
        if (!card.classList.contains("is-hidden")) {
          card.classList.remove("is-entering");
        }
      });
    });

    window.setTimeout(() => {
      sortedCards.forEach((card) => {
        card.style.transitionDelay = "";
      });
    }, 1500);

    if (shopCount) {
      const label = matchingCards.length === 1 ? "module" : "modules";
      shopCount.textContent = `${matchingCards.length} ${label} loaded`;
    }

    if (loadMoreProducts) {
      const shownCount = Math.min(visibleLimit, matchingCards.length);
      loadMoreProducts.hidden = shownCount >= matchingCards.length;
      loadMoreProducts.textContent = `LOAD MORE (${shownCount}/${matchingCards.length})`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      visibleLimit = productsPerPage;
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
      renderProducts();
    });
  });

  shopSort.addEventListener("change", renderProducts);
  loadMoreProducts?.addEventListener("click", () => {
    visibleLimit += productsPerPage;
    renderProducts();
  });
  renderProducts();
}

if (coordinateX && coordinateY) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;

    coordinateX.textContent = `X ${x.toFixed(2)}`;
    coordinateY.textContent = `Y ${y.toFixed(2)}`;
  });
}

systemPanelGroups.forEach((group) => {
  const panels = [...group.children];
  let activePanel = 0;

  if (panels.length < 2) {
    return;
  }

  panels[activePanel].classList.add("is-panel-active");

  window.setInterval(() => {
    panels[activePanel].classList.remove("is-panel-active");
    activePanel = (activePanel + 1) % panels.length;
    panels[activePanel].classList.add("is-panel-active");
  }, 2600);

  panels.forEach((panel, index) => {
    panel.addEventListener("pointerenter", () => {
      panels[activePanel].classList.remove("is-panel-active");
      activePanel = index;
      panel.classList.add("is-panel-active");
    });
  });
});

imageGalleries.forEach((gallery) => {
  const mainImage = gallery.querySelector("[data-gallery-main]");
  const galleryButtons = [...gallery.querySelectorAll("[data-gallery-src]")];
  const previousButton = gallery.querySelector("[data-gallery-prev]");
  const nextButton = gallery.querySelector("[data-gallery-next]");
  let activeGalleryIndex = 0;

  function showGalleryImage(index) {
    if (!mainImage || !galleryButtons.length) {
      return;
    }

    activeGalleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const activeButton = galleryButtons[activeGalleryIndex];

    mainImage.src = activeButton.dataset.gallerySrc;
    mainImage.alt = activeButton.dataset.galleryAlt || "";
    galleryButtons.forEach((item) => item.classList.remove("is-active"));
    activeButton.classList.add("is-active");
  }

  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      showGalleryImage(index);
    });
  });

  previousButton?.addEventListener("click", () => {
    showGalleryImage(activeGalleryIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    showGalleryImage(activeGalleryIndex + 1);
  });
});

const storyPuzzle = document.querySelector("[data-story-puzzle]");

if (storyPuzzle) {
  const storyCards = [...storyPuzzle.querySelectorAll("[data-story-card]")];
  const cardFilterButtons = [...storyPuzzle.querySelectorAll("[data-card-filter]")];
  const storyBoardGrid = storyPuzzle.querySelector("[data-story-board-grid]");
  const storyBoard = storyPuzzle.querySelector("[data-story-board]");
  const storyCollage = storyPuzzle.querySelector("[data-story-collage]");
  const storyOutput = storyPuzzle.querySelector("[data-story-output]");
  const storyInstruction = storyPuzzle.querySelector("[data-story-instruction]");
  const storyIntroModal = document.querySelector("[data-story-intro-modal]");
  const storyIntroClose = document.querySelector("[data-story-intro-close]");
  const resetButtons = [...storyPuzzle.querySelectorAll("[data-story-reset]")];
  const shuffleButton = storyPuzzle.querySelector("[data-story-shuffle]");
  const copyButton = storyPuzzle.querySelector("[data-story-copy]");
  const maxBoardCards = 12;
  const introStorageKey = "ffee-story-intro-dismissed";
  const copyButtonDefaultText = copyButton?.textContent || "복사";
  let draggedCardId = "";

  function closeStoryIntro() {
    storyIntroModal?.classList.add("is-hidden");
    window.sessionStorage.setItem(introStorageKey, "true");
  }

  function getSelectedCards() {
    return storyCards.filter((card) => card.classList.contains("is-selected"));
  }

  function getCardById(cardId) {
    return storyCards.find((card) => card.dataset.cardId === cardId);
  }

  function getDraggedCard(event) {
    return getCardById(event.dataTransfer.getData("text/plain") || draggedCardId);
  }

  function addCardToBoard(card) {
    if (!card || card.classList.contains("is-selected") || getSelectedCards().length >= maxBoardCards) {
      return;
    }

    card.classList.add("is-selected");
    renderStory();
  }

  function removeCardFromBoard(card) {
    if (!card) {
      return;
    }

    card.classList.remove("is-selected");
    renderStory();
  }

  function createBoardCard(card) {
    const boardCard = document.createElement("article");
    boardCard.className = "board-card";
    boardCard.tabIndex = 0;
    boardCard.dataset.boardCardId = card.dataset.cardId;
    boardCard.setAttribute("role", "button");
    boardCard.setAttribute("aria-label", `${card.dataset.cardLabel} 카드 제거`);
    boardCard.title = "클릭하면 보드에서 제거됩니다";

    if (card.dataset.cardImage) {
      const image = document.createElement("img");
      image.src = card.dataset.cardImage;
      image.alt = `${card.dataset.cardLabel} 보드 카드 이미지`;
      boardCard.append(image);
    } else {
      const colorBlock = document.createElement("span");
      colorBlock.className = "board-color-block";
      colorBlock.style.background = card.dataset.cardColor || "";
      boardCard.append(colorBlock);
    }

    const label = document.createElement("span");
    label.textContent = card.dataset.cardLabel;
    boardCard.append(label);

    boardCard.addEventListener("click", () => {
      removeCardFromBoard(card);
    });

    boardCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        removeCardFromBoard(card);
      }
    });

    return boardCard;
  }

  function createBoardSlot() {
    const slot = document.createElement("div");
    slot.className = "board-slot";
    slot.textContent = "+";

    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
      slot.classList.add("is-drop-target");
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("is-drop-target");
    });

    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      slot.classList.remove("is-drop-target");
      addCardToBoard(getDraggedCard(event));
    });

    return slot;
  }

  function createCollageLayer(card, index) {
    const layer = document.createElement("div");
    const layouts = [
      { top: "6%", left: "8%", width: "58%", height: "46%", rotate: "-1deg" },
      { top: "14%", left: "45%", width: "38%", height: "58%", rotate: "2deg" },
      { top: "50%", left: "10%", width: "46%", height: "34%", rotate: "-8deg" },
      { top: "54%", left: "48%", width: "42%", height: "30%", rotate: "7deg" },
      { top: "28%", left: "24%", width: "34%", height: "42%", rotate: "-3deg" },
      { top: "8%", left: "60%", width: "28%", height: "28%", rotate: "5deg" },
    ];
    const layout = layouts[index % layouts.length];

    layer.className = "collage-layer";
    layer.dataset.label = card.dataset.cardLabel;
    layer.style.top = layout.top;
    layer.style.left = layout.left;
    layer.style.width = layout.width;
    layer.style.height = layout.height;
    layer.style.transform = `rotate(${layout.rotate})`;
    layer.style.zIndex = String(index + 1);

    if (card.dataset.cardImage) {
      layer.style.backgroundImage = `url("${card.dataset.cardImage}")`;
    } else {
      layer.classList.add("collage-color-layer");
      layer.style.background = card.dataset.cardColor || "#565a41";
    }

    return layer;
  }

  function renderCollage(selectedCards) {
    if (!storyCollage) {
      return;
    }

    storyCollage.replaceChildren();

    if (!selectedCards.length) {
      const empty = document.createElement("div");
      empty.className = "collage-empty";
      empty.textContent = "카드를 선택하면 조합 이미지가 만들어집니다.";
      storyCollage.append(empty);
      return;
    }

    selectedCards.slice(0, 6).forEach((card, index) => {
      storyCollage.append(createCollageLayer(card, index));
    });
  }

  function getCardsByCategory(cards, category) {
    return cards.filter((card) => card.dataset.cardCategory === category);
  }

  function getCardLabels(cards) {
    return cards.map((card) => card.dataset.cardLabel).filter(Boolean);
  }

  function createBrandSentence(selectedCards) {
    const labels = getCardLabels(selectedCards);
    const clothing = getCardLabels(getCardsByCategory(selectedCards, "clothing"));
    const objects = getCardLabels(getCardsByCategory(selectedCards, "object"));
    const materials = getCardLabels(getCardsByCategory(selectedCards, "material"));
    const colors = getCardLabels(getCardsByCategory(selectedCards, "color"));
    const selectedLines = selectedCards
      .slice(0, 4)
      .map((card) => card.dataset.cardLine)
      .filter(Boolean);

    const labelLine = labels.join(" + ");
    const clothingPhrase = clothing.length ? clothing.join(", ") : "몸에 가까운 표면";
    const objectPhrase = objects.length ? objects.join(", ") : "사용의 구조";
    const materialPhrase = materials.length ? materials.join(", ") : "소재의 결";
    const colorPhrase = colors.length ? colors.join(", ") : "낮은 색감";

    if (selectedCards.length === 1) {
      const firstLine = selectedLines[0] || `${labelLine}은 FFEE의 감각 체계 안에서 하나의 기준점이 됩니다`;
      return `${labelLine}. ${firstLine}. FFEE는 이 조각을 사물의 쓰임과 분위기를 다시 읽는 출발점으로 둡니다.`;
    }

    if (clothing.length && objects.length && colors.length) {
      return `${labelLine}. ${clothingPhrase}의 표면과 ${objectPhrase}의 구조가 ${colorPhrase} 안에서 정리됩니다. FFEE는 입는 것과 사용하는 것 사이의 감각을 하나의 장면으로 배열합니다.`;
    }

    if (objects.length && colors.length) {
      return `${labelLine}. ${objectPhrase}의 쓰임과 ${colorPhrase}의 온도가 하나의 조용한 장면으로 모입니다. FFEE는 기능을 분위기로 번역합니다.`;
    }

    if (clothing.length && colors.length) {
      return `${labelLine}. ${clothingPhrase}의 실루엣이 ${colorPhrase}의 표면 위에서 낮고 선명하게 정리됩니다. FFEE는 옷을 몸에 가까운 구조이자 감각의 표면으로 봅니다.`;
    }

    if (materials.length || selectedLines.length >= 3) {
      return `${labelLine}. ${selectedLines.join(". ")}. FFEE는 이 조합을 통해 소재, 형태, 색이 하나의 문장으로 작동하는 방식을 보여줍니다.`;
    }

    return `${labelLine}. ${clothingPhrase}, ${objectPhrase}, ${materialPhrase}, ${colorPhrase}가 하나의 감각 보드 위에 놓입니다. FFEE는 사물을 따로 고르지 않고 서로의 분위기와 쓰임으로 연결합니다.`;
  }

  function renderStory() {
    const selectedCards = getSelectedCards();
    storyBoardGrid.replaceChildren();
    renderCollage(selectedCards);

    selectedCards.slice(0, maxBoardCards).forEach((card) => {
      storyBoardGrid.append(createBoardCard(card));
    });

    const slotsToShow = Math.max(0, maxBoardCards - selectedCards.length);
    for (let index = 0; index < slotsToShow; index += 1) {
      storyBoardGrid.append(createBoardSlot());
    }

    if (storyInstruction) {
      if (selectedCards.length) {
        storyInstruction.textContent = `${selectedCards.length}개의 카드로 브랜드 문구를 구성 중입니다`;
      } else {
        storyInstruction.textContent = "카드를 선택해 브랜드 문구를 만들어보세요";
      }
    }

    if (!storyOutput) {
      return;
    }

    if (!selectedCards.length) {
      storyOutput.textContent =
        "감각 라이브러리에서 조각을 선택하면 의류, 오브젝트, 소재, 색이 FFEE의 브랜드 문구로 정리됩니다.";
      return;
    }

    storyOutput.textContent = createBrandSentence(selectedCards);
  }

  function setActiveCardFilter(category) {
    cardFilterButtons.forEach((button) => {
      const isActive = button.dataset.cardFilter === category;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    storyCards.forEach((card) => {
      card.classList.toggle("is-filter-hidden", category !== "all" && card.dataset.cardCategory !== category);
    });
  }

  storyCards.forEach((card) => {
    card.draggable = true;

    card.addEventListener("click", () => {
      card.classList.toggle("is-selected");
      renderStory();
    });

    card.addEventListener("dragstart", (event) => {
      draggedCardId = card.dataset.cardId;
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", card.dataset.cardId);
      card.classList.add("is-dragging");
    });

    card.addEventListener("dragend", () => {
      draggedCardId = "";
      card.classList.remove("is-dragging");
      storyBoardGrid.querySelectorAll(".is-drop-target").forEach((slot) => {
        slot.classList.remove("is-drop-target");
      });
      storyBoard?.classList.remove("is-drop-target");
    });
  });

  storyBoard?.addEventListener("dragover", (event) => {
    if (!draggedCardId) {
      return;
    }

    event.preventDefault();
    storyBoard.classList.add("is-drop-target");
  });

  storyBoard?.addEventListener("dragleave", (event) => {
    if (!storyBoard.contains(event.relatedTarget)) {
      storyBoard.classList.remove("is-drop-target");
    }
  });

  storyBoard?.addEventListener("drop", (event) => {
    event.preventDefault();
    storyBoard.classList.remove("is-drop-target");
    addCardToBoard(getDraggedCard(event));
  });

  cardFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveCardFilter(button.dataset.cardFilter);
    });
  });

  resetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      storyCards.forEach((card) => card.classList.remove("is-selected"));
      renderStory();
    });
  });

  shuffleButton?.addEventListener("click", () => {
    storyCards.forEach((card) => card.classList.remove("is-selected"));
    [...storyCards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .forEach((card) => card.classList.add("is-selected"));
    renderStory();
  });

  copyButton?.addEventListener("click", async () => {
    if (!storyOutput) {
      return;
    }

    const textToCopy = storyOutput.textContent.trim();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      copyButton.textContent = "복사됨";
      window.setTimeout(() => {
        copyButton.textContent = copyButtonDefaultText;
      }, 1300);
    } catch {
      const copyField = document.createElement("textarea");
      copyField.value = textToCopy;
      copyField.setAttribute("readonly", "");
      copyField.style.position = "fixed";
      copyField.style.top = "-1000px";
      document.body.append(copyField);
      copyField.select();

      const didCopy = document.execCommand("copy");
      copyField.remove();
      if (!didCopy) {
        const selection = window.getSelection();
        const storyRange = document.createRange();
        storyRange.selectNodeContents(storyOutput);
        selection.removeAllRanges();
        selection.addRange(storyRange);
      }

      copyButton.textContent = didCopy ? "복사됨" : "선택됨";
      window.setTimeout(() => {
        copyButton.textContent = copyButtonDefaultText;
      }, 1300);
    }
  });

  if (storyIntroModal && window.sessionStorage.getItem(introStorageKey) === "true") {
    storyIntroModal.classList.add("is-hidden");
  }

  storyIntroClose?.addEventListener("click", closeStoryIntro);

  storyIntroModal?.addEventListener("click", (event) => {
    if (event.target === storyIntroModal) {
      closeStoryIntro();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && storyIntroModal && !storyIntroModal.classList.contains("is-hidden")) {
      closeStoryIntro();
    }
  });

  renderStory();
  setActiveCardFilter(cardFilterButtons[0]?.dataset.cardFilter || "all");
}
