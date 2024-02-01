import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import image1 from '../src/Earth_Texture_Full.jpg';
import image2 from '../src/Sun_Texture.jpg';
import image3 from '../src/Venus_Texture.jpg';
import image4 from '../src/Mercury_Texture.jpg';
import circleTexture from '../src/disc.png'; // Replace with your texture path

function ThreeScene() {
  const refContainer = useRef(null);

  useEffect(() => {
    // Create scene
    const scene = new THREE.Scene();

    // Create first sphere
    const geometry = new THREE.SphereGeometry(0.82, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      emissive: "#ffff00",
      emissiveMap: new THREE.TextureLoader().load(image2), // Sun texture
    });

    const sun = new THREE.Mesh(geometry, material);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Create second sphere with different position
    const geometry4 = new THREE.SphereGeometry(0.3, 64, 64);
    const material4 = new THREE.MeshStandardMaterial({ color: "#D3D3D3", map: new THREE.TextureLoader().load(image4) });
    const Mercury = new THREE.Mesh(geometry4, material4);
    // Mercury.position.set(0, 0, -3); // Set different position
    scene.add(Mercury);

    // Create second sphere with different position
    const geometry3 = new THREE.SphereGeometry(0.5, 64, 64);
    const material3 = new THREE.MeshStandardMaterial({ color: "#F5F5F5", map: new THREE.TextureLoader().load(image3) });
    const venus = new THREE.Mesh(geometry3, material3);
    // venus.position.set(-3, 0, -6); // Set different position
    scene.add(venus);

    // Create second sphere with different position
    const geometry2 = new THREE.SphereGeometry(1, 64, 64);
    const material2 = new THREE.MeshStandardMaterial({ color: "#00aaff", map: new THREE.TextureLoader().load(image1) });
    const earth = new THREE.Mesh(geometry2, material2);
    // earth.position.set(-6, 0, -10); // Set different position
    scene.add(earth);

    // Create lights for earth
    const light1 = new THREE.PointLight(0xffffff, 1, 1000);
    light1.position.set(0, 0, 0);
    light1.intensity = 60;
    scene.add(light1);

    // Create a particle system with circular sprite texture
    const particles_materials = [];
    const particlesSystems = [];
    const colors = [0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xd3d3d3, 0x333333, 0x000000];
    for (let i = 0; i < 4; i++) {
      particles_materials.push(new THREE.PointsMaterial({
        size: 0.1,
        map: new THREE.TextureLoader().load(circleTexture),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: colors[i],
      }));

      const particles_geometry = new THREE.BufferGeometry();
      const particlesVertices = [];

      for (let j = 0; j < 2000; j++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        particlesVertices.push(x, y, z);
      }

      particles_geometry.setAttribute("position", new THREE.Float32BufferAttribute(particlesVertices, 3));

      const particlesSystem = new THREE.Points(particles_geometry, particles_materials[i]);
      particlesSystems.push(particlesSystem);
      scene.add(particlesSystem);
    }

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    scene.add(camera);

    // Create renderer and attach to container element
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    refContainer.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.3;
    bloomPass.strength = 3;
    bloomPass.radius = 0.55;
    composer.addPass(bloomPass);

    var orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitGroup.add(sun);
    orbitGroup.add(Mercury);
    orbitGroup.add(venus);
    orbitGroup.add(earth);

    let colorIndex = 0;
    let frameCount = 0;
    // ...

    const blink = () => {
      for (let i = 0; i < particles_materials.length; i++) {
        setTimeout(() => {
          colorIndex = (colorIndex + 1) % colors.length;
          particles_materials[i].color.setHex(colors[colorIndex]);
        }, i * 100); // Adjust the delay (in milliseconds) as needed
      }
      frameCount++;
    };

    // ...

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate spheres
      orbitGroup.rotation.y += 0.004;

      earth.rotation.x += 0.00001;
      earth.rotation.y += 0.01;
      venus.rotation.x += 0.00001;
      venus.rotation.y += 0.01;
      Mercury.rotation.x += 0.00001;
      Mercury.rotation.y += 0.01;
          // Set different orbit speeds for each planet
          const earthOrbitSpeed = -0.001;
          const venusOrbitSpeed = -0.0015;  // Faster orbit for Venus
          const mercuryOrbitSpeed = -0.002; // Faster orbit for Mercury
          
          const earthDistance = -10;
          const venusDistance = -6;
          const mercuryDistance = -3;
          
          earth.position.x = Math.cos(earthOrbitSpeed * frameCount) * earthDistance;
          earth.position.z = Math.sin(earthOrbitSpeed * frameCount) * earthDistance;
          
          venus.position.x = Math.cos(venusOrbitSpeed * frameCount) * venusDistance;
          venus.position.z = Math.sin(venusOrbitSpeed * frameCount) * venusDistance;
          
          Mercury.position.x = Math.cos(mercuryOrbitSpeed * frameCount) * mercuryDistance;
          Mercury.position.z = Math.sin(mercuryOrbitSpeed * frameCount) * mercuryDistance;
          

      blink();

      // Render scene
      composer.render();
    };

    // Start animation loop
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div style={{ height: "100%", width: "100%" }} ref={refContainer}></div>;
}

export default ThreeScene;
