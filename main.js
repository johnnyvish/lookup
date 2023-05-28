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
const STAR_CENTER = 200;
const TIMELINE_START_POSITION = -50;
const ASTEROID_START_POSITION = -400;
const EARTH_POSITION = 400;
const SUN_POSITION = 1000;
const TEXT_VISIBILITY_THRESHOLD = 30;
const EARTH_VISIBILITY_THRESHOLD = 40;
const MAX_VELOCITY = 10;
const DAMPING_FACTOR = 0.90;

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

function createStars(scene) {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 });

  const starPoints = [];

  for (let i = 0; i < STAR_COUNT; i++) {
      const x = THREE.MathUtils.randFloatSpread(STAR_SPREAD);
      const y = THREE.MathUtils.randFloatSpread(STAR_SPREAD);
      const z = THREE.MathUtils.randFloatSpread(STAR_SPREAD) + STAR_CENTER;

      starPoints.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPoints, 3));

  const stars = new THREE.Points(starsGeometry, starsMaterial); 

  scene.add(stars);
}

function createSun(scene, loader) {
  const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
  const sunTexture = loader.load('/sun.jpeg');
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0,0, SUN_POSITION);
  scene.add(sun);

  const sunLight = new THREE.DirectionalLight('white', 1);
  sunLight.position.set(0,0,SUN_POSITION);
  scene.add(sunLight);
}

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

function updatePosition(asteroid) {
  const moveAmount = calculateMoveAmount();
  updateAsteroidPosition(asteroid, moveAmount);
  updateTimeline(asteroid);
}

function updateAsteroidPosition(asteroid, moveAmount) {
  asteroid.position.z += moveAmount;

  if (asteroid.position.z < ASTEROID_START_POSITION){
    asteroid.position.z = ASTEROID_START_POSITION;
  }

  if (asteroid.position.z > EARTH_POSITION){
    asteroid.position.z = EARTH_POSITION;
  }
}

function updateTimeline(asteroid) {

  const timeline = document.querySelector('.timeline');
  const timelineAsteroid = document.getElementById('asteroid');

  const timelineMargin = 3;
  const timelineWidth = 100 - 2 * timelineMargin;

  const normalizedZ = timelineMargin + (timelineWidth * ((asteroid.position.z - TIMELINE_START_POSITION) / (EARTH_POSITION - TIMELINE_START_POSITION)));

  timelineAsteroid.style.left = `${normalizedZ}%`;
  timelineAsteroid.style.transform = `rotate(${normalizedZ*5}deg)`;

  const asteroidActualPos = timelineAsteroid.getBoundingClientRect().left-40;
  const timelineTotalWidth = timeline.getBoundingClientRect().width;
  const asteroidPosPercentage = (asteroidActualPos / timelineTotalWidth) * 100;

  timeline.style.background = `linear-gradient(to right, red ${asteroidPosPercentage}%, gray ${asteroidPosPercentage}%)`;

  const markers = document.querySelectorAll('.marker');
  markers.forEach(marker => {
    if (marker.getBoundingClientRect().left <= asteroidActualPos+70) {
      marker.style.backgroundColor = 'red';
    } else {
      marker.style.backgroundColor = '#b5b5b5';
    }
  });
}

function updateCameraPosition(camera, asteroid, mouse) {
  camera.position.x = asteroid.position.x - 2 + mouse.x * 0.1;
  camera.position.y = asteroid.position.y + mouse.y * 0.1;
  camera.position.z = asteroid.position.z - 4;
}

function updateAsteroidRotation(asteroid) {
  asteroid.rotation.x += 0.05;
}

function updateEarthRotation(earth) {
  earth.rotation.y += 0.01;
}

function lookAtEarth(camera, earth) {
  camera.lookAt(earth.position.x-1, earth.position.y, earth.position.z);
}

function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// function generateLoremIpsum() {
//   const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
//   let result = '';

//   for (let i = 0; i < 100; i++) {
//       result += words[Math.floor(Math.random() * words.length)] + ' ';
//   }

//   return result.trim() + '.';
// }

function animate(composer, scene, camera, asteroid, earth, years, mouse) {
  requestAnimationFrame(() => animate(composer, scene, camera, asteroid, earth, years, mouse));

  updatePosition(asteroid);
  updateYears(asteroid, years);
  updateEarth(asteroid, earth);
  updateEarthRotation(earth);
  updateAsteroidRotation(asteroid);
  updateCameraPosition(camera, asteroid, mouse);
  lookAtEarth(camera, earth);

  composer.render(scene, camera);
}

function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createStars(scene);
  // createSun(scene, loader);

  const years = createYears(scene);
  const asteroid = createAsteroid(scene, loader);
  const earth = createEarth(scene, loader);

  const ambientLight = new THREE.AmbientLight(0x404040, 10);
  scene.add(ambientLight);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

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
  // const infoContainer = document.querySelector('.info-text-container');

  // let loremIpsumText = '';
  // for (let i = 0; i < 50; i++) {
  //     loremIpsumText += '<p>' + generateLoremIpsum() + '</p>';
  // }

  // document.getElementById('infoText').innerHTML = loremIpsumText;

  window.addEventListener('mousemove', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });
  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);

  window.addEventListener('wheel', function(e) {
    scrollY += e.deltaY;
   
  });

  gsap.from('.title div', {y: '-400%', ease: 'power2', stagger: 0.1});
  // gsap.from('.fa-info-circle', {duration: 1, x: '300%', ease: 'power2'});
  // gsap.to(".timeline-container", {duration: 2, width: "100%", opacity: 1});





  animate(composer, scene, camera, asteroid, earth, years, mouse);
}

main();