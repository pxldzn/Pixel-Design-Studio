// document.addEventListener("contextmenu", e => e.preventDefault());

// document.addEventListener("keydown", e => {
//   if (
//     e.key === "F12" ||
//     (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
//     (e.ctrlKey && e.key === "U")
//   ) {
//     e.preventDefault();
//   }
// });

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

  // Animate image, main content, and footer
  const imageContainer = document.querySelector(".image-container");
  if (imageContainer) imageContainer.classList.add("animate-in");

  const main = document.querySelector("main");
  if (main) main.classList.add("animate-in");

  const footer = document.querySelector("footer");
  if (footer) footer.classList.add("animate-in");
});

const mobileQuery = window.matchMedia("(max-width: 1120px)");

function swapSvgSources(isMobile) {
  document.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    const isFooterPlusGroup = img.classList.contains("footer-plus-group");
    if (isMobile) {
      if (
        src.includes("plusGroup.svg") &&
        !src.includes("plusGroupMobile.svg") &&
        !src.includes("plusGroupFooterMobile.svg")
      ) {
        if (isFooterPlusGroup) {
          img.setAttribute(
            "src",
            src.replace("plusGroup.svg", "plusGroupFooterMobile.svg"),
          );
        } else {
          img.setAttribute(
            "src",
            src.replace("plusGroup.svg", "plusGroupMobile.svg"),
          );
        }
      } else if (
        src.includes("plus.svg") &&
        !src.includes("plusMobile.svg") &&
        !src.includes("plusGroup")
      ) {
        img.setAttribute("src", src.replace("plus.svg", "plusMobile.svg"));
      }
    } else {
      if (
        src.includes("plusGroupMobile.svg") ||
        src.includes("plusGroupFooterMobile.svg")
      ) {
        img.setAttribute(
          "src",
          src
            .replace("plusGroupMobile.svg", "plusGroup.svg")
            .replace("plusGroupFooterMobile.svg", "plusGroup.svg"),
        );
      } else if (src.includes("plusMobile.svg")) {
        img.setAttribute("src", src.replace("plusMobile.svg", "plus.svg"));
      }
    }
  });
}

swapSvgSources(mobileQuery.matches);
mobileQuery.addEventListener("change", (e) => swapSvgSources(e.matches));

// ===== PDS & EDM SVG Swap (1120px breakpoint) =====
const tabletQuery = window.matchMedia("(max-width: 1120px)");

function swapFooterSvgs(isSmall) {
  document.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (isSmall) {
      if (src.includes("PDS.svg") && !src.includes("PDSmobile.svg")) {
        img.setAttribute("src", src.replace("PDS.svg", "PDSmobile.svg"));
      }
      if (src.includes("footer/EDM.svg") && !src.includes("EDMmobile.svg")) {
        img.setAttribute("src", src.replace("footer/EDM.svg", "EDMmobile.svg"));
      }
    } else {
      if (src.includes("PDSmobile.svg")) {
        img.setAttribute("src", src.replace("PDSmobile.svg", "PDS.svg"));
      }
      if (src.includes("EDMmobile.svg")) {
        img.setAttribute("src", src.replace("EDMmobile.svg", "footer/EDM.svg"));
      }
    }
  });
}

swapFooterSvgs(tabletQuery.matches);
tabletQuery.addEventListener("change", (e) => swapFooterSvgs(e.matches));
