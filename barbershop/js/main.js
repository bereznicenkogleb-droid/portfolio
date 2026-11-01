/* ТОПОР — интерактив лендинга.
   Без библиотек: меню, липкая шапка, появление блоков,
   маска телефона и отправка заявки в Telegram. */

(function () {
  "use strict";

  /* ------------------------------------------------ липкая шапка + меню */

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
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
      if (window.innerWidth > 900) closeMenu();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------- появление блоков */

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = (index % 3) * 70 + "ms";
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------ форма записи */

  var form = document.getElementById("booking-form");
  var status = document.getElementById("form-status");
  var phoneInput = document.getElementById("phone");
  var dateInput = document.getElementById("date");
  var timeInput = document.getElementById("time");

  var TELEGRAM = "topor_barber";

  function setStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove("is-error", "is-success");
    if (type) status.classList.add(type);
  }

  /* Маска: +7 (999) 123-45-67 */
  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");

    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);

    var rest = digits.slice(1);
    var out = "+7";

    if (rest.length) out += " (" + rest.slice(0, 3);
    if (rest.length >= 3) out += ")";
    if (rest.length > 3) out += " " + rest.slice(3, 6);
    if (rest.length > 6) out += "-" + rest.slice(6, 8);
    if (rest.length > 8) out += "-" + rest.slice(8, 10);

    return out;
  }

  if (phoneInput) {
    phoneInput.addEventListener("focus", function () {
      if (!phoneInput.value) phoneInput.value = "+7 (";
    });

    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });

    phoneInput.addEventListener("blur", function () {
      if (phoneInput.value.replace(/\D/g, "").length <= 1) phoneInput.value = "";
    });
  }

  /* Дата: сегодня и позже, +60 дней вперёд */
  if (dateInput) {
    var today = new Date();
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    var iso = function (d) {
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    };

    dateInput.min = iso(today);
    dateInput.max = iso(new Date(today.getTime() + 60 * 86400000));
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var service = form.elements.service.value;
      var date = form.elements.date.value;
      var time = form.elements.time.value;
      var digits = phone.replace(/\D/g, "");

      if (name.length < 2) {
        setStatus("Напишите имя — хотя бы две буквы.", "is-error");
        form.elements.name.focus();
        return;
      }

      if (digits.length !== 11) {
        setStatus("Проверьте телефон: нужно 11 цифр.", "is-error");
        form.elements.phone.focus();
        return;
      }

      if (!service) {
        setStatus("Выберите услугу из списка.", "is-error");
        form.elements.service.focus();
        return;
      }

      if (!date) {
        setStatus("Укажите дату визита.", "is-error");
        form.elements.date.focus();
        return;
      }

      if (!time) {
        setStatus("Укажите удобное время.", "is-error");
        form.elements.time.focus();
        return;
      }

      var lines = [
        "Заявка с сайта ТОПОР",
        "Имя: " + name,
        "Телефон: " + phone,
        "Услуга: " + service,
        "Дата: " + formatDate(date),
        "Время: " + time
      ];

      var link =
        "https://t.me/" + TELEGRAM + "?text=" + encodeURIComponent(lines.join("\n"));

      /* window.open с "noopener" всегда возвращает null, поэтому
         открываем через временную ссылку — так не бывает ложных ошибок. */
      var opener = document.createElement("a");
      opener.href = link;
      opener.target = "_blank";
      opener.rel = "noopener noreferrer";
      document.body.appendChild(opener);
      opener.click();
      opener.remove();

      setStatus(
        "Готово! Открыли Telegram — осталось нажать «Отправить» в чате.",
        "is-success"
      );
      form.reset();
      if (timeInput) timeInput.value = "";
    });
  }

  /* ------------------------------------------------------------ подвал */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
