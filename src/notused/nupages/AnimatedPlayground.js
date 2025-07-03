import React, { useEffect, useRef, useState } from "react";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
//import ParticleBackground from "./src/components/ParticleBackground";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedPlayground() {
  const scrollRef = useRef(null);
  const [ripples, setRipples] = useState({});

  // Initialize LocomotiveScroll and connect with ScrollTrigger
  useEffect(() => {
    if (!scrollRef.current) return;

    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 1.0,
      smartphone: { smooth: true },
      tablet: { smooth: true },
    });

    scroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(scrollRef.current, {
      scrollTop(value) {
        if (arguments.length) {
          scroll.scrollTo(value, 0, 0);
        } else {
          return scroll.scroll.instance.scroll.y;
        }
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollRef.current.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => scroll.update());
    ScrollTrigger.refresh();

    return () => {
      if (scroll) scroll.destroy();
      ScrollTrigger.removeEventListener("refresh", () => scroll.update());
      ScrollTrigger.killAll();
    };
  }, []);

  // GSAP reveal animations on scroll
  useEffect(() => {
    if (!scrollRef.current) return;

    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 50 },
        {
          duration: 1,
          autoAlpha: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            scroller: scrollRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  // Handle click ripple effect
  const handleClickRipple = (sectionId) => (e) => {
    const section = e.currentTarget;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => {
      const sectionRipples = prev[sectionId] || [];
      return {
        ...prev,
        [sectionId]: [...sectionRipples, newRipple],
      };
    });

    setTimeout(() => {
      setRipples((prev) => {
        const sectionRipples = prev[sectionId] || [];
        return {
          ...prev,
          [sectionId]: sectionRipples.filter((r) => r.id !== newRipple.id),
        };
      });
    }, 700);
  };

  const renderRipples = (sectionId) => {
    const sectionRipples = ripples[sectionId] || [];
    return sectionRipples.map(({ id, x, y }) => (
      <span key={id} className="ripple" style={{ top: y, left: x }} />
    ));
  };

  const sections = [
    {
      id: "sec1",
      content: (
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            margin: 0,
            userSelect: "none",
          }}
        >
          Welcome to Playground
        </h1>
      ),
      bg: "#0d0d0d",
    },
    {
      id: "sec2",
      content: (
        <p
          style={{
            fontSize: "2rem",
            margin: 0,
            userSelect: "none",
          }}
        >
          Scroll-Triggered Animations!
        </p>
      ),
      bg: "#111111",
    },
    {
      id: "sec3",
      content: (
        <h2
          style={{
            fontSize: "3rem",
            margin: 0,
            userSelect: "none",
          }}
        >
          Smooth Locomotive Scroll + GSAP
        </h2>
      ),
      bg: "#222222",
    },
  ];

  return (
    <>
      

      <div
        data-scroll-container
        ref={scrollRef}
        style={{
          minHeight: "300vh",
          overflow: "hidden",
          backgroundColor: "#0d0d0d",
          color: "white",
        }}
      >
        {sections.map(({ id, content, bg }) => (
          <section
            key={id}
            className="reveal"
            style={{
              height: "100vh",
              backgroundColor: bg,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
            onClick={handleClickRipple(id)}
          >
            {content}
            {renderRipples(id)}
          </section>
        ))}
      </div>

      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          background: rgba(0, 255, 204, 0.5);
          pointer-events: none;
          transform: translate(-50%, -50%) scale(0);
          animation: rippleEffect 700ms ease-out forwards;
          mix-blend-mode: screen;
          z-index: 10;
        }
        @keyframes rippleEffect {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(10);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(15);
          }
        }
      `}</style>
    </>
  );
}
