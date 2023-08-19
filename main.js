import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { createNoise3D } from "simplex-noise";
import alea from "alea";
import { gsap } from "gsap";
import "./style.css";

const textData = [
  {
    year: 1800,
    position: { x: -50, y: -20, z: 20484.865301724138 },
    rotation: 0,
  },
  {
    year: 1869,
    position: { x: -50, y: -20, z: 20219.21875 },
    rotation: 0,
  },
  {
    year: 1901,
    position: { x: -50, y: -20, z: 19411.637931034482 },
    rotation: 0,
  },
  {
    year: 1929,
    position: { x: -50, y: -20, z: 18199.353448275862 },
    rotation: 0,
  },
  {
    year: 1943,
    position: { x: -50, y: -20, z: 17784.48275862069 },
    rotation: 0,
  },
  {
    year: 1963,
    position: { x: -50, y: -20, z: 14966.594827586207 },
    rotation: 0,
  },
  {
    year: 1985,
    position: { x: -50, y: -20, z: 9546.336206896553 },
    rotation: 0,
  },
  {
    year: 2006,
    position: { x: -50, y: -20, z: 4018.3189655172428 },
    rotation: 0,
  },
  {
    year: 2012,
    position: { x: -50, y: -20, z: 1636.8534482758623 },
    rotation: 0,
  },
  {
    year: 2021,
    position: { x: -50, y: -20, z: 500 },
    rotation: 0,
  },
];

let started = false;

function createText(scene, string, x, y, z) {
  const loader = new FontLoader();

  loader.load("/fonts/Bebas.json", function (font) {
    const textGeometry = new TextGeometry(string, {
      font: font,
      size: 25,
      height: 5,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    const textMaterial = new THREE.MeshPhongMaterial({
      color: "orange",
      transparent: true,
      opacity: 0,
    });

    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(x, y, z);
    scene.add(text);
  });
}

function createTexts(scene) {
  createText(scene, "10 Million Tonnes", -1050, -15, 4700);
  createText(scene, "50 Million Tonnes", -950, -15, 4400);
  createText(scene, "100 Million Tonnes", -850, -15, 4000);
  // createText(scene, "1900", -500, -15, 3000);
  // createText(scene, "1950", -200, -15, 2000);
  // createText(scene, "2023", 0, -15, 1000);
}

function updateTextOpacity(camera, scene) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material.transparent) {
      const distance = camera.position.distanceTo(object.position);
      const maxDistance = 500; // Adjust this value based on your needs
      const opacity = THREE.MathUtils.clamp(1 - distance / maxDistance, 0, 1);
      object.material.opacity = opacity;
    }
  });
}

function createCurves(scene) {
  const asteroidPoints = [
    new THREE.Vector3(-1000, -15, 5000),
    new THREE.Vector3(250, -15, 1000),
    new THREE.Vector3(0, -15, 0),
  ];
  const asteroidCurve = new THREE.CatmullRomCurve3(asteroidPoints);

  const cameraPoints = [
    new THREE.Vector3(-1000, 0, 5100),
    new THREE.Vector3(300, 0, 1200),
    new THREE.Vector3(0, 0, 0),
  ];
  const cameraCurve = new THREE.CatmullRomCurve3(cameraPoints);

  const asteroidGeometry = new THREE.BufferGeometry().setFromPoints(
    asteroidCurve.getPoints(100)
  );
  const asteroidMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const asteroidLine = new THREE.Line(asteroidGeometry, asteroidMaterial);

  const cameraGeometry = new THREE.BufferGeometry().setFromPoints(
    cameraCurve.getPoints(100)
  );
  const cameraMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const cameraLine = new THREE.Line(cameraGeometry, cameraMaterial);

  scene.userData.asteroidCurve = asteroidCurve;
  scene.userData.cameraCurve = cameraCurve;

  // scene.add(asteroidLine);
  // scene.add(cameraLine);
}

