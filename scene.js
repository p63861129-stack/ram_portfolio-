
(() => {
  "use strict";

  /* ==========================================
     RAM. — THREE.JS CINEMATIC SCENE ENGINE
     ========================================== */

  const canvasContainer = document.querySelector(".hero-visual");

  if (!canvasContainer || !window.THREE) {
    console.warn("RAM. 3D scene unavailable.");
    return;
  }

  const THREE = window.THREE;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isMobile = window.matchMedia(
    "(max-width: 768px)"
  ).matches;

  /* ==========================================
     01. SCENE SETUP
     ========================================== */

  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0x080812, 0.055);

  const camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.clientWidth / canvasContainer.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
  );

  renderer.setSize(
    canvasContainer.clientWidth,
    canvasContainer.clientHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  renderer.domElement.className = "hero-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");

  canvasContainer.appendChild(renderer.domElement);


  /* ==========================================
     02. LIGHTING
     ========================================== */

  const ambientLight = new THREE.AmbientLight(
    0x8795ff,
    1.4
  );

  scene.add(ambientLight);

  const blueLight = new THREE.PointLight(
    0x376bff,
    35,
    15
  );

  blueLight.position.set(-3, 2, 4);
  scene.add(blueLight);

  const violetLight = new THREE.PointLight(
    0x9d45ff,
    28,
    15
  );

  violetLight.position.set(3, -2, 3);
  scene.add(violetLight);

  const cyanLight = new THREE.PointLight(
    0x00e5ff,
    18,
    12
  );

  cyanLight.position.set(0, 3, -2);
  scene.add(cyanLight);


  /* ==========================================
     03. CENTRAL HOLOGRAPHIC CORE
     ========================================== */

  const coreGroup = new THREE.Group();

  scene.add(coreGroup);

  const coreGeometry = new THREE.IcosahedronGeometry(
    1.25,
    2
  );

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7a5cff,
    emissive: 0x3215a8,
    emissiveIntensity: 0.65,
    metalness: 0.8,
    roughness: 0.22,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });

  const core = new THREE.Mesh(
    coreGeometry,
    coreMaterial
  );

  coreGroup.add(core);


  /* Inner energy sphere */

  const innerGeometry = new THREE.IcosahedronGeometry(
    0.72,
    3
  );

  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d9ff,
    wireframe: true,
    transparent: true,
    opacity: 0.32
  });

  const innerCore = new THREE.Mesh(
    innerGeometry,
    innerMaterial
  );

  coreGroup.add(innerCore);


  /* Central glowing orb */

  const orbGeometry = new THREE.SphereGeometry(
    0.38,
    32,
    32
  );

  const orbMaterial = new THREE.MeshBasicMaterial({
    color: 0x9e72ff
  });

  const orb = new THREE.Mesh(
    orbGeometry,
    orbMaterial
  );

  coreGroup.add(orb);


  /* ==========================================
     04. ENERGY ORBIT RINGS
     ========================================== */

  const orbitMaterials = [
    new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.8
    }),
    new THREE.MeshBasicMaterial({
      color: 0x9d4dff,
      transparent: true,
      opacity: 0.8
    }),
    new THREE.MeshBasicMaterial({
      color: 0xff4dcb,
      transparent: true,
      opacity: 0.65
    })
  ];

  const orbitRings = [];

  const orbitConfigurations = [
    { radius: 1.75, rotation: [1.1, 0.2, 0.3] },
    { radius: 2.05, rotation: [0.3, 1.2, 0.7] },
    { radius: 2.3, rotation: [1.5, 0.4, 1.1] }
  ];

  orbitConfigurations.forEach((config, index) => {
    const geometry = new THREE.TorusGeometry(
      config.radius,
      0.012,
      8,
      150
    );

    const ring = new THREE.Mesh(
      geometry,
      orbitMaterials[index]
    );

    ring.rotation.set(...config.rotation);

    coreGroup.add(ring);
    orbitRings.push(ring);
  });


  /* ==========================================
     05. ORBITING ENERGY PARTICLES
     ========================================== */

  const orbitParticles = [];

  const orbitParticleCount = isMobile ? 35 : 70;

  const particleGeometry = new THREE.SphereGeometry(
    0.035,
    8,
    8
  );

  for (let i = 0; i < orbitParticleCount; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(
        0.55 + Math.random() * 0.22,
        1,
        0.65
      )
    });

    const particle = new THREE.Mesh(
      particleGeometry,
      material
    );

    const angle = Math.random() * Math.PI * 2;
    const radius = 1.6 + Math.random() * 1.1;

    particle.userData = {
      angle,
      radius,
      speed: 0.15 + Math.random() * 0.4,
      verticalOffset: (Math.random() - 0.5) * 1.5
    };

    coreGroup.add(particle);
    orbitParticles.push(particle);
  }


  /* ==========================================
     06. BACKGROUND PARTICLE FIELD
     ========================================== */

  const backgroundCount = isMobile ? 350 : 900;

  const backgroundPositions = new Float32Array(
    backgroundCount * 3
  );

  const backgroundColors = new Float32Array(
    backgroundCount * 3
  );

  const colorPalette = [
    new THREE.Color(0x00d9ff),
    new THREE.Color(0x8957ff),
    new THREE.Color(0xff4dcb),
    new THREE.Color(0xffffff)
  ];

  for (let i = 0; i < backgroundCount; i++) {
    const index = i * 3;

    backgroundPositions[index] =
      (Math.random() - 0.5) * 18;

    backgroundPositions[index + 1] =
      (Math.random() - 0.5) * 14;

    backgroundPositions[index + 2] =
      (Math.random() - 0.5) * 10;

    const color = colorPalette[
      Math.floor(Math.random() * colorPalette.length)
    ];

    backgroundColors[index] = color.r;
    backgroundColors[index + 1] = color.g;
    backgroundColors[index + 2] = color.b;
  }

  const backgroundGeometry = new THREE.BufferGeometry();

  backgroundGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(backgroundPositions, 3)
  );

  backgroundGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(backgroundColors, 3)
  );

  const backgroundMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.025 : 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const backgroundParticles = new THREE.Points(
    backgroundGeometry,
    backgroundMaterial
  );

  scene.add(backgroundParticles);


  /* ==========================================
     07. FLOATING GEOMETRIC OBJECTS
     ========================================== */

  const floatingObjects = [];

  const floatingGeometry = [
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.TetrahedronGeometry(0.18, 0),
    new THREE.IcosahedronGeometry(0.15, 0)
  ];

  const floatingMaterials = [
    new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true
    }),
    new THREE.MeshBasicMaterial({
      color: 0xa45cff,
      wireframe: true
    }),
    new THREE.MeshBasicMaterial({
      color: 0xff4dcb,
      wireframe: true
    })
  ];

  for (let i = 0; i < (isMobile ? 7 : 15); i++) {
    const geometry = floatingGeometry[
      i % floatingGeometry.length
    ];

    const material = floatingMaterials[
      i % floatingMaterials.length
    ];

    const object = new THREE.Mesh(
      geometry,
      material
    );

    object.position.set(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 3
    );

    object.userData = {
      baseY: object.position.y,
      speed: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    };

    scene.add(object);
    floatingObjects.push(object);
  }


  /* ==========================================
     08. INTERACTION / MOUSE PARALLAX
     ========================================== */

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  canvasContainer.addEventListener("pointermove", event => {
    const rect = canvasContainer.getBoundingClientRect();

    pointer.targetX =
      ((event.clientX - rect.left) / rect.width - 0.5) * 2;

    pointer.targetY =
      ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }, { passive: true });

  canvasContainer.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });


  /* ==========================================
     09. ANIMATION LOOP
     ========================================== */

  const clock = new THREE.Clock();

  let animationFrame = null;
  let isVisible = true;

  function animate() {
    if (!isVisible) return;

    animationFrame = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const delta = Math.min(clock.getDelta(), 0.05);

    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;


    /* Core rotation */

    core.rotation.x += delta * 0.12;
    core.rotation.y += delta * 0.2;

    innerCore.rotation.x -= delta * 0.24;
    innerCore.rotation.y += delta * 0.3;

    orb.scale.setScalar(
      1 + Math.sin(elapsed * 2.2) * 0.08
    );

    coreGroup.rotation.y = pointer.x * 0.18;
    coreGroup.rotation.x = -pointer.y * 0.13;

    coreGroup.position.y =
      Math.sin(elapsed * 0.65) * 0.12;


    /* Orbit movement */

    orbitRings.forEach((ring, index) => {
      ring.rotation.x += delta * (0.1 + index * 0.04);
      ring.rotation.y += delta * (0.13 + index * 0.03);
    });


    /* Orbiting particles */

    orbitParticles.forEach(particle => {
      const data = particle.userData;

      data.angle += delta * data.speed;

      particle.position.x =
        Math.cos(data.angle) * data.radius;

      particle.position.z =
        Math.sin(data.angle) * data.radius;

      particle.position.y =
        data.verticalOffset +
        Math.sin(elapsed * 1.5 + data.angle) * 0.2;
    });


    /* Floating objects */

    floatingObjects.forEach(object => {
      const data = object.userData;

      object.rotation.x += delta * 0.4;
      object.rotation.y += delta * 0.55;

      object.position.y =
        data.baseY +
        Math.sin(elapsed * data.speed + data.phase) * 0.28;
    });


    /* Background movement */

    backgroundParticles.rotation.y = elapsed * 0.012;
    backgroundParticles.rotation.x =
      Math.sin(elapsed * 0.1) * 0.04;


    /* Animated lighting */

    blueLight.position.x = Math.sin(elapsed * 0.5) * 3;
    violetLight.position.y = Math.cos(elapsed * 0.4) * 2;

    blueLight.intensity =
      30 + Math.sin(elapsed * 1.5) * 8;

    violetLight.intensity =
      25 + Math.cos(elapsed * 1.2) * 7;


    /* Camera parallax */

    camera.position.x +=
      (pointer.x * 0.25 - camera.position.x) * 0.025;

    camera.position.y +=
      (-pointer.y * 0.2 - camera.position.y) * 0.025;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }


  /* ==========================================
     10. RESPONSIVE RESIZING
     ========================================== */

  function resizeScene() {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
    );
  }

  const resizeObserver = new ResizeObserver(resizeScene);
  resizeObserver.observe(canvasContainer);

  window.addEventListener("orientationchange", resizeScene);


  /* ==========================================
     11. PERFORMANCE / VISIBILITY
     ========================================== */

  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;

      if (isVisible && !animationFrame) {
        clock.start();
        animate();
      }

      if (!isVisible && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    });
  }, {
    threshold: 0.01
  });

  visibilityObserver.observe(canvasContainer);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    } else if (isVisible && !animationFrame) {
      clock.start();
      animate();
    }
  });


  /* ==========================================
     12. REDUCED MOTION SUPPORT
     ========================================== */

  if (reducedMotion) {
    core.rotation.set(0.25, 0.4, 0);
    innerCore.rotation.set(0.4, 0.2, 0);

    renderer.render(scene, camera);
  } else {
    animate();
  }


  /* ==========================================
     13. CLEANUP
     ========================================== */

  window.addEventListener("beforeunload", () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    resizeObserver.disconnect();
    visibilityObserver.disconnect();

    scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    renderer.dispose();
  });

})();
