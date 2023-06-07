import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { gsap } from "gsap";
import * as THREE from "three";
import "./index.css";

const STAR_PARAMETERS = {
  spreadX: 5000,
  spreadY: 5000,
  spreadZ: 7000,
  count: 5000,
  center: 1000,
  size: 2,
  cylinderRadius: 50,
  color: 0xffffff,
};

const SCROLL_PARAMETERS = {
  y: 0,
  scale: 0.001,
  minFactor: 0.1,
  maxFactor: 10,
  trueFactor: 0,
  maxVelocity: 5,
  dampingFactor: 0.98,
};

const CAMERA_PARAMETERS = {
  fov: 45,
  focal: 20,
  near: 0.1,
  far: 2000,
  initialPosition: { x: 100, y: 50, z: 2600 },
  toAsteroidDistance: 10,
  maxShake: 0.3,
  distancetoShake: 500,
};

const SUNLIGHT_PARAMETERS = {
  properties: { color: 0x404040, intensity: 10 },
  position: { x: -420, y: -10, z: -500 },
};

const ASTEROID_PARAMETERS = {
  properties: { radius: 1, widthSegments: 12, heightSegments: 8 },
  position: { x: 0, y: 0, z: -1000 },
  rotation: { x: 0.01, y: 0, z: 0 },
  texturePath: "/images/asteroid.jpeg",
};

const EARTH_PARAMETERS = {
  properties: { radius: 80, widthSegments: 64, heightSegments: 64 },
  position: { x: 0, y: 0, z: 3100 },
  rotation: { x: 0, y: Math.PI / (60 * 24), z: 0 },
  texturePath: {
    color: "/images/earth.jpg",
    normal: "/images/earth-normal.png",
    specular: "/images/earth-spec.png",
  },
};

const MOON_PARAMETERS = {
  properties: {
    radius: 20,
    widthSegments: 32,
    heightSegments: 32,
  },
  texturePath: {
    color: "/images/moon.jpeg",
  },
  position: {
    x: 500,
    y: 0,
    z: 4000,
  },
  angle: 0,
  radiusOrbit: 900,
};

const ATMOSPHERE_PARAMETERS = {
  properties: {
    radius: EARTH_PARAMETERS.properties.radius * 1.13,
    widthSegments: 16,
    heightSegments: 16,
  },
  position: {
    x: EARTH_PARAMETERS.position.x,
    y: EARTH_PARAMETERS.position.y,
    z: EARTH_PARAMETERS.position.z,
  },
  opacity: 0.1,
  color: new THREE.Color(0x2040ff),
};

const TEXT_PARAMETERS = {
  visibilityThreshold: 100,
  fontURL: "/fonts/Bebas.json",
  yearText: {
    size: 3,
    height: 0.1,
    curveSegments: 10,
    bevel: {
      enabled: true,
      thickness: 0.3,
      size: 0.01,
      offset: 0,
      segments: 5,
    },
    material: {
      color: "orange",
      transparent: true,
      opacity: 1,
    },
    positionOffset: {
      x: 0.5,
      y: 2,
      z: 0,
    },
  },
  infoText: {
    size: 1,
    height: 0,
    curveSegments: 10,
    bevel: {
      enabled: false,
    },
    material: {
      color: "white",
      transparent: true,
      opacity: 1,
    },
  },
};

