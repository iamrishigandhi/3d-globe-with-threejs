import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";
import { drawThreeGeo } from "./src/threeGeoJSON.js";
import countryLabels from "./src/countryLabels.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0); // what the camera should orbit around
camera.position.set(0, 2.5, 3); // view angle you want
controls.update();
controls.minDistance = 3.2;
controls.maxDistance = 5;
const geometry = new THREE.SphereGeometry(2);

// solid colored sphere
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x3498db });
const sphereMesh = new THREE.Mesh(geometry, sphereMaterial);
scene.add(sphereMesh);

let lineMat = new THREE.LineBasicMaterial({ 
  color: 0xffffff,
  transparent: true,
  opacity: 0.5, 
});
const edges = new THREE.EdgesGeometry(geometry, 1);
const line = new THREE.LineSegments(edges, lineMat);
scene.add(line);

// check here for more datasets ...
// https://github.com/martynafford/natural-earth-geojson
// non-geojson datasets: https://www.naturalearthdata.com/downloads/

fetch('./geojson/ne_110m_admin_0_countries.json')
  .then(response => response.text())
  .then(text => {
    const data = JSON.parse(text);
    const countries = drawThreeGeo({
      json: data,
      radius: 2,
      materialOptions: {
        color: 0x00ff00,
      },
    });
    scene.add(countries);
    countryLabels(scene, data);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));;

  let stars = null;
  stars = getStarfield({ numStars: 1500});
  scene.add(stars);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
