// Генериране на реалистичен сняг
function createSnow() {
  const snowContainer = document.getElementById("snow-container");
  const snowflakeCount = 70; // Брой снежинки

  for (let i = 0; i < snowflakeCount; i++) {
    const snowflake = document.createElement("div");
    snowflake.classList.add("snowflake");

    // Рандомизиране на позиция, размер и продължителност
    const size = Math.random() * 5 + 3; // Размери между 3px и 8px
    const left = Math.random() * 100; // Позиция от 0% до 100%
    const duration = Math.random() * 5 + 5; // Падане между 5s и 10s
    const delay = Math.random() * 10; // Закъснение при старт

    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${left}vw`;
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.animationDelay = `-${delay}s`; // Отрицателен delay, за да има сняг още при зареждане

    snowContainer.appendChild(snowflake);
  }
}

// Fallback за Scroll Animations
function initScrollObserver() {
  // Проверка дали браузърът поддържа модерния CSS animation-timeline
  if (!CSS.supports("animation-timeline: view()")) {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.15, // Активира се, когато 15% от елемента е видим
        rootMargin: "0px 0px -50px 0px",
      },
    );

    revealElements.forEach((el) => observer.observe(el));
  }
}

// Функция за персонализирано бавно и плавно скролиране
function customSmoothScroll(targetY, duration) {
  const startY = window.scrollY; // Текущата позиция
  const distance = targetY - startY; // Разстоянието, което трябва да изминем
  let startTime = null;

  // Easing функция (прави скрола да започва бавно, да се забързва и пак да спира бавно)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Анимационна рамка
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime; // Изминало време

    // Изчисляваме прогреса (от 0 до 1), но не повече от 1
    const progress = Math.min(timeElapsed / duration, 1);

    // Прилагаме easing ефекта към прогреса
    const easeProgress = easeInOutCubic(progress);

    // Преместваме екрана
    window.scrollTo(0, startY + distance * easeProgress);

    // Ако не сме стигнали края на времето, заявяваме следващ кадър
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// Стартиране при зареждане на страницата
document.addEventListener("DOMContentLoaded", () => {
  createSnow();
  initScrollObserver();

  // --- Логика за плаващия бутон "Следваща секция" ---
  const nextBtn = document.getElementById("next-section-btn");
  const sections = Array.from(document.querySelectorAll(".section"));

  // Показваме бутона малко след зареждане с анимация
  setTimeout(() => {
    nextBtn.classList.add("visible");
  }, 1000);

  // Функция, която намира коя е следващата секция спрямо текущия скрол
  function getNextSection() {
    const scrollPosition = window.scrollY;
    // Взимаме височината на екрана и добавяме малък толеранс (буфер),
    // за да не прескача секции, ако сме скролнали само малко надолу
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < sections.length; i++) {
      const sectionTop = sections[i].offsetTop;

      // Ако горният край на секцията е по-надолу от текущия ни скрол + половината екран
      if (sectionTop > scrollPosition + viewportHeight / 2) {
        return { section: sections[i], isLast: i === sections.length - 1 };
      }
    }
    // Ако не намери следваща (вече сме най-долу), връщаме null
    return { section: null, isLast: true };
  }

  // Слушател за скрол, за да завъртаме стрелката, ако сме най-долу
  window.addEventListener("scroll", () => {
    // Проверка дали сме близо до дъното на страницата
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

    if (isAtBottom) {
      nextBtn.classList.add("up-mode");
      nextBtn.setAttribute("aria-label", "Към началото");
    } else {
      nextBtn.classList.remove("up-mode");
      nextBtn.setAttribute("aria-label", "Към следващата секция");
    }
  });

  // Действие при клик с новото бавно скролиране
  nextBtn.addEventListener("click", () => {
    // Време за скролиране в милисекунди (1500 = 1.5 секунди). Можете да го увеличите на 2000 за още по-бавно.
    const scrollDuration = 2000;

    // Проверяваме дали бутонът е в режим "Нагоре"
    if (nextBtn.classList.contains("up-mode")) {
      // Бавно превъртане най-горе (позиция Y = 0)
      customSmoothScroll(0, scrollDuration);
      return;
    }

    // Ако не сме най-долу, намираме следващата секция
    const nextInfo = getNextSection();

    if (nextInfo.section) {
      // Намираме точната Y координата на следващата секция спрямо целия документ
      const targetY = nextInfo.section.getBoundingClientRect().top + window.scrollY;

      // Извикваме нашата бавна функция
      customSmoothScroll(targetY, scrollDuration);
    }
  });
});
