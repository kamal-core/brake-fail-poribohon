import * as THREE from 'three';

export class CollisionSystem {
  constructor(player, world, traffic, cameraController, audioManager, gameState, pursuitManager, cartoonEffects) {
    this.player = player;
    this.world = world;
    this.traffic = traffic;
    this.camera = cameraController;
    this.audio = audioManager;
    this.gameState = gameState;
    this.pursuit = pursuitManager;
    this.effects = cartoonEffects;

    this.lastAccidentTime = 0;
    this.accidentCooldown = 1500; // ms cooldown between comic accident events
  }

  update(dt = 0.016) {
    if (this.gameState.state !== 'PLAYING') return;

    // Sub-stepping to completely eliminate tunneling at high speeds
    const steps = Math.min(3, Math.max(1, Math.ceil(Math.abs(this.player.speed) * dt / 0.8)));
    const subDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      this.resolveSolidObstacles();
    }

    this.checkVehicleCollisions();
    this.checkPedestrianCollisions();
    this.checkWorldPropCollisions();
    this.checkStuntRamps();
    this.checkProtestCollisions();
  }

  checkStuntRamps() {
    if (!this.world.stuntRamps) return;
    const pBox = this.player.box;
    for (const ramp of this.world.stuntRamps) {
      if (!ramp.hit && pBox.intersectsBox(ramp.box)) {
        if (this.player.speed > 6.0) {
          ramp.hit = true;
          this.player.jump(ramp.jumpForce || 12.0);
          this.gameState.addScore(1500, 'ঠেলাগাড়ি স্টান্ট জাম্প (আন্দোলন ওভারফ্লাই)!');
          this.audio?.playBoost();
          this.camera?.addTrauma(0.3);
          this.effects?.spawnAccidentBurst(this.player.position);
          this.audio?.speakDialogue('উইড়্যা গেলাম রে!', 'driver', true);
        }
      }
    }
  }

  checkProtestCollisions() {
    if (!this.world.protestBlockades) return;
    const pBox = this.player.box;
    for (const protest of this.world.protestBlockades) {
      if (pBox.intersectsBox(protest.box)) {
        // If airborne, player flies safely over the protest!
        if (this.player.position.y > 1.35) {
          continue;
        }

        // Hit blockade on ground
        this.audio?.playCrash(1.5);
        this.camera?.addTrauma(0.8);
        this.player.speed = 0;
        this.effects?.spawnAccidentBurst(this.player.position);
        this.gameState.triggerGameOver('আন্দোলনের ব্যারিকেডে সরাসরি ধাক্কায় গাড়ি ধ্বংস ও গণধোলাই!');
        return;
      }
    }
  }

  /**
   * Hard collision resolution against flyover pillars and solid walls.
   * Prevents the auto-rickshaw from passing through or sticking inside obstacles!
   */
  resolveSolidObstacles() {
    const pBox = this.player.box;
    const playerPos = this.player.position;

    for (const obs of this.world.solidObstacles) {
      // Distance culling: check only nearby obstacles
      const obsCenter = new THREE.Vector3();
      obs.box.getCenter(obsCenter);
      if (Math.abs(playerPos.z - obsCenter.z) > 5.5 || Math.abs(playerPos.x - obsCenter.x) > 4.5) {
        continue;
      }

      if (pBox.intersectsBox(obs.box)) {
        const dx = playerPos.x - obsCenter.x;
        const dz = playerPos.z - obsCenter.z;

        const halfPWidth = this.player.width * 0.5;
        const halfPLength = this.player.length * 0.5;
        const halfObsWidth = obs.width * 0.5;
        const halfObsDepth = obs.depth * 0.5;

        // Overlap on both axes
        const overlapX = (halfPWidth + halfObsWidth) - Math.abs(dx);
        const overlapZ = (halfPLength + halfObsDepth) - Math.abs(dz);

        if (overlapX > 0 && overlapZ > 0) {
          const impactSpeed = Math.abs(this.player.speed);

          // Hard penetration resolution: push out along the minimum overlap axis
          if (overlapX < overlapZ) {
            const pushDirX = dx >= 0 ? 1 : -1;
            this.player.position.x += pushDirX * (overlapX + 0.05);
            this.player.velocity.x = 0;
            this.player.speed *= 0.5;
          } else {
            const pushDirZ = dz >= 0 ? 1 : -1;
            this.player.position.z += pushDirZ * (overlapZ + 0.05);
            // Rebound backwards off pillar
            this.player.velocity.z = 0;
            this.player.speed = -this.player.speed * 0.35;
          }

          // Immediately sync Three.js mesh and AABB
          this.player.mesh.position.copy(this.player.position);
          this.player.box.setFromCenterAndSize(
            new THREE.Vector3(this.player.position.x, this.player.position.y + 0.95, this.player.position.z),
            new THREE.Vector3(this.player.width, this.player.height, this.player.length)
          );

          // Audio & Camera response
          this.audio?.playCrash(1.2);
          this.camera?.addTrauma(0.65);
          this.gameState.addScore(450, 'মেট্রোরেলের পিলারে মুখোমুখি ধাক্কা!');

          // Spawn cartoon accident burst
          const impactPoint = new THREE.Vector3(
            (playerPos.x + obsCenter.x) * 0.5,
            1.2,
            (playerPos.z + obsCenter.z) * 0.5
          );
          this.effects?.spawnAccidentBurst(impactPoint);

          // Pillar hit: rebound and speed reduction, but NO game over
          break;
        }
      }
    }
  }

  checkVehicleCollisions() {
    const pBox = this.player.box;

    for (const v of this.traffic.vehicles) {
      if (!v.hit && pBox.intersectsBox(v.box)) {
        v.hit = true;
        this.gameState.recordVehicleHit();

        const relativeSpeed = Math.abs(this.player.speed - v.speed);
        const impact = Math.min(2.0, 0.7 + relativeSpeed / 12);

        this.audio?.playCrash(impact);
        this.camera?.addTrauma(0.45 * impact);

        // Recoil pushback
        const pushDir = new THREE.Vector3().subVectors(this.player.position, v.mesh.position).normalize();
        pushDir.y = 0;
        this.player.applyRecoil(pushDir.multiplyScalar(15 * impact));

        // Comic accident burst
        const contactPoint = new THREE.Vector3().addVectors(this.player.position, v.mesh.position).multiplyScalar(0.5);
        this.effects?.spawnAccidentBurst(contactPoint);

        // Collision consequences: vehicle-only collision DOES NOT trigger pedestrian shouting
        if (v.type === 'bus' && this.player.speed > 17) {
          this.gameState.addScore(v.score, 'বিহঙ্গ বাসে সরাসরি ধাক্কা!');
          this.gameState.triggerGameOver('বিহঙ্গ বাসের সাথে মুখোমুখি সংঘর্ষে টমটম দুমড়ে-মুচড়ে গেছে!');
          return;
        } else {
          const label = v.type === 'bus' ? 'লোকাল বাসে ধাক্কা!' : (v.type === 'cng' ? 'সিএনজি অটোতে ধাক্কা!' : 'প্রাইভেট কারে ধাক্কা!');
          this.gameState.addScore(v.score, label);
        }
      }
    }
  }

  checkPedestrianCollisions() {
    const pBox = this.player.box;

    for (const p of this.traffic.pedestrians) {
      if (!p.hit && pBox.intersectsBox(p.box)) {
        p.hit = true;
        this.audio?.playCrash(0.65);
        this.camera?.addTrauma(0.35);
        this.gameState.addScore(p.score, 'পথচারী পাবলিক নকড ডাউন!');

        // Dramatic cartoon tumble / knockback
        p.mesh.position.x += (p.mesh.position.x > this.player.position.x ? 3.0 : -3.0);
        p.mesh.rotation.z = (Math.random() > 0.5 ? 0.7 : -0.7);

        const contactPoint = p.mesh.position.clone();
        this.effects?.spawnAccidentBurst(contactPoint);

        // Trigger comic pedestrian collision dialogue & crowd pursuit sequence
        if (this.pursuit && typeof this.pursuit.triggerPedestrianIncident === 'function') {
          this.pursuit.triggerPedestrianIncident(p);
        } else {
          this.triggerAccidentEvent('পাবলিক নকড ডাউন!', contactPoint);
        }
      }
    }
  }

  checkWorldPropCollisions() {
    const pBox = this.player.box;

    for (const prop of this.world.collidables) {
      if (!prop.hit && pBox.intersectsBox(prop.box)) {
        if (prop.type === 'stall') {
          prop.hit = true;
          this.gameState.recordStallHit();
          this.audio?.playCrash(0.9);
          this.camera?.addTrauma(0.5);
          this.gameState.addScore(prop.score, 'চায়ের টং ও কেটলি চূর্ণ!');

          // Visual tumble of tea stall
          if (prop.mesh) {
            prop.mesh.rotation.z = (Math.random() > 0.5 ? 0.45 : -0.45);
            prop.mesh.position.y = -0.2;
          }

          this.player.speed *= 0.4;
          const contactPoint = prop.mesh ? prop.mesh.position.clone() : this.player.position.clone();
          this.effects?.spawnAccidentBurst(contactPoint);
        } else if (prop.type === 'recharge') {
          prop.hit = true;
          this.gameState.rechargeBattery(100);
          this.audio?.playRecharge();
          this.gameState.addScore(prop.score, 'ড্রেন লাইন থেকে বিদ্যুৎ চুরি সফল!');
          if (prop.mesh) {
            prop.mesh.visible = false;
          }
        }
      }
    }
  }

  /**
   * Triggers non-graphic cartoon accident event:
   * Surprised Bengali exclamations and initiates crowd pursuit
   */
  triggerAccidentEvent(reason, location) {
    const now = Date.now();
    if (now - this.lastAccidentTime < this.accidentCooldown) return;
    this.lastAccidentTime = now;

    // Surprised Bengali exclamation
    const exclamations = [
      'আরে ভাই, দেখে চালান!',
      'ওই! কী করেন?',
      'সর্বনাশ করছে রে!',
      'রাস্তা কি আপনার বাপের?'
    ];
    const shout = exclamations[Math.floor(Math.random() * exclamations.length)];
    this.audio?.speakDialogue(shout, 'pedestrian');

    // Activate Bengali crowd pursuit!
    this.pursuit?.activatePursuit();
  }
}
