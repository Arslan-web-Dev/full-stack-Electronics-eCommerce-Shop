"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Futuristic3DCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mountRef.current) return;

    // --- Scene Setup ---
    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    
    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 15;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Particles Geometry ---
    const particlesCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    // Arrange particles in a sphere shape
    for (let i = 0; i < particlesCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.5 + Math.random() * 0.8; // Radius of sphere with slight variation

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Holographic cyber color gradient (indigo to light cyan)
      const ratio = i / particlesCount;
      colors[i * 3] = 0.09 + ratio * 0.15;   // R
      colors[i * 3 + 1] = 0.65 + ratio * 0.3; // G
      colors[i * 3 + 2] = 0.9 + ratio * 0.1;  // B
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // --- Material ---
    // Creating custom canvas-based texture for round glowing particles
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(56, 189, 248, 0.8)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // --- Points Mesh ---
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // --- Orbital Hologram Ring ---
    const ringGeo = new THREE.RingGeometry(5.2, 5.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    scene.add(ring);

    // --- Orbital Hologram Outer Ring ---
    const outerRingGeo = new THREE.RingGeometry(6.0, 6.05, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2.8;
    scene.add(outerRing);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // --- Interactive Parallax variables ---
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event: MouseEvent) => {
      targetX = (event.clientX - windowHalfX) * 0.0006;
      targetY = (event.clientY - windowHalfY) * 0.0006;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- Resize handler ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // --- Animation loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotation of spheres
      particleSystem.rotation.y = elapsedTime * 0.06;
      particleSystem.rotation.x = elapsedTime * 0.03;

      // Parallax effect towards mouse cursor position
      particleSystem.position.x += (targetX - particleSystem.position.x) * 0.05;
      particleSystem.position.y += (-targetY - particleSystem.position.y) * 0.05;

      // Orbital rings rotate at slightly distinct frequencies
      ring.rotation.z = elapsedTime * 0.15;
      outerRing.rotation.z = -elapsedTime * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      texture.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-[500px] h-[500px] max-md:w-[350px] max-md:h-[350px] max-sm:w-[280px] max-sm:h-[280px] cursor-pointer"
    />
  );
};

export default Futuristic3DCanvas;
