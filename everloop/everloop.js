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


// Modal Logic
const modal = document.getElementById("poster-modal");
const modalImg = document.getElementById("modal-img");
const span = document.getElementsByClassName("close")[0];
const posters = document.querySelectorAll('.content-logo');

posters.forEach(poster => {
  poster.addEventListener('click', function () {
    modal.style.display = "flex";
    modalImg.src = this.src;
  });
});

// Close when clicking the X
span.onclick = function () {
  modal.style.display = "none";
}

// Close when clicking outside the image
modal.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}