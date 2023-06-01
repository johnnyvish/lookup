import * as THREE from 'three';
import './index.css';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { gsap } from 'gsap';

const STAR_SPREAD_X = 1000;
const STAR_SPREAD_Y = 1000;
const STAR_SPREAD_Z = 5000;
const STAR_COUNT = 50000;
const STAR_CENTER = 1000;
const STAR_SIZE = 0.5;

const TIMELINE_START_POSITION = 0;
const ASTEROID_START_POSITION = -100;
const EARTH_POSITION = 3100;
const EARTH_RADIUS = 80;

const TEXT_VISIBILITY_THRESHOLD = 100;

const SCROLL = {y: 0};
const MAX_VELOCITY = 5;
const DAMPING_FACTOR = 0.94;

const MOUSE = { x: 0, y: 0 };
const TITLE_SCREEN = { showing: true };
const BUTTON = {clicked: false};

const CAMERA_PARAMETERS = { fov: 45, near: 0.1, far: 4000};
const CAMERA_INITIAL_POSITION = { x: 0, y: 200, z: -400 };
const CAMERA_TO_ASTEROID_DISTANCE = 10;
const CAMERA_FOCAL_LENGTH = 20;

const SUN_POSITION = 3500;
const SUN_RADIUS = 10;
const SUNLIGHT = { color: 0x404040, intensity: 10 };
const SUNLIGHT_POSITION = { x: -500, y: 0, z: -600 };

const textData = [
  { year: 1950, info: 'Information for 1950', position: new THREE.Vector3(-5, 1, 0) },
  { year: 1960, info: 'Information for 1960', position: new THREE.Vector3(15, 1, 500) },
  { year: 1970, info: 'Information for 1970', position: new THREE.Vector3(-5, 1, 1000) },
  { year: 1980, info: 'Information for 1980', position: new THREE.Vector3(15, 1, 1500) },
  { year: 1990, info: 'Information for 1990', position: new THREE.Vector3(-5, 1, 2000) },
  { year: 2000, info: 'Information for 2000', position: new THREE.Vector3(15, 1, 2500) },
  { year: 2010, info: 'Information for 2010', position: new THREE.Vector3(-5, 1, 2600) },
  { year: 2020, info: 'Information for 2020', position: new THREE.Vector3(15, 1, 2700) },
  { year: 2030, info: 'Information for 2030', position: new THREE.Vector3(-5, 1, 2800) },
  { year: 2040, info: 'Information for 2040', position: new THREE.Vector3(15, 1, 2900) },
  { year: 2050, info: 'Information for 2050', position: new THREE.Vector3(-5, 1, 2950) }
];

const cameraData = [
  { distance: -1000, positionOffset: new THREE.Vector2(0, 0), lookAt: new THREE.Vector3(0, 0, 0) }
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
  return new Promise((resolve, reject) => {
    try {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: STAR_SIZE});

      const starPoints = [];

      for (let i = 0; i < STAR_COUNT; i++) {
        const x = THREE.MathUtils.randFloatSpread(STAR_SPREAD_X);
        const y = THREE.MathUtils.randFloatSpread(STAR_SPREAD_Y);
        const z = THREE.MathUtils.randFloatSpread(STAR_SPREAD_Z) + center;

        starPoints.push(x, y, z);
      }

      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPoints, 3));

      const stars = new THREE.Points(starsGeometry, starsMaterial); 

      scene.add(stars);

      resolve(stars);
    } catch (error) {
      reject(error);
    }
  });
}

function updateStars(starCluster, asteroid) { 
  return;
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

function updateAsteroidPosition(asteroid) {
  const moveAmount = calculateMoveAmount();
  asteroid.position.z += moveAmount;

  if (asteroid.position.z < ASTEROID_START_POSITION){
    asteroid.position.z = ASTEROID_START_POSITION;
  }

  if (asteroid.position.z > EARTH_POSITION){
    asteroid.position.z = EARTH_POSITION;
  }
}

function updateCamera(asteroid, earth, camera) {
  
  if (!TITLE_SCREEN.showing) {
    camera.position.z = asteroid.position.z - CAMERA_TO_ASTEROID_DISTANCE;
    camera.position.y = asteroid.position.y + 2;
  
    let newPosition = { x: asteroid.position.x, y: asteroid.position.y };
    let lookAtPosition = new THREE.Vector3(earth.position.x, earth.position.y, earth.position.z);

    for (let i = 0; i < cameraData.length; i++) {
      const cameraInfo = cameraData[i];
      if (Math.abs(asteroid.position.z - cameraInfo.distance) <= 1) {
        newPosition.x += cameraInfo.positionOffset.x;
        newPosition.y += cameraInfo.positionOffset.y;
        if (cameraInfo.lookAt) {
          lookAtPosition = cameraInfo.lookAt;
        }
        break;
      }
    }
    
    gsap.to(camera.position, {
      duration: 5,
      x: newPosition.x,
      y: newPosition.y,
      ease: "power1",
      onUpdate: function () {
        camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
      }
    });
  }
}

function updateInitialCamera(camera, asteroid, earth) {
  const newPosition = {
    x: asteroid.position.x,
    y: asteroid.position.y+2,
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
      // camera.lookAt(earth.position);
      TITLE_SCREEN.showing = false;
    } 
  });
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

