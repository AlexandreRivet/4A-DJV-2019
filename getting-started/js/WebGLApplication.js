import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Clock,
	PCFSoftShadowMap,
	Vector2,
}
from '../libs/threejs/build/three.module.js';

import {
	EffectComposer
}
from '../libs/threejs/examples/jsm/postprocessing/EffectComposer.js';

import {
	StereoEffect
}
from '../libs/threejs/examples/jsm/effects/StereoEffect.js';

import {
	isDefined
}
from './Utils.js';

const RenderMode = {
	CLASSIC: 0,
	POSTPROCESSED: 1,
	VR: 2
};

class WebGLApplication {
	constructor(containerElement, update, events = {}, renderMode = RenderMode.CLASSIC) {
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
		this._renderer.setSize(clientWidth, clientHeight, false);

		// Active les ombres
		this._renderer.shadowMap.enabled = true;
		this._renderer.shadowMap.type = PCFSoftShadowMap;
		this._renderer.setClearColor(0xcccccc);

		// Ajoute le canvas dans le container et ajoute les évenements user
		containerElement.appendChild(this._renderer.domElement);
		this._bindListeners();

		this._update = update;

		this._clock = new Clock();

		this._events = events;

		this._renderMode = renderMode;
		switch (this._renderMode) {
		case RenderMode.POSTPROCESSED:
			{
				this._composer = new EffectComposer(this._renderer);
				break;
			}
		case RenderMode.VR:
			{
				this._effect = new StereoEffect(this._renderer);
				break;
			}
		}
	}

	get composer() {
		return this._composer;
	}

	get renderer() {
		return this._renderer;
	}

	addPass(pass) {
		if (!this._composer) return;
		this._composer.addPass(pass);
	}

	get scene() {
		return this._scene;
	}

	get camera() {
		return this._camera;
	}

	get mouse() {
		return this._mouse;
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
		const elapsedTime = this._clock.getElapsedTime();

		// On va check si la size a changé par rapport au précédent refresh
		this._checkDimension();

		// update des éléments de la scène
		if (isDefined(this._update)) {
			this._update(this, deltaTime, elapsedTime);
		}

		// rendu d'une frame en fonction du mode de rendu
		switch (this._renderMode) {
		case RenderMode.CLASSIC:
			{
				this._renderer.render(this._scene, this._camera);
				break;
			}
		case RenderMode.POSTPROCESSED:
			{
				this._composer.render();
				break;
			}
		case RenderMode.VR:
			{
				this._effect.render(this._scene, this._camera);
				break;
			}
		}

		// rappel de la fonction au prochain 'repaint' du navigateur
		this._rafID = requestAnimationFrame(() => {
			this.animate();
		});
	}

	_checkDimension() {
		const {
			clientWidth, clientHeight
		} = this._renderer.domElement.parentElement;

		if (this._storedWidth !== clientWidth || this._storedHeight !== clientHeight) {
			this._storedWidth = clientWidth;
			this._storedHeight = clientHeight;

			// mise à jour du buffer de rendu
			this._renderer.setSize(clientWidth, clientHeight, false);
			if (this._composer) {
				this._composer.setSize(clientWidth, clientHeight);
			}

			// mise à jour de la caméra
			this._camera.aspect = clientWidth / clientHeight;
			this._camera.updateProjectionMatrix();
		}
	}

	_computeMousePosition(evt) {
		if (!isDefined(this._mouse)) {
			this._mouse = new Vector2();
		}

		const {
			clientX, clientY
		} = evt;
		const {
			clientWidth, clientHeight
		} = this._renderer.domElement;

		this._mouse.x = (clientX / clientWidth) * 2 - 1;
		this._mouse.y = -(clientY / clientHeight) * 2 + 1;
	}

	_bindListeners() {
		['mousedown', 'mouseup', 'mousemove'].forEach(eventName => {
			this._renderer.domElement.addEventListener(eventName, this[`_${eventName}`].bind(this));
		});
	}

	_mousedown(evt) {
		this._mouseFnc(evt, 'mousedown');
	}

	_mouseup(evt) {
		this._mouseFnc(evt, 'mouseup');
	}

	_mousemove(evt) {
		this._mouseFnc(evt, 'mousemove');
	}

	_mouseFnc(evt, name) {
		this._computeMousePosition(evt);

		if (isDefined(this._events[name])) {
			this._events[name](this);
		}
	}






}

export {
	WebGLApplication,
	RenderMode
};