const textData = [
  {
    year: 1950,
    info: "Post-war industrialization begins\nto significantly increase carbon dioxide levels.",
    position: new THREE.Vector3(-5, 1, 0),
    rotation: Math.PI * -1.1,
  },
  {
    year: 1960,
    info: "Rapid deforestation and urbanization\nfurther escalate greenhouse gas emissions.",
    position: new THREE.Vector3(-5, 1, 500),
    rotation: Math.PI * -1.1,
  },
  {
    year: 1970,
    info: "The Clean Air Act is passed in the USA, but global\nemissions continue to rise.",
    position: new THREE.Vector3(-5, 1, 1000),
    rotation: Math.PI * -1.1,
  },
  {
    year: 1980,
    info: "Scientists reach consensus on\nthe reality of climate change, but political action is slow.",
    position: new THREE.Vector3(15, 1, 1500),
    rotation: Math.PI * 1.1,
  },
  {
    year: 1990,
    info: "The IPCC is formed but struggles\nto influence global climate policy.",
    position: new THREE.Vector3(15, 1, 2000),
    rotation: Math.PI * 1.1,
  },
  {
    year: 2000,
    info: "Record high temperatures and extreme weather events\nbecome the new normal.",
    position: new THREE.Vector3(15, 1, 2500),
    rotation: Math.PI * 1.1,
  },
  {
    year: 2010,
    info: "Despite the Paris Agreement, countries fall short of\ntheir commitments to reduce emissions.",
    position: new THREE.Vector3(-5, 1, 2600),
    rotation: Math.PI * -1.1,
  },
  {
    year: 2023,
    info: "The world witnesses unprecedented climate disasters,\nas global warming exceeds the 1.5 degrees Celsius threshold.",
    position: new THREE.Vector3(15, 1, 2700),
    rotation: Math.PI * 1.1,
  },
  {
    year: 2024,
    info: "Despite efforts, carbon emissions continue to rise\nat a dangerous rate.",
    position: new THREE.Vector3(-5, 1, 2800),
    rotation: Math.PI * -1.1,
  },
  {
    year: 2025,
    info: "Fossil fuels still dominate the energy landscape,\nand renewable energy adoption is slower than needed.",
    position: new THREE.Vector3(15, 1, 2900),
    rotation: Math.PI * 1.1,
  },
  {
    year: 2026,
    info: "Climate change-related crises intensify worldwide. The 2 degrees Celsius\ntarget seems increasingly out of reach.",
    position: new THREE.Vector3(4, 1, 2950),
    rotation: Math.PI,
  },
];

const DISTANCE_THRESHOLD = 200;
const TITLE_SCREEN_STATE = { showing: true };
const BUTTON_STATE = { clicked: false };
const MOUSE = { x: 0, y: 0 };

const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize( normalMatrix * normal );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `;
const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform float opacity;
  uniform vec3 color;
  void main() {
    float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
    gl_FragColor = vec4( color, opacity ) * intensity;
  }
`;

function createEarth(scene, loader) {
  return new Promise((resolve, reject) => {
    const earthGeometry = new THREE.SphereGeometry(
      EARTH_PARAMETERS.properties.radius,
      EARTH_PARAMETERS.properties.widthSegments,
      EARTH_PARAMETERS.properties.heightSegments
    );

    const earthMaterial = new THREE.MeshPhongMaterial();

    const atmosphereGeometry = new THREE.SphereGeometry(
      ATMOSPHERE_PARAMETERS.properties.radius,
      ATMOSPHERE_PARAMETERS.properties.widthSegments,
      ATMOSPHERE_PARAMETERS.properties.heightSegments
    );

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      uniforms: {
        opacity: { value: ATMOSPHERE_PARAMETERS.opacity },
        color: { value: ATMOSPHERE_PARAMETERS.color },
      },
    });

    const loadTexture = (path) => {
      return new Promise((resolve, reject) => {
        loader.load(path, resolve, undefined, reject);
      });
    };

    Promise.all([
      loadTexture(EARTH_PARAMETERS.texturePath.color),
      loadTexture(EARTH_PARAMETERS.texturePath.normal),
      loadTexture(EARTH_PARAMETERS.texturePath.specular),
    ])
      .then(([earthTexture, normalMap, specularMap]) => {
        earthMaterial.map = earthTexture;
        earthMaterial.normalMap = normalMap;
        earthMaterial.specularMap = specularMap;

        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.userData = { earthTexture, normalMap, specularMap };

        earth.position.set(
          EARTH_PARAMETERS.position.x,
          EARTH_PARAMETERS.position.y,
          EARTH_PARAMETERS.position.z
        );

        scene.add(earth);

        const atmosphere = new THREE.Mesh(
          atmosphereGeometry,
          atmosphereMaterial
        );

        scene.add(atmosphere);

        atmosphere.position.set(
          earth.position.x,
          earth.position.y,
          earth.position.z
        );

        resolve({ earth, atmosphere });
      })
      .catch(reject);
  });
}

