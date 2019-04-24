import WebGLApplication from './WebGLApplication.js';

import {
	BoxGeometry,
	PlaneGeometry,
	MeshStandardMaterial,
	Mesh,
	PointLight,
}
from '../libs/three.module.js';

import {
	isDefined
}
from './Utils.js';

const app = new WebGLApplication(
	document.querySelector('#webgl'), ({
		scene
	}, deltaTime) => {
		/*
		Execute une fonction sur tous les fils de manière récursive
		scene.traverse(child => {
			child.rotation.x += 0.01 * deltaTime;
		});
		*/
		const child = scene.getObjectByName('cube-001');
		if (isDefined(child)) {
			child.rotation.x += 0.1 * deltaTime;
		}
	}
);

const {
	scene, camera
} = app;

// Ajout du cube
const geometry = new BoxGeometry(5, 5, 5);
const material = new MeshStandardMaterial({
	color: 'red'
});
const mesh = new Mesh(geometry, material);
mesh.name = 'cube-001';
scene.add(mesh);

// Ajout du plan
const geometry2 = new PlaneGeometry(10, 10);
const material2 = new MeshStandardMaterial({
	color: 'blue',
});
const mesh2 = new Mesh(geometry2, material2);
mesh2.position.y = -5;
mesh2.rotation.x = -Math.PI / 2;
scene.add(mesh2);

// Ajout de la lumière
const light = new PointLight(0xffffff);
light.position.z = 10;
scene.add(light);

camera.position.z = 15;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

app.start();