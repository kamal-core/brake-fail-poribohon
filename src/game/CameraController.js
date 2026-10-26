import * as THREE from 'three';

export class CameraController {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // PlayerVehicle

    this.modes = [
      { name: 'CHASE', offset: new THREE.Vector3(0, 4.25, -8.2), lookAhead: new THREE.Vector3(0, 1.40, 12.0) },
      { name: 'DRIVER', offset: new THREE.Vector3(0.35, 1.48, 0.73), lookAhead: new THREE.Vector3(0.05, 1.30, 10.0) },
      { name: 'WIDE', offset: new THREE.Vector3(0, 5.2, -10.5), lookAhead: new THREE.Vector3(0, 1.40, 13.5) }
    ];
    this.currentModeIndex = 0;

    this.offset = this.modes[0].offset.clone();
    this.lookAheadOffset = this.modes[0].lookAhead.clone();

    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    this.trauma = 0; // 0 to 1
    this.baseFov = 58;
    this.targetFov = 58;

    // Initialize camera position
    if (this.target) {
      this.currentPosition.copy(this.target.position).add(this.offset);
      this.currentLookAt.copy(this.target.position).add(this.lookAheadOffset);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  toggleCameraMode() {
    this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
    const mode = this.modes[this.currentModeIndex];
    this.offset.copy(mode.offset);
    this.lookAheadOffset.copy(mode.lookAhead);
    return mode.name;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt, isBoosting) {
    if (!this.target) return;

    // FOV kick on boost (subtle, natural transition)
    this.targetFov = isBoosting ? 68 : 58;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, dt * 5);
    this.camera.updateProjectionMatrix();

    const isChase = (this.modes[this.currentModeIndex].name === 'CHASE');
    const isWide = (this.modes[this.currentModeIndex].name === 'WIDE');
    const speedRatio = this.target.maxSpeed > 0 ? Math.min(1.2, Math.abs(this.target.speed) / this.target.maxSpeed) : 0;

    // Desired camera position in world space
    const targetPos = this.target.position.clone();

    if (isChase || isWide) {
      // Dynamic speed adjustments: pulls back and slightly up at higher speed to expand forward road visibility
      const speedDistance = speedRatio * 1.35;
      const speedHeight = speedRatio * 0.40;

      // Smooth centrifugal sway when player turns
      const turnSway = this.target.steerAngle * 0.95;

      targetPos.x += this.offset.x + turnSway;
      targetPos.y += this.offset.y + speedHeight;
      targetPos.z += this.offset.z - speedDistance;
    } else {
      // Driver cockpit mode: fixed relative offset
      targetPos.add(this.offset);
    }

    // Separate follow speeds for smooth lateral trailing and tight longitudinal tracking
    const followSpeedX = (isChase || isWide) ? 7.5 : 12;
    const followSpeedY = 9.5;
    const followSpeedZ = 12.0;

    this.currentPosition.x = THREE.MathUtils.lerp(this.currentPosition.x, targetPos.x, Math.min(1, dt * followSpeedX));
    this.currentPosition.y = THREE.MathUtils.lerp(this.currentPosition.y, targetPos.y, Math.min(1, dt * followSpeedY));
    this.currentPosition.z = THREE.MathUtils.lerp(this.currentPosition.z, targetPos.z, Math.min(1, dt * followSpeedZ));

    // Look-ahead target with dynamic corner anticipation
    const lookTarget = this.target.position.clone().add(this.lookAheadOffset);
    if (isChase || isWide) {
      // Look slightly into the turn for natural cornering feel
      lookTarget.x += this.target.steerAngle * 2.2;
    }

    this.currentLookAt.x = THREE.MathUtils.lerp(this.currentLookAt.x, lookTarget.x, Math.min(1, dt * 7.5));
    this.currentLookAt.y = THREE.MathUtils.lerp(this.currentLookAt.y, lookTarget.y, Math.min(1, dt * 9.5));
    this.currentLookAt.z = THREE.MathUtils.lerp(this.currentLookAt.z, lookTarget.z, Math.min(1, dt * 12.0));

    // Camera Trauma / Shake
    if (this.trauma > 0.001) {
      const shake = this.trauma * this.trauma; // quadratic
      const shakeX = (Math.random() * 2 - 1) * 0.45 * shake;
      const shakeY = (Math.random() * 2 - 1) * 0.45 * shake;
      const shakeZ = (Math.random() * 2 - 1) * 0.3 * shake;

      this.camera.position.set(
        this.currentPosition.x + shakeX,
        this.currentPosition.y + shakeY,
        this.currentPosition.z + shakeZ
      );

      this.trauma = Math.max(0, this.trauma - dt * 1.6);
    } else {
      this.camera.position.copy(this.currentPosition);
    }

    this.camera.lookAt(this.currentLookAt);
  }

  reset() {
    this.trauma = 0;
    if (this.target) {
      this.currentPosition.copy(this.target.position).add(this.offset);
      this.currentLookAt.copy(this.target.position).add(this.lookAheadOffset);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);
    }
  }
}
