import React, { useEffect, useRef, useState } from "react";
import kitchen from "/assets/kitchen-c.png";
import bedroom from "/assets/bedroom.png";
import wardrobe from "/assets/wardrobe-c.png";

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
    const stickyTop = vh * 0.06; // 6vh, same as your CSS top

    const scrollDistancePerSlide = vh * SCROLL_DISTANCE_PER_SLIDE_VH;
    const scrollLifeHeight = TOTAL_SLIDES * scrollDistancePerSlide;

    const sectionHeight = section.offsetHeight || vh;
    anchor.style.minHeight = `${sectionHeight + scrollLifeHeight}px`;

    // -------- RANGE DETECTION (same idea as script.js) --------
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const anchorTop = anchor.offsetTop;

      const startPin = anchorTop - stickyTop;
      const endPin = startPin + scrollLifeHeight;

      inServiceRangeRef.current = scrollY >= startPin && scrollY < endPin;
      // The actual pinning at 6vh is still done by CSS position: sticky on #service.
      // We are just deciding when to "capture" the scroll.
    };

    // -------- SLIDE CHANGE helper --------
    const changeSlide = (direction) => {
      if (isTransitioningRef.current) return;

      const index = currentIndexRef.current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= TOTAL_SLIDES) return;

      setCurrentIndex(nextIndex);
    };

    // -------- DESKTOP: WHEEL (1 scroll = 1 slide) --------
    const handleWheel = (e) => {
      if (!inServiceRangeRef.current) return;

      const deltaY = e.deltaY;
      if (deltaY === 0) return;

      const index = currentIndexRef.current;

      // first slide + scroll up → allow natural exit
      if (deltaY < 0 && index === 0) return;

      // last slide + scroll down → allow natural exit
      if (deltaY > 0 && index === TOTAL_SLIDES - 1) return;

      if (e.cancelable) e.preventDefault();
      if (isTransitioningRef.current) return;

      const direction = deltaY > 0 ? 1 : -1;
      changeSlide(direction);
    };

    // -------- MOBILE: TOUCH (no momentum, same logic) --------
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartYRef.current = touch.clientY;
      gestureHandledRef.current = false;
      pendingExitRef.current = 0;
    };

    const handleTouchMove = (e) => {
      if (!inServiceRangeRef.current) return;

      const touch = e.touches[0];
      const currentY = touch.clientY;
      const delta = touchStartYRef.current - currentY; // >0 swipe up, <0 swipe down

      const threshold = 30; // px

      // While in "service range", block native scroll → kills momentum
      if (e.cancelable) e.preventDefault();

      if (gestureHandledRef.current || isTransitioningRef.current) return;
      if (Math.abs(delta) < threshold) return;

      const index = currentIndexRef.current;

      if (delta > 0) {
        // swipe up → scroll down → go to next slide or exit down
        if (index < TOTAL_SLIDES - 1) {
          changeSlide(1); // next slide
          gestureHandledRef.current = true;
        } else {
          // last slide, user swiped up → mark exit DOWN
          pendingExitRef.current = 1;
          gestureHandledRef.current = true;
        }
      } else {
        // swipe down → scroll up → go to previous slide or exit up
        if (index > 0) {
          changeSlide(-1); // previous slide
          gestureHandledRef.current = true;
        } else {
          // first slide, user swiped down → mark exit UP
          pendingExitRef.current = -1;
          gestureHandledRef.current = true;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!inServiceRangeRef.current && pendingExitRef.current === 0) {
        gestureHandledRef.current = false;
        return;
      }

      const pendingExit = pendingExitRef.current;
      if (pendingExit !== 0) {
        const scrollY = window.scrollY || window.pageYOffset;
        const anchorTop = anchor.offsetTop;

        const startPin = anchorTop - stickyTop;
        const endPin = startPin + scrollLifeHeight;

        let target;
        if (pendingExit === -1) {
          // exit UP (previous section)
          target = startPin - 10;
        } else {
          // exit DOWN (next section)
          target = endPin + 10;
        }

        window.scrollTo({
          top: target,
          behavior: "smooth",
        });
      }

      gestureHandledRef.current = false;
      pendingExitRef.current = 0;
    };

    // -------- LISTENERS --------
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("wheel", handleWheel, { passive: false });

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    // initial check
    handleScroll();

    // cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);

      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

 return (
  <div id="service-scroll-anchor" ref={anchorRef}>
    <section id="service" ref={sectionRef}>
      <h2>Our Service</h2>

      <div id="service-container">
        
        {/* ------------------ SLIDE 1 ------------------ */}
        <div
          className={`service-slide ${currentIndex === 0 ? "is-current" : ""}`}
          data-index="0"
        >
          <div className="service-data">
            <h3>Fitted Kitchen</h3>
            <p>
              Smart, space-efficient modular kitchens designed for smooth workflow, clean aesthetics, and everyday ease — tailored exactly to your layout, lifestyle needs, and long-term daily use with practical detailing.
            </p>
            <div className={`service-logo slide-${currentIndex}`}>
              <img src={kitchen} alt="kitchen" className="logo-kitchen" />
            </div>
          </div>

          <div className="service-below">

            <div
              className="service-images"
              style={{ backgroundImage: "url('assets/slider-A.png')" }}
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

        {/* ------------------ SLIDE 2 ------------------ */}
        <div
          className={`service-slide ${currentIndex === 1 ? "is-current" : ""}`}
          data-index="1"
        >
          <div className="service-data">
            <h3>Custom Wardrobes</h3>
            <p>
              Custom-built wardrobes designed for maximum storage, clean symmetry, and durable everyday convenience — tailored to your space, habits, and evolving storage requirements with refined finishes.
            </p>
            <div className={`service-logo slide-${currentIndex}`}>
              <img src={wardrobe} alt="wardrobe" className="logo-wardrobe" />
            </div>
          </div>

          <div className="service-below">

            <div
              className="service-images"
              style={{ backgroundImage: "url('assets/e.jpg')" }}
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
          className={`service-slide ${currentIndex === 2 ? "is-current" : ""}`}
          data-index="2"
        >
          <div className="service-data">
            <h3>Comfort Bedrooms</h3>
            <p>
              Calming, modern bedrooms crafted with warm ambience and functional balance — designed to fit your lifestyle perfectly while supporting comfort, relaxation, and effortless daily routines.
            </p>
            <div className={`service-logo slide-${currentIndex}`}>
              <img src={bedroom} alt="bedroom" className="logo-bedroom" />
            </div>
          </div>

          <div className="service-below">

            <div
              className="service-images"
              style={{ backgroundImage: "url('assets/slider-C.jpg')" }}
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
