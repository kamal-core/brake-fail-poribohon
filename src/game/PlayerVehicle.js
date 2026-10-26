import * as THREE from 'three';
import { createRickshawBackTexture } from '../utils/TextureGenerator.js';
import { createRealisticDriver } from './CharacterModelGenerator.js';
import { GLTFCharacterManager } from './GLTFCharacterManager.js';

export class PlayerVehicle {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // Physics parameters
    this.position = new THREE.Vector3(6.0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 0; // units/sec (1 unit ~= 1 meter)
    this.maxSpeed = 22; // ~80 km/h
    this.maxReverseSpeed = -7;
    this.acceleration = 18;
    this.braking = 28;
    this.friction = 7.5;
    this.turnSpeed = 2.4;
    this.steerAngle = 0;
    this.bodyRoll = 0;
    this.recoilVelocity = new THREE.Vector3();

    // Wheel references for rotation
    this.wheels = [];
    this.frontFork = null;
    this.brakeLights = [];
    this.tassels = [];

    // Driver Model References for Animation
    this.driverGroup = null;
    this.driverUpperBody = null;
    this.driverHead = null;
    this.leftArm = null;
    this.rightArm = null;
    this.isPanic = false; // Triggered during crowd pursuit

    // Collision box
    this.box = new THREE.Box3();
    this.width = 1.6;
    this.height = 1.9;
    this.length = 2.8;

    this.buildModel();
    this.scene.add(this.mesh);
  }

