import * as THREE from 'three';
import './index.css';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { gsap } from 'gsap';

const STAR_SPREAD = 2000;
const STAR_COUNT = 10000;
const STAR_CENTER_1 = 200;
const STAR_CENTER_2 = 800;
const STAR_SIZE = 0.5;

const TIMELINE_START_POSITION = 0;
const ASTEROID_START_POSITION = -100;
const EARTH_POSITION = 600;
const EARTH_RADIUS = 80;

const TEXT_VISIBILITY_THRESHOLD = 100;

const SCROLL = {y: 0};
const MAX_VELOCITY = 1;
const DAMPING_FACTOR = 0.94;

const CAMERA_PARAMETERS = { fov: 45, near: 0.1, far: 5000};
const CAMERA_INITIAL_POSITION = { x: 0, y: 200, z: -400 };
const CAMERA_TO_ASTEROID_DISTANCE = 10;
const CAMERA_FOCAL_LENGTH = 20;

const SUNLIGHT = { color: 0x404040, intensity: 10 };
const SUNLIGHT_POSITION = { x: -500, y: 0, z: -600 };

const textData = [
  { year: 1950, info: 'Information for 1950', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION) },
  { year: 1960, info: 'Information for 1960', position: new THREE.Vector3(10, 1, TIMELINE_START_POSITION + 50) },
  { year: 1970, info: 'Information for 1970', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION + 100) },
  { year: 1980, info: 'Information for 1980', position: new THREE.Vector3(10, 1, TIMELINE_START_POSITION + 150) },
  { year: 1990, info: 'Information for 1990', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION + 200) },
  { year: 2000, info: 'Information for 2000', position: new THREE.Vector3(10, 1, TIMELINE_START_POSITION + 250) },
  { year: 2010, info: 'Information for 2010', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION + 300) },
  { year: 2020, info: 'Information for 2020', position: new THREE.Vector3(10, 1, TIMELINE_START_POSITION + 350) },
  { year: 2030, info: 'Information for 2030', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION + 400) },
  { year: 2040, info: 'Information for 2040', position: new THREE.Vector3(10, 1, TIMELINE_START_POSITION + 450) },
  { year: 2050, info: 'Information for 2050', position: new THREE.Vector3(0, 1, TIMELINE_START_POSITION + 500) }
];

const cameraData = [
  { distance: 0, positionOffset: new THREE.Vector3(0, 0, 0), lookAt: new THREE.Vector3(0, 0, 0) },
  { distance: 0, positionOffset: new THREE.Vector3(0, 0, 0), lookAt: new THREE.Vector3(0, 0, 0) },
  { distance: 0, positionOffset: new THREE.Vector3(0, 0, 0), lookAt: new THREE.Vector3(0, 0, 0) }
];

function createText(scene) {
  const loader = new FontLoader();

  const textObjects = textData.map(({year, info, position}) => {
    return new Promise((resolve) => {
      loader.load('/fonts/Bebas.json', function (font) {
      
        const yearTextGeo = new TextGeometry(String(year), {
          font: font,
          size: 3,
          height: 0.1,
          curveSegments: 10,
          bevelEnabled: true,
          bevelThickness: 0.3,
          bevelSize: 0.01,
          bevelOffset: 0,
          bevelSegments: 5
        });

        const yearTextMaterial = new THREE.MeshBasicMaterial({
          color: 'orange',
          transparent: true,
          opacity: 1
        });

        const yearText = new THREE.Mesh(yearTextGeo, yearTextMaterial);
        yearText.position.x = position.x + 0.5;
        yearText.position.y = position.y + 2;
        yearText.position.z = position.z;
        yearText.rotation.y = Math.PI;

        scene.add(yearText);

        const infoTextGeo = new TextGeometry(info, {
          font: font,
          size: 1,
          height: 0,
          curveSegments: 10,
          bevelEnabled: false
        });

        const infoTextMaterial = new THREE.MeshBasicMaterial({
          color: 'white',
          transparent: true,
          opacity: 1
        });

        const infoText = new THREE.Mesh(infoTextGeo, infoTextMaterial);
        infoText.position.x = position.x;
        infoText.position.y = position.y;
        infoText.position.z = position.z;
        infoText.rotation.y = Math.PI;

        scene.add(infoText);

        resolve({ yearText: yearText, infoText: infoText });
      });
    });
  });

  return Promise.all(textObjects);
}

