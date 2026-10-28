import * as THREE from 'three';
import { createRealisticPedestrian, animatePedestrianRunning } from './CharacterModelGenerator.js';
import { GLTFCharacterManager } from './GLTFCharacterManager.js';

export const IncidentState = {
  NORMAL_DRIVING: 'NORMAL_DRIVING',
  PEDESTRIAN_COLLISION: 'PEDESTRIAN_COLLISION',
  CROWD_REACTION: 'CROWD_REACTION',
  CROWD_CATCHES_DRIVER: 'CROWD_CATCHES_DRIVER',
  DRIVER_PLEADS: 'DRIVER_PLEADS',
  FINAL_CROWD_DIALOGUE: 'FINAL_CROWD_DIALOGUE'
};

export class PursuitManager {
  constructor(scene, player, audioManager, cartoonEffects, gameState, hud) {
    this.scene = scene;
    this.player = player;
    this.audio = audioManager;
    this.effects = cartoonEffects;
    this.gameState = gameState;
    this.hud = hud;

    // Dialogue Manager reference
    this.dialogues = this.audio?.dialogues || null;

    // 6-State Street Collision & Dialogue Sequence State
    this.incidentState = IncidentState.NORMAL_DRIVING;
    this.state = 'IDLE'; // Backward compatibility

    this.pursuitTimer = 0;
    this.lastShoutTime = 0;
    this.shoutCooldown = 4500; // ms
    this.crowd = [];
    this.maxCrowdSize = 5;
    this.isSequenceAborted = false;

    // Materials for crowd attire
    this.lungiMats = [
      new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x008000, roughness: 0.9 })
    ];
    this.shirtMats = [
      new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x3a86ff, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x8338ec, roughness: 0.8 })
    ];
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  }

  /**
   * STATE 2 — PEDESTRIAN COLLISION TRIGGER
   * Called by CollisionSystem when player vehicle hits a pedestrian
   */
  async triggerPedestrianIncident(pedestrian) {
    if (this.gameState.state !== 'PLAYING') return;

    if (this.incidentState !== IncidentState.NORMAL_DRIVING) {
      // Already in an incident/pursuit: apply additional collision fine and alert so every accident is registered
      const penaltyAmount = 500;
      this.gameState.applyCollisionPenalty(penaltyAmount, 'আরেক পথচারী দুর্ঘটনার জরিমানা');
      this.hud?.showAlert(`💥 আবার পথচারীর সাথে ধাক্কা! জরিমানা: -৳${penaltyAmount}`);
      this.pursuitTimer = 0; // refresh pursuit intensity
      return;
    }

    this.isSequenceAborted = false;
    this.incidentState = IncidentState.PEDESTRIAN_COLLISION;
    this.state = 'PURSUIT';

    // 1. Apply collision fine / penalty
    const penaltyAmount = 500;
    this.gameState.applyCollisionPenalty(penaltyAmount, 'পথচারী দুর্ঘটনার ক্ষতিপূরণ জরিমানা');
    this.hud?.showAlert(`💥 পথচারীর সাথে ধাক্কা! জরিমানা: -৳${penaltyAmount}`);

    // Slow vehicle slightly on initial collision
    this.player.speed *= 0.65;

    // 2. Play pedestrian angry dialogue: “অই মিয়া, দেইখা চালাইতে পারেন না?”
    if (this.dialogues) {
      await this.dialogues.play('pedestrian_angry', 'অই মিয়া, দেইখা চালাইতে পারেন না?', 'pedestrian');
    } else {
      this.audio?.speakDialogue('অই মিয়া, দেইখা চালাইতে পারেন না?', 'pedestrian', true);
      await this.sleep(2500);
    }

    if (this.isSequenceAborted || this.gameState.state !== 'PLAYING') return;

    // Transition to STATE 3
    this.triggerCrowdReaction();
  }

  /**
   * STATE 3 — CROWD REACTION
   * Crowd reacts angrily and pursues the driver
   */
  async triggerCrowdReaction() {
    if (this.incidentState !== IncidentState.PEDESTRIAN_COLLISION) return;
    this.incidentState = IncidentState.CROWD_REACTION;
    this.pursuitTimer = 0;
    this.player.isPanic = true;

    // Alert banner
    this.hud?.showAlert('⚠️ পাবলিক ক্ষেপে গেছে! ধাওয়া শুরু করেছে!');

    // Spawn crowd runners behind player
    this.spawnCrowdBehindPlayer();

    // Crowd catch dialogue removed per request
  }

  /**
   * STATE 4 — CROWD CATCHES THE DRIVER
   * Comic slapstick scuffle animation & sound
   */
  async triggerCrowdCatch() {
    if (this.incidentState !== IncidentState.CROWD_REACTION) return;
    this.incidentState = IncidentState.CROWD_CATCHES_DRIVER;
    this.state = 'CAUGHT';

    // Stop auto-rickshaw completely
    this.player.speed = 0;
    this.player.velocity.set(0, 0, 0);

    // Surround vehicle with crowd
    const angleStep = (Math.PI * 2) / Math.max(1, this.crowd.length);
    this.crowd.forEach((runner, i) => {
      const a = i * angleStep;
      runner.group.position.set(
        this.player.position.x + Math.cos(a) * 1.8,
        0,
        this.player.position.z + Math.sin(a) * 1.8
      );
      runner.group.lookAt(this.player.position.x, 0, this.player.position.z);
    });

    // 1. Trigger exaggerated non-graphic cartoon slapstick fight animation
    this.effects?.spawnSlapstickFight(this.player.position);

    // 2. Play slapstick fight audio: “ধিসুম! ধাসুম! কিল! ফুঁসি! চিত-পটাং!”
    if (this.dialogues) {
      await this.dialogues.play('slapstick_fight', 'ধিসুম! ধাসুম! কিল! ফুঁসি! চিত-পটাং!', 'sfx');
    } else {
      this.audio?.playSlapstickArrest();
      await this.sleep(2200);
    }

    if (this.isSequenceAborted || this.gameState.state === 'MENU') return;
    await this.sleep(450);

    // Transition to STATE 5
    this.triggerDriverPleading();
  }

  /**
   * STATE 5 — DRIVER PLEADS
   * Driver raises hands in terror and begs for mercy
   */
  async triggerDriverPleading() {
    if (this.incidentState !== IncidentState.CROWD_CATCHES_DRIVER) return;
    this.incidentState = IncidentState.DRIVER_PLEADS;

    // Set driver pleading pose (hands up, trembling head)
    this.player.setPleading(true);

    // Play driver pleading dialogue: “ভাই, ছাইরা দেন গরিব মানুষ”
    if (this.dialogues) {
      await this.dialogues.play('driver_pleading', 'ভাই, ছাইরা দেন গরিব মানুষ', 'driver');
    } else {
      this.audio?.speakDialogue('ভাই, ছাইরা দেন গরিব মানুষ', 'driver', true);
      await this.sleep(2000);
    }

    if (this.isSequenceAborted || this.gameState.state === 'MENU') return;
    await this.sleep(450);

    // Transition to STATE 6
    this.triggerFinalCrowdDialogue();
  }

  /**
   * STATE 6 — FINAL CROWD DIALOGUE & GAME OVER
   * Crowd delivers final line and game-over modal appears
   */
  async triggerFinalCrowdDialogue() {
    if (this.incidentState !== IncidentState.DRIVER_PLEADS) return;
    this.incidentState = IncidentState.FINAL_CROWD_DIALOGUE;

    // Play final crowd dialogue: “পাইছি তোরে! খাইছি তোরে! পালাবি কই?”
    if (this.dialogues) {
      await this.dialogues.play('crowd_found_you', 'পাইছি তোরে! খাইছি তোরে! পালাবি কই?', 'crowd');
    } else {
      this.audio?.speakDialogue('পাইছি তোরে! খাইছি তোরে! পালাবি কই?', 'crowd', true);
      await this.sleep(2200);
    }

    if (this.isSequenceAborted || this.gameState.state === 'MENU') return;
    await this.sleep(750);

    // Display Game Over screen with collision penalty details
    this.gameState.triggerGameOver('পাবলিকের ধাওয়ায় আটক! গণধোলাই খেয়ে আপনার খেলা শেষ!');
  }

  /**
   * Legacy activatePursuit for general collision triggers
   */
  activatePursuit() {
    if (this.incidentState !== IncidentState.NORMAL_DRIVING) return;
    this.triggerPedestrianIncident(null);
  }

  spawnCrowdBehindPlayer() {
    this.clearCrowd();

    const spawnZ = this.player.position.z - 24;
    const laneOffsets = [-7.0, -3.5, 3.5, 7.0, 5.0];

    for (let i = 0; i < this.maxCrowdSize; i++) {
      const x = laneOffsets[i % laneOffsets.length] + (Math.random() - 0.5) * 1.5;
      const z = spawnZ - i * 3.5;
      const runner = this.createRunningPedestrian(i);
      runner.group.position.set(x, 0, z);
      this.scene.add(runner.group);
      this.crowd.push(runner);
    }
  }

  createRunningPedestrian(seed) {
    const group = new THREE.Group();
    const runnerObj = {
      group,
      speed: 10.5 + (seed % 3) * 0.8,
      controller: null
    };

    const gltfRunner = GLTFCharacterManager.createPursuitRunner(seed);
    if (gltfRunner) {
      group.add(gltfRunner.root);
      runnerObj.controller = gltfRunner;
    } else {
      const procPed = createRealisticPedestrian(seed);
      group.add(procPed.mesh);
      runnerObj.controller = {
        update: (dt) => animatePedestrianRunning(procPed, dt, runnerObj.speed)
      };

      GLTFCharacterManager.onReady(() => {
        const newGltf = GLTFCharacterManager.createPursuitRunner(seed);
        if (newGltf) {
          while (group.children.length > 0) group.remove(group.children[0]);
          group.add(newGltf.root);
          runnerObj.controller = newGltf;
        }
      });
    }

    return runnerObj;
  }

  update(dt) {
    if (this.incidentState !== IncidentState.CROWD_REACTION) return;

    this.pursuitTimer += dt;
    const playerPos = this.player.position;

    let closestDistance = 999;

    // Update each pursuing crowd runner
    this.crowd.forEach((runner) => {
      if (runner.controller && runner.controller.update) {
        runner.controller.update(dt);
      }

      // Move toward player
      const dx = playerPos.x - runner.group.position.x;
      const dz = playerPos.z - runner.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < closestDistance) {
        closestDistance = dist;
      }

      // Dodge around pillars
      let targetX = runner.group.position.x + Math.sign(dx) * Math.min(Math.abs(dx), runner.speed * 0.6 * dt);
      if (Math.abs(targetX) < 1.35) {
        targetX = (dx >= 0 ? 1.6 : -1.6);
      }
      runner.group.position.x = THREE.MathUtils.clamp(targetX, -13.5, 13.5);

      // Advance along Z towards auto
      runner.group.position.z += runner.speed * dt;
      runner.group.rotation.y = Math.atan2(dx, dz);
    });

    // Check catch condition:
    // If closest runner reaches auto (< 2.0m) AND vehicle speed is slow (< 4.0 m/s) AND pursuit has lasted at least 2.5 seconds
    // OR if pursuit has lasted more than 7.5 seconds and runner caught up (< 3.0m)
    if (this.pursuitTimer > 2.5 && ((closestDistance < 2.0 && Math.abs(this.player.speed) < 4.0) || (this.pursuitTimer > 7.5 && closestDistance < 3.0))) {
      this.triggerCrowdCatch();
      return;
    }

    // Check Escape condition:
    // If player speeds away and leaves crowd behind (> 13m after 4.5s, or > 6m after 8.0s)
    const isEscaped = (this.pursuitTimer > 4.5 && closestDistance > 13.0) || (this.pursuitTimer > 8.0 && closestDistance > 6.0);
    if (isEscaped) {
      this.triggerEscape();
    }
  }

  /**
   * Called when player successfully outruns and escapes the pursuing crowd
   */
  triggerEscape() {
    this.hud?.showAlert('💨 পাবলিকের হাত থেকে বেঁচে ফিরলেন! (ধাওয়া শেষ)');
    this.player.isPanic = false;
    this.clearCrowd();
    this.incidentState = IncidentState.NORMAL_DRIVING;
    this.state = 'IDLE';
    this.pursuitTimer = 0;
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  clearCrowd() {
    this.crowd.forEach(runner => {
      this.scene.remove(runner.group);
    });
    this.crowd = [];
  }

  reset() {
    this.isSequenceAborted = true;
    this.incidentState = IncidentState.NORMAL_DRIVING;
    this.state = 'IDLE';
    this.pursuitTimer = 0;
    this.player.isPanic = false;
    this.player.setPleading(false);
    this.clearCrowd();
    if (this.dialogues) {
      this.dialogues.stopAll();
    }
  }
}
