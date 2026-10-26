import * as THREE from 'three';
import { createBusLiveryTexture } from '../utils/TextureGenerator.js';
import { createRealisticPedestrian, animatePedestrianWalking } from './CharacterModelGenerator.js';
import { GLTFCharacterManager } from './GLTFCharacterManager.js';

export class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.pedestrians = [];
    this.maxVehicles = 12;
    this.maxPedestrians = 10;

    // Lanes (X positions)
    // Left side traffic lanes: -10.0 (slow), -6.5 (mid), -3.0 (fast)
    // Right side traffic lanes: 3.0 (fast), 6.5 (mid), 10.0 (slow)
    this.lanes = [-10.0, -6.5, -3.0, 3.0, 6.5, 10.0];

    this.initMaterials();
    this.spawnInitialTraffic();
  }

  initMaterials() {
    this.busTexture = createBusLiveryTexture('বিহঙ্গ পরিবহন');
    this.busMat = new THREE.MeshStandardMaterial({
      map: this.busTexture,
      roughness: 0.7
    });

    this.cngMat = new THREE.MeshStandardMaterial({
      color: 0x008000, // Vibrant CNG green
      roughness: 0.6
    });

    this.carColors = [0xffffff, 0x111111, 0x3a86ff, 0xffbe0b, 0xd00000, 0x6c757d];
    this.carMats = this.carColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.3 }));

    this.tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    this.glassMat = new THREE.MeshStandardMaterial({ color: 0x14213d, roughness: 0.2 });

    // Pedestrian attire
    this.lungiMats = [
      new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x457b9d, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.9 })
    ];
    this.shirtMats = [
      new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xa8dadc, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.8 })
    ];
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });
  }

  spawnInitialTraffic() {
    for (let i = 0; i < this.maxVehicles; i++) {
      const type = (i % 4 === 0) ? 'bus' : (i % 3 === 0 ? 'cng' : 'car');
      const v = this.createVehicle(type);
      const lane = this.lanes[i % this.lanes.length];
      const z = 40 + i * 22 + Math.random() * 10;
      v.mesh.position.set(lane, 0, z);
      v.lane = lane;
      v.speed = (type === 'bus') ? 12 : (type === 'cng' ? 14 : 17 + Math.random() * 4);
      this.scene.add(v.mesh);
      this.vehicles.push(v);
    }

    for (let i = 0; i < this.maxPedestrians; i++) {
      const p = this.createPedestrian(i);
      const onLeft = (i % 2 === 0);
      const x = onLeft ? -15.5 - Math.random() * 2 : 15.5 + Math.random() * 2;
      const z = 30 + i * 25 + Math.random() * 15;
      p.mesh.position.set(x, 0, z);
      p.targetX = x;
      this.scene.add(p.mesh);
      this.pedestrians.push(p);
    }
  }

  createVehicle(type) {
    const group = new THREE.Group();
    let width = 2.0;
    let height = 1.6;
    let length = 4.2;
    let score = 500;

    if (type === 'bus') {
      width = 2.7;
      height = 3.2;
      length = 8.5;
      score = 1200;

      // Bus main body
      const bodyGeo = new THREE.BoxGeometry(width, height, length);
      const body = new THREE.Mesh(bodyGeo, this.busMat);
      body.position.y = height / 2 + 0.4;
      body.castShadow = true;
      group.add(body);

      // Roof luggage rack with bags & sacks
      const rackGeo = new THREE.BoxGeometry(2.3, 0.4, 6.0);
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(0, height + 0.6, 0);
      group.add(rack);

      // Bus Wheels (6 wheels)
      const wheelPos = [
        [-1.3, 0.4, 2.5], [1.3, 0.4, 2.5],
        [-1.3, 0.4, -2.2], [1.3, 0.4, -2.2],
        [-1.3, 0.4, -3.2], [1.3, 0.4, -3.2]
      ];
      wheelPos.forEach(pos => {
        const wGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12);
        const w = new THREE.Mesh(wGeo, this.tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(...pos);
        group.add(w);
      });
    } else if (type === 'cng') {
      width = 1.6;
      height = 1.8;
      length = 2.9;
      score = 650;

      // Green CNG cabin
      const cngGeo = new THREE.BoxGeometry(width, 1.2, length);
      const cngBody = new THREE.Mesh(cngGeo, this.cngMat);
      cngBody.position.y = 1.0;
      cngBody.castShadow = true;
      group.add(cngBody);

      // Black canvas top
      const topGeo = new THREE.BoxGeometry(width * 0.95, 0.5, length * 0.85);
      const topMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(0, 1.7, -0.1);
      group.add(top);

      // Wheels
      const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12);
      const fWheel = new THREE.Mesh(wGeo, this.tireMat);
      fWheel.rotation.z = Math.PI / 2;
      fWheel.position.set(0, 0.32, 1.1);
      group.add(fWheel);

      const rWheelL = new THREE.Mesh(wGeo, this.tireMat);
      rWheelL.rotation.z = Math.PI / 2;
      rWheelL.position.set(-0.75, 0.32, -0.8);
      group.add(rWheelL);

      const rWheelR = rWheelL.clone();
      rWheelR.position.set(0.75, 0.32, -0.8);
      group.add(rWheelR);
    } else {
      // Private Car / Microbus
      width = 1.9;
      height = 1.5;
      length = 4.4;
      score = 500;

      const randomMat = this.carMats[Math.floor(Math.random() * this.carMats.length)];
      const carBaseGeo = new THREE.BoxGeometry(width, 0.75, length);
      const carBase = new THREE.Mesh(carBaseGeo, randomMat);
      carBase.position.y = 0.65;
      carBase.castShadow = true;
      group.add(carBase);

      // Cabin / Glass
      const cabinGeo = new THREE.BoxGeometry(width * 0.85, 0.65, length * 0.55);
      const cabin = new THREE.Mesh(cabinGeo, this.glassMat);
      cabin.position.set(0, 1.25, -0.2);
      group.add(cabin);

      // 4 Wheels
      const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      const wPos = [
        [-0.95, 0.35, 1.3], [0.95, 0.35, 1.3],
        [-0.95, 0.35, -1.3], [0.95, 0.35, -1.3]
      ];
      wPos.forEach(p => {
        const w = new THREE.Mesh(wGeo, this.tireMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(...p);
        group.add(w);
      });
    }

    const box = new THREE.Box3();
    return {
      type,
      mesh: group,
      width,
      height,
      length,
      score,
      speed: 15,
      lane: 0,
      box,
      hit: false
    };
  }

  createPedestrian(index = 0) {
    const group = new THREE.Group();
    const box = new THREE.Box3();

    const pObj = {
      mesh: group,
      speed: 1.2 + Math.random() * 0.6,
      walkPhase: Math.random() * Math.PI * 2,
      isCrossing: Math.random() > 0.6,
      targetX: 0,
      box,
      hit: false,
      score: 300,
      controller: null
    };

    const gltfPed = GLTFCharacterManager.createPedestrian(index);
    if (gltfPed) {
      group.add(gltfPed.root);
      pObj.controller = gltfPed;
    } else {
      const procPed = createRealisticPedestrian(index);
      group.add(procPed.mesh);
      pObj.controller = {
        update: (dt, speed) => animatePedestrianWalking(procPed, dt, speed)
      };

      GLTFCharacterManager.onReady(() => {
        const newGltf = GLTFCharacterManager.createPedestrian(index);
        if (newGltf) {
          while (group.children.length > 0) group.remove(group.children[0]);
          group.add(newGltf.root);
          pObj.controller = newGltf;
        }
      });
    }

    return pObj;
  }

  onHornBlown(playerZ) {
    // Pedestrians panic and run to sidewalks
    this.pedestrians.forEach(p => {
      if (Math.abs(p.mesh.position.z - playerZ) < 45) {
        p.speed = 4.5; // sprint
        p.targetX = (p.mesh.position.x > 0 ? 17.0 : -17.0);
      }
    });

    // Nearby AI vehicles swerve slightly
    this.vehicles.forEach(v => {
      if (v.mesh.position.z > playerZ && v.mesh.position.z < playerZ + 40) {
        v.mesh.position.x += (Math.random() > 0.5 ? 0.8 : -0.8);
      }
    });
  }

  update(dt, playerZ) {
    // Update vehicles
    this.vehicles.forEach(v => {
      // Move along street
      v.mesh.position.z += v.speed * dt;

      // Update bounding box
      v.box.setFromCenterAndSize(
        new THREE.Vector3(v.mesh.position.x, v.mesh.position.y + v.height / 2, v.mesh.position.z),
        new THREE.Vector3(v.width, v.height, v.length)
      );

      // Recycle if behind player or too far ahead
      if (v.mesh.position.z < playerZ - 35) {
        v.mesh.position.z = playerZ + 140 + Math.random() * 60;
        v.lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
        v.mesh.position.x = v.lane;
        v.hit = false;
      } else if (v.mesh.position.z > playerZ + 240) {
        v.mesh.position.z = playerZ + 70 + Math.random() * 40;
        v.hit = false;
      }
    });

    // Update pedestrians
    this.pedestrians.forEach(p => {
      // Natural skeletal walking animation with coordinated arm & leg swings
      if (p.controller && p.controller.update) {
        p.controller.update(dt, p.speed);
      }

      if (p.isCrossing) {
        // Move towards target X
        const dx = p.targetX - p.mesh.position.x;
        if (Math.abs(dx) > 0.2) {
          const moveDir = Math.sign(dx);
          p.mesh.position.x += moveDir * p.speed * dt;
          p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, moveDir > 0 ? Math.PI / 2 : -Math.PI / 2, dt * 6);
        } else {
          // Switch target side
          p.targetX = (p.mesh.position.x > 0 ? -15.5 : 15.5);
        }
      } else {
        // Strolling along sidewalk facing forward/backward
        p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, (p.mesh.position.x > 0 ? 0 : Math.PI), dt * 6);
        p.mesh.position.z += (p.mesh.position.x > 0 ? 1 : -1) * p.speed * dt * 0.4;
      }

      p.box.setFromCenterAndSize(
        new THREE.Vector3(p.mesh.position.x, p.mesh.position.y + 0.85, p.mesh.position.z),
        new THREE.Vector3(0.65, 1.7, 0.65)
      );

      // Recycle pedestrian
      if (p.mesh.position.z < playerZ - 30) {
        p.mesh.position.z = playerZ + 120 + Math.random() * 60;
        const onLeft = (Math.random() > 0.5);
        p.mesh.position.x = onLeft ? -15.5 : 15.5;
        p.targetX = onLeft ? 15.5 : -15.5;
        p.hit = false;
        p.mesh.rotation.z = 0;
        p.speed = 1.2 + Math.random() * 0.6;
      }
    });
  }

  reset(startZ = 0) {
    this.vehicles.forEach((v, i) => {
      const lane = this.lanes[i % this.lanes.length];
      v.mesh.position.set(lane, 0, startZ + 40 + i * 24);
      v.lane = lane;
      v.hit = false;
    });

    this.pedestrians.forEach((p, i) => {
      const onLeft = (i % 2 === 0);
      p.mesh.position.set(onLeft ? -15.5 : 15.5, 0, startZ + 30 + i * 22);
      p.hit = false;
    });
  }
}