function createMoon(scene, loader) {
  return new Promise((resolve, reject) => {
    const moonGeometry = new THREE.SphereGeometry(
      MOON_PARAMETERS.properties.radius,
      MOON_PARAMETERS.properties.widthSegments,
      MOON_PARAMETERS.properties.heightSegments
    );

    const moonMaterial = new THREE.MeshPhongMaterial();

    const loadTexture = (path) => {
      return new Promise((resolve, reject) => {
        loader.load(path, resolve, undefined, reject);
      });
    };

    loadTexture(MOON_PARAMETERS.texturePath.color)
      .then((moonTexture) => {
        moonMaterial.map = moonTexture;

        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.userData = { moonTexture };

        moon.position.set(
          MOON_PARAMETERS.position.x,
          MOON_PARAMETERS.position.y,
          MOON_PARAMETERS.position.z
        );

        scene.add(moon);

        resolve(moon);
      })
      .catch(reject);
  });
}

function createAsteroid(scene, loader) {
  return new Promise((resolve, reject) => {
    const asteroidGeometry = new THREE.SphereGeometry(
      ASTEROID_PARAMETERS.properties.radius,
      ASTEROID_PARAMETERS.properties.widthSegments,
      ASTEROID_PARAMETERS.properties.heightSegments
    );
    loader.load(
      ASTEROID_PARAMETERS.texturePath,
      function (asteroidTexture) {
        const asteroidMaterial = new THREE.MeshPhongMaterial({
          map: asteroidTexture,
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(
          ASTEROID_PARAMETERS.position.x,
          ASTEROID_PARAMETERS.position.y,
          ASTEROID_PARAMETERS.position.z
        );
        scene.add(asteroid);
        resolve(asteroid);
      },
      undefined,
      function (err) {
        reject(err);
      }
    );
  });
}

function createSunlight(scene) {
  return new Promise((resolve, reject) => {
    try {
      const sunlight = new THREE.DirectionalLight(
        SUNLIGHT_PARAMETERS.properties.color,
        SUNLIGHT_PARAMETERS.properties.intensity
      );
      sunlight.position.set(
        SUNLIGHT_PARAMETERS.position.x,
        SUNLIGHT_PARAMETERS.position.y,
        SUNLIGHT_PARAMETERS.position.z
      );
      scene.add(sunlight);
      resolve(sunlight);
    } catch (error) {
      reject(error);
    }
  });
}

function createStars(scene) {
  return new Promise((resolve, reject) => {
    try {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: STAR_PARAMETERS.color,
        size: STAR_PARAMETERS.size,
      });

      const starPoints = [];

      for (let i = 0; i < STAR_PARAMETERS.count; i++) {
        let x, y, z;
        do {
          x = THREE.MathUtils.randFloatSpread(STAR_PARAMETERS.spreadX);
          y = THREE.MathUtils.randFloatSpread(STAR_PARAMETERS.spreadY);
          z =
            THREE.MathUtils.randFloatSpread(STAR_PARAMETERS.spreadZ) +
            STAR_PARAMETERS.center;
        } while (Math.sqrt(x * x + y * y) < STAR_PARAMETERS.cylinderRadius);

        starPoints.push(x, y, z);
      }

      starsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPoints, 3)
      );

      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);

      resolve(stars);
    } catch (error) {
      reject(error);
    }
  });
}

