const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-navigation");
const header = document.querySelector(".site-header");

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

if (header) {
  let previousScrollY = window.scrollY;
  let ticking = false;

  const updateHeaderVisibility = () => {
    const currentScrollY = window.scrollY;
    const navIsOpen = nav?.classList.contains("is-open");
    const scrollingDown = currentScrollY > previousScrollY;

    if (currentScrollY < 80 || navIsOpen) {
      header.classList.remove("is-hidden");
    } else if (scrollingDown) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    previousScrollY = Math.max(currentScrollY, 0);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      window.requestAnimationFrame(updateHeaderVisibility);
      ticking = true;
    },
    { passive: true }
  );
}

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button");
    const originalButtonText = button?.textContent;
    if (button) {
      button.textContent = "Sending...";
      button.disabled = true;
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });

      if (!response.ok) throw new Error("Form submission failed");

      window.location.replace(form.getAttribute("action") || "/thank-you");
    } catch (error) {
      if (button) {
        button.textContent = originalButtonText || "Submit";
        button.disabled = false;
      }

      HTMLFormElement.prototype.submit.call(form);
    }
  });
});

document.querySelectorAll(".faq-section").forEach((section) => {
  const items = Array.from(section.querySelectorAll(".faq-item"));

  const setItemOpen = (item, shouldOpen) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    item.classList.toggle("is-open", shouldOpen);
    button.setAttribute("aria-expanded", String(shouldOpen));
    answer.setAttribute("aria-hidden", String(!shouldOpen));
    answer.style.height = shouldOpen ? `${answer.scrollHeight}px` : "0px";
  };

  items.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    setItemOpen(item, item.classList.contains("is-open"));

    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("is-open");

      items.forEach((otherItem) => {
        setItemOpen(otherItem, otherItem === item && shouldOpen);
      });
    });
  });

  window.addEventListener("resize", () => {
    items.forEach((item) => {
      if (item.classList.contains("is-open")) setItemOpen(item, true);
    });
  });
});
