import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Clock,
}
from '../libs/three.module.js';

import {
	isDefined
}
from './Utils.js';

class WebGLApplication {
	constructor(containerElement, update) {
		const {
			clientWidth, clientHeight
		} = containerElement;

		// Scene graph des objets
		this._scene = new Scene();

		// Camera qui fera le rendu
		this._camera = new PerspectiveCamera(
			45,
			clientWidth / clientHeight,
			0.1,
			1000
		);

		// Renderer
		this._renderer = new WebGLRenderer({
			antialias: true,
		});
		this._renderer.setSize(clientWidth, clientHeight);
		containerElement.appendChild(this._renderer.domElement);

		this._update = update;

		this._clock = new Clock();
	}

	get scene() {
		return this._scene;
	}

	get camera() {
		return this._camera;
	}

	start() {
		if (!isDefined(this._rafID)) {
			this.animate();
		}
	}

	stop() {
		if (isDefined(this._rafID)) {
			cancelAnimationFrame(this._rafID);
			this._rafID = null;
		}
	}

	animate() {
		const deltaTime = this._clock.getDelta();

		// update des éléments de la scène
		if (isDefined(this._update)) {
			this._update(this, deltaTime);
		}

		// rendu d'une frame
		this._renderer.render(this._scene, this._camera);

		// rappel de la fonction au prochain 'repaint' du navigateur
		this._rafID = requestAnimationFrame(() => {
			this.animate();
		});
	}







}

export default WebGLApplication;