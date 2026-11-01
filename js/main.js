/* Портфолио: меню, липкая шапка, появление блоков, копирование почты. */

(function () {
  "use strict";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  /* ------------------------------------------------------------- шапка */

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    header.classList.remove("is-open");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      header.classList.toggle("is-open", open);
      burger.classList.toggle("is-active", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------- появление блоков */

  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------ копия почты */

  var copyBtn = document.getElementById("copy-email");

  if (copyBtn) {
    var label = copyBtn.textContent;

    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var done = function () {
        copyBtn.textContent = "Скопировано ✓";
        window.setTimeout(function () {
          copyBtn.textContent = label;
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done, function () {
          window.location.href = "mailto:" + email;
        });
        return;
      }

      var input = document.createElement("textarea");
      input.value = email;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        done();
      } catch (error) {
        window.location.href = "mailto:" + email;
      }
      input.remove();
    });
  }

  /* ------------------------------------------------------------- подвал */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
