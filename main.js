import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { gsap } from 'gsap';
import './style.css';

const STAR_SPREAD = 1000;
const STAR_COUNT = 30000;
const STAR_CENTER_1 = 200;
const STAR_CENTER_2 = 600;
const TIMELINE_START_POSITION = -50;
const ASTEROID_START_POSITION = -400;
const EARTH_POSITION = 800;
const SUN_POSITION = 1000;
const TEXT_VISIBILITY_THRESHOLD = 30;
const EARTH_VISIBILITY_THRESHOLD = 40;
const MAX_VELOCITY = 10;
const DAMPING_FACTOR = 0.90;
const CAMERA_PARAMETERS = { fov: 45, near: 0.1, far: 500 };
const CAMERA_POSITION = { x: 0, y: -2, z: -395 };
const AMBIENT_LIGHT = { color: 0x404040, intensity: 10 };

let scrollY = 0;

function createYears(scene) {

  const years = [];
  const loader = new FontLoader();

  loader.load('Bebas.json', function (font) {
    const yearCount = (2050 - 1950) / 10 + 1;

    for (let i = 0; i < yearCount; i++) {
      let year = 1950 + i * 10;
      if (year == 2050) year = "END";

      const textGeo = new TextGeometry(String(year), {
        font: font,
        size: 2,
        height: 0.1,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
      });

      const textMaterial = new THREE.MeshPhongMaterial({
        color: 'orange',
        specular: 0xffffff,
        shininess: 200,
        transparent: true,
        opacity: 0
      });

      const text = new THREE.Mesh(textGeo, textMaterial);
      text.position.y = -1;
      text.position.x = 1.9;
      text.position.z = (TIMELINE_START_POSITION + i / (yearCount - 1) * (EARTH_POSITION - TIMELINE_START_POSITION) - 30);
      text.rotation.y = Math.PI;
      text.offset = 2;
      scene.add(text);

      years.push(text);
    }
  });
  return years;
}

function updateYears(asteroid, years) {

  years.forEach((element, index) => {
    const distance = asteroid.position.distanceTo(element.position);

    if (distance < TEXT_VISIBILITY_THRESHOLD) {
      element.material.opacity = 1 - (distance / TEXT_VISIBILITY_THRESHOLD);
     
    } else {
      element.material.opacity = 0;
    }

    element.material.needsUpdate = true;
  });
}

function createStars(scene, center) {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 });

  const starPoints = [];

  for (let i = 0; i < STAR_COUNT; i++) {
      const x = THREE.MathUtils.randFloatSpread(STAR_SPREAD);
      const y = THREE.MathUtils.randFloatSpread(STAR_SPREAD);
      const z = THREE.MathUtils.randFloatSpread(STAR_SPREAD) + center;

      starPoints.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPoints, 3));

  const stars = new THREE.Points(starsGeometry, starsMaterial); 

  scene.add(stars);
}

// function createSun(scene, loader) {
//   const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
//   const sunTexture = loader.load('/sun.jpeg');
//   const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

//   const sun = new THREE.Mesh(sunGeometry, sunMaterial);
//   sun.position.set(0,0, SUN_POSITION);
//   scene.add(sun);

//   const sunLight = new THREE.DirectionalLight('white', 1);
//   sunLight.position.set(0,0,SUN_POSITION);
//   scene.add(sunLight);
// }

function createEarth(scene, loader) {
  const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
  const earthTexture = loader.load('/earth.jpeg');
  const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, transparent: true});

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.position.set(0, 0, EARTH_POSITION);
  scene.add(earth);

  return earth;
}

function updateEarth(asteroid, earth){
  const distance = asteroid.position.distanceTo(earth.position);

  if (distance < EARTH_VISIBILITY_THRESHOLD){
    earth.material.opacity = 1 - (distance / EARTH_VISIBILITY_THRESHOLD);
  } else {
    earth.material.opacity = 0;
  }
  earth.material.needsUpdate = true;
}

function createAsteroid(scene, loader) {
  const asteroidGeometry = new THREE.SphereGeometry(0.2,5,8);
  const asteroidTexture = loader.load('/asteroid.jpeg');
  const asteroidMaterial = new THREE.MeshPhongMaterial({ map: asteroidTexture });

  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  asteroid.position.set(0,0,ASTEROID_START_POSITION);
  scene.add(asteroid);

  return asteroid;
}

function calculateMoveAmount() {
  scrollY *= DAMPING_FACTOR;
  const moveAmount = scrollY / 1000;

  if (Math.abs(moveAmount) > MAX_VELOCITY) {
    moveAmount = Math.sign(moveAmount) * MAX_VELOCITY;
  }
  
  return moveAmount;
}

