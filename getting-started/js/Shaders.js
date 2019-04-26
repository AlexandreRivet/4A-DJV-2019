const vshader = `
	void main() {
		gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
	}
`;

const fshader = `
	uniform vec4 uColor;
	void main() {
		// gl_FragColor = vec4(1., 0., 0., 1.);
		gl_FragColor = uColor;
	}
`;

/* DO NOT USE 
const shader = [
	'void main() {',
	'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);',
	'}',
].join('\n');
*/
export {
	vshader,
	fshader,
};