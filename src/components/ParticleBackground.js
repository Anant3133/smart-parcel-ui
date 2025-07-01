// components/ParticleBackground.js
import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: 0, // behind everything
        },
        background: {
          color: "#0d0d0d",
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ["#00ffcc", "#00aabb", "#66ffff"],
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.7,
            random: { enable: true, minimumValue: 0.3 },
          },
          size: {
            value: 4,
            random: { enable: true, minimumValue: 1 },
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "bounce",
            },
          },
          links: {
            enable: true,
            distance: 120,
            color: "#00ffcc",
            opacity: 0.3,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
            push: {
              quantity: 4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
