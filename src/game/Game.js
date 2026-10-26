import * as THREE from 'three';
import { GameState } from './GameState.js';
import { AudioManager } from './AudioManager.js';
import { InputManager } from './InputManager.js';
import { World } from './World.js';
import { PlayerVehicle } from './PlayerVehicle.js';
import { TrafficManager } from './TrafficManager.js';
import { CameraController } from './CameraController.js';
import { CollisionSystem } from './CollisionSystem.js';
import { CartoonEffects } from './CartoonEffects.js';
import { PursuitManager } from './PursuitManager.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { TouchControls } from '../ui/TouchControls.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.isPaused = false;

    // 1. Initialize Core Three.js
    this.initThree();

    // 2. Initialize Game Systems
    this.gameState = new GameState();
    this.audio = new AudioManager(this.gameState);
    this.input = new InputManager(this.audio, this.gameState);

    // 3. Initialize UI first so subsystems can send alerts
    this.hud = new HUD(this.gameState, this.audio);
    this.menu = new Menu(
      this.gameState,
      () => this.startPlay(),
      () => this.restartPlay(),
      () => this.returnToMenu()
    );
    this.touchControls = new TouchControls(this.input);

    // 4. Build 3D World & Entities
    this.world = new World(this.scene);
    this.player = new PlayerVehicle(this.scene);
    this.traffic = new TrafficManager(this.scene);
    this.cameraController = new CameraController(this.camera, this.player);

    // 5. Cartoon Comic Visual Effects & Crowd Pursuit Systems
    this.effects = new CartoonEffects(this.scene);
    this.pursuit = new PursuitManager(
      this.scene,
      this.player,
      this.audio,
      this.effects,
      this.gameState,
      this.hud
    );

    // 6. Collision System with Hard Pillar Resolution & Accident Trigger
    this.collisions = new CollisionSystem(
      this.player,
      this.world,
      this.traffic,
      this.cameraController,
      this.audio,
      this.gameState,
      this.pursuit,
      this.effects
    );

    // Connect voice lines to visual speech bubble
    this.audio.onDialogueCallback = (text, speaker) => {
      this.hud.showSpeechBubble(text, speaker);
    };

    // 7. Setup Listeners
    this.initListeners();

    // 8. Apply initial quality
    this.applyQuality(this.gameState.quality);

    // 9. Start Game Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
  }

  initListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Listen for horn event to reactively scatter traffic & pedestrians
    this.gameState.subscribe((event, data) => {
      if (event === 'horn') {
        this.traffic.onHornBlown(this.player.position.z);
      } else if (event === 'toggleCamera') {
        const modeName = this.cameraController.toggleCameraMode();
        this.hud?.showAlert(`ক্যামেরা ভিউ: ${modeName}`);
      } else if (event === 'togglePause') {
        this.togglePause();
      } else if (event === 'quality') {
        this.applyQuality(data);
      }
    });
  }

  applyQuality(quality) {
    if (!this.renderer) return;
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
  }

  startPlay() {
    this.audio.unlock();
    this.audio.startEngine();
    this.gameState.reset();
    this.player.reset(6.0, 0);
    this.pursuit.reset();
    this.effects.clearAll();
    this.cameraController.reset();
    this.hud.show();
  }

  restartPlay() {
    this.audio.startEngine();
    this.gameState.reset();
    this.player.reset(6.0, 0);
    this.world.reset();
    this.traffic.reset(0);
    this.pursuit.reset();
    this.effects.clearAll();
    this.cameraController.reset();
    this.hud.show();
  }

  returnToMenu() {
    this.audio.stopEngine();
    this.gameState.state = 'MENU';
    this.player.reset(6.0, 0);
    this.world.reset();
    this.traffic.reset(0);
    this.pursuit.reset();
    this.effects.clearAll();
    this.cameraController.reset();
    this.hud.hide();
  }

  togglePause() {
    if (this.gameState.state !== 'PLAYING') return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.audio.stopEngine();
    } else {
      this.audio.startEngine();
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(0.08, this.clock.getDelta());

    if (this.gameState.state === 'PLAYING' && !this.isPaused) {
      // Update vehicle physics & controls
      this.player.update(dt, this.input, this.gameState, this.audio);

      // Update world chunks around player
      this.world.update(this.player.position.z);

      // Update AI traffic & pedestrians
      this.traffic.update(dt, this.player.position.z);

      // Update hard pillar collisions and accident events
      this.collisions.update(dt);

      // Update crowd pursuit AI
      this.pursuit.update(dt);

      // Update cartoon comic visual effects
      this.effects.update(dt);

      // Update camera follow
      this.cameraController.update(dt, this.gameState.isBoosting);

      // Update HUD
      this.hud.update(dt);
    } else if (this.gameState.state === 'MENU') {
      // Third-person perspective showing rickshaw and driver in lane
      const time = Date.now() * 0.0006;
      const subtleSway = Math.sin(time) * 0.25;
      this.camera.position.set(
        6.0 + subtleSway,
        3.8,
        -7.2
      );
      this.camera.lookAt(6.0, 1.4, 15);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
