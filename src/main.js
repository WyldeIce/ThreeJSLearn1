import './style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';

const gui = new dat.GUI()
//this is the object with the modifiable objects & properties
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}

//this adds an object to the gui, the 3rd and 4th args are min and max for slider
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 500).onChange(generatePlane)

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
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0, 1);
  }

  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
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
camera.position.z = 75

//takes 3 args for this: (width, length, height) all measured in a unit of some form
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
//ThreeJS docs have the list for every geometry shape
//planeGeometry takes 2-4 args (width, height, width segments, height segments), defauly width & height segments are one if not specified
const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
//mesh for the geometry, takes an argument, color is in hexademical
// const material = new THREE.MeshBasicMaterial({color: 0x00FF00})
//phong material needs light to be visible
const planeMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: true, vertexColors: true})

//args are (geometry, material)
// const mesh = new THREE.Mesh(boxGeometry, material);
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

//to find vertices, go to this console.log. Every 3 items represents XYZ
// console.log(planeMesh.geometry.attributes.position.array)
//use this {array} to object destructure to clean code up, vertice position randomization
const {array} = planeMesh.geometry.attributes.position;
const randomValues = [];
for (let i = 0; i < array.length; i++) {
  const x = array[i];
  const y = array[i + 1];
  const z = array [i + 2];

  array[i] = x + (Math.random() - 0.5) * 3
  array[i + 1] = y + (Math.random() - 0.5) * 3
  array[i + 2] = z + (Math.random() - 0.5) * 3

  randomValues.push(Math.random() - 0.5)
}

planeMesh.geometry.attributes.position.randomValues = randomValues;

planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array;

//color attribute addition
const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0, 1);
}

planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

//create a light for the scene, takes 2 args (color, intensity)
const light = new THREE.DirectionalLight(0xFFFFFF, 1)
const backLight = new THREE.DirectionalLight(0x777777, 1)
//set takes X,Y,Z
light.position.set(0, 1, 1)
backLight.position.set(0,0,-1)

//adding mesh to the scene
// scene.add(mesh)
scene.add(planeMesh);
scene.add(light);
scene.add(backLight);

const mouse = {
  x: undefined,
  y: undefined
};

let frame = 0;
//add animation
function animate() {
  requestAnimationFrame(animate)
  //calls to render the scene, takes two args (scene to render, camera)/
  renderer.render(scene, camera)
  //adds rotation to the mesh as it loops animation calls
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // planeMesh.rotation.x -= 0.005;
  raycaster.setFromCamera(mouse, camera)
  frame += 0.01
  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003
    array[i + 1] = originalPosition[i + 1] + Math.cos(frame + randomValues[i]) * 0.003
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const {color} = intersects[0].object.geometry.attributes
    //lower left v1
    color.setX(intersects[0].face.a, 0)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 0.9)
    //lower right v2
    color.setX(intersects[0].face.b, 0)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 0.9)
    //above v3
    color.setX(intersects[0].face.c, 0)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 0.9)

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0,
      b: 1
    };
    const hoverColor = {
      r: 0,
      g: 0.5,
      b: 0.9
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
        
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
        
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true;
      }
    })
  }
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})