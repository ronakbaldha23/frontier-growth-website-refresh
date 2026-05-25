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
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
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

  document.addEventListener("pointerdown", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    closeNavigation();
  });

  window.addEventListener("scroll", closeNavigation, { passive: true });

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

document.querySelectorAll(".contact-form select").forEach((select) => {
  const options = Array.from(select.options);
  const placeholder = options.find((option) => option.disabled)?.textContent || "Select an option";
  const wrapper = document.createElement("div");
  const trigger = document.createElement("button");
  const list = document.createElement("div");

  select.classList.add("native-select");
  select.setAttribute("tabindex", "-1");
  select.removeAttribute("required");

  wrapper.className = "custom-select";
  trigger.className = "custom-select-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = select.selectedOptions[0]?.disabled ? placeholder : select.selectedOptions[0]?.textContent || placeholder;

  list.className = "custom-select-options";
  list.setAttribute("role", "listbox");

  options
    .filter((option) => !option.disabled)
    .forEach((option) => {
      const item = document.createElement("button");
      item.className = "custom-select-option";
      item.type = "button";
      item.setAttribute("role", "option");
      item.textContent = option.textContent;

      item.addEventListener("click", () => {
        select.value = option.value;
        trigger.textContent = option.textContent;
        wrapper.classList.remove("is-open", "has-error");
        trigger.setAttribute("aria-expanded", "false");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });

      list.append(item);
    });

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelectorAll(".custom-select.is-open").forEach((openSelect) => {
      if (openSelect !== wrapper) {
        openSelect.classList.remove("is-open");
        openSelect.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
      }
    });
    const isOpen = wrapper.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  wrapper.append(trigger, list);
  select.insertAdjacentElement("afterend", wrapper);
});

document.addEventListener("pointerdown", (event) => {
  document.querySelectorAll(".custom-select.is-open").forEach((wrapper) => {
    if (wrapper.contains(event.target)) return;
    wrapper.classList.remove("is-open");
    wrapper.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".contact-form").forEach((form) => {
  const setFieldError = (field, message) => {
    const label = field.closest("label") || field.parentElement;
    if (!label) return;

    label.classList.add("field-error");
    field.classList.add("user-invalid");

    let validationMessage = label.querySelector(".validation-message");
    if (!validationMessage) {
      validationMessage = document.createElement("span");
      validationMessage.className = "validation-message";
      validationMessage.setAttribute("aria-live", "polite");
      label.append(validationMessage);
    }

    validationMessage.textContent = message;
  };

  const clearFieldError = (field) => {
    const label = field.closest("label") || field.parentElement;
    label?.classList.remove("field-error");
    field.classList.remove("user-invalid");
    field.nextElementSibling?.classList.remove("has-error");
  };

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const invalidField = Array.from(form.querySelectorAll("input, textarea, select")).find((field) => {
      if (field.classList.contains("native-select")) return !field.value;
      return !field.checkValidity();
    });
    if (invalidField) {
      const message = invalidField.validity.valueMissing
        ? "This field is required."
        : invalidField.type === "email"
          ? "Enter a valid email address."
          : "Please enter a valid value.";

      setFieldError(invalidField, message);
      const customSelect = invalidField.nextElementSibling;
      if (customSelect?.classList.contains("custom-select")) {
        customSelect.classList.add("has-error");
        customSelect.querySelector(".custom-select-trigger")?.focus();
      } else {
        invalidField.focus();
      }
      return;
    }

    const button = form.querySelector("button");
    const originalButtonText = button?.textContent;
    if (button) {
      button.dataset.originalText = originalButtonText || "Submit";
      button.textContent = "Sending...";
      button.disabled = true;
    }

    let timeout;
    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(window.location.pathname || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      if (!response.ok) throw new Error("Form submission failed");

      window.location.replace(form.getAttribute("action") || "/thank-you");
    } catch (error) {
      if (timeout) window.clearTimeout(timeout);
      if (button) {
        button.textContent = originalButtonText || "Submit";
        button.disabled = false;
      }

      HTMLFormElement.prototype.submit.call(form);
    }
  });
});

window.addEventListener("pageshow", () => {
  document.querySelectorAll(".contact-form button[type='submit']").forEach((button) => {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  });
});

document.querySelectorAll(".faq-section").forEach((section) => {
  const items = Array.from(section.querySelectorAll(".faq-item"));

  const setItemOpen = (item, shouldOpen) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    button.setAttribute("aria-expanded", String(shouldOpen));
    answer.setAttribute("aria-hidden", String(!shouldOpen));

    if (shouldOpen) {
      item.classList.add("is-open");
      answer.style.height = `${answer.scrollHeight}px`;
      return;
    }

    answer.style.height = `${answer.scrollHeight}px`;
    window.requestAnimationFrame(() => {
      item.classList.remove("is-open");
      answer.style.height = "0px";
    });
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
      const answer = item.querySelector(".faq-answer");
      if (answer && item.classList.contains("is-open")) {
        answer.style.height = `${answer.scrollHeight}px`;
      }
    });
  });

  items.forEach((item) => {
    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    answer.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height" || !item.classList.contains("is-open")) return;
      answer.style.height = "auto";
    });
  });
});
