import * as THREE from 'three';
import { createBusLiveryTexture, DHAKA_BUS_COMPANIES } from '../utils/TextureGenerator.js';
import { createRealisticPedestrian, animatePedestrianWalking } from './CharacterModelGenerator.js';
import { GLTFCharacterManager } from './GLTFCharacterManager.js';

export class TrafficManager {
  constructor(scene, world = null) {
    this.scene = scene;
    this.world = world;
    this.vehicles = [];
    this.pedestrians = [];
    this.maxVehicles = 12;
    this.maxPedestrians = 10;

    // Directional Traffic Lanes (Dhaka Two-Way Avenue)
    // Left side outbound lanes (+Z direction, matching player): -10.0, -6.5, -3.0
    // Left side outbound lanes (+Z direction, matching player): -14.5, -10.0, -5.5
    this.leftLanes = [5.5, 10.0, 14.5];
    // Right side inbound lanes (-Z direction, ONCOMING towards player): 5.5, 10.0, 14.5
    this.rightLanes = [-14.5, -10.0, -5.5];
    this.lanes = [...this.leftLanes, ...this.rightLanes];

    this.initMaterials();
    this.spawnInitialTraffic();
  }

  initMaterials() {
    this.busMaterials = DHAKA_BUS_COMPANIES.map(comp => new THREE.MeshStandardMaterial({
      map: createBusLiveryTexture(comp),
      roughness: 0.7
    }));
    this.busCompanyIndex = 0;
    this.busMat = this.busMaterials[0];

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

  setWorld(world) {
    this.world = world;
  }

  configureVehicleLaneAndDirection(v, lane) {
    v.lane = lane;
    v.mesh.position.x = lane;
    const isOutbound = lane > 0; // Left lanes travel forward with player (+Z)
    const baseSpeed = (v.type === 'bus') ? 12 : (v.type === 'cng' ? 14 : 17 + Math.random() * 4);
    if (isOutbound) {
      v.speed = baseSpeed;
      v.mesh.rotation.y = 0;
    } else {
      // Inbound oncoming traffic facing south (-Z)
      v.speed = -baseSpeed;
      v.mesh.rotation.y = Math.PI;
    }
  }

  spawnInitialTraffic() {
    for (let i = 0; i < this.maxVehicles; i++) {
      const type = (i % 4 === 0) ? 'bus' : (i % 3 === 0 ? 'cng' : 'car');
      const v = this.createVehicle(type);
      const lane = this.lanes[i % this.lanes.length];
      const z = 40 + i * 22 + Math.random() * 10;
      v.mesh.position.set(lane, 0, z);
      this.configureVehicleLaneAndDirection(v, lane);
      this.scene.add(v.mesh);
      this.vehicles.push(v);
    }

    for (let i = 0; i < this.maxPedestrians; i++) {
      const p = this.createPedestrian(i);
      const onLeft = (i % 2 === 0);
      const x = onLeft ? -21.5 - Math.random() * 1.5 : 21.5 + Math.random() * 1.5;
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
    let name = 'প্রাইভেট কার';

    if (type === 'bus') {
      width = 2.7;
      height = 3.2;
      length = 8.5;
      score = 1200;

      const comp = DHAKA_BUS_COMPANIES[this.busCompanyIndex % DHAKA_BUS_COMPANIES.length];
      name = comp.name;
      const curBusMat = this.busMaterials[this.busCompanyIndex % this.busMaterials.length];
      this.busCompanyIndex++;

      // Bus main body
      const bodyGeo = new THREE.BoxGeometry(width, height, length);
      const body = new THREE.Mesh(bodyGeo, curBusMat);
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
      name = comp.name;
    } else if (type === 'cng') {
      name = 'সিএনজি';
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
      name,
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

    const onLeft = (index % 2 === 0);
    const sidewalkX = onLeft ? -21.5 : 21.5;

    const pObj = {
      mesh: group,
      speed: 1.2 + Math.random() * 0.5,
      walkPhase: Math.random() * Math.PI * 2,
      sidewalkSide: onLeft ? 'left' : 'right',
      state: 'WALKING_SIDEWALK', // 'WALKING_SIDEWALK' | 'WAITING_ZEBRA' | 'CROSSING_ROAD'
      walkDirection: Math.random() > 0.5 ? 1 : -1,
      targetX: sidewalkX,
      targetZ: 0,
      waitTimer: 0,
      crossingZ: null,
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
        p.targetX = (p.mesh.position.x > 0 ? 22.0 : -22.0);
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
    // 1. Update Directional Two-Way Vehicles
    this.vehicles.forEach(v => {
      // Move along street
      v.mesh.position.z += v.speed * dt;

      // Update bounding box
      v.box.setFromCenterAndSize(
        new THREE.Vector3(v.mesh.position.x, v.mesh.position.y + v.height / 2, v.mesh.position.z),
        new THREE.Vector3(v.width, v.height, v.length)
      );

      // Two-Way Recycling
      if (v.speed > 0) {
        // Outbound lane traffic (+Z)
        if (v.mesh.position.z < playerZ - 35) {
          v.mesh.position.z = playerZ + 120 + Math.random() * 60;
          const lane = this.leftLanes[Math.floor(Math.random() * this.leftLanes.length)];
          this.configureVehicleLaneAndDirection(v, lane);
          v.hit = false;
        } else if (v.mesh.position.z > playerZ + 240) {
          v.mesh.position.z = playerZ + 60 + Math.random() * 40;
          v.hit = false;
        }
      } else {
        // Inbound oncoming traffic (-Z towards player)
        if (v.mesh.position.z < playerZ - 35) {
          // Passed behind player, respawn far ahead on oncoming right lanes
          v.mesh.position.z = playerZ + 150 + Math.random() * 70;
          const lane = this.rightLanes[Math.floor(Math.random() * this.rightLanes.length)];
          this.configureVehicleLaneAndDirection(v, lane);
          v.hit = false;
        } else if (v.mesh.position.z > playerZ + 260) {
          v.mesh.position.z = playerZ + 160 + Math.random() * 50;
          v.hit = false;
        }
      }
    });

    // 2. Update Pedestrians (Footpaths & Zebra Crossings Only)
    this.pedestrians.forEach(p => {
      if (p.controller && p.controller.update) {
        p.controller.update(dt, p.speed);
      }

      const currentX = p.mesh.position.x;
      const currentZ = p.mesh.position.z;

      if (p.state === 'WALKING_SIDEWALK') {
        // Walking strictly on sidewalk along Z
        const sidewalkX = p.sidewalkSide === 'left' ? 21.5 : -21.5;
        p.mesh.position.x = THREE.MathUtils.lerp(currentX, sidewalkX, dt * 4);
        p.mesh.position.z += p.walkDirection * p.speed * dt * 0.7;
        p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, p.walkDirection > 0 ? 0 : Math.PI, dt * 6);

        // Check if near a designated Zebra Crossing
        if (this.world && this.world.zebraCrossings && Math.random() < 0.08) {
          for (const zc of this.world.zebraCrossings) {
            if (Math.abs(currentZ - zc.z) < 2.2) {
              p.state = 'WAITING_ZEBRA';
              p.crossingZ = zc.z;
              p.waitTimer = 1.0 + Math.random() * 1.5;
              break;
            }
          }
        }
      } else if (p.state === 'WAITING_ZEBRA') {
        // At the curb waiting for oncoming traffic to clear
        p.waitTimer -= dt;
        p.mesh.position.z = THREE.MathUtils.lerp(currentZ, p.crossingZ, dt * 4);
        const curbX = p.sidewalkSide === 'left' ? 18.0 : -18.0;
        p.mesh.position.x = THREE.MathUtils.lerp(currentX, curbX, dt * 4);

        // Turn to look across the road
        const targetRot = p.sidewalkSide === 'left' ? -Math.PI / 2 : Math.PI / 2;
        p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, targetRot, dt * 6);

        if (p.waitTimer <= 0) {
          // Check safety: are vehicles or player within 20m?
          let isSafe = true;
          for (const v of this.vehicles) {
            if (Math.abs(v.mesh.position.z - p.crossingZ) < 22) {
              isSafe = false;
              break;
            }
          }
          if (Math.abs(playerZ - p.crossingZ) < 20) {
            isSafe = false;
          }

          if (isSafe) {
            p.state = 'CROSSING_ROAD';
            p.targetX = p.sidewalkSide === 'left' ? -21.5 : 21.5;
          } else {
            p.waitTimer = 0.8 + Math.random() * 0.8;
          }
        }
      } else if (p.state === 'CROSSING_ROAD') {
        // Walking straight across the road along the zebra stripes
        const dx = p.targetX - currentX;
        p.mesh.position.z = THREE.MathUtils.lerp(currentZ, p.crossingZ, dt * 4);

        if (Math.abs(dx) > 0.3) {
          const moveDir = Math.sign(dx);
          p.mesh.position.x += moveDir * p.speed * 1.35 * dt;
          p.mesh.rotation.y = moveDir > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          // Successfully crossed to the opposite sidewalk!
          p.sidewalkSide = p.sidewalkSide === 'left' ? 'right' : 'left';
          p.state = 'WALKING_SIDEWALK';
          p.walkDirection = Math.random() > 0.5 ? 1 : -1;
        }
      }

      p.box.setFromCenterAndSize(
        new THREE.Vector3(p.mesh.position.x, p.mesh.position.y + 0.85, p.mesh.position.z),
        new THREE.Vector3(0.65, 1.7, 0.65)
      );

      // Recycle pedestrian
      if (p.mesh.position.z < playerZ - 35) {
        p.mesh.position.z = playerZ + 120 + Math.random() * 60;
        const onLeft = Math.random() > 0.5;
        p.sidewalkSide = onLeft ? 'left' : 'right';
        p.mesh.position.x = onLeft ? 21.5 : -21.5;
        p.state = 'WALKING_SIDEWALK';
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
      this.configureVehicleLaneAndDirection(v, lane);
      v.hit = false;
    });

    this.pedestrians.forEach((p, i) => {
      const onLeft = (i % 2 === 0);
      p.sidewalkSide = onLeft ? 'left' : 'right';
      p.mesh.position.set(onLeft ? 21.5 : -21.5, 0, startZ + 30 + i * 22);
      p.state = 'WALKING_SIDEWALK';
      p.walkDirection = Math.random() > 0.5 ? 1 : -1;
      p.hit = false;
    });
  }
}
