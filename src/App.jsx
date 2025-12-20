import React, { useEffect, useRef, useState } from "react";
import kitchen from "/assets/kitchen-c.webp";
import bedroom from "/assets/bedroom.webp";
import wardrobe from "/assets/wardrobe-c.webp";

export default function App() {
  // 0,1,2 = state 1,2,3
  const [currentIndex, setCurrentIndex] = useState(0);

  const anchorRef = useRef(null); // #service-scroll-anchor
  const sectionRef = useRef(null); // #service

  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const inServiceRangeRef = useRef(false);

  const touchStartYRef = useRef(0);
  const gestureHandledRef = useRef(false);
  const pendingExitRef = useRef(0); // -1 = exit up, +1 = exit down

  const TOTAL_SLIDES = 3;
  const TRANSITION_DURATION = 400; // ms (same as script.js)
  const SCROLL_DISTANCE_PER_SLIDE_VH = 0.8; // 0.8 * viewport height per slide

  // keep refs in sync
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    // whenever slide changes, start transition cooldown
    isTransitioningRef.current = true;
    const id = setTimeout(() => {
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION);
    return () => clearTimeout(id);
  }, [currentIndex]);

  useEffect(() => {
  const anchor = anchorRef.current;
  const section = sectionRef.current;
  if (!anchor || !section) return;

  const vh = window.innerHeight || document.documentElement.clientHeight;
  const stickyTop = vh * 0.06;

  const scrollDistancePerSlide = vh * SCROLL_DISTANCE_PER_SLIDE_VH;
  const scrollLifeHeight = TOTAL_SLIDES * scrollDistancePerSlide;

  const sectionHeight = section.offsetHeight || vh;
  anchor.style.minHeight = `${sectionHeight + scrollLifeHeight}px`;

  /* ---------- RANGE DETECTION ---------- */
  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const anchorTop = anchor.offsetTop;

    const startPin = anchorTop - stickyTop;
    const endPin = startPin + scrollLifeHeight;

    inServiceRangeRef.current =
      scrollY >= startPin && scrollY < endPin;
  };

  /* ---------- SLIDE CHANGE ---------- */
  const changeSlide = (direction) => {
    if (isTransitioningRef.current) return;

    const index = currentIndexRef.current;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= TOTAL_SLIDES) return;

    setCurrentIndex(nextIndex);
  };

  /* ---------- EJECT ---------- */
  const eject = (dir) => {
    const anchorTop = anchor.offsetTop;
    const startPin = anchorTop - stickyTop;
    const endPin = startPin + scrollLifeHeight;

    window.scrollTo({
      top: dir === -1 ? startPin - 10 : endPin + 10,
      behavior: "smooth",
    });
  };

  /* ---------- WHEEL ---------- */
  const handleWheel = (e) => {
    if (!inServiceRangeRef.current) return;

    const deltaY = e.deltaY;
    if (!deltaY) return;

    const index = currentIndexRef.current;

    if (deltaY < 0 && index === 0) return;
    if (deltaY > 0 && index === TOTAL_SLIDES - 1) return;

    if (e.cancelable) e.preventDefault();
    if (isTransitioningRef.current) return;

    changeSlide(deltaY > 0 ? 1 : -1);
  };

  /* ---------- TOUCH ---------- */
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    gestureHandledRef.current = false;
    pendingExitRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!inServiceRangeRef.current) return;

    const delta =
      touchStartYRef.current - e.touches[0].clientY;

    if (e.cancelable) e.preventDefault();
    if (gestureHandledRef.current || isTransitioningRef.current) return;
    if (Math.abs(delta) < 30) return;

    const index = currentIndexRef.current;

    if (delta > 0) {
      index < TOTAL_SLIDES - 1
        ? changeSlide(1)
        : (pendingExitRef.current = 1);
    } else {
      index > 0
        ? changeSlide(-1)
        : (pendingExitRef.current = -1);
    }

    gestureHandledRef.current = true;
  };

  const handleTouchEnd = () => {
    if (pendingExitRef.current !== 0) {
      eject(pendingExitRef.current);
    }
    pendingExitRef.current = 0;
    gestureHandledRef.current = false;
  };

  /* ---------- BUTTONS ---------- */
  const handlePrev = () => {
    const index = currentIndexRef.current;
    index === 0 ? eject(-1) : setCurrentIndex(index - 1);
  };

  const handleNext = () => {
    const index = currentIndexRef.current;
    index === TOTAL_SLIDES - 1
      ? eject(1)
      : setCurrentIndex(index + 1);
  };

  const prevBtns = section.querySelectorAll(".nav-btn-prev");
  const nextBtns = section.querySelectorAll(".nav-btn-next");

  prevBtns.forEach((b) => b.addEventListener("click", handlePrev));
  nextBtns.forEach((b) => b.addEventListener("click", handleNext));

  /* ---------- LISTENERS ---------- */
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });

  handleScroll();

  /* ---------- CLEANUP (ONLY ONE) ---------- */
  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);

    prevBtns.forEach((b) =>
      b.removeEventListener("click", handlePrev)
    );
    nextBtns.forEach((b) =>
      b.removeEventListener("click", handleNext)
    );
  };
}, []);


  return (
    <div id="service-scroll-anchor" ref={anchorRef}>
      <section id="service" ref={sectionRef}>
        <h2>Our Service</h2>

        <div id="service-container">
          {/* ------------------ SLIDE 1 ------------------ */}
          <div
            className={`service-slide ${
              currentIndex === 0 ? "is-current" : ""
            }`}
            data-index="0"
          >
            <div className="service-data">
              <h3>Fitted Kitchen</h3>
              <div id="service-suppport">
                <p>
                  Smart, space-efficient modular kitchens designed for seamless
                  workflow, refined aesthetics, and effortless everyday use —
                  customised to your layout, lifestyle requirements, and
                  long-term functionality with carefully considered detailing.
                </p>
                <div className={`service-logo slide-${currentIndex}`}>
                  <img src={kitchen} alt="kitchen" className="logo-kitchen" />
                </div>
              </div>
            </div>

            <div className="service-below">
              <div
                className="service-images"
                style={{ backgroundImage: "url('assets/slider-A.webp')" }}>
              
                <div className="slider-buttons">
                  <a className="nav-btn-prev">
                    <i className="fa-solid fa-chevron-left"></i>
                  </a>
                  <a className="nav-btn-next">
                    <i className="fa-solid fa-chevron-right"></i>
                  </a>
                </div>
              </div>

              {/* DOTS — NON CLICKABLE */}
              <div className="service-dots-vertical">
                {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${currentIndex === i ? "is-active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ------------------ SLIDE 2 ------------------ */}
          <div
            className={`service-slide ${
              currentIndex === 1 ? "is-current" : ""
            }`}
            data-index="1"
          >
            <div className="service-data">
              <h3>Custom Wardrobes</h3>
              <div id="service-suppport">
                <p>
                  Custom-built wardrobes designed for maximum storage, clean
                  symmetry, and effortless everyday convenience — customised to
                  your space, habits, and evolving storage needs with refined,
                  long-lasting finishes.
                </p>
                <div className={`service-logo slide-${currentIndex}`}>
                  <img
                    src={wardrobe}
                    alt="wardrobe"
                    className="logo-wardrobe"
                  />
                </div>
              </div>
            </div>

            <div className="service-below">
              <div
                className="service-images"
                style={{ backgroundImage: "url('assets/slider-B.webp')" }}
              >
                <div className="slider-buttons">
                  <a className="nav-btn-prev">
                    <i className="fa-solid fa-chevron-left"></i>
                  </a>
                  <a className="nav-btn-next">
                    <i className="fa-solid fa-chevron-right"></i>
                  </a>
                </div>
              </div>

              {/* DOTS — NON CLICKABLE */}
              <div className="service-dots-vertical">
                {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${currentIndex === i ? "is-active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ------------------ SLIDE 3 ------------------ */}
          <div
            className={`service-slide ${
              currentIndex === 2 ? "is-current" : ""
            }`}
            data-index="2"
          >
            <div className="service-data">
              <h3>Comfort Bedrooms</h3>
              <div id="service-suppport">
                <p>
                  Calming, modern bedrooms designed with warm ambience and
                  functional balance — thoughtfully tailored to your lifestyle,
                  supporting deep comfort, everyday relaxation, and effortless
                  daily living with refined, lasting details.
                </p>
                <div className={`service-logo slide-${currentIndex}`}>
                  <img src={bedroom} alt="bedroom" className="logo-bedroom" />
                </div>
              </div>
            </div>

            <div className="service-below">
              <div
                className="service-images"
                style={{ backgroundImage: "url('assets/slider-C.webp')" }}
              >
                <div className="slider-buttons">
                  <a className="nav-btn-prev">
                    <i className="fa-solid fa-chevron-left"></i>
                  </a>
                  <a className="nav-btn-next">
                    <i className="fa-solid fa-chevron-right"></i>
                  </a>
                </div>
              </div>

              {/* DOTS — NON CLICKABLE */}
              <div className="service-dots-vertical">
                {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${currentIndex === i ? "is-active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
