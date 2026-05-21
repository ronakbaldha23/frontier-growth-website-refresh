const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", () => {
    const button = form.querySelector("button");
    if (button) button.textContent = "Opening email";
  });
});