// function createEarth(scene, loader) {
//   return new Promise((resolve, reject) => {
//     const atmosphereVertexShader = `
//     varying vec3 vNormal;
//     void main() {
//       vNormal = normalize( normalMatrix * normal );
//       gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
//     }
//     `;
//     const atmosphereFragmentShader = `
//     varying vec3 vNormal;
//     uniform float opacity;
//     void main() {
//       float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
//       gl_FragColor = vec4( 0.2, 0.6, 1.0, opacity ) * intensity;
//     }
//     `;

//     const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 32, 32);
    
//     // Lava shader
//     const lavaVertexShader = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//     `;
//     const lavaFragmentShader = `
//     varying vec2 vUv;
//     void main() {
//       float lavaColor = 0.5 + 0.5 * sin(vUv.y * 10.0 + time);
//       gl_FragColor = vec4(vec3(lavaColor), 1.0);
//     }
//     `;

//     const earthMaterial = new THREE.ShaderMaterial({
//       uniforms: {
//         time: { value: 0.0 }
//       },
//       vertexShader: lavaVertexShader,
//       fragmentShader: `
//       uniform float time;
//       varying vec2 vUv;
//       void main() {
//         float lavaColor = 0.5 + 0.5 * sin(vUv.y * 10.0 + time);
//         gl_FragColor = vec4(vec3(lavaColor), 1.0);
//       }
//       `
//     });


//     const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.1, 32, 32);
//     const atmosphereMaterial = new THREE.ShaderMaterial({
//       vertexShader: atmosphereVertexShader,
//       fragmentShader: atmosphereFragmentShader,
//       side: THREE.BackSide,
//       blending: THREE.AdditiveBlending,
//       transparent: true,
//       uniforms: {
//         opacity: { value: 0.2 }
//       }
//     });

//     const earth = new THREE.Mesh(earthGeometry, earthMaterial);
//     earth.position.set(0, 0, EARTH_POSITION);
//     scene.add(earth);

//     const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
//     scene.add(atmosphere);
//     atmosphere.position.set(earth.position.x, earth.position.y, earth.position.z);

//     resolve(earth);
//   });
// }


function updateEarthRotation(earth) {
  earth.rotation.y += 0.001;
}

function createSun(scene, loader) {
  const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 10, 10);
  const sunTexture = loader.load('/images/sun.jpeg');
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(420,-10, SUN_POSITION);
  scene.add(sun);
}



function calculateMoveAmount() {
  SCROLL.y *= DAMPING_FACTOR;
  let moveAmount = SCROLL.y / 1000;

  if (Math.abs(moveAmount) > MAX_VELOCITY) {
    moveAmount = Math.sign(moveAmount) * MAX_VELOCITY;
  }
  
  return moveAmount;
}

function mouseInteraction(camera) {
  const parallaxFactor = 0.1;
  if (!BUTTON.clicked) {
    let newX = camera.position.x + MOUSE.x * 0.5;
    let newY = camera.position.y + MOUSE.y * 0.5;

    newX = Math.max(Math.min(newX, 50), -50);
    newY = Math.max(Math.min(newY, 50), -50);

    camera.position.x = newX;
    // camera.position.y = newY;

    return;
  } 
  if (!TITLE_SCREEN.showing) {
    return;
    // camera.position.x += MOUSE.x * parallaxFactor;
    // camera.position.y += MOUSE.y * parallaxFactor;
  }
}

function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

function animate(composer, scene, camera, asteroid, earth, texts, stars) {
  requestAnimationFrame(() => animate(composer, scene, camera, asteroid, earth, texts, stars));

  updateAsteroidPosition(asteroid);
  updateStars(stars, asteroid);
  updateCamera(asteroid, earth, camera);
  updateScrollHandle(asteroid);
  updateText(camera, texts);
  updateEarthRotation(earth);
  updateAsteroidRotation(asteroid);
  mouseInteraction(camera);

  composer.render(scene, camera);
}

async function main() {
  const scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  createSun(scene, loader);
  const stars = await createStars(scene, STAR_CENTER);
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
  camera.lookAt(earth.position.x-250, earth.position.y-175, earth.position.z);

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

  window.addEventListener('mousemove', function(e) {
    MOUSE.x = (e.clientX / window.innerWidth) * 2 - 1;
    MOUSE.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => onWindowResize(camera, renderer), false);

  window.addEventListener('wheel', function(e) {
    if (!TITLE_SCREEN.showing) {
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

    BUTTON.clicked = true;
    updateInitialCamera(camera, asteroid, earth);

  });

  animateUI();
  animate(composer, scene, camera, asteroid, earth, text, stars);
}

main();