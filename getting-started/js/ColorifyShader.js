import {
	Vector3
}
from '../libs/threejs/build/three.module.js';

const ColorifyShader = {
	uniforms: {
		uColor: {
			value: new Vector3(1, 1, 1)
		},
		tDiffuse: {
			value: null
		},
	},

	vertexShader: `
		
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
		}

	`,

	fragmentShader: `

		uniform vec3 uColor;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {
			vec3 texColor = texture2D(tDiffuse, vUv).rgb;
			gl_FragColor = vec4(uColor * texColor, 1.);
		}

	`
};









export {
	ColorifyShader
};