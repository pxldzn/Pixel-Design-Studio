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

// Slider Factory Function
const sliderControls = [];
let isModalOpen = false;

function initSlider(container) {
  const sliderTrack = container.querySelector(".slider-track");
  const originalSlides = Array.from(container.querySelectorAll(".slide"));

  if (!sliderTrack || originalSlides.length === 0) return;

  // Clone slides for infinite loop
  // We clone enough slides to cover the view, but for simplicity in this specific "strip" case,
  // cloning the entire set once is usually sufficient if the set is wider than the container.
  // To be safe, let's clone the set twice (once for end buffer).
  // Actually, a standard infinite loop usually needs: [Original] [Clone]
  // When we scroll past [Original], we snap back to 0.

  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("clone");
    sliderTrack.appendChild(clone);
  });

  const allSlides = container.querySelectorAll(".slide");

  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID;
  let currentIndex = 0;
  let autoSlideID;
  let isAutoSliding = false;
  let clickAllowed = true;

  // Prevent context menu
  allSlides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (img) img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  // Event Listeners
  container.addEventListener("mousedown", touchStart);
  container.addEventListener("touchstart", touchStart);

  container.addEventListener("mouseup", touchEnd);
  container.addEventListener("mouseleave", touchEnd);
  container.addEventListener("touchend", touchEnd);

  container.addEventListener("mousemove", touchMove);
  container.addEventListener("touchmove", touchMove);

  function getSlideWidth() {
    const style = window.getComputedStyle(sliderTrack);
    const gap = parseFloat(style.gap) || 0;
    return originalSlides[0].offsetWidth + gap;
  }

  function getTotalOriginalWidth() {
    return getSlideWidth() * originalSlides.length;
  }

  function touchStart(event) {
    stopAutoSlide();
    isDragging = true;
    clickAllowed = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    container.style.cursor = "grabbing";
    sliderTrack.style.transition = "none";

    // Sync currentIndex
    const slideWidth = getSlideWidth();
    currentIndex = Math.round(Math.abs(currentTranslate) / slideWidth);
  }

  function touchEnd() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);
    container.style.cursor = "grab";
    sliderTrack.style.transition = "transform 0.3s ease-out";

    const movedBy = currentTranslate - prevTranslate;
    const threshold = 60;

    if (movedBy < -threshold) {
      currentIndex += 1;
    } else if (movedBy > threshold) {
      currentIndex -= 1;
    }

    setPositionByIndex();

    // After transition (300ms), check if we need to silently reset/wrap
    setTimeout(() => {
      // Check if we are on a clone (index >= original length)
      if (currentIndex >= originalSlides.length) {
        sliderTrack.style.transition = "none";
        currentIndex -= originalSlides.length;
        setPositionByIndex();
      }
      // Check if we are before start (negative index - theoretical)
      else if (currentIndex < 0) {
        sliderTrack.style.transition = "none";
        currentIndex += originalSlides.length;
        setPositionByIndex();
      }

      // Resume auto-slide if visible
      if (isVisible && !isModalOpen) {
        // Ensure transition is off for auto-slide
        sliderTrack.style.transition = "none";
        startAutoSlide();
      }
    }, 300);
  }

  function touchMove(event) {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      const currentMove = currentPosition - startPos;
      if (Math.abs(currentMove) > 5) clickAllowed = false;
      currentTranslate = prevTranslate + currentMove;
    }
  }

  function getPositionX(event) {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }

  function animation() {
    // While dragging, we verify boundaries but generally let user drag freely
    // We only enforce seamless loop during auto-slide OR silent reset
    checkBoundary();
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
  }

  function checkBoundary() {
    const totalWidth = getTotalOriginalWidth();

    // Only enforce boundary wrap during auto-slide to prevent jumps while dragging
    if (!isDragging && isAutoSliding) {
      if (currentTranslate <= -totalWidth) {
        currentTranslate += totalWidth;
        prevTranslate += totalWidth;
      }
    }

    // We can add a "rubber band" effect or hard stop for dragging if needed,
    // but allowing drag into clones + silent reset is standard.
  }

  function setPositionByIndex() {
    const slideWidth = getSlideWidth();
    currentTranslate = currentIndex * -slideWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
  }

  // Auto-Slide Logic
  let isVisible = false;
  const autoSpeed = 0.5;

  function startAutoSlide() {
    if (isAutoSliding) return;
    isAutoSliding = true;
    sliderTrack.style.transition = "none";
    autoSlideLoop();
  }

  function stopAutoSlide() {
    isAutoSliding = false;
    cancelAnimationFrame(autoSlideID);
  }

  function autoSlideLoop() {
    if (!isAutoSliding) return;

    currentTranslate -= autoSpeed;
    prevTranslate = currentTranslate;

    checkBoundary();

    setSliderPosition();
    autoSlideID = requestAnimationFrame(autoSlideLoop);
  }

  // --- COMMENTED OUT: IntersectionObserver that stops sliding when ~50% scrolled out of view ---
  // Uncomment the block below (and remove the direct startAutoSlide call) to re-enable this behavior.
  //
  // const observer = new IntersectionObserver((entries) => {
  //     entries.forEach(entry => {
  //         if (entry.isIntersecting) {
  //             isVisible = true;
  //             if (!isDragging && !isModalOpen) startAutoSlide();
  //         } else {
  //             isVisible = false;
  //             stopAutoSlide();
  //
  //             // Reset to initial state when out of view
  //             currentIndex = 0;
  //             currentTranslate = 0;
  //             prevTranslate = 0;
  //             sliderTrack.style.transition = 'none';
  //             setSliderPosition();
  //         }
  //     });
  // }, {
  //     threshold: 0.5
  // });
  //
  // observer.observe(container);
  // --- END COMMENTED OUT ---

  // Always visible & always auto-slide (replaces IntersectionObserver)
  isVisible = true;
  if (!isDragging && !isModalOpen) startAutoSlide();

  // Register controls for global access
  sliderControls.push({
    stop: stopAutoSlide,
    resume: () => {
      if (isVisible && !isDragging && !isModalOpen) startAutoSlide();
    },
  });

  // Modal Click Listener
  sliderTrack.addEventListener("click", (e) => {
    if (clickAllowed && e.target.tagName === "IMG") {
      const modal = document.getElementById("poster-modal");
      const modalImg = document.getElementById("modal-img");
      modal.style.display = "flex";
      modalImg.src = e.target.src;
      isModalOpen = true;

      // Stop all sliders
      sliderControls.forEach((control) => control.stop());
    }
  });

  // Initial Setup
  // setPositionByIndex(); // Start at 0
}

// Initialize all instances
document.querySelectorAll(".sliding-box-container").forEach((container) => {
  initSlider(container);
});

// Modal for standalone content-img images (not inside sliders)
document.querySelectorAll(".content-img").forEach((img) => {
  img.style.cursor = "pointer";
  img.addEventListener("click", () => {
    const modal = document.getElementById("poster-modal");
    const modalImg = document.getElementById("modal-img");
    modal.style.display = "flex";
    modalImg.src = img.src;
    isModalOpen = true;
    sliderControls.forEach((control) => control.stop());
  });
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

// Global Modal Close Logic
const modal = document.getElementById("poster-modal");
const span = document.getElementsByClassName("close")[0];

function closeModal() {
  modal.style.display = "none";
  isModalOpen = false;
  // Resume sliders
  sliderControls.forEach((control) => control.resume());
}

span.onclick = closeModal;

modal.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});