function createText(scene) {
  const loader = new FontLoader();

  const textObjects = textData.map(({ year, info, position, rotation }) => {
    return new Promise((resolve) => {
      loader.load(TEXT_PARAMETERS.fontURL, function (font) {
        const yearTextGeo = new TextGeometry(String(year), {
          font: font,
          size: TEXT_PARAMETERS.yearText.size,
          height: TEXT_PARAMETERS.yearText.height,
          curveSegments: TEXT_PARAMETERS.yearText.curveSegments,
          bevelEnabled: TEXT_PARAMETERS.yearText.bevel.enabled,
          bevelThickness: TEXT_PARAMETERS.yearText.bevel.thickness,
          bevelSize: TEXT_PARAMETERS.yearText.bevel.size,
          bevelOffset: TEXT_PARAMETERS.yearText.bevel.offset,
          bevelSegments: TEXT_PARAMETERS.yearText.bevel.segments,
        });

        const yearTextMaterial = new THREE.MeshBasicMaterial(
          TEXT_PARAMETERS.yearText.material
        );

        const yearText = new THREE.Mesh(yearTextGeo, yearTextMaterial);
        yearText.position.x =
          position.x + TEXT_PARAMETERS.yearText.positionOffset.x;
        yearText.position.y =
          position.y + TEXT_PARAMETERS.yearText.positionOffset.y;
        yearText.position.z =
          position.z + TEXT_PARAMETERS.yearText.positionOffset.z;
        yearText.rotation.y = rotation;

        scene.add(yearText);

        const infoTextGeo = new TextGeometry(info, {
          font: font,
          size: TEXT_PARAMETERS.infoText.size,
          height: TEXT_PARAMETERS.infoText.height,
          curveSegments: TEXT_PARAMETERS.infoText.curveSegments,
          bevelEnabled: TEXT_PARAMETERS.infoText.bevel.enabled,
        });

        const infoTextMaterial = new THREE.MeshBasicMaterial(
          TEXT_PARAMETERS.infoText.material
        );

        const infoText = new THREE.Mesh(infoTextGeo, infoTextMaterial);
        infoText.position.x = position.x;
        infoText.position.y = position.y;
        infoText.position.z = position.z;
        infoText.rotation.y = rotation;

        scene.add(infoText);

        resolve({ yearText: yearText, infoText: infoText });
      });
    });
  });

  return Promise.all(textObjects);
}

function updateAsteroidPosition(asteroid) {
  const scrollAmount = calculateScrollAmount();

  let closestDistance = Infinity;

  for (const textDataItem of textData) {
    const distance = Math.abs(
      asteroid.position.z - textDataItem.position.z + 25
    );

    if (distance < closestDistance) {
      closestDistance = distance;
    }
  }

  if (closestDistance <= DISTANCE_THRESHOLD) {
    const scrollFactorRange =
      SCROLL_PARAMETERS.maxFactor - SCROLL_PARAMETERS.minFactor;
    const distanceFactor = closestDistance / DISTANCE_THRESHOLD;
    SCROLL_PARAMETERS.trueFactor =
      SCROLL_PARAMETERS.minFactor + scrollFactorRange * distanceFactor;
  } else {
    SCROLL_PARAMETERS.trueFactor = SCROLL_PARAMETERS.maxFactor;
  }

  asteroid.position.z += SCROLL_PARAMETERS.trueFactor * scrollAmount;

  if (asteroid.position.z < ASTEROID_PARAMETERS.position.z) {
    asteroid.position.z = ASTEROID_PARAMETERS.position.z;
  }

  if (asteroid.position.z > EARTH_PARAMETERS.position.z - 100) {
    asteroid.position.z = EARTH_PARAMETERS.position.z - 100;
  }
}

function updateAsteroidRotation(asteroid) {
  asteroid.rotation.x += ASTEROID_PARAMETERS.rotation.x;
}

function updateEarthRotation(earth) {
  earth.rotation.y += EARTH_PARAMETERS.rotation.y;
}

function updateMoon(earth, moon) {
  moon.position.x =
    earth.position.x +
    MOON_PARAMETERS.radiusOrbit * Math.sin(MOON_PARAMETERS.angle);
  moon.position.z =
    earth.position.z +
    MOON_PARAMETERS.radiusOrbit * Math.cos(MOON_PARAMETERS.angle);

  MOON_PARAMETERS.angle += EARTH_PARAMETERS.rotation.y;
  if (MOON_PARAMETERS.angle >= Math.PI * 2) {
    MOON_PARAMETERS.angle = 0;
  }
  moon.rotation.y += EARTH_PARAMETERS.rotation.y;
}

