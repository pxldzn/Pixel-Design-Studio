document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("keydown", e => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});


let lastScrollY = window.scrollY;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    // scrolling down
    navbar.classList.add("navbar--hidden");
  } else {
    // scrolling up
    navbar.classList.remove("navbar--hidden");
  }

  lastScrollY = currentScrollY;
});


// Handle touch interactions
const navText = document.querySelector(".nav-text");

navText.addEventListener("click", (e) => {
  if (!window.matchMedia("(hover: hover)").matches) {
    if (!navText.classList.contains("expanded")) {

      navText.classList.add("expanded");
    } else {

    }
  }
});

document.addEventListener("click", (event) => {
  if (!navText.contains(event.target)) {
    navText.classList.remove("expanded");
  }
});

// ===== Entrance Animations =====
document.addEventListener("DOMContentLoaded", () => {
  // Animate navbar
  const nav = document.querySelector(".navbar");
  if (nav) nav.classList.add("animate-in");

  // Staggered animate grid items
  const gridItems = document.querySelectorAll(".grid-item");
  gridItems.forEach((item) => {
    item.classList.add("animate-in");
  });
});
