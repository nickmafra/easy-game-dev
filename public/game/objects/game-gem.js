import * as THREE from 'three';
import * as CANNON from 'cannon';
import gamePhysics from '../engine/game-physics.js';
import gameAudio from '../engine/game-audio.js';
import GamePlayer from './game-player.js';

const meshRadius = 0.3;
const bodyRadius = 0.5;
const rotationSpeed = 0.05;
const rotation = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rotationSpeed);
const colorLightness = 0.8;

export default class GameGem {
  initialPosition = new CANNON.Vec3(0, 0, 5.0);
  ignoreContact = true;
  maxTime = 15;
  body = null;
  mesh = null;
  player = null;
  time = 0;
  color = new THREE.Color(colorLightness, colorLightness, colorLightness);

  constructor(initialPosition) {
    if (initialPosition) this.initialPosition = initialPosition;

    this.#createBody();
    this.#createMesh();
  }

  #createMesh() {
    this.mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(meshRadius),
        new THREE.MeshLambertMaterial({ color: this.color })
    );
    this.mesh.castShadow = true;
    this.mesh.userData = this;
  }

  #createBody() {
    this.body = new CANNON.Body({
      shape: new CANNON.Sphere(bodyRadius),
      mass: 0.001,
      linearDamping: 1.0,
      angularDamping: 1.0,
    });
    this.body.position.copy(this.initialPosition);
    this.body.userData = this;
  }

  afterAddToGame() {
    this.body.addEventListener('collide', (event) => {
      let object = gamePhysics.inContact(event.contact, this.body);
      if (object.userData instanceof GamePlayer) {
        this.playerPickup(object.userData);
      }
    });
  }

  playerPickup(player) {
    this.player = player;
    this.player.gem = this;
    this.time = 0;
    gameAudio.playEffect('gem');
    gameAudio.playEffect('clock');
  }

  update() {
    this.body.quaternion.mult(rotation, this.body.quaternion);
    if (this.player != null) {
      this.body.position.copy(this.player.mesh.position);
      this.body.position.z += 1.8;
      this.time += gamePhysics.timeUnit;
    } else {
      this.body.position.copy(this.initialPosition);
    }
    const colorIntensity = this.time/this.maxTime;
    this.mesh.material.color.r = colorLightness + (1-colorLightness)*colorIntensity;
    this.mesh.material.color.g = colorLightness*(1-colorIntensity);
    this.mesh.material.color.b = colorLightness*(1-colorIntensity);
    gamePhysics.updateMesh(this);
  }

  timeIsOver() {
    return this.time >= this.maxTime;
  }

  reset() {
    this.player.gem = null;
    this.player = null;
    this.time = 0;
  }
}
