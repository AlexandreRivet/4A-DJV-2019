import {
	WebGLApplication, RenderMode
}
from './WebGLApplication.js';

import {
	BoxGeometry,
	PlaneGeometry,
	SphereGeometry,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshNormalMaterial,
	ShaderMaterial,
	Mesh,
	PointLight,
	SpotLight,
	Math as TMath, // import en tant qu'alias
	Color,
	Vector3,
	BufferGeometry,
	Float32BufferAttribute,
	DoubleSide,
	Points,
	PointsMaterial,
	Raycaster,
	TextureLoader,
	AnimationMixer,
}
from '../libs/threejs/build/three.module.js';

import {
	OBJLoader
}
from '../libs/threejs/examples/jsm/loaders/OBJLoader.js';

import {
	FBXLoader
}
from '../libs/threejs/examples/jsm/loaders/FBXLoader.js';

import {
	RenderPass
}
from '../libs/threejs/examples/jsm/postprocessing/RenderPass.js';

import {
	ShaderPass
}
from '../libs/threejs/examples/jsm/postprocessing/ShaderPass.js';

import {
	DotScreenShader
}
from '../libs/threejs/examples/jsm/shaders/DotScreenShader.js';

import {
	OrbitControls
}
from '../libs/threejs/examples/jsm/controls/OrbitControls.js';

import {
	DeviceOrientationControls
}
from '../libs/threejs/examples/jsm/controls/DeviceOrientationControls.js';

import {
	isDefined
}
from './Utils.js';

import {
	vshader,
	fshader,
}
from './Shaders.js';

import {
	ColorifyShader
}
from './ColorifyShader.js';

const app = new WebGLApplication(
	document.querySelector('#webgl'), ({
		scene
	}, deltaTime, elapsedTime) => {
		/*
		Execute une fonction sur tous les fils de manière récursive
		scene.traverse(child => {
			child.rotation.x += 0.01 * deltaTime;
		});
		*/
		const child = scene.getObjectByName('cube-001');
		if (isDefined(child)) {
			child.rotation.x += 0.5 * deltaTime;
		}
		const child2 = scene.getObjectByName('plane-001');
		if (isDefined(child2)) {
			const {
				value
			} = child2.material.uniforms.uColor;
			value.y = 1 - (value.y + 0.001) % 1;

			// Modification de la géométrie
			const {
				geometry
			} = child2;
			geometry.vertices.forEach((vertex, index) => {
				vertex.z = Math.sin(elapsedTime * index * 0.01);
			});
			geometry.verticesNeedUpdate = true;
		}

		// Update de l'animation du fbx
		if (mixer) {
			mixer.update(deltaTime);
		}

		if (controls) {
			controls.update();
		}

		// Update de la couleur de la pass
		colorifyShaderPass.uniforms['uColor'].value.set(Math.random(), 0.0, 0.0);

	}, {
		mousemove: ({
			mouse, scene, camera
		}) => {
			/*
			const raycaster = new Raycaster();
			raycaster.setFromCamera(mouse, camera);
			let intersected = raycaster.intersectObjects(scene.children);
			*/
		},
		mousedown: ({
			mouse, scene, camera
		}) => {
			const raycaster = new Raycaster();
			raycaster.setFromCamera(mouse, camera);
			let intersected = raycaster.intersectObjects(scene.children);

			if (intersected.length) {
				let first = intersected[0];
				const intersectedGeometry = new SphereGeometry(0.1, 32, 32);
				const material = new MeshBasicMaterial({
					color: 'red'
				});
				const mesh = new Mesh(intersectedGeometry, material);
				mesh.position.copy(first.point);
				scene.add(mesh);
			}
		}
	},
	RenderMode.VR
);

const {
	scene, camera, renderer,
} = app;

// Ajout du cube
const geometry = new BoxGeometry(5, 5, 5);
const material = new MeshNormalMaterial();
const mesh = new Mesh(geometry, material);
mesh.name = 'cube-001';
mesh.castShadow = true;
// scene.add(mesh);

// Ajout du plan
const geometry2 = new PlaneGeometry(30, 30, 50, 50);
const material2 = new ShaderMaterial({
	uniforms: {
		uColor: {
			value: new Vector3(0, 1, 0),
		}
	},
	vertexShader: vshader,
	fragmentShader: fshader,
	wireframe: false,
});
const mesh2 = new Mesh(geometry2, material2);
mesh2.name = 'plane-001';
mesh2.position.y = -5;
mesh2.rotation.x = -Math.PI / 2;
mesh2.receiveShadow = true;
scene.add(mesh2);

// Ajout de la lumière
// PointLight
const light = new PointLight(0xffffff, 0.5);
light.position.y = 50;
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 100;
light.shadow.bias = 0.0001;
scene.add(light);

// SpotLight
const light2 = new SpotLight(0xffffff);
light2.position.x = 10;
light2.castShadow = true;
light2.shadow.mapSize.x = 2048;
light2.shadow.mapSize.y = 2048;
light2.shadow.camera.near = 0.1;
light2.shadow.camera.far = 100;
light2.shadow.bias = 0.001;
scene.add(light2);

camera.position.z = 25;
camera.position.y = 25;
camera.position.x = 5;
// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new DeviceOrientationControls(camera);



const vertices = [
	0, 0, 0,
	0, 1, 0,
	1, 0, 0
];
const uvs = [
	0, 0,
	0, 1,
	1, 0
];
const customBuffer = new BufferGeometry();
customBuffer.addAttribute('position', new Float32BufferAttribute(vertices, 3));
customBuffer.addAttribute('uv0', new Float32BufferAttribute(uvs, 2));
// customBuffer.setIndex([0, 2, 1]);

const material3 = new PointsMaterial({
	color: 'blue',
});
const mesh3 = new Points(customBuffer, material3);
mesh3.position.y = 10;
scene.add(mesh3);

const textureLoader = new TextureLoader();

// Load d'un obj
const objLoader = new OBJLoader();
objLoader.load(
	'models/obj/ninja/ninjaHead_Low.obj', (object) => {
		const aoMap = textureLoader.load('models/obj/ninja/ao.jpg');
		const displacementMap = textureLoader.load('models/obj/ninja/displacement.jpg');
		const normalMap = textureLoader.load('models/obj/ninja/normal.jpg');

		scene.add(object);
		object.scale.set(0.05, 0.05, 0.05);
		object.position.z = 5;

		object.children[0].material.aoMap = aoMap;
		object.children[0].material.displacementMap = displacementMap;
		object.children[0].material.normalMap = normalMap;
	},
	xhr => {
		console.log(xhr);
	}
);



// Load d'un FBX
let mixer = null;
const fbxLoader = new FBXLoader();
fbxLoader.load('models/fbx/Samba dancing.fbx', (object) => {
	scene.add(object);
	object.scale.set(0.05, 0.05, 0.05);

	mixer = new AnimationMixer(object);
	const action = mixer.clipAction(object.animations[0]);
	action.play();

	console.log(object);
});



// Setup des pass pour le postprocessing
app.addPass(new RenderPass(scene, camera));
app.addPass(new ShaderPass(DotScreenShader));
const colorifyShaderPass = new ShaderPass(ColorifyShader);
colorifyShaderPass.uniforms['uColor'].value.set(0.5, 0.0, 0.0);
app.addPass(colorifyShaderPass);

var elem = document.documentElement;

document.querySelector('#webgl').addEventListener('click', () => {
	openFullscreen();
});

/* View in fullscreen */
function openFullscreen() {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
}

app.start();