function updateText(camera, texts) {
  texts.forEach(text => {
    const yearDistance = camera.position.distanceTo(text.yearText.position);
    const infoDistance = camera.position.distanceTo(text.infoText.position);

    if (yearDistance < TEXT_VISIBILITY_THRESHOLD) {
      text.yearText.material.opacity = 1 - (yearDistance / TEXT_VISIBILITY_THRESHOLD);
    } else {
      text.yearText.material.opacity = 0;
    }
    text.yearText.material.needsUpdate = true;

    if (infoDistance < TEXT_VISIBILITY_THRESHOLD) {
      text.infoText.material.opacity = 1 - (infoDistance / TEXT_VISIBILITY_THRESHOLD);
    } else {
      text.infoText.material.opacity = 0;
    }
    text.infoText.material.needsUpdate = true;
  });
}

function createStars(scene, center) {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: STAR_SIZE});

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

function createAsteroid(scene, loader) {
  return new Promise((resolve, reject) => {
    const asteroidGeometry = new THREE.SphereGeometry(1, 8, 16);

    loader.load('/images/asteroid.jpeg',
      function (asteroidTexture) {
        const asteroidMaterial = new THREE.MeshPhongMaterial({ map: asteroidTexture });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(0, 0, ASTEROID_START_POSITION);
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
    camera.lookAt(earth.position.x, earth.position.y, earth.position.z);
    
    let newPosition = {x: asteroid.position.x, y: asteroid.position.y,};

    camera.position.z = asteroid.position.z - CAMERA_TO_ASTEROID_DISTANCE;

    for (let i = 0; i < textData.length; i++) {
      const textPosition = textData[i].position;
      
      if (asteroid.position.z > (textPosition.z - 30)) {
        if (i % 2 === 0) {
          newPosition.x = asteroid.position.x - 4;
          newPosition.y = asteroid.position.y;
        } else {
          newPosition.x = asteroid.position.x + 4;
          newPosition.y = asteroid.position.y;
        }
      }
    }

    gsap.to(camera.position, { 
      duration: 5, 
      x: newPosition.x, 
      y: newPosition.y,
      ease: "power1", 
      onUpdate: function() {
        camera.lookAt(earth.position.x, earth.position.y, earth.position.z);
      }
    });
  }
}

function updateAsteroidRotation(asteroid) {
  asteroid.rotation.x += 0.01;
}

function createEarth(scene, loader) {
  return new Promise((resolve, reject) => {
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
    void main() {
      float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
      gl_FragColor = vec4( 0.2, 0.6, 1.0, opacity ) * intensity;
    }
    `;

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial();
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.1, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      uniforms: {
        opacity: { value: 0.2}
      }
    });

    const loadTexture = (path) => {
      return new Promise((resolve, reject) => {
        loader.load(path, resolve, undefined, reject);
      });
    };

    loadTexture('/images/earth.jpg').then(earthTexture => {
      earthMaterial.map = earthTexture;
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.userData = { earthTexture };
      earth.position.set(0, 0, EARTH_POSITION);
      scene.add(earth);

      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphere);
      atmosphere.position.set(earth.position.x, earth.position.y, earth.position.z);

      resolve(earth);
    }).catch(reject);
  });
}

function updateEarthRotation(earth) {
  earth.rotation.y += 0.001;
}

function calculateMoveAmount() {
  SCROLL.y *= DAMPING_FACTOR;
  let moveAmount = SCROLL.y / 1000;

  if (Math.abs(moveAmount) > MAX_VELOCITY) {
    moveAmount = Math.sign(moveAmount) * MAX_VELOCITY;
  }
  
  return moveAmount;
}

function mouseInteraction(camera, mouse, button, titleScreen) {
  const parallaxFactor = 0.1;
  if (!button.clicked) {
    let newX = camera.position.x + mouse.x * 0.5;
    let newY = camera.position.y + mouse.y * 0.5;

    newX = Math.max(Math.min(newX, 50), -50);
    newY = Math.max(Math.min(newY, 50), -50);

    camera.position.x = newX;
    // camera.position.y = newY;

    return;
  } 
  if (!titleScreen.showing) {
    return;
    // camera.position.x += mouse.x * parallaxFactor;
    // camera.position.y += mouse.y * parallaxFactor;
  }
}

function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateInitialCamera(camera, asteroid, earth, mouse, titleScreen) {
  const newPosition = {
    x: asteroid.position.x,
    y: asteroid.position.y,
    z: asteroid.position.z - CAMERA_TO_ASTEROID_DISTANCE
  };

  gsap.to(camera.position, { 
    duration: 2, 
    x: newPosition.x, 
    y: newPosition.y, 
    z: newPosition.z,
    ease: "power4", 
    onUpdate: function() {
      camera.lookAt(earth.position.x, earth.position.y, earth.position.z);
    },
    onComplete: function() {
      camera.lookAt(earth.position);
      titleScreen.showing = false;
    } 
  });
}

function updateScrollHandle(asteroid){

  const handle = document.querySelector("#scrollbar-handle");

  const timelineMargin = 0;
  const timelineWidth = 100 - 2 * timelineMargin;

  const normalizedZ = timelineMargin + (timelineWidth * ((asteroid.position.z - ASTEROID_START_POSITION) / (EARTH_POSITION+50 - ASTEROID_START_POSITION)));

  handle.style.top = `${normalizedZ}%`;

}

function animateUI(){

  gsap.from(".title div", {
    // scale: 0,
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
}

function animate(composer, scene, camera, asteroid, earth, texts, mouse, titleScreen, button) {
  requestAnimationFrame(() => animate(composer, scene, camera, asteroid, earth, texts, mouse, titleScreen, button));

  updateAsteroidPosition(asteroid, earth, camera, titleScreen);
  updateScrollHandle(asteroid);
  updateText(camera, texts);
  updateEarthRotation(earth);
  updateAsteroidRotation(asteroid);
  mouseInteraction(camera,mouse, button, titleScreen);

  composer.render(scene, camera);
}

async function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createStars(scene, STAR_CENTER_1);
  createStars(scene, STAR_CENTER_2);

  const text = await createText(scene);
  const asteroid = await createAsteroid(scene, loader);
  const earth = await createEarth(scene, loader);

  const sunlight = new THREE.DirectionalLight(SUNLIGHT.color, SUNLIGHT.intensity);
  sunlight.position.set(SUNLIGHT_POSITION.x, SUNLIGHT_POSITION.y, SUNLIGHT_POSITION.z);
  scene.add(sunlight);

  const camera = new THREE.PerspectiveCamera(
    CAMERA_PARAMETERS.fov, 
    window.innerWidth / window.innerHeight, 
    CAMERA_PARAMETERS.near, 
    CAMERA_PARAMETERS.far
    );

  camera.position.set(CAMERA_INITIAL_POSITION.x, CAMERA_INITIAL_POSITION.y, CAMERA_INITIAL_POSITION.z);
  camera.setFocalLength(CAMERA_FOCAL_LENGTH);
  camera.lookAt(asteroid.position.x, asteroid.position.y-2, asteroid.position.z+100);

  const canvas = document.querySelector(".webgl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: false  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const renderScene = new RenderPass(scene, camera);
  const composer = new EffectComposer(renderer);

  // const afterimagePass = new AfterimagePass();
  // afterimagePass.uniforms["damp"].value = 0.2;

  composer.addPass(renderScene);
  // composer.addPass(afterimagePass);

  const mouse = { x: 0, y: 0 };
  const titleScreen = {showing: true};
  const button = {clicked: false};

  window.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);

  window.addEventListener('wheel', function(e) {
    if (!titleScreen.showing) {
      SCROLL.y += e.deltaY;
    }
  });

  document.querySelector('.explore-button').addEventListener('click', () => {
    gsap.to('.title', {
      duration: 1,
      y: '-550%',
      fontSize:'4rem',
      ease: 'power3.out'
    });

    document.querySelector('.explore-button').style.display = 'none';

    button.clicked = true;
    updateInitialCamera(camera, asteroid, earth, mouse, titleScreen);

  });

  animateUI();
  animate(composer, scene, camera, asteroid, earth, text, mouse, titleScreen, button);
}

main();