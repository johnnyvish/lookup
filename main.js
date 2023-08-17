import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import "./style.css";

let CAMERA_PARAMETERS = {
  fov: 45,
  near: 10,
  far: 50000,
  position: { x: 0, y: 0, z: 10500 },
};

const EARTH_PARAMETERS = {
  properties: { radius: 63.71, widthSegments: 32, heightSegments: 32 },
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: Math.PI / (60 * 24 * 2), z: 0 },
  texturePath: {
    color: "/images/earth.jpg",
    normal: "/images/earth-normal.jpg",
    specular: "/images/earth-specular.jpg",
    cloud: "/images/clouds.jpg",
  },
};

const STARS_PARAMETERS = {
  radius: 10000,
  widthSegments: 16,
  heightSegments: 16,
};

const TEXT_PARAMETERS = {
  visibilityThreshold: 100,
  fontURL: "/fonts/Bebas.json",
  yearText: {
    size: 50,
    height: 0.5,
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
      x: -10,
      y: 20,
      z: 0,
    },
  },
  infoText: {
    size: 10,
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
    year: 1750,
    info: "Tonnes of Co2 - 621,371\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 9997.481142241379 },
    rotation: 0,
  },
  {
    year: 1869,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 9859.609375 },
    rotation: 0,
  },
  {
    year: 1884,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 9730.603448275862 },
    rotation: 0,
  },
  {
    year: 1901,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 9455.818965517241 },
    rotation: 0,
  },
  {
    year: 1910,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 9183.728448275862 },
    rotation: 0,
  },
  {
    year: 1929,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 8849.676724137931 },
    rotation: 0,
  },
  {
    year: 1943,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 8642.241379310344 },
    rotation: 0,
  },
  {
    year: 1963,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 7233.297413793103 },
    rotation: 0,
  },
  {
    year: 1985,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 4523.168103448276 },
    rotation: 0,
  },
  {
    year: 2006,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 1759.1594827586214 },
    rotation: 0,
  },
  {
    year: 2012,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 568.4267241379312 },
    rotation: 0,
  },
  {
    year: 2021,
    info: "Tonnes of Co2 - 75 million\nMiles from Earth - 10 million",
    position: { x: -75, y: 0, z: 100 },
    rotation: 0,
  },
];

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
        yearText.name = `yearText_${year}`;
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
        infoText.name = `infoText_${year}`;
        scene.add(infoText);

        resolve({ yearText: yearText, infoText: infoText });
      });
    });
  });

  return Promise.all(textObjects);
}

function updateTextOpacity(camera, scene) {
  textData.forEach(({ year }) => {
    const yearText = scene.getObjectByName(`yearText_${year}`);
    const infoText = scene.getObjectByName(`infoText_${year}`);
    const distance = camera.position.z - yearText.position.z;

    const opacityThreshold = 500;
    const opacity = 1 - Math.min(Math.abs(distance) / opacityThreshold, 1);

    yearText.material.opacity = opacity;
    infoText.material.opacity = opacity;

    yearText.material.transparent = true;
    infoText.material.transparent = true;
  });
}

function createEarth(scene, loader) {
  const earthGroup = new THREE.Group();
  earthGroup.name = "earth";

  const geometry = new THREE.SphereGeometry(
    EARTH_PARAMETERS.properties.radius,
    EARTH_PARAMETERS.properties.widthSegments,
    EARTH_PARAMETERS.properties.heightSegments
  );

  const colorTexture = loader.load(EARTH_PARAMETERS.texturePath.color);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  const normalTexture = loader.load(EARTH_PARAMETERS.texturePath.normal);
  const specularTexture = loader.load(EARTH_PARAMETERS.texturePath.specular);

  const material = new THREE.MeshPhongMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    specularMap: specularTexture,
    normalScale: new THREE.Vector2(2, 2),
  });

  const earthMesh = new THREE.Mesh(geometry, material);
  earthMesh.name = "earthMesh";
  earthGroup.add(earthMesh);

  const cloudAlphaTexture = loader.load(EARTH_PARAMETERS.texturePath.cloud);
  cloudAlphaTexture.colorSpace = THREE.SRGBColorSpace;

  const cloudRadius = EARTH_PARAMETERS.properties.radius * 1.02;
  const cloudGeometry = new THREE.SphereGeometry(
    cloudRadius,
    EARTH_PARAMETERS.properties.widthSegments,
    EARTH_PARAMETERS.properties.heightSegments
  );

  const cloudMaterial = new THREE.MeshPhongMaterial({
    alphaMap: cloudAlphaTexture,
    transparent: true,
    depthWrite: false,
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  clouds.name = "clouds";
  earthGroup.add(clouds);

  earthGroup.position.set(
    EARTH_PARAMETERS.position.x,
    EARTH_PARAMETERS.position.y,
    EARTH_PARAMETERS.position.z
  );

  scene.add(earthGroup);

  return earthGroup;
}

function createStars(scene, loader) {
  const sphereGeometry = new THREE.SphereGeometry(
    STARS_PARAMETERS.radius,
    STARS_PARAMETERS.widthSegments,
    STARS_PARAMETERS.heightSegments
  );

  const texture = loader.load("/images/starfield.jpeg");
  texture.colorSpace = THREE.SRGBColorSpace;

  const sphereMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    color: new THREE.Color(0.25, 0.25, 0.25),
  });

  const starSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  scene.add(starSphere);
}

function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_PARAMETERS.fov,
    window.innerWidth / window.innerHeight,
    CAMERA_PARAMETERS.near,
    CAMERA_PARAMETERS.far
  );

  camera.position.set(
    CAMERA_PARAMETERS.position.x,
    CAMERA_PARAMETERS.position.y,
    CAMERA_PARAMETERS.position.z
  );

  camera.lookAt(
    EARTH_PARAMETERS.position.x,
    EARTH_PARAMETERS.position.y,
    EARTH_PARAMETERS.position.z
  );

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

function handleScroll(event, camera) {
  const zoomSpeed = 0.1;
  const deltaY = -event.deltaY;
  const newZ = camera.position.z + deltaY * zoomSpeed;
  camera.position.z = newZ;
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

function animate(renderer, scene, camera) {
  requestAnimationFrame(() => animate(renderer, scene, camera));

  const earth = scene.getObjectByName("earth");
  if (earth) {
    earth.rotation.y += EARTH_PARAMETERS.rotation.y;
  }

  updateTextOpacity(camera, scene);

  renderer.render(scene, camera);
}

async function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createEarth(scene, loader);
  createStars(scene, loader);
  createText(scene);
  setupLighting(scene);

  const camera = setupCamera();
  const renderer = setupRenderer();

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  window.addEventListener("wheel", (event) => handleScroll(event, camera));
  window.addEventListener("touchstart", (event) =>
    handleTouchStart(event, camera)
  );
  window.addEventListener("touchmove", (event) =>
    handleTouchMove(event, camera)
  );

  animate(renderer, scene, camera);
}

main();