function updateText(asteroid, texts) {
  texts.forEach((text) => {
    const yearDistance = asteroid.position.distanceTo(text.yearText.position);

    if (yearDistance < TEXT_PARAMETERS.visibilityThreshold) {
      text.yearText.material.opacity =
        1 - yearDistance / TEXT_PARAMETERS.visibilityThreshold;
      text.infoText.material.opacity =
        1 - yearDistance / TEXT_PARAMETERS.visibilityThreshold;
    } else {
      text.yearText.material.opacity = 0;
      text.infoText.material.opacity = 0;
    }
    text.yearText.material.needsUpdate = true;
    text.infoText.material.needsUpdate = true;
  });
}

function updateCamera(asteroid, earth, camera) {
  if (!TITLE_SCREEN_STATE.showing) {
    camera.position.z =
      asteroid.position.z - CAMERA_PARAMETERS.toAsteroidDistance;
    camera.position.y = asteroid.position.y + 2;

    gsap.to(camera.position, {
      duration: 5,
      x: asteroid.position.x,
      y: asteroid.position.y,
      ease: "power1",
      onUpdate: function () {
        camera.lookAt(earth.position.x, earth.position.y, earth.position.z);
      },
    });
  }
}

function updateCameraInitial(camera, asteroid, earth) {
  camera.far = 6000;

  const newPosition = {
    x: asteroid.position.x,
    y: asteroid.position.y + 2,
    z: asteroid.position.z - CAMERA_PARAMETERS.toAsteroidDistance,
  };

  gsap.to(camera.position, {
    duration: 3,
    x: newPosition.x,
    y: newPosition.y,
    z: newPosition.z,
    ease: "power3",
    onUpdate: function () {
      camera.updateProjectionMatrix();
      camera.lookAt(earth.position.x, earth.position.y, earth.position.z);
    },
    onComplete: function () {
      TITLE_SCREEN_STATE.showing = false;
    },
  });
}

function updateSunlight(sunlight, asteroid, earth, atmosphere) {
  const distanceToEarth = asteroid.position.distanceTo(earth.position);
  const maxDistance = 500;

  let redIntensity = 0;

  if (distanceToEarth < maxDistance) {
    redIntensity = 0.1;
  } else {
    redIntensity = 0;
  }

  const newColor = new THREE.Color(redIntensity, 0, 0);
  const originalColor = new THREE.Color(0x404040);

  sunlight.color = redIntensity > 0 ? newColor : originalColor;

  if (redIntensity > 0) {
    atmosphere.material.uniforms.color.value = newColor;
  } else {
    atmosphere.material.uniforms.color.value = new THREE.Color(0x2040ff);
  }
  atmosphere.material.needsUpdate = true;
}

function shakeCamera(camera, asteroid, earth) {
  const distance = asteroid.position.distanceTo(earth.position);
  if (distance > CAMERA_PARAMETERS.distancetoShake) {
    return;
  }
  const shakeAmount =
    (1 - distance / CAMERA_PARAMETERS.distancetoShake) *
    CAMERA_PARAMETERS.maxShake;

  const dx = (Math.random() - 0.5) * shakeAmount;
  const dy = (Math.random() - 0.5) * shakeAmount;
  const dz = (Math.random() - 0.5) * shakeAmount;

  gsap.to(camera.position, {
    duration: 0.1,
    x: `+=${dx}`,
    y: `+=${dy}`,
    z: `+=${dz}`,
    onComplete: () => {
      gsap.to(camera.position, {
        duration: 0.1,
        x: `-=${dx}`,
        y: `-=${dy}`,
        z: `-=${dz}`,
      });
    },
  });
}

function calculateScrollAmount() {
  SCROLL_PARAMETERS.y *= SCROLL_PARAMETERS.dampingFactor;
  let scrollAmount = SCROLL_PARAMETERS.y * SCROLL_PARAMETERS.scale;

  if (Math.abs(scrollAmount) > SCROLL_PARAMETERS.maxVelocity) {
    scrollAmount = Math.sign(scrollAmount) * SCROLL_PARAMETERS.maxVelocity;
  }

  return scrollAmount;
}

