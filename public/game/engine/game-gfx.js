import * as THREE from 'three';

const fov = 50;
const fovRadians = (fov/180)*Math.PI;
const baseDistance = 7;
const totalDistance = 12;
const angle = 0.09 * Math.PI;

const outlineMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000,
	side: THREE.BackSide,
});

const gameGfx = {

	xVector: new THREE.Vector3(1, 0, 0),
	renderer: new THREE.WebGLRenderer({
		antialias: true,
	}),
	scene: null,
	camera: null,

    configure: function(container) {
		this.renderer.shadowMap.enabled = true;
		container.appendChild(this.renderer.domElement);

		window.onresize = () => this.resize();
    },

	start: function() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();
		this.resize();
	},

	resize: function() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		if (this.camera) {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		}
	},
	
	addObject: function(object) {
		this.scene.add(object.mesh);
		if (object.hasOutline) {
			this.addOutline(object.mesh);
		}
	},

	removeObject: function(object) {
		this.scene.remove(object.mesh);
	},

	addOutline: function(mesh) {
		const outline = new THREE.Mesh(mesh.geometry, outlineMaterial);
		outline.scale.multiplyScalar(1.03);
		mesh.add(outline);
	},

    addAmbientLight: function() {
		const ambientlLight = new THREE.AmbientLight(0xffffff, 0.3);
		this.scene.add(ambientlLight);
    },

    addDirectionalLight: function() {
		const directionalLight = new THREE.DirectionalLight(0xffffdd, 0.6);
		directionalLight.position.set(100, 50, 300);
		directionalLight.castShadow = true;
		this.scene.add(directionalLight);
    },

	resetCamera: function() {
		let verticalDistance = totalDistance*Math.cos(angle);
		let horizontalDistance = totalDistance*Math.sin(angle);
		this.camera.position.set(0, -baseDistance-horizontalDistance, verticalDistance);
		this.camera.quaternion.setFromAxisAngle(this.xVector, angle+fovRadians/2);
	},

    render: function() {
		this.renderer.render(this.scene, this.camera);
    },

};

export default gameGfx;
