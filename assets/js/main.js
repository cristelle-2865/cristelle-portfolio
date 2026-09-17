document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  /* =========================================================
     THEME
  ========================================================== */

  const getPreferredTheme = () => {
    const saved = localStorage.getItem("cristelle-theme");

    if (saved === "light" || saved === "dark") {
      return saved;
    }

    // Portfolio intentionally opens in light mode.
    return "light";
  };

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;

    if (persist) {
      localStorage.setItem("cristelle-theme", theme);
    }

    const isDark = theme === "dark";

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));

      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );

      themeToggle.title = isDark ? "Light mode" : "Dark mode";
    }

    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#10120F" : "#F7F3EA");
    }
  };

  applyTheme(getPreferredTheme());

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  /* =========================================================
     SCROLLING HEADER
  ========================================================== */

  const siteHeader = document.querySelector(".site-header");

  const updateHeader = () => {
    if (!siteHeader) return;

    siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true,
  });

  /* =========================================================
     MOBILE NAV
  ========================================================== */

  const closeMenu = () => {
    navToggle?.classList.remove("is-open");
    navLinks?.classList.remove("is-open");

    navToggle?.setAttribute("aria-expanded", "false");

    navToggle?.setAttribute("aria-label", "Open menu");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("is-open");

    navToggle.classList.toggle("is-open", isOpen);

    navToggle.setAttribute("aria-expanded", String(isOpen));

    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* =========================================================
     YEAR
  ========================================================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================== */

  const sections = document.querySelectorAll("main section[id]");

  const links = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        links.forEach((link) => {
          link.toggleAttribute(
            "aria-current",
            link.getAttribute("href") === `#${visible.target.id}`,
          );
        });
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.05, 0.2, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* =========================================================
     CODE TYPEWRITER
  ========================================================== */

  const codeElements = [
    document.getElementById("codeLine1"),
    document.getElementById("codeLine2"),
    document.getElementById("codeLine3"),
    document.getElementById("codeLine4"),
    document.getElementById("codeLine5"),
  ];

  const codeLines = [
    '<span class="keyword">const</span> <span class="function">buildExperience</span> = <span class="variable">(need)</span> => {',

    '  <span class="keyword">const</span> <span class="variable">flow</span> = <span class="function">design</span>(need);',

    '  <span class="keyword">const</span> <span class="variable">product</span> = <span class="function">develop</span>(flow);',

    '  <span class="keyword">return</span> <span class="function">ship</span>(product, <span class="string">"with intention"</span>);',

    "};",
  ];

  function prepareLine(html) {
    const template = document.createElement("template");

    template.innerHTML = html;

    return template.content.cloneNode(true);
  }

  function getTextNodes(rootNode) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);

    const nodes = [];
    let current;

    while ((current = walker.nextNode())) {
      nodes.push(current);
    }

    return nodes;
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function typeLine(element, html, speed = 30) {
    element.innerHTML = "";

    element.appendChild(prepareLine(html));

    const textNodes = getTextNodes(element);

    const originals = textNodes.map((node) => node.textContent);

    textNodes.forEach((node) => (node.textContent = ""));

    for (let nodeIndex = 0; nodeIndex < textNodes.length; nodeIndex++) {
      const node = textNodes[nodeIndex];

      const text = originals[nodeIndex];

      for (let i = 0; i < text.length; i++) {
        node.textContent = text.slice(0, i + 1);

        await wait(speed);
      }
    }
  }

  async function eraseLine(element, speed = 12) {
    const textNodes = getTextNodes(element);

    for (let nodeIndex = textNodes.length - 1; nodeIndex >= 0; nodeIndex--) {
      const node = textNodes[nodeIndex];

      while (node.textContent.length) {
        node.textContent = node.textContent.slice(0, -1);

        await wait(speed);
      }
    }

    element.innerHTML = "";
  }

  async function runCodeAnimation() {
    if (codeElements.some((element) => !element)) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      codeElements.forEach((element, index) => {
        element.innerHTML = codeLines[index];
      });

      return;
    }

    while (true) {
      for (let index = 0; index < codeLines.length; index++) {
        await typeLine(codeElements[index], codeLines[index], 30);

        await wait(120);
      }

      await wait(6000);

      for (let index = codeElements.length - 1; index >= 0; index--) {
        await eraseLine(codeElements[index], 12);

        await wait(80);
      }

      await wait(500);
    }
  }

  runCodeAnimation();

  /* =========================================================
     SCROLL REVEALS
  ========================================================== */

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 55, 360)}ms`;

      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  /* =========================================================
     IMAGE LIGHTBOX
  ========================================================== */

  const lightbox = document.getElementById("imageLightbox");

  const lightboxImage = document.getElementById("lightboxImage");

  const lightboxCaption = document.getElementById("lightboxCaption");

  const lightboxCounter = document.getElementById("lightboxCounter");

  const lightboxClose = document.getElementById("lightboxClose");

  const lightboxPrev = document.getElementById("lightboxPrev");

  const lightboxNext = document.getElementById("lightboxNext");

  if (lightbox && lightboxImage && lightboxCounter) {
    /*
      Only actual project screenshots are included.
      Decorative SVGs / visual covers are intentionally ignored.
    */

    const imageElements = Array.from(
      document.querySelectorAll(".visual-film img, .visual-flower img"),
    );

    const images = imageElements.map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.getAttribute("alt") || "Project screenshot",
      element: image,
    }));

    let currentIndex = 0;
    let lastFocusedElement = null;

    const updateLightbox = () => {
      if (!images.length) return;

      const image = images[currentIndex];

      /*
        Re-trigger the image entrance animation
        every time navigation occurs.
      */

      lightboxImage.style.animation = "none";

      void lightboxImage.offsetWidth;

      lightboxImage.style.animation = "";

      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;

      if (lightboxCaption) {
        lightboxCaption.textContent = image.alt || "";
      }

      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
        images.length,
      ).padStart(2, "0")}`;

      lightboxImage.onload = () => {
        lightboxImage.style.animation = "lightboxImageIn 0.28s ease both";
      };
    };

    const openLightbox = (index) => {
      if (!images.length) return;

      currentIndex = (index + images.length) % images.length;

      lastFocusedElement = document.activeElement;

      updateLightbox();

      lightbox.classList.add("is-open");

      lightbox.setAttribute("aria-hidden", "false");

      document.body.classList.add("lightbox-open");

      lightboxClose?.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");

      lightbox.setAttribute("aria-hidden", "true");

      document.body.classList.remove("lightbox-open");

      /*
        Clear the source after the closing
        animation so the hidden image does
        not remain active.
      */

      window.setTimeout(() => {
        if (!lightbox.classList.contains("is-open")) {
          lightboxImage.removeAttribute("src");
        }
      }, 300);

      if (
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        lastFocusedElement.focus();
      }
    };

    const showPrevious = () => {
      if (!images.length) return;

      currentIndex = (currentIndex - 1 + images.length) % images.length;

      updateLightbox();
    };

    const showNext = () => {
      if (!images.length) return;

      currentIndex = (currentIndex + 1) % images.length;

      updateLightbox();
    };

    /* -----------------------------------------
       OPEN ON IMAGE CLICK
    ----------------------------------------- */

    imageElements.forEach((image, index) => {
      image.setAttribute("tabindex", "0");

      image.setAttribute("role", "button");

      image.setAttribute("aria-label", `Open image ${index + 1} in fullscreen`);

      image.addEventListener("click", () => openLightbox(index));

      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    /* -----------------------------------------
       CONTROLS
    ----------------------------------------- */

    lightboxClose?.addEventListener("click", closeLightbox);

    lightboxPrev?.addEventListener("click", showPrevious);

    lightboxNext?.addEventListener("click", showNext);

    /* -----------------------------------------
       CLICK BACKDROP TO CLOSE
    ----------------------------------------- */

    lightbox.querySelectorAll("[data-lightbox-close]").forEach((element) => {
      element.addEventListener("click", closeLightbox);
    });

    /* -----------------------------------------
       KEYBOARD NAVIGATION
    ----------------------------------------- */

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }
    });

    /* -----------------------------------------
       TOUCH / SWIPE SUPPORT
       Nice on mobile.
    ----------------------------------------- */

    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      {
        passive: true,
      },
    );

    lightbox.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];

        const deltaX = touch.clientX - touchStartX;

        const deltaY = touch.clientY - touchStartY;

        /*
          Only treat the gesture as a swipe
          when horizontal movement clearly
          dominates vertical movement.
        */

        if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          return;
        }

        if (deltaX > 0) {
          showPrevious();
        } else {
          showNext();
        }
      },
      {
        passive: true,
      },
    );
  }
});