function createEarth(scene, loader) {
  const earthGroup = new THREE.Group();
  earthGroup.name = "earth";

  const geometry = new THREE.SphereGeometry(200, 32, 32);

  const colorTexture = loader.load("/images/earth.jpg");
  const normalTexture = loader.load("/images/earth-normal.jpg");
  const specularTexture = loader.load("/images/earth-specular.jpg");

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshPhongMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    specularMap: specularTexture,
    normalScale: new THREE.Vector2(2, 2),
  });

  const earthMesh = new THREE.Mesh(geometry, material);
  earthMesh.name = "earthMesh";
  earthGroup.add(earthMesh);

  const cloudAlphaTexture = loader.load("/images/clouds.jpg");
  cloudAlphaTexture.colorSpace = THREE.SRGBColorSpace;

  const cloudRadius = 200 * 1.015;
  const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 32, 32);

  const cloudMaterial = new THREE.MeshPhongMaterial({
    alphaMap: cloudAlphaTexture,
    transparent: true,
    depthWrite: false,
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  clouds.name = "clouds";
  earthGroup.add(clouds);

  earthGroup.position.set(0, 0, 0);

  scene.add(earthGroup);

  return earthGroup;
}

// function createStars(scene, numStars = 10000) {
//   const starsGeometry = new THREE.BufferGeometry();
//   const starsMaterial = new THREE.PointsMaterial({
//     color: 0xffffff,
//     size: 1,
//     sizeAttenuation: false,
//   });

//   const positions = new Float32Array(numStars * 3);

//   for (let i = 0; i < numStars; i++) {
//     const radius = 7000;
//     const phi = Math.random() * Math.PI * 2;
//     const theta = Math.acos(2 * Math.random() - 1);

//     const x = radius * Math.sin(theta) * Math.cos(phi);
//     const y = radius * Math.sin(theta) * Math.sin(phi);
//     const z = radius * Math.cos(theta);

//     positions[i * 3] = x;
//     positions[i * 3 + 1] = y;
//     positions[i * 3 + 2] = z;
//   }

//   starsGeometry.setAttribute(
//     "position",
//     new THREE.BufferAttribute(positions, 3)
//   );

//   const starField = new THREE.Points(starsGeometry, starsMaterial);
//   starField.position.set(0, 0, 0);
//   starField.name = "stars";

//   scene.add(starField);
// }

function createStars(scene, loader) {
  const sphereGeometry = new THREE.SphereGeometry(7000, 4, 4);

  const texture = loader.load("/images/starfield2.jpeg");
  texture.colorSpace = THREE.SRGBColorSpace;

  const sphereMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    color: new THREE.Color(0.1, 0.1, 0.1),
  });

  const starSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  scene.add(starSphere);
}

function createAsteroid(scene, loader) {
  const geometry = new THREE.SphereGeometry(10, 64, 64);
  geometry.scale(1, 1.3, 1);

  const prng = alea("69");

  const noise3D = createNoise3D(prng);
  const noise3D_2 = createNoise3D(prng);
  const noise3D_3 = createNoise3D(prng);

  const vertices = geometry.attributes.position.array;
  const normals = geometry.attributes.normal.array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    const nx = normals[i];
    const ny = normals[i + 1];
    const nz = normals[i + 2];

    const offset1 = noise3D(x * 0.1, y * 0.1, z * 0.1) * 1.0;
    const offset2 = noise3D_2(x * 0.05, y * 0.15, z * 0.1) * 0.5;
    const offset3 = noise3D_3(x * 0.02, y * 0.05, z * 0.02) * 4;

    const totalOffset = offset1 + offset2 + offset3;

    vertices[i] += nx * totalOffset;
    vertices[i + 1] += ny * totalOffset;
    vertices[i + 2] += nz * totalOffset;
  }

  geometry.computeVertexNormals();

  const colorTexture = loader.load("/images/asteroid.jpeg");

  const material = new THREE.MeshPhongMaterial({
    map: colorTexture,
    color: new THREE.Color(0.2, 0.2, 0.2),
  });

  const asteroid = new THREE.Mesh(geometry, material);

  asteroid.position.set(-1000, -15, 5000);
  asteroid.name = "asteroid";

  asteroid.rotation.z = Math.PI / 3;

  scene.add(asteroid);
}

