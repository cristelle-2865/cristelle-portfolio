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
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;

    if (persist) localStorage.setItem("cristelle-theme", theme);

    const isDark = theme === "dark";

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
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

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!localStorage.getItem("cristelle-theme")) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  /* =========================================================
     MOBILE NAV
  ========================================================== */

  const closeMenu = () => {
    navToggle?.classList.remove("is-open");
    navLinks?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* =========================================================
     YEAR
  ========================================================== */

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

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
            link.getAttribute("href") === `#${visible.target.id}`
          );
        });
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.05, 0.2, 0.5] }
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
    '};',
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
    if (codeElements.some((element) => !element)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

      // Deliberately pauses long enough for the composition to be read.
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
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 55, 360)}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }
});
