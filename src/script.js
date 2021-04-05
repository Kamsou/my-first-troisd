import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const cubeTextureLoader = new THREE.CubeTextureLoader()


/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Material
 */

 const loadingManager = new THREE.LoadingManager()
 const textureLoader = new THREE.TextureLoader(loadingManager)
const map = textureLoader.load('/textures/pinto.png')
const material = new THREE.MeshPhongMaterial({ map: map })

/**
 * Update all materials
 */


const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            console.log(child);
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = 2
            // child.material = material
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Models
 */
 gltfLoader.load(
    '/models/microphone.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.set(0, -1, 0)
        scene.add(gltf.scene)


        updateAllMaterials()
    }
)

/**
 * Environment map
 */
 const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap


/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight('#ffffff', 5)
directionalLight.position.set(0.25, 3, - 2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 10
directionalLight.shadow.mapSize.set(256, 256)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.LinearToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() =>
    {
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
    })

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()