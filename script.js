const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-navigation");

// Keep mobile navigation state and ARIA attributes in sync.
const closeNavigation = () => {
  if (!toggle || !nav) return;
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
};

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNavigation();
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1025px)").matches) closeNavigation();
  });
}

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", () => {
    const button = form.querySelector("button");
    if (button) button.textContent = "Opening email...";
  });
});
