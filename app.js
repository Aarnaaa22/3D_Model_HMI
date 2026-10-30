import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const mount = document.getElementById("modelViewer");
const status = document.getElementById("modelStatus");
const errorBox = document.getElementById("viewerError");
const colorInput = document.getElementById("modelColor");
const autoRotate = document.getElementById("autoRotate");
const wireframe = document.getElementById("wireframe");
const downloadLink = document.getElementById("downloadModel");

let scene, camera, renderer, controls, mesh, currentMaterial;
let currentModel = "hmi_final.stl";
let currentGeometry = null;
let frameId;

function initViewer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#302e2c");
  camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 5000);
  camera.position.set(2.8, 2.1, 3.2);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.minDistance = 0.7;
  controls.maxDistance = 50;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6e5b64, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(4, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xf5b7d2, 1.5);
  fill.position.set(-5, 2, -4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(0, -3, 5); scene.add(rim);

  const resize = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  new ResizeObserver(resize).observe(mount);

  // Drag and drop support for local STL files
  mount.addEventListener("dragover", e => {
    e.preventDefault();
    mount.style.outline = "2px dashed #d58aaa";
  });
  mount.addEventListener("dragleave", e => {
    e.preventDefault();
    mount.style.outline = "none";
  });
  mount.addEventListener("drop", e => {
    e.preventDefault();
    mount.style.outline = "none";
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".stl")) {
      loadFromFile(droppedFile);
    }
  });

  animate();
  loadModel(currentModel);
}
function animate() {
  frameId = requestAnimationFrame(animate);
  controls.autoRotate = autoRotate.checked;
  controls.update();
  renderer.render(scene, camera);
}
function setStatus(message) { status.textContent = message; }

function displayGeometry(geometry, label) {
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
  const sphere = new THREE.Sphere();
  geometry.computeBoundingSphere();
  sphere.copy(geometry.boundingSphere);
  const material = new THREE.MeshStandardMaterial({
    color: colorInput.value, metalness: 0.12, roughness: 0.34,
    wireframe: wireframe.checked
  });
  const newMesh = new THREE.Mesh(geometry, material);
  const maxDim = Math.max(
    geometry.boundingBox.max.x - geometry.boundingBox.min.x,
    geometry.boundingBox.max.y - geometry.boundingBox.min.y,
    geometry.boundingBox.max.z - geometry.boundingBox.min.z
  );
  const scale = 2.25 / (maxDim || 1);
  newMesh.scale.setScalar(scale);
  newMesh.rotation.x = -Math.PI / 2;
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  mesh = newMesh;
  currentGeometry = geometry;
  currentMaterial = material;
  scene.add(mesh);
  const radius = Math.max(2.7, sphere.radius * scale * 3.1);
  camera.position.set(radius * 1.05, radius * 0.72, radius * 1.15);
  controls.target.set(0, 0, 0);
  controls.minDistance = radius * 0.55;
  controls.maxDistance = radius * 5;
  controls.update();
  errorBox.hidden = true;
  errorBox.style.display = "none";
  errorBox.classList.remove("visible");
  setStatus("Ready · " + label);
}

function loadModel(file) {
  currentModel = file;
  setStatus("Loading " + file + "…");
  errorBox.hidden = true;
  errorBox.style.display = "none";
  errorBox.classList.remove("visible");
  const loader = new STLLoader();
  loader.load("models/" + file, geometry => {
    displayGeometry(geometry, file);
    downloadLink.href = "models/" + file;
    downloadLink.download = file;
    document.querySelectorAll(".model-option").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.model === file);
    });
  }, xhr => {
    if (xhr.total) setStatus("Loading " + Math.round(xhr.loaded / xhr.total * 100) + "%");
  }, err => {
    console.error(err);
    setStatus("Preview unavailable");
    errorBox.hidden = false;
    errorBox.style.display = "flex";
    errorBox.classList.add("visible");
  });
}

function loadFromFile(file) {
  setStatus("Loading " + file.name + "…");
  errorBox.hidden = true;
  errorBox.style.display = "none";
  errorBox.classList.remove("visible");
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const loader = new STLLoader();
      const geometry = loader.parse(e.target.result);
      displayGeometry(geometry, file.name);
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = file.name;
      document.querySelectorAll(".model-option").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.model.toLowerCase() === file.name.toLowerCase());
      });
    } catch (parseErr) {
      console.error(parseErr);
      setStatus("Error parsing STL");
      errorBox.hidden = false;
      errorBox.style.display = "flex";
      errorBox.classList.add("visible");
    }
  };
  reader.onerror = () => {
    setStatus("Error reading file");
    errorBox.hidden = false;
    errorBox.style.display = "flex";
    errorBox.classList.add("visible");
  };
  reader.readAsArrayBuffer(file);
}

const localPicker = document.getElementById("localStlPicker");
if (localPicker) {
  localPicker.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) loadFromFile(file);
  });
}
document.querySelectorAll(".model-option").forEach(btn => btn.addEventListener("click", () => loadModel(btn.dataset.model)));
colorInput.addEventListener("input", () => { if (currentMaterial) currentMaterial.color.set(colorInput.value); });
wireframe.addEventListener("change", () => { if (currentMaterial) currentMaterial.wireframe = wireframe.checked; });
document.getElementById("resetView").addEventListener("click", () => {
  if (!mesh) return;
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) * 1.65;
  camera.position.set(radius, radius * .72, radius * 1.1);
  controls.target.set(0,0,0); controls.update();
});
initViewer();

// Gallery lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
document.querySelectorAll(".gallery-item").forEach(item => item.addEventListener("click", () => {
  lightboxImage.src = item.dataset.full;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}));
function closeLightbox() { lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true"); }
lightbox.addEventListener("click", e => { if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

// Mobile navigation
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
}));
