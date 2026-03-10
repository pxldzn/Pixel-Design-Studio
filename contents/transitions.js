// ===== Page Transition System =====
(function () {
    const overlay = document.getElementById("page-transition-overlay");
    if (!overlay) return;

    // Intercept all internal link clicks
    document.addEventListener("click", function (e) {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;

        // Skip external links, anchors, javascript:, mailto:, tel:, etc.
        if (
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            link.target === "_blank"
        ) {
            return;
        }

        // Skip external URLs
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;
        } catch (err) {
            return;
        }

        e.preventDefault();

        // Trigger fade-in (cover screen with black)
        overlay.classList.add("fade-in");

        // Navigate after the fade-in animation completes
        overlay.addEventListener(
            "animationend",
            function onEnd() {
                overlay.removeEventListener("animationend", onEnd);
                window.location.href = href;
            }
        );
    });

    // Handle browser back/forward — re-trigger the reveal
    window.addEventListener("pageshow", function (e) {
        if (e.persisted) {
            // Page was loaded from bfcache (back/forward)
            overlay.classList.remove("fade-in");
            overlay.style.animation = "none";
            // Force reflow
            void overlay.offsetWidth;
            overlay.style.animation = "";
        }
    });
})();