function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    5,
    20_000
  );

  camera.position.set(-50, 0, 600);
  camera.lookAt(0, 0, 0);

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.7;

  return renderer;
}

function setupLighting(scene) {
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(500, 0, 500).normalize();
  scene.add(light);
}

function resizeCamera(camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function resizeRenderer(renderer) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
}

function onWindowResize(camera, renderer) {
  resizeCamera(camera);
  resizeRenderer(renderer);
}

let accumulatedScroll = 0;

function handleScroll(event, camera, scene) {
  if (started) {
    const asteroid = scene.getObjectByName("asteroid");

    const asteroidCurve = scene.userData.asteroidCurve;
    const cameraCurve = scene.userData.cameraCurve;
    const deltaY = event.deltaY;

    if (accumulatedScroll < 0) {
      accumulatedScroll = 0;
    }

    accumulatedScroll += deltaY;

    const t = Math.min(Math.max(accumulatedScroll / 15000, 0), 1);

    const pointOnAsteroidCurve = asteroidCurve.getPoint(t);
    asteroid.position.copy(pointOnAsteroidCurve);

    const pointOnCameraCurve = cameraCurve.getPoint(t);
    camera.position.copy(pointOnCameraCurve);

    camera.lookAt(0, 0, 0);
  }
}

let startY;

function handleTouchStart(event) {
  startY = event.touches[0].clientY;
}

function handleTouchMove(event, camera) {
  const deltaY = startY - event.touches[0].clientY;
  const zoomSpeed = 2;
  const newZ = camera.position.z + deltaY * zoomSpeed;
  camera.position.z = newZ;
  startY = event.touches[0].clientY;
}

function updateObjects(scene, camera) {
  const earth = scene.getObjectByName("earth");
  if (earth) {
    earth.rotation.y += 0.001;
  }

  const asteroid = scene.getObjectByName("asteroid");
  if (asteroid) {
    asteroid.rotation.x -= 0.01;
  }

  updateTextOpacity(camera, scene);
}

function animate(renderer, scene, camera) {
  requestAnimationFrame(() => animate(renderer, scene, camera));
  updateObjects(scene, camera);

  renderer.render(scene, camera);
}

async function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createEarth(scene, loader);
  createStars(scene, loader);

  createAsteroid(scene, loader);
  createCurves(scene);
  setupLighting(scene);

  const camera = setupCamera();
  const renderer = setupRenderer();

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  window.addEventListener("wheel", (event) =>
    handleScroll(event, camera, scene)
  );
  window.addEventListener("touchstart", (event) =>
    handleTouchStart(event, camera)
  );
  window.addEventListener("touchmove", (event) =>
    handleTouchMove(event, camera)
  );

  document
    .querySelector('a[href="#"]')
    .addEventListener("click", function (event) {
      event.preventDefault();

      const titleScreen = document.getElementById("title-screen");
      const year = document.getElementById("ui");

      gsap.to(titleScreen, {
        duration: 1,
        opacity: 0,
        onComplete: function () {
          titleScreen.style.display = "none";
        },
      });

      gsap.to(camera.position, {
        duration: 5,
        x: -1000,
        y: 0,
        z: 5100,
        onUpdate: function () {
          camera.lookAt(0, 0, 0);
        },
        onComplete: function () {
          started = true;
          gsap.to(year, {
            duration: 1,
            opacity: 1,
          });

          createTexts(scene);
        },
      });
    });

  animate(renderer, scene, camera);
}

main();