function updateAsteroidRotation(asteroid) {
  asteroid.rotation.x += 0.05;
}

function updateEarthRotation(earth) {
  earth.rotation.y += 0.01;
}

function mouseInteraction(camera, mouse, titleScreen) {
  const parallaxFactor = 0.1;
  if (titleScreen.showing) {
    let newX = camera.position.x + mouse.x * 0.5;
    let newY = camera.position.y + mouse.y * 0.5;

    newX = Math.max(Math.min(newX, 200), -200);
    newY = Math.max(Math.min(newY, 200), -200);

    camera.position.x = newX;
    camera.position.y = newY;

    return;
    
  } else {
    camera.position.x += mouse.x * parallaxFactor;
    camera.position.y += mouse.y * parallaxFactor;
  }
}


function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateAsteroidPosition(asteroid, earth, camera, titleScreen) {
  const moveAmount = calculateMoveAmount();
  asteroid.position.z += moveAmount;

  if (asteroid.position.z < ASTEROID_START_POSITION){
    asteroid.position.z = ASTEROID_START_POSITION;
  }

  if (asteroid.position.z > EARTH_POSITION){
    asteroid.position.z = EARTH_POSITION;
  }

  if (!titleScreen.showing) {
    camera.position.x = asteroid.position.x-2;
    camera.position.y = asteroid.position.y;
    camera.position.z = asteroid.position.z-4;
  }

}

function updateInitialCamera(camera, asteroid, earth, mouse, titleScreen) {
  const newPosition = {
    x: asteroid.position.x - 2,
    y: asteroid.position.y,
    z: asteroid.position.z - 4
  };

  gsap.to(camera.position, { 
    duration: 2, 
    x: newPosition.x, 
    y: newPosition.y, 
    z: newPosition.z,
    ease: "power4", 
    onUpdate: function() {
      camera.lookAt(earth.position);
    },
    onComplete: function() {
      camera.lookAt(earth.position);
      titleScreen.showing = false;
    } 
  });
}

function animate(composer, scene, camera, asteroid, earth, years, mouse, titleScreen) {
  requestAnimationFrame(() => animate(composer, scene, camera, asteroid, earth, years, mouse, titleScreen));

  updateAsteroidPosition(asteroid, earth, camera, titleScreen);
  updateYears(asteroid, years);
  updateEarth(asteroid, earth);
  updateEarthRotation(earth);
  updateAsteroidRotation(asteroid);
  mouseInteraction(camera,mouse, titleScreen);

  composer.render(scene, camera);
}

function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createStars(scene, STAR_CENTER_1);
  createStars(scene, STAR_CENTER_2);
  // createSun(scene, loader);

  const years = createYears(scene);
  const asteroid = createAsteroid(scene, loader);
  const earth = createEarth(scene, loader);

  const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT.color, AMBIENT_LIGHT.intensity);
  scene.add(ambientLight);

  const camera = new THREE.PerspectiveCamera(
    CAMERA_PARAMETERS.fov, 
    window.innerWidth / window.innerHeight, 
    CAMERA_PARAMETERS.near, 
    CAMERA_PARAMETERS.far
    );

  camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
  camera.lookAt(asteroid.position.x, asteroid.position.y-2, asteroid.position.z+100);

  const canvas = document.querySelector(".webgl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const renderScene = new RenderPass(scene, camera);
  const composer = new EffectComposer(renderer);

  const afterimagePass = new AfterimagePass();
  afterimagePass.uniforms["damp"].value = 0.5;

  composer.addPass(renderScene);
  // composer.addPass(afterimagePass);

  const mouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);

  const titleScreen = {showing: true}

  window.addEventListener('wheel', function(e) {
    if (!titleScreen.showing) {
      scrollY += e.deltaY;
    }
  });

  gsap.from('.fa-info-circle', {duration: 3, opacity: 0, ease: 'power2'});

  gsap.from(".title div", {
    scale: 0,
    y: '100%',
    opacity: 0,
    ease: "power2",
    duration: 0.5,
    stagger: 0.1
  });

  gsap.from(".explore-button", {
    scale: 0,
    y: '100%',
    opacity: 0,
    ease: "power2",
    duration: 0.5,
    delay: 0.5
  });

  let handle = document.querySelector("#scrollbar-handle");

  document.querySelector('.explore-button').addEventListener('click', () => {
    gsap.to('.title', {
      duration: 1,
      y: '-350%',
      fontSize:'3rem',
      ease: 'power3.out'
    });

    document.querySelector('.explore-button').style.display = 'none';

    updateInitialCamera(camera, asteroid, earth, mouse, titleScreen);

  });

  animate(composer, scene, camera, asteroid, earth, years, mouse, titleScreen);
}

main();