function mouseInteraction(camera) {
  // if (!BUTTON_STATE.clicked) {
  //   let newX = camera.position.x + MOUSE.x * 0.2; // Reduced multiplier
  //   let newY = camera.position.y + MOUSE.y * 0.2; // Reduced multiplier

  //   newX = Math.max(Math.min(newX, 5), -5);
  //   newY = Math.max(Math.min(newY, 5), -5);

  //   camera.position.x = newX;
  //   camera.position.y = newY;

  //   return;
  // }
  return;
}

function updateScrollHandle(asteroid) {
  const handle = document.querySelector("#scrollbar-handle");

  const timelineMargin = 0;
  const timelineWidth = 100 - 2 * timelineMargin;

  const normalizedZ =
    timelineMargin +
    timelineWidth *
      ((asteroid.position.z - ASTEROID_PARAMETERS.position.z) /
        (EARTH_PARAMETERS.position.z + 50 - ASTEROID_PARAMETERS.position.z));

  handle.style.top = `${normalizedZ}%`;
}

function showScene() {
  gsap.to(".yellow-dot-logo", {
    autoAlpha: 1,
    ease: "power2",
    duration: 2,
    delay: 0.5,
  });

  gsap.to("#about-button", {
    autoAlpha: 1,
    ease: "power2",
    duration: 1,
    delay: 0.5,
  });

  gsap.to("#scrollbar-handle", {
    autoAlpha: 1,
    ease: "power2",
    duration: 1,
    delay: 0.5,
  });
}

function animateLoadingScreen(sunlight, camera, earth) {
  var tl = gsap.timeline();

  tl.add([
    gsap.from(sunlight, {
      intensity: 0,
      ease: "none",
      duration: 10,
    }),
    gsap.from("#svg-logo", {
      autoAlpha: 0,
      ease: "power2",
      duration: 4,
    }),
    gsap.from("#loading-bar-foreground", {
      autoAlpha: 0,
      duration: 4,
      ease: "power1",
    }),
    gsap.to("#loading-bar-background", {
      autoAlpha: 1,
      duration: 4,
      ease: "power1",
    }),
    gsap.to("#loading-bar-foreground", {
      width: "100%",
      duration: 10,
      ease: "none",
    }),
  ]);

  let lookAtTween = {
    x: earth.position.x,
    y: earth.position.y - 75,
    z: earth.position.z,
  };

  tl.add([
    gsap.to("#svg-logo", {
      autoAlpha: 0,
      ease: "power2",
      duration: 1,
    }),
    gsap.to("#loading-bar-foreground", {
      autoAlpha: 0,
      duration: 0.5,
      ease: "power1",
    }),
    gsap.to("#loading-bar-background", {
      autoAlpha: 0,
      duration: 1,
      ease: "power1",
    }),
    gsap.to(lookAtTween, {
      duration: 3,
      x: earth.position.x,
      y: earth.position.y,
      z: earth.position.z,
      ease: "power4",
      delay: 1,
      onUpdate: function () {
        camera.lookAt(lookAtTween.x, lookAtTween.y, lookAtTween.z);
        camera.updateProjectionMatrix();
      },
    }),
    gsap.to(camera.position, {
      duration: 3,
      x: 0,
      y: 0,
      z: 2900,
      ease: "power4",
      delay: 1,
      onUpdate: function () {
        camera.updateProjectionMatrix();
      },
    }),
    gsap.to(".title div", {
      y: "-50%",
      ease: "power2",
      duration: 1,
      stagger: 0.1,
      delay: 3,
    }),
    gsap.to(".title", {
      autoAlpha: 1,
      ease: "power2",
      duration: 1,
      delay: 3,
    }),
    gsap.to(".explore-button", {
      y: "-120%",
      autoAlpha: 1,
      ease: "power2",
      duration: 1,
      delay: 3,
    }),
  ]);
}

function moveScrollIndicator() {
  const scrollIndicatorAnimation = gsap.to("#scroll-indicator", {
    opacity: 1,
    duration: 1.5,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
  });

  window.addEventListener(
    "wheel",
    function hideScrollIndicatorOnFirstScroll() {
      scrollIndicatorAnimation.kill();
      document.getElementById("scroll-indicator").style.display = "none";
      window.removeEventListener("wheel", hideScrollIndicatorOnFirstScroll);
    },
    { once: true }
  );
}

