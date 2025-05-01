import './style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const gui = new dat.GUI()
//this is the object with the modifiable objects & properties
const world = {
  plane: {
    width: 10,
    height: 10,
    widthSegments: 10,
    heightSegments: 10
  }
}

//this adds an object to the gui, the 3rd and 4th args are min and max for slider
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 20).onChange(generatePlane)

function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

  const {array} = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array [i + 2];

    array[i + 2] = z + Math.random()

  }
}

const raycaster = new THREE.Raycaster()
//create the scene
const scene = new THREE.Scene();
//camera uses (degrees of perspective, aspect ratio, close clipping plane, far clipping pane) -> 4 args
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
//create a render
const renderer = new THREE.WebGLRenderer()

//set size for the render canvas
renderer.setSize(innerWidth, innerHeight);
//use setPixelRatio to help set the frames to the right setting to prevent poor animation frames
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)
camera.position.z = 5;

//takes 3 args for this: (width, length, height) all measured in a unit of some form
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
//ThreeJS docs have the list for every geometry shape
//planeGeometry takes 2-4 args (width, height, width segments, height segments), defauly width & height segments are one if not specified
const planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10)
//mesh for the geometry, takes an argument, color is in hexademical
// const material = new THREE.MeshBasicMaterial({color: 0x00FF00})
//phong material needs light to be visible
const planeMaterial = new THREE.MeshPhongMaterial({color: 0x0066CC, side: THREE.DoubleSide, flatShading: true})

//args are (geometry, material)
// const mesh = new THREE.Mesh(boxGeometry, material);
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

//to find vertices, go to this console.log. Every 3 items represents XYZ
// console.log(planeMesh.geometry.attributes.position.array)
//use this {array} to object destructure to clean code up
const {array} = planeMesh.geometry.attributes.position;
for (let i = 0; i < array.length; i += 3) {
  const x = array[i];
  const y = array[i + 1];
  const z = array [i + 2];

  array[i + 2] = z + Math.random()

}

//create a light for the scene, takes 2 args (color, intensity)
const light = new THREE.DirectionalLight(0xFFFFFF, 1)
const backLight = new THREE.DirectionalLight(0x777777, 1)
//set takes X,Y,Z
light.position.set(0, 0, 1)
backLight.position.set(0,0,-1)

//adding mesh to the scene
// scene.add(mesh)
scene.add(planeMesh);
scene.add(light);
scene.add(backLight);

//modify where the camera is, moving it along the Z-axis so it isn't at point 0,0,0
camera.position.z = 5;

const mouse = {
  x: undefined,
  y: undefined
};

//add animation
function animate() {
  requestAnimationFrame(animate)
  //calls to render the scene, takes two args (scene to render, camera)
  renderer.render(scene, camera)
  //adds rotation to the mesh as it loops animation calls
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // planeMesh.rotation.x -= 0.005;
  raycaster.setFromCamera(mouse, camera)
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})