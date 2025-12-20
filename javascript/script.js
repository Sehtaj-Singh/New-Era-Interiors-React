document.addEventListener("DOMContentLoaded", () => {
  initHeaderFade();

  /* ================= MENU / MODAL ================= */

  const menuBtn = document.querySelector(".menu-btn");
  const menuIcon = menuBtn.querySelector("i");
  const modal = document.getElementById("sideModal");
  const closeBtn = modal.querySelector(".modal-close");

  function openModal() {
    modal.classList.add("open");
    menuBtn.classList.add("open");
    document.body.classList.add("no-scroll");

    menuIcon.classList.remove("fa-bars");
    menuIcon.classList.add("fa-xmark");
  }

  function closeModal() {
    modal.classList.remove("open");
    menuBtn.classList.remove("open");
    document.body.classList.remove("no-scroll");

    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");
  }

  menuBtn.addEventListener("click", () => {
    modal.classList.contains("open") ? closeModal() : openModal();
  });

  closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  document.querySelectorAll("#sideModal a").forEach((link) => {
    link.addEventListener("click", closeModal);
  });

  /* ================= CONTACT FORM SANITIZATION ================= */

  /* ================= CONTACT FORM (WEB3FORMS) ================= */

  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const phoneInput = document.getElementById("phone");
      const messageInput = document.getElementById("message");

      const name = nameInput.value.trim();
      const email = sanitizeEmail(emailInput.value);
      const phone = sanitizeUKPhone(phoneInput.value);
      const message = messageInput.value.trim();

      // silent exit if required data missing
      if (!name || !email || !message) return;
      if (!isValidEmail(email)) return;
      if (phoneInput.value && !phone) return;

      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "3774a79f-d961-4d7d-819f-0f264947b922",
            subject: `New Enquiry from ${name}`,
            name,
            email,
            phone,
            message,
          }),
        });
      } catch (_) {
        // intentionally silent (as requested)
      }

      contactForm.reset();
      showSuccessModal();
    });
  }
  /* ================= SUCCESS MODAL ================= */

  function showSuccessModal() {
    const modal = document.getElementById("successModal");
    const closeBtn = document.getElementById("closeSuccess");

    if (!modal || !closeBtn) return;

    modal.classList.add("show");

    // Close on button click
    closeBtn.onclick = () => {
      modal.classList.remove("show");
    };

    // Auto close after 3 seconds
    setTimeout(() => {
      modal.classList.remove("show");
    }, 3000);
  }

  /* ================= HELPERS ================= */

  function sanitizeEmail(email) {
    return email.trim().toLowerCase().replace(/\s+/g, "");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  /* UK PHONE → ALWAYS +44 FORMAT */
  function sanitizeUKPhone(phone) {
    if (!phone) return "";

    const cleaned = phone.replace(/\D/g, "");

    // Expect exactly 10 local UK digits
    if (cleaned.length !== 10) return "";

    return "+44" + cleaned;
  }

  function isValidUKPhone(phone) {
    return /^\+44\d{9,10}$/.test(phone);
  }

  /* ================= PHONE INPUT CLEANING (UK ONLY) ================= */

  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "");

      // UK local mobile = EXACTLY 10 digits
      if (digits.length > 10) {
        digits = digits.slice(0, 10);
      }

      this.value = digits;
    });
  }

  /* ================= PORTFOLIO SLIDER ================= */

  (() => {
    const track = document.querySelector(".slider-track");
    if (!track) return;

    const prevBtn = document.querySelector(".slider-btn.prev");
    const nextBtn = document.querySelector(".slider-btn.next");

    let slides = Array.from(track.children);
    let index = 1;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    /* ---------- CLONE SLIDES ---------- */
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.classList.add("clone");
    lastClone.classList.add("clone");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    slides = Array.from(track.children);

    const slideWidth = () =>
      slides[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 0);

    function setPosition(animate = true) {
      track.style.transition = animate ? "transform 0.45s ease" : "none";
      track.style.transform = `translateX(${-index * slideWidth()}px)`;
    }

    setPosition(false);

    /* ---------- LOOP FIX ---------- */
    track.addEventListener("transitionend", () => {
      if (slides[index].classList.contains("clone")) {
        track.style.transition = "none";
        index = index === 0 ? slides.length - 2 : 1;
        setPosition(false);
      }
    });

    /* ---------- BUTTONS ---------- */
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        index--;
        setPosition();
      });

      nextBtn.addEventListener("click", () => {
        index++;
        setPosition();
      });
    }

    /* ---------- TOUCH ---------- */
    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    track.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    track.addEventListener("touchend", () => {
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? index++ : index--;
        setPosition();
      }
      isDragging = false;
    });

    /* ---------- MOUSE ---------- */
    track.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      isDragging = true;
      track.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      currentX = e.clientX;
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? index++ : index--;
        setPosition();
      }
      isDragging = false;
      track.style.cursor = "grab";
    });

    /* ---------- RESIZE ---------- */
    window.addEventListener("resize", () => {
      setPosition(false);
    });
  })();
});

/* ================= HEADER FADE ================= */

function initHeaderFade() {
  const header = document.getElementById("site-header");
  const heroTitle = document.querySelector(".intro h1");

  if (!header || !heroTitle) return;

  const titleTop = heroTitle.offsetTop;
  const titleHeight = heroTitle.offsetHeight;
  const maxScroll = titleTop + titleHeight;

  function handleHeaderScroll() {
    const scrolled = window.scrollY || window.pageYOffset;
    let progress = scrolled / maxScroll;
    progress = Math.min(Math.max(progress, 0), 1);

    header.style.opacity = progress;
    header.style.pointerEvents = progress > 0 ? "auto" : "none";
    heroTitle.style.opacity = 1 - progress;
  }

  window.addEventListener("scroll", handleHeaderScroll);
  handleHeaderScroll();
}