function setupCamera(earth) {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_PARAMETERS.fov,
    window.innerWidth / window.innerHeight,
    CAMERA_PARAMETERS.near,
    CAMERA_PARAMETERS.far
  );

  camera.position.set(
    CAMERA_PARAMETERS.initialPosition.x,
    CAMERA_PARAMETERS.initialPosition.y,
    CAMERA_PARAMETERS.initialPosition.z
  );

  camera.setFocalLength(CAMERA_PARAMETERS.focal);
  camera.lookAt(earth.position.x, earth.position.y - 75, earth.position.z);

  return camera;
}

function setupRenderer() {
  const canvas = document.querySelector(".webgl");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  return renderer;
}

function setupWindowEventListeners(camera, renderer) {
  window.addEventListener("mousemove", function (e) {
    MOUSE.x = (e.clientX / window.innerWidth) * 2 - 1;
    MOUSE.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener(
    "resize",
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  window.addEventListener("wheel", function (e) {
    if (!TITLE_SCREEN_STATE.showing) {
      SCROLL_PARAMETERS.y += e.deltaY;
    }
  });
}

function setupButtonInteractions(camera, asteroid, earth) {
  document.querySelector(".explore-button").addEventListener("click", () => {
    moveScrollIndicator();
    gsap.to(".title", {
      duration: 1,
      fontSize: "4rem",
      top: "7vh",
      ease: "power2.out",
    });

    document.querySelector(".explore-button").style.display = "none";
    BUTTON_STATE.clicked = true;
    showScene();
    updateCameraInitial(camera, asteroid, earth);
  });

  const aboutButton = document.getElementById("about-button");
  const closeButton = document.getElementById("close-button");

  let isAnimating = false;

  aboutButton.addEventListener("click", () => {
    if (!isAnimating) {
      isAnimating = true;

      gsap.to(aboutButton, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          aboutButton.style.display = "none";
          isAnimating = false;
        },
      });

      closeButton.style.display = "block";
      gsap.fromTo(
        closeButton,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
        }
      );
    }
  });

  closeButton.addEventListener("click", () => {
    if (!isAnimating) {
      isAnimating = true;

      aboutButton.style.display = "block";
      gsap.fromTo(
        aboutButton,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          onComplete: () => {
            isAnimating = false;
          },
        }
      );

      gsap.to(closeButton, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          closeButton.style.display = "none";
        },
      });
    }
  });
}

function animate(
  renderer,
  scene,
  camera,
  asteroid,
  earth,
  moon,
  texts,
  stars,
  sunlight,
  atmosphere
) {
  requestAnimationFrame(() =>
    animate(
      renderer,
      scene,
      camera,
      asteroid,
      earth,
      moon,
      texts,
      stars,
      sunlight,
      atmosphere
    )
  );

  updateAsteroidPosition(asteroid);
  updateCamera(asteroid, earth, camera);
  updateScrollHandle(asteroid);
  updateText(asteroid, texts);
  updateEarthRotation(earth);
  updateAsteroidRotation(asteroid);
  updateSunlight(sunlight, asteroid, earth, atmosphere);
  mouseInteraction(camera);
  shakeCamera(camera, asteroid, earth);
  updateMoon(earth, moon);

  renderer.render(scene, camera);
}

async function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  const stars = await createStars(scene);
  const { earth, atmosphere } = await createEarth(scene, loader);
  const moon = await createMoon(scene, loader);
  const asteroid = await createAsteroid(scene, loader);
  const sunlight = await createSunlight(scene, asteroid);
  const text = await createText(scene);

  const camera = setupCamera(earth);
  const renderer = setupRenderer();

  animateLoadingScreen(sunlight, camera, earth);
  setupWindowEventListeners(camera, renderer);
  setupButtonInteractions(camera, asteroid, earth);

  animate(
    renderer,
    scene,
    camera,
    asteroid,
    earth,
    moon,
    text,
    stars,
    sunlight,
    atmosphere
  );
}

main();
