const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-navigation");
const header = document.querySelector(".site-header");
const formSubmitRecipient = "justin@frontiergrowth.io";
const formSubmitAction = `https://formsubmit.co/${encodeURIComponent(formSubmitRecipient)}`;
const formSubmitAjaxAction = `https://formsubmit.co/ajax/${encodeURIComponent(formSubmitRecipient)}`;

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
  const optionButtons = [];

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

  const closeSelect = () => {
    wrapper.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };

  const openSelect = () => {
    document.querySelectorAll(".custom-select.is-open").forEach((openWrapper) => {
      if (openWrapper !== wrapper) {
        openWrapper.classList.remove("is-open");
        openWrapper.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
      }
    });
    wrapper.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };

  const selectOption = (option) => {
    select.value = option.value;
    trigger.textContent = option.textContent;
    wrapper.classList.remove("has-error");
    closeSelect();
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };

  options
    .filter((option) => !option.disabled)
    .forEach((option) => {
      const item = document.createElement("button");
      item.className = "custom-select-option";
      item.type = "button";
      item.setAttribute("role", "option");
      item.textContent = option.textContent;

      item.addEventListener("click", () => {
        selectOption(option);
        trigger.focus();
      });

      item.addEventListener("keydown", (event) => {
        const currentIndex = optionButtons.indexOf(item);
        if (event.key === "ArrowDown") {
          event.preventDefault();
          optionButtons[Math.min(currentIndex + 1, optionButtons.length - 1)]?.focus();
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          optionButtons[Math.max(currentIndex - 1, 0)]?.focus();
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectOption(option);
          trigger.focus();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeSelect();
          trigger.focus();
        }
      });

      optionButtons.push(item);
      list.append(item);
    });

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (wrapper.classList.contains("is-open")) {
      closeSelect();
    } else {
      openSelect();
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      openSelect();
      optionButtons[0]?.focus();
    }
    if (event.key === "Escape") {
      closeSelect();
    }
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
  const ensureHiddenField = (name, value) => {
    let field = form.querySelector(`input[name="${name}"]`);
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.prepend(field);
    }
    field.value = value;
    return field;
  };

  const subjectField = ensureHiddenField("_subject", "Frontier Growth Website Inquiry");
  ensureHiddenField("_template", "table");
  ensureHiddenField("_captcha", "false");
  ensureHiddenField("_next", `${window.location.origin}/thank-you`);
  form.action = formSubmitAction;

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

    if (form.dataset.submitting === "true") return;

    const botField = form.querySelector('[name="bot-field"]');
    if (botField?.value) {
      window.location.replace("/thank-you");
      return;
    }

    const invalidField = Array.from(form.querySelectorAll("input, textarea, select")).find((field) => {
      if (field.type === "hidden") return false;
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

    const button = form.querySelector("button[type='submit']");
    const originalButtonText = button?.textContent;
    const pageName = form.querySelector('input[name="page"]')?.value || document.title || "Website";
    const visitorName = form.querySelector('input[name="name"]')?.value.trim() || "New lead";
    const submittedAt = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    subjectField.value = `Frontier Growth Inquiry - ${pageName} - ${visitorName} - ${submittedAt}`;
    const formData = new FormData(form);
    formData.delete("bot-field");

    form.dataset.submitting = "true";
    form.setAttribute("aria-busy", "true");
    if (button) {
      button.dataset.originalText = originalButtonText || "Submit";
      button.textContent = "Sending...";
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    }

    let timeout;
    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(formSubmitAjaxAction, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      if (!response.ok) throw new Error("Form submission failed");

      window.location.assign(form.querySelector('input[name="_next"]')?.value || "/thank-you");
    } catch (error) {
      if (timeout) window.clearTimeout(timeout);
      form.dataset.submitting = "false";
      form.removeAttribute("aria-busy");
      if (button) {
        button.textContent = "Try again";
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    }
  });
});

window.addEventListener("pageshow", () => {
  document.querySelectorAll(".contact-form").forEach((form) => {
    form.dataset.submitting = "false";
    form.removeAttribute("aria-busy");
  });

  document.querySelectorAll(".contact-form button[type='submit']").forEach((button) => {
    button.disabled = false;
    button.removeAttribute("aria-busy");
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