  buildModel() {
    const rickshaw = this.mesh;

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.8 });
    const bodyYellowMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4, metalness: 0.2 });
    const bodyRedMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.5 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7, roughness: 0.3 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x780000, roughness: 0.7 });
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfffae0, emissiveIntensity: 0.9 });
    const taillightMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0x660000, emissiveIntensity: 0.5 });

    // 1. Lower Chassis / Floorboard
    const floorGeo = new THREE.BoxGeometry(1.4, 0.15, 2.6);
    const floor = new THREE.Mesh(floorGeo, chassisMat);
    floor.position.set(0, 0.4, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    rickshaw.add(floor);

    // Front narrow extension for front wheel fork
    const frontFrameGeo = new THREE.BoxGeometry(0.5, 0.12, 1.0);
    const frontFrame = new THREE.Mesh(frontFrameGeo, chassisMat);
    frontFrame.position.set(0, 0.4, 1.6);
    rickshaw.add(frontFrame);

    // 2. Front Fork & Handlebar (Steerable Group)
    this.frontFork = new THREE.Group();
    this.frontFork.position.set(0, 0.4, 1.8);

    // Fork stem
    const forkStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const forkStem = new THREE.Mesh(forkStemGeo, chromeMat);
    forkStem.rotation.x = 0.2;
    forkStem.position.set(0, 0.35, 0);
    this.frontFork.add(forkStem);

    // Handlebar
    const handlebarGeo = new THREE.BoxGeometry(0.9, 0.04, 0.04);
    const handlebar = new THREE.Mesh(handlebarGeo, chromeMat);
    handlebar.position.set(0, 0.75, 0.08);
    this.frontFork.add(handlebar);

    // Grips
    const gripGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.15, 8);
    const leftGrip = new THREE.Mesh(gripGeo, tireMat);
    leftGrip.rotation.z = Math.PI / 2;
    leftGrip.position.set(-0.4, 0.75, 0.08);
    const rightGrip = leftGrip.clone();
    rightGrip.position.set(0.4, 0.75, 0.08);
    this.frontFork.add(leftGrip);
    this.frontFork.add(rightGrip);

    // Front Headlight mounted on fork
    const headlightGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.18, 12);
    const headlightMesh = new THREE.Mesh(headlightGeo, headlightMat);
    headlightMesh.rotation.x = Math.PI / 2;
    headlightMesh.position.set(0, 0.55, 0.2);
    this.frontFork.add(headlightMesh);

    // Front Wheel
    const frontWheel = this.createWheel(tireMat, rimMat, 0.32, 0.12);
    frontWheel.position.set(0, -0.08, 0);
    this.frontFork.add(frontWheel);
    this.wheels.push(frontWheel);

    rickshaw.add(this.frontFork);

    // 3. Rear Wheels (Left & Right)
    const rearWheelLeft = this.createWheel(tireMat, rimMat, 0.35, 0.15);
    rearWheelLeft.position.set(-0.76, 0.35, -0.7);
    rickshaw.add(rearWheelLeft);
    this.wheels.push(rearWheelLeft);

    const rearWheelRight = this.createWheel(tireMat, rimMat, 0.35, 0.15);
    rearWheelRight.position.set(0.76, 0.35, -0.7);
    rickshaw.add(rearWheelRight);
    this.wheels.push(rearWheelRight);

    // 4. Passenger Cabin & Seats
    // Driver seat positioned close to front fork handlebar
    const driverSeatGeo = new THREE.BoxGeometry(0.5, 0.18, 0.45);
    const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
    driverSeat.position.set(0, 0.65, 1.18);
    rickshaw.add(driverSeat);

    // Passenger rear bench seat
    const passengerBenchGeo = new THREE.BoxGeometry(1.25, 0.25, 0.6);
    const passengerBench = new THREE.Mesh(passengerBenchGeo, seatMat);
    passengerBench.position.set(0, 0.65, -0.6);
    rickshaw.add(passengerBench);

    // Low-profile passenger backrest to ensure clear driver visibility from behind!
    const passengerBackrestGeo = new THREE.BoxGeometry(1.25, 0.35, 0.12);
    const passengerBackrest = new THREE.Mesh(passengerBackrestGeo, seatMat);
    passengerBackrest.position.set(0, 0.88, -0.9);
    rickshaw.add(passengerBackrest);

    // 5. Build Recognizable Animated Bangladeshi Driver
    this.buildDriver(rickshaw);

    // 6. Cabin Roof & Metal Frame Pillars
    const roofPillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 8);
    const pillarPositions = [
      [-0.65, 1.15, 0.6], [0.65, 1.15, 0.6],
      [-0.65, 1.15, -0.9], [0.65, 1.15, -0.9]
    ];
    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(roofPillarGeo, chromeMat);
      pillar.position.set(...pos);
      rickshaw.add(pillar);
    });

    // Canopy Roof (Curved shape positioned with ample headroom)
    const roofGeo = new THREE.CylinderGeometry(0.78, 0.78, 2.2, 16, 1, false, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeo, bodyYellowMat);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 1.90, -0.15);
    roof.scale.set(1, 0.38, 1);
    rickshaw.add(roof);

    // Red roof border trim
    const roofBorderGeo = new THREE.BoxGeometry(1.45, 0.08, 2.25);
    const roofBorder = new THREE.Mesh(roofBorderGeo, bodyRedMat);
    roofBorder.position.set(0, 1.88, -0.15);
    rickshaw.add(roofBorder);

    // 7. Rear Rickshaw Art Plate ("বাপের রাস্তা")
    // Positioned cleanly on the lower tailgate so driver is visible above it!
    const rearPlateTexture = createRickshawBackTexture();
    const rearPlateGeo = new THREE.PlaneGeometry(1.28, 0.72);
    const rearPlateMat = new THREE.MeshBasicMaterial({
      map: rearPlateTexture,
      side: THREE.DoubleSide
    });
    const rearPlate = new THREE.Mesh(rearPlateGeo, rearPlateMat);
    rearPlate.position.set(0, 0.82, -1.02);
    rearPlate.rotation.y = Math.PI; // Face backwards towards camera
    rickshaw.add(rearPlate);

    // 8. Dangling tassels/pompoms underneath rear bumper
    const tasselColors = [0xd90429, 0xffb703, 0x008000, 0x3a86ff, 0x9b5de5];
    const tasselCount = 7;
    const startX = -0.55;
    const stepX = 1.1 / (tasselCount - 1);

    for (let i = 0; i < tasselCount; i++) {
      const tasselGroup = new THREE.Group();
      tasselGroup.position.set(startX + i * stepX, 0.38, -1.02);

      const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 4);
      const stringMesh = new THREE.Mesh(stringGeo, chromeMat);
      stringMesh.position.y = -0.08;
      tasselGroup.add(stringMesh);

      const pompomGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const pompomMat = new THREE.MeshStandardMaterial({
        color: tasselColors[i % tasselColors.length],
        roughness: 0.9
      });
      const pompom = new THREE.Mesh(pompomGeo, pompomMat);
      pompom.position.y = -0.18;
      tasselGroup.add(pompom);

      rickshaw.add(tasselGroup);
      this.tassels.push(tasselGroup);
    }

    // 9. Taillights (Red)
    const taillightGeo = new THREE.BoxGeometry(0.12, 0.08, 0.05);
    const leftTaillight = new THREE.Mesh(taillightGeo, taillightMat);
    leftTaillight.position.set(-0.6, 0.46, -1.02);
    const rightTaillight = leftTaillight.clone();
    rightTaillight.position.set(0.6, 0.46, -1.02);

    rickshaw.add(leftTaillight);
    rickshaw.add(rightTaillight);
    this.brakeLights.push(leftTaillight, rightTaillight);

    // 10. Headlight forward projection (PointLight)
    const headlampLight = new THREE.PointLight(0xfff3cc, 2.5, 25, 1.2);
    headlampLight.position.set(0, 0.95, 2.2);
    rickshaw.add(headlampLight);

    // Scale whole vehicle slightly for solid presence
    rickshaw.scale.set(1.1, 1.1, 1.1);
  }

  buildDriver(rickshaw) {
    this.driverContainer = new THREE.Group();
    rickshaw.add(this.driverContainer);

    // Initial procedural driver
    const fallbackDriver = createRealisticDriver();
    this.driverContainer.add(fallbackDriver.root);
    this.driverController = {
      update: (dt, speed, steerAngle, isPanic, bodyRoll) => {
        fallbackDriver.upperBody.rotation.z = steerAngle * 0.45;
        const pitchTarget = (speed > 0.5 ? -0.07 : 0);
        fallbackDriver.upperBody.rotation.x = THREE.MathUtils.lerp(fallbackDriver.upperBody.rotation.x, pitchTarget, dt * 8);
        fallbackDriver.head.rotation.y = isPanic ? Math.sin(Date.now() * 0.008) * 0.85 : steerAngle * 0.55;
      }
    };

    // When GLTF model is ready, replace seamlessly with high-poly rigged GLB model
    GLTFCharacterManager.onReady(() => {
      const gltfDriver = GLTFCharacterManager.createDriver();
      if (gltfDriver) {
        while (this.driverContainer.children.length > 0) {
          this.driverContainer.remove(this.driverContainer.children[0]);
        }
        this.driverContainer.add(gltfDriver.root);
        this.driverController = gltfDriver;
        if (typeof gltfDriver.setPleadingPose === 'function') {
          gltfDriver.setPleadingPose(this.isPanic);
        }
      }
    });
  }

  createWheel(tireMat, rimMat, radius, width) {
    const wheelGroup = new THREE.Group();

    // Tire
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Silver Rim
    const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width * 1.05, 12);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Center axle cap
    const capGeo = new THREE.SphereGeometry(radius * 0.25, 8, 8);
    const cap = new THREE.Mesh(capGeo, rimMat);
    wheelGroup.add(cap);

    return wheelGroup;
  }

  update(dt, input, gameState, audio) {
    if (gameState.state !== 'PLAYING') return;

    const isBoosting = input.isBoost && gameState.boostEnergy > 0;
    gameState.updateBoost(dt, input.isBoost);

    // Acceleration & Braking
    const topSpeed = isBoosting ? this.maxSpeed * 1.5 : this.maxSpeed;
    const accelRate = isBoosting ? this.acceleration * 1.7 : this.acceleration;

    if (input.isForward) {
      this.speed = Math.min(topSpeed, this.speed + accelRate * dt);
    } else if (input.isBackward) {
      if (this.speed > 0.5) {
        // Braking
        this.speed = Math.max(0, this.speed - this.braking * dt);
      } else {
        // Reverse
        this.speed = Math.max(this.maxReverseSpeed, this.speed - this.acceleration * 0.6 * dt);
      }
    } else {
      // Natural rolling friction
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.friction * dt);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.friction * dt);
      }
    }

    // Handbrake
    if (input.isHandbrake) {
      this.speed = Math.max(0, this.speed - this.braking * 1.8 * dt);
    }

    // Brake lights illumination
    const isBraking = (input.isBackward && this.speed > 0.5) || input.isHandbrake;
    this.brakeLights.forEach(light => {
      light.material.emissiveIntensity = isBraking ? 1.6 : 0.4;
    });

    // Steering logic (Right arrow / D turns right, Left arrow / A turns left)
    const steerAuthority = Math.min(1.0, Math.abs(this.speed) / 4.0);
    let targetSteer = 0;
    if (input.isLeft) targetSteer += 1;
    if (input.isRight) targetSteer -= 1;

    // Smooth steering interpolation
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer * 0.55, dt * 10);
    if (this.frontFork) {
      this.frontFork.rotation.y = this.steerAngle;
    }

    // Chassis body roll/tilt when cornering (rickshaw lean!)
    const targetRoll = -this.steerAngle * (this.speed / this.maxSpeed) * 0.28;
    this.bodyRoll = THREE.MathUtils.lerp(this.bodyRoll, targetRoll, dt * 8);

    // Apply rotation
    const turnDelta = this.steerAngle * this.turnSpeed * steerAuthority * (this.speed >= 0 ? 1 : -1) * dt;
    this.mesh.rotation.y += turnDelta;

    // Apply chassis lean
    this.mesh.rotation.z = this.bodyRoll;
    this.mesh.rotation.x = (input.isForward ? -0.025 : (isBraking ? 0.03 : 0));

    // Dynamic Driver Animations
    if (this.driverController && this.driverController.update) {
      this.driverController.update(dt, this.speed, this.steerAngle, this.isPanic, this.bodyRoll);
    }

    // Calculate forward vector
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
    this.velocity.copy(forward).multiplyScalar(this.speed);

    // Add collision recoil velocity with rapid decay
    this.velocity.add(this.recoilVelocity);
    this.recoilVelocity.multiplyScalar(Math.max(0, 1.0 - dt * 6));

    // Update position
    this.position.addScaledVector(this.velocity, dt);

    // Keep within road lateral boundaries
    this.position.x = THREE.MathUtils.clamp(this.position.x, -16.5, 16.5);
    this.mesh.position.copy(this.position);

    // Spin wheels
    const rollDelta = (this.speed * dt) / 0.35;
    this.wheels.forEach(w => {
      w.rotation.x += rollDelta;
    });

    // Sway tassels based on acceleration and steering
    const swayAngle = Math.sin(Date.now() * 0.008) * 0.2 + (this.speed / this.maxSpeed) * 0.4;
    this.tassels.forEach((tassel, idx) => {
      tassel.rotation.x = swayAngle + Math.sin(Date.now() * 0.01 + idx) * 0.1;
      tassel.rotation.z = -this.bodyRoll * 1.5;
    });

    // Update state & audio
    const speedKmh = Math.floor(Math.abs(this.speed) * 3.6);
    gameState.setSpeed(speedKmh);
    gameState.addDistance(Math.abs(this.speed) * dt);
    gameState.drainBattery(dt);

    if (audio) {
      audio.updateEngine(Math.abs(this.speed) / this.maxSpeed, isBoosting, isBraking);
    }

    // Update bounding box
    this.box.setFromCenterAndSize(
      new THREE.Vector3(this.position.x, this.position.y + 0.95, this.position.z),
      new THREE.Vector3(this.width, this.height, this.length)
    );
  }

  setPleading(pleading = true) {
    this.isPanic = !!pleading;
    if (this.driverController && typeof this.driverController.setPleadingPose === 'function') {
      this.driverController.setPleadingPose(pleading);
    }
  }

  applyRecoil(forceVector) {
    this.recoilVelocity.copy(forceVector);
    this.speed *= 0.35;
  }

  reset(x = 6.0, z = 0) {
    this.position.set(x, 0, z);
    this.velocity.set(0, 0, 0);
    this.recoilVelocity.set(0, 0, 0);
    this.speed = 0;
    this.steerAngle = 0;
    this.bodyRoll = 0;
    this.isPanic = false;
    this.setPleading(false);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
    if (this.driverUpperBody) {
      this.driverUpperBody.rotation.set(0, 0, 0);
    }
    if (this.driverHead) {
      this.driverHead.rotation.set(0, 0, 0);
    }
  }
}
