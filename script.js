const panelData = {
  supplements: {
    label: "SUPPLEMENT PANEL · CONCEPT V1",
    title: "Know whether the basics show up.",
    description:
      "Compare selected vitamins, minerals, fillers and contaminants against the label’s expected profile.",
    signals: [
      ["Magnesium", "Detected", "detected"],
      ["Vitamin C", "Detected", "detected"],
      ["Iron", "Low", "alert"],
      ["Starch", "Elevated", "alert"],
      ["Lead", "Not detected", "info"],
      ["Ashwagandha", "Unsupported", "neutral"],
    ],
  },
  spices: {
    label: "SPICE PANEL · CONCEPT V1",
    title: "See more than colour and aroma.",
    description:
      "Screen selected spice markers alongside common fillers, synthetic colours and concerning contaminants.",
    signals: [
      ["Turmeric marker", "Detected", "detected"],
      ["Starch", "Elevated", "alert"],
      ["Synthetic dye", "Check", "alert"],
      ["Salt", "Moderate", "info"],
      ["Lead screen", "Negative", "detected"],
      ["Origin", "Unsupported", "neutral"],
    ],
  },
  protein: {
    label: "PROTEIN PANEL · CONCEPT V1",
    title: "Interrogate the scoop.",
    description:
      "Compare broad protein response, carbohydrates and selected fillers against the product’s declared profile.",
    signals: [
      ["Protein", "Detected", "detected"],
      ["Reducing sugar", "High", "alert"],
      ["Starch", "Detected", "info"],
      ["Creatine", "Detected", "detected"],
      ["Caffeine", "Not listed", "alert"],
      ["Amino profile", "Unsupported", "neutral"],
    ],
  },
  ayurveda: {
    label: "AYURVEDA PANEL · RESEARCH TRACK",
    title: "Check supported markers and risks.",
    description:
      "Screen selected mineral, filler and heavy-metal targets while clearly separating supported tests from unknown plant chemistry.",
    signals: [
      ["Plant marker", "Detected", "detected"],
      ["Mercury screen", "Check", "alert"],
      ["Lead screen", "Negative", "detected"],
      ["Starch", "Moderate", "info"],
      ["Iron", "Detected", "detected"],
      ["Full herb ID", "Unsupported", "neutral"],
    ],
  },
};

const signalContainer = document.querySelector("#panel-signals");
const panelLabel = document.querySelector("#panel-label");
const panelTitle = document.querySelector("#panel-title");
const panelDescription = document.querySelector("#panel-description");
const panelTabs = document.querySelectorAll(".panel-tab");

function renderPanel(key) {
  const panel = panelData[key];
  if (!panel || !signalContainer) return;

  panelLabel.textContent = panel.label;
  panelTitle.textContent = panel.title;
  panelDescription.textContent = panel.description;
  signalContainer.innerHTML = panel.signals
    .map(
      ([name, status, tone]) => `
        <div class="signal-bubble ${tone}">
          <div>
            <strong>${name}</strong>
            <small>${status}</small>
          </div>
        </div>
      `,
    )
    .join("");
}

panelTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    panelTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    renderPanel(tab.dataset.panel);
  });
});

renderPanel("supplements");

const copyButtons = document.querySelectorAll("[data-copy-target]");

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy-target");
    const target = targetId ? document.getElementById(targetId) : null;
    const text = target?.textContent?.trim();
    const status = document.querySelector(".copy-status");

    if (!text) {
      if (status) status.textContent = "Brief text was not found.";
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (!copyTextFallback(text)) {
        throw new Error("Clipboard fallback failed");
      }

      button.classList.add("copied");
      if (status) status.textContent = "Manufacturer brief copied.";
      setTimeout(() => button.classList.remove("copied"), 1600);
    } catch (error) {
      if (status) status.textContent = "Copy failed. Select the brief text manually.";
    }
  });
});

const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

reveals.forEach((element) => revealObserver.observe(element));

const cursorGlow = document.querySelector(".cursor-glow");
window.addEventListener(
  "pointermove",
  (event) => {
    if (!cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  },
  { passive: true },
);

const choices = document.querySelectorAll(".choice");
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    choices.forEach((item) => item.classList.remove("active"));
    choice.classList.add("active");
  });
});

const pilotForm = document.querySelector(".pilot-form");
const pilotEmail = document.querySelector("#pilot-email");
const formStatus = document.querySelector(".form-status");

pilotForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = pilotEmail.value.trim();
  const selectedPanel = document.querySelector(".choice.active")?.textContent.trim() || "Supplements";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formStatus.textContent = "Enter a valid email to continue.";
    pilotEmail.focus();
    return;
  }

  localStorage.setItem(
    "truth-sachet-pilot-interest",
    JSON.stringify({ email, panel: selectedPanel, createdAt: new Date().toISOString() }),
  );
  formStatus.textContent = `Interest saved on this device · ${selectedPanel} panel selected.`;
  pilotForm.reset();
});
