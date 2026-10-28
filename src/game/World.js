import * as THREE from 'three';
import {
  createRoadTexture,
  createCurbTexture,
  createSidewalkTexture,
  createMetroPosterTexture,
  createShopSignTexture,
  createRechargeMarkingTexture,
  createProtestBannerTexture,
  createDhakaDirectionalSignTexture,
  DHAKA_JUNCTION_SIGNS
} from '../utils/TextureGenerator.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.chunkLength = 120;
    this.chunkCount = 5;
    this.roadWidth = 36; // Spacious multi-lane Dhaka avenue (was 26)
    this.sidewalkWidth = 7.0; // Wide pedestrian footpath
    this.medianWidth = 4.0; // Central median with Metro pillars

    // Obstacles and interactive items for collision
    this.collidables = []; // stalls, carts, charging stations
    this.solidObstacles = []; // Solid pillars, buildings, hard boundaries
    this.zebraCrossings = []; // Designated pedestrian zebra crossings
    this.stuntRamps = []; // Thela Gari stunt jump ramps
    this.protestBlockades = []; // Street protest rallies / roadblocks

    // Shared materials & textures
    this.initSharedResources();

    // Setup Environment Lighting & Fog
    this.setupLighting();

    // Create Initial Chunks
    for (let i = 0; i < this.chunkCount; i++) {
      const chunk = this.createChunk(i * this.chunkLength, i);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  initSharedResources() {
    this.roadTexture = createRoadTexture();
    this.roadTexture.repeat.set(1, 4);

    this.curbTexture = createCurbTexture();
    this.sidewalkTexture = createSidewalkTexture();

    this.rechargeTexture = createRechargeMarkingTexture();

    // Poster textures
    this.posterTextures = [
      createMetroPosterTexture(0),
      createMetroPosterTexture(1)
    ];

    // Shop sign textures
    this.shopTextures = [
      createShopSignTexture('মা ফার্মেসি', 'ড্রাগ ও সার্জিক্যাল হাউস', '#d90429'),
      createShopSignTexture('ভাই ভাই টেলিকম', 'ফ্লেক্সিলোড ও মোবাইল সার্ভিস', '#0077b6'),
      createShopSignTexture('আল্লার দান বিরিয়ানি', 'কাচ্চি ও স্পেশাল মোরগ পোলাও', '#7209b7'),
      createShopSignTexture('জননী ইলেকট্রনিক্স', 'ব্যাটারি ও অটো পার্টস', '#2a9d8f'),
      createShopSignTexture('হাজী স্টোর', 'নিত্যপ্রয়োজনীয় পণ্য সামগ্রী', '#d4a373')
    ];

    // Shared Materials
    this.roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.85,
      metalness: 0.1
    });

    this.zebraMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    this.protestBannerTexture = createProtestBannerTexture();
    this.protestBannerMat = new THREE.MeshBasicMaterial({
      map: this.protestBannerTexture,
      side: THREE.DoubleSide
    });

    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x6f4e37,
      roughness: 0.8
    });

    this.curbMat = new THREE.MeshStandardMaterial({
      map: this.curbTexture,
      roughness: 0.7
    });

    this.sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.sidewalkTexture,
      roughness: 0.85
    });

    this.concreteMat = new THREE.MeshStandardMaterial({
      color: 0x9e9ea0,
      roughness: 0.9
    });

    this.grassMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.95
    });

    this.brickBuildingMat = new THREE.MeshStandardMaterial({
      color: 0xa04838, // Dhaka red brick
      roughness: 0.85
    });

    this.pastelBuildingMats = [
      new THREE.MeshStandardMaterial({ color: 0xe0d6c3, roughness: 0.9 }), // Beige
      new THREE.MeshStandardMaterial({ color: 0x90b8ad, roughness: 0.9 }), // Mint
      new THREE.MeshStandardMaterial({ color: 0xc89f9c, roughness: 0.9 }), // Dusty Rose
      new THREE.MeshStandardMaterial({ color: 0x7c90a0, roughness: 0.9 })  // Slate
    ];

    this.wireMat = new THREE.LineBasicMaterial({
      color: 0x111115,
      linewidth: 1.5
    });
  }

  setupLighting() {
    // Warm Dhaka sunlight & atmospheric golden haze
    this.scene.background = new THREE.Color(0xdad2bc);
    this.scene.fog = new THREE.FogExp2(0xdad2bc, 0.0065);

    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.95);
    this.scene.add(ambientLight);

    // Directional Sunlight (Dhaka afternoon sun)
    const sunLight = new THREE.DirectionalLight(0xfffae0, 1.6);
    sunLight.position.set(40, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    this.scene.add(sunLight);
    this.sunLight = sunLight;
  }

  createChunk(startZ, chunkIndex = 0) {
    const group = new THREE.Group();
    group.position.z = startZ;

    const chunkLength = this.chunkLength;
    const halfLen = chunkLength / 2;

    // 1. Asphalt Road Surface
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, chunkLength);
    const road = new THREE.Mesh(roadGeo, this.roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, halfLen);
    road.receiveShadow = true;
    group.add(road);

    // 2. Central Road Divider (Median)
    const medianGeo = new THREE.BoxGeometry(this.medianWidth, 0.35, chunkLength);
    const median = new THREE.Mesh(medianGeo, this.concreteMat);
    median.position.set(0, 0.175, halfLen);
    median.receiveShadow = true;
    group.add(median);

    // Curbs on both sides of median
    const medianCurbGeo = new THREE.BoxGeometry(0.3, 0.4, chunkLength);
    const leftMedCurb = new THREE.Mesh(medianCurbGeo, this.curbMat);
    leftMedCurb.position.set(-this.medianWidth / 2 + 0.15, 0.2, halfLen);
    const rightMedCurb = leftMedCurb.clone();
    rightMedCurb.position.set(this.medianWidth / 2 - 0.15, 0.2, halfLen);
    group.add(leftMedCurb);
    group.add(rightMedCurb);

    // 3. Metro Rail Viaduct Pillars & Overhead Tracks
    this.addMetroRail(group, chunkLength);

    // 4. Sidewalks & Curbs (Left & Right)
    this.addSidewalks(group, chunkLength);

    // 5. Buildings along roadside with shops & signs
    this.addBuildings(group, chunkLength);

    // 6. Tangled Overhead Electrical Wires & Poles
    this.addUtilityPolesAndWires(group, chunkLength);

    // 7. Roadside details: Tea Stalls (টং দোকান) & Charging Stations
    this.addRoadsideProps(group, chunkLength);

    // 8. Zebra Crossings (জেব্রা ক্রসিং)
    this.addZebraCrossings(group, chunkLength, startZ);

    // 9. Street Protest Event (আন্দোলন) & Thela Gari Stunt Ramp
    this.addProtestEventAndRamp(group, chunkLength, startZ, chunkIndex);

    // 10. Dhaka Highway & Intersection Directional Road Signs
    this.addDirectionalRoadSigns(group, chunkLength, startZ, chunkIndex);

    return {
      group,
      startZ,
      length: chunkLength
    };
  }

  addMetroRail(group, length) {
    const halfLen = length / 2;
    const pillarSpacing = 30;
    const pillarCount = Math.floor(length / pillarSpacing);

    // Overhead Metro Rail Track Bed (Viaduct)
    const trackBedGeo = new THREE.BoxGeometry(4.8, 1.2, length);
    const trackBed = new THREE.Mesh(trackBedGeo, this.concreteMat);
    trackBed.position.set(0, 8.5, halfLen);
    trackBed.castShadow = true;
    group.add(trackBed);

    // Track parapet walls
    const wallGeo = new THREE.BoxGeometry(0.35, 0.9, length);
    const leftWall = new THREE.Mesh(wallGeo, this.concreteMat);
    leftWall.position.set(-2.2, 9.4, halfLen);
    const rightWall = leftWall.clone();
    rightWall.position.set(2.2, 9.4, halfLen);
    group.add(leftWall);
    group.add(rightWall);

    // Pillars along the median
    for (let i = 0; i < pillarCount; i++) {
      const pZ = i * pillarSpacing + 15;

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(0, 0, pZ);

      // Main concrete column
      const colGeo = new THREE.BoxGeometry(2.2, 8.0, 2.2);
      const col = new THREE.Mesh(colGeo, this.concreteMat);
      col.position.y = 4.0;
      col.castShadow = true;
      col.receiveShadow = true;
      pillarGroup.add(col);

      // Hammerhead cap supporting the deck
      const capGeo = new THREE.BoxGeometry(4.6, 1.0, 2.8);
      const cap = new THREE.Mesh(capGeo, this.concreteMat);
      cap.position.y = 7.7;
      pillarGroup.add(cap);

      // Authentic Dhaka posters plastered on pillar faces!
      const posterTexture = this.posterTextures[i % this.posterTextures.length];
      const posterGeo = new THREE.PlaneGeometry(1.6, 3.2);
      const posterMat = new THREE.MeshBasicMaterial({ map: posterTexture });

      // Front poster (facing south)
      const frontPoster = new THREE.Mesh(posterGeo, posterMat);
      frontPoster.position.set(0, 3.8, -1.11);
      frontPoster.rotation.y = Math.PI;
      pillarGroup.add(frontPoster);

      // Back poster (facing north)
      const backPoster = new THREE.Mesh(posterGeo, posterMat);
      backPoster.position.set(0, 3.8, 1.11);
      pillarGroup.add(backPoster);

      group.add(pillarGroup);

      // Register solid collider for flyover pillar to prevent passing through
      const pillarCollider = {
        type: 'pillar',
        name: 'মেট্রোরেলের পিলার',
        x: 0,
        localZ: pZ,
        chunkGroup: group,
        width: 2.3,
        depth: 2.3,
        height: 8.0,
        box: new THREE.Box3()
      };
      pillarCollider.box.setFromCenterAndSize(
        new THREE.Vector3(0, 4.0, group.position.z + pZ),
        new THREE.Vector3(2.3, 8.0, 2.3)
      );
      this.solidObstacles.push(pillarCollider);

      // Low-poly green shrubs/bushes between pillars on median
      for (let b = -1; b <= 1; b += 2) {
        const bushGeo = new THREE.DodecahedronGeometry(0.7 + Math.random() * 0.4);
        const bush = new THREE.Mesh(bushGeo, this.grassMat);
        bush.position.set(0, 0.65, pZ + b * 6.5);
        bush.scale.set(1.1, 0.7, 1.1);
        group.add(bush);
      }
    }
  }

  addSidewalks(group, length) {
    const halfLen = length / 2;
    const roadHalf = this.roadWidth / 2;

    // Sidewalk mesh (left & right)
    const swGeo = new THREE.BoxGeometry(this.sidewalkWidth, 0.35, length);

    const leftSW = new THREE.Mesh(swGeo, this.sidewalkMat);
    leftSW.position.set(-roadHalf - this.sidewalkWidth / 2, 0.175, halfLen);
    leftSW.receiveShadow = true;
    group.add(leftSW);

    const rightSW = leftSW.clone();
    rightSW.position.set(roadHalf + this.sidewalkWidth / 2, 0.175, halfLen);
    group.add(rightSW);

    // Yellow-black curbs along sidewalk edge
    const curbGeo = new THREE.BoxGeometry(0.35, 0.4, length);

    const leftCurb = new THREE.Mesh(curbGeo, this.curbMat);
    leftCurb.position.set(-roadHalf - 0.175, 0.2, halfLen);
    group.add(leftCurb);

    const rightCurb = leftCurb.clone();
    rightCurb.position.set(roadHalf + 0.175, 0.2, halfLen);
    group.add(rightCurb);
  }

  addBuildings(group, length) {
    const roadEdge = this.roadWidth / 2 + this.sidewalkWidth;
    const bldgSpacing = 16;
    const count = Math.floor(length / bldgSpacing);

    for (let i = 0; i < count; i++) {
      const bldgZ = i * bldgSpacing + 8;

      // Left side building
      this.createBuilding(group, -roadEdge - 5.5, bldgZ, 1, i);

      // Right side building
      this.createBuilding(group, roadEdge + 5.5, bldgZ, -1, i + 3);
    }
  }

  createBuilding(group, x, z, sideSign, seed) {
    const floors = 3 + (seed % 4); // 3 to 6 stories
    const height = floors * 3.4;
    const width = 12 + (seed % 4) * 2;
    const depth = 14;

    const isBrick = (seed % 2 === 0);
    const mat = isBrick ? this.brickBuildingMat : this.pastelBuildingMats[seed % this.pastelBuildingMats.length];

    const bldgGeo = new THREE.BoxGeometry(depth, height, width);
    const bldg = new THREE.Mesh(bldgGeo, mat);
    bldg.position.set(x + (sideSign < 0 ? 3 : -3), height / 2, z);
    bldg.castShadow = true;
    bldg.receiveShadow = true;
    group.add(bldg);

    // Rooftop water tank (পানির ট্যাংক) - ubiquitous Dhaka detail
    const tankGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 8);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(x + (sideSign < 0 ? 2 : -2), height + 0.7, z - 2);
    group.add(tank);

    // Ground Floor Shopfront Signboard
    const shopTexture = this.shopTextures[seed % this.shopTextures.length];
    const signGeo = new THREE.PlaneGeometry(7.5, 1.8);
    const signMat = new THREE.MeshBasicMaterial({ map: shopTexture });
    const sign = new THREE.Mesh(signGeo, signMat);

    // Face toward the road
    sign.position.set(x + (sideSign > 0 ? depth/2 + 0.05 : -depth/2 - 0.05), 3.0, z);
    sign.rotation.y = (sideSign > 0 ? Math.PI / 2 : -Math.PI / 2);
    group.add(sign);
  }

  addUtilityPolesAndWires(group, length) {
    const roadEdge = this.roadWidth / 2 + 0.6;
    const poleSpacing = 35;
    const poleCount = Math.floor(length / poleSpacing);
    const polePositionsLeft = [];
    const polePositionsRight = [];

    const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 9.0, 8);
    const crossbarGeo = new THREE.BoxGeometry(0.15, 0.15, 2.0);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555558, roughness: 0.9 });

    for (let i = 0; i < poleCount; i++) {
      const pZ = i * poleSpacing + 12;

      // Left Pole
      const leftPole = new THREE.Mesh(poleGeo, poleMat);
      leftPole.position.set(-roadEdge, 4.5, pZ);
      leftPole.castShadow = true;
      group.add(leftPole);

      const leftBar = new THREE.Mesh(crossbarGeo, poleMat);
      leftBar.position.set(-roadEdge, 8.2, pZ);
      group.add(leftBar);
      polePositionsLeft.push(new THREE.Vector3(-roadEdge, 8.2, pZ));

      // Right Pole
      const rightPole = leftPole.clone();
      rightPole.position.set(roadEdge, 4.5, pZ);
      group.add(rightPole);

      const rightBar = leftBar.clone();
      rightBar.position.set(roadEdge, 8.2, pZ);
      group.add(rightBar);
      polePositionsRight.push(new THREE.Vector3(roadEdge, 8.2, pZ));
    }

    // Crisscrossing drooping electrical wires (CatmullRomCurve3)
    const addDroopingWire = (p1, p2) => {
      const midPoint = new THREE.Vector3(
        (p1.x + p2.x) / 2,
        Math.min(p1.y, p2.y) - 1.2 - Math.random() * 0.8, // Sagging curve
        (p1.z + p2.z) / 2
      );
      const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2]);
      const points = curve.getPoints(12);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wireLine = new THREE.Line(wireGeo, this.wireMat);
      group.add(wireLine);
    };

    for (let i = 0; i < polePositionsLeft.length - 1; i++) {
      addDroopingWire(polePositionsLeft[i], polePositionsLeft[i+1]);
      addDroopingWire(polePositionsRight[i], polePositionsRight[i+1]);

      // Cross-road hanging cables
      if (i % 2 === 0) {
        addDroopingWire(polePositionsLeft[i], polePositionsRight[i]);
      }
    }
  }

  addRoadsideProps(group, length) {
    const roadHalf = this.roadWidth / 2;

    // 1. Roadside Tea Stall (টং দোকান)
    const stallZ = length * 0.35;
    const stallX = -roadHalf - 3.5;

    const stallGroup = new THREE.Group();
    stallGroup.position.set(stallX, 0, stallZ);

    // Umbrella / Tarp (Conical canopy)
    const tarpGeo = new THREE.ConeGeometry(2.4, 1.2, 8);
    const tarpMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.8 }); // Red umbrella
    const tarp = new THREE.Mesh(tarpGeo, tarpMat);
    tarp.position.y = 2.4;
    stallGroup.add(tarp);

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6);
    const pole = new THREE.Mesh(poleGeo, this.concreteMat);
    pole.position.y = 1.25;
    stallGroup.add(pole);

    // Wooden tea counter & bench
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7f4f24, roughness: 0.8 });
    const counterGeo = new THREE.BoxGeometry(2.0, 0.8, 1.1);
    const counter = new THREE.Mesh(counterGeo, woodMat);
    counter.position.set(0, 0.4, 0);
    stallGroup.add(counter);

    // Tea kettle
    const kettleGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 8);
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(0.4, 0.95, 0);
    stallGroup.add(kettle);

    group.add(stallGroup);

    // Register stall for collision detection
    this.collidables.push({
      type: 'stall',
      name: 'টং দোকান',
      score: 750,
      box: new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(stallX, 1.2, group.position.z + stallZ),
        new THREE.Vector3(2.5, 2.4, 2.5)
      ),
      mesh: stallGroup,
      hit: false
    });

    // 2. Battery Recharge Zone ("ড্রেন লাইন চার্জিং পয়েন্ট")
    const chargeZ = length * 0.75;
    const chargeX = 14.5; // In left slow lane

    const chargeGeo = new THREE.PlaneGeometry(3.6, 5.0);
    const chargeMat = new THREE.MeshBasicMaterial({
      map: this.rechargeTexture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    const chargeMarking = new THREE.Mesh(chargeGeo, chargeMat);
    chargeMarking.rotation.x = -Math.PI / 2;
    chargeMarking.position.set(chargeX, 0.03, chargeZ);
    group.add(chargeMarking);

    // Register recharge pickup
    this.collidables.push({
      type: 'recharge',
      name: 'ড্রেন লাইন চার্জার',
      score: 250,
      box: new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(chargeX, 0.8, group.position.z + chargeZ),
        new THREE.Vector3(3.6, 1.6, 5.0)
      ),
      mesh: chargeMarking,
      hit: false
    });
  }

  /**
   * Adds painted white Zebra Crossings across the roadway
   */
  addZebraCrossings(group, length, startZ) {
    const zebraOffsets = [35, 95];
    const stripeWidth = 0.65;
    const stripeLength = 4.4;
    const stripeGap = 0.55;

    zebraOffsets.forEach(localZ => {
      const crossingGroup = new THREE.Group();
      crossingGroup.position.set(0, 0.02, localZ);

      // Left carriageway stripes (from x = -12.5 to -2.5)
      for (let x = -17.5; x <= -2.5; x += (stripeWidth + stripeGap)) {
        const sGeo = new THREE.PlaneGeometry(stripeWidth, stripeLength);
        const stripe = new THREE.Mesh(sGeo, this.zebraMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0, 0);
        crossingGroup.add(stripe);
      }

      // Right carriageway stripes (from x = 2.5 to 12.5)
      for (let x = 2.5; x <= 17.5; x += (stripeWidth + stripeGap)) {
        const sGeo = new THREE.PlaneGeometry(stripeWidth, stripeLength);
        const stripe = new THREE.Mesh(sGeo, this.zebraMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0, 0);
        crossingGroup.add(stripe);
      }

      group.add(crossingGroup);

      // Register zebra crossing zone
      this.zebraCrossings.push({
        chunkGroup: group,
        localZ,
        z: startZ + localZ,
        zMin: startZ + localZ - 2.5,
        zMax: startZ + localZ + 2.5,
        xMin: -13.0,
        xMax: 13.0
      });
    });
  }

  /**
   * Street Protest Blockade (আন্দোলন) & Angled Thela Gari Stunt Jump Ramp!
   */
  addProtestEventAndRamp(group, length, startZ, chunkIndex) {
    // Spawn protest event on alternate chunks
    if (chunkIndex % 2 !== 1) return;

    const protestZ = 75;
    const rampZ = 52; // 23 meters before protest blockade

    // --- A. THELA GARI (ঠেলাগাড়ি) STUNT RAMP ---
    // Placed in player's main left driving lane (x = -6.5)
    const rampGroup = new THREE.Group();
    rampGroup.position.set(10.0, 0, rampZ);

    // Tilted wooden ramp deck (tilted upward by ~18 degrees)
    const deckGeo = new THREE.BoxGeometry(2.5, 0.12, 4.2);
    const deck = new THREE.Mesh(deckGeo, this.woodMat);
    deck.position.set(0, 0.55, 0);
    deck.rotation.x = 0.32; // Incline ramp upward along +Z
    deck.castShadow = true;
    rampGroup.add(deck);

    // Wooden frame support legs
    const legGeo = new THREE.BoxGeometry(0.12, 1.1, 0.12);
    const legL = new THREE.Mesh(legGeo, this.woodMat);
    legL.position.set(-1.15, 0.55, 1.8);
    const legR = legL.clone();
    legR.position.set(1.15, 0.55, 1.8);
    rampGroup.add(legL);
    rampGroup.add(legR);

    // Two wooden spoked wheels on sides of the cart
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
    const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(-1.32, 0.5, 1.5);
    const wheelR = wheelL.clone();
    wheelR.position.set(1.32, 0.5, 1.5);
    rampGroup.add(wheelL);
    rampGroup.add(wheelR);

    // Push handles at the rear
    const handleGeo = new THREE.BoxGeometry(0.1, 0.1, 1.2);
    const handleL = new THREE.Mesh(handleGeo, this.woodMat);
    handleL.position.set(-0.9, 0.25, -2.4);
    const handleR = handleL.clone();
    handleR.position.set(0.9, 0.25, -2.4);
    rampGroup.add(handleL);
    rampGroup.add(handleR);

    group.add(rampGroup);

    // Register stunt ramp collider
    const rampCollider = {
      type: 'stunt_ramp',
      name: 'ঠেলাগাড়ি র‍্যাম্প',
      x: 10.0,
      localZ: rampZ,
      chunkGroup: group,
      width: 2.8,
      depth: 4.4,
      height: 1.2,
      jumpForce: 12.0,
      hit: false,
      box: new THREE.Box3()
    };
    rampCollider.box.setFromCenterAndSize(
      new THREE.Vector3(10.0, 0.6, startZ + rampZ),
      new THREE.Vector3(2.8, 1.2, 4.4)
    );
    this.stuntRamps.push(rampCollider);

    // --- B. PROTEST ROADBLOCK (রাস্তা অবরোধ ও আন্দোলন) ---
    const protestGroup = new THREE.Group();
    protestGroup.position.set(0, 0, protestZ);

    // Red banner strung across lanes: "দফা এক দাবি এক! রাস্তা বন্ধ!"
    const bannerGeo = new THREE.PlaneGeometry(24, 1.6);
    const banner = new THREE.Mesh(bannerGeo, this.protestBannerMat);
    banner.position.set(-2.0, 2.0, 0);
    banner.castShadow = true;
    protestGroup.add(banner);

    // Banner support tripods / poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const bPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2), poleMat);
    bPoleL.position.set(-15.2, 1.6, 0);
    const bPoleR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2), poleMat);
    bPoleR.position.set(11.2, 1.6, 0);
    protestGroup.add(bPoleL);
    protestGroup.add(bPoleR);

    // Demonstrators holding placards across roadway
    const protestorPositions = [-14.0, -11.5, -9.0, -6.5, -4.0, 4.0, 6.5, 9.0, 11.5, 14.0];
    const demonstratorMat = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.8 });
    const placardMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    protestorPositions.forEach((posX, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(posX, 0, (idx % 2 === 0 ? 0.4 : -0.4));

      // Demonstrator body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.6), demonstratorMat);
      body.position.y = 0.8;
      pGroup.add(body);

      // Placard stick & board
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4), poleMat);
      stick.position.set(0.2, 1.5, 0.1);
      pGroup.add(stick);

      const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), placardMat);
      signBoard.position.set(0.2, 2.1, 0.12);
      pGroup.add(signBoard);

      protestGroup.add(pGroup);
    });

    group.add(protestGroup);

    // Register protest hazard collider (lynch / arrest if hit on ground)
    const protestCollider = {
      type: 'protest_blockade',
      name: 'আন্দোলনের ব্যারিকেড',
      localZ: protestZ,
      chunkGroup: group,
      width: 28.0,
      depth: 2.8,
      height: 2.6,
      box: new THREE.Box3()
    };
    protestCollider.box.setFromCenterAndSize(
      new THREE.Vector3(-2.0, 1.3, startZ + protestZ),
      new THREE.Vector3(28.0, 2.6, 2.8)
    );
    this.protestBlockades.push(protestCollider);
  }


  /**
   * Roadside Highway & Intersection Directional Signs for Dhaka Locations (Placed strictly on the sidewalk roadside)
   */
  addDirectionalRoadSigns(group, length, startZ, chunkIndex) {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x495057, metalness: 0.7, roughness: 0.4 });
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.8, 10);
    const boardGeo = new THREE.PlaneGeometry(4.6, 2.3);
    const frameGeo = new THREE.BoxGeometry(4.7, 2.4, 0.08);

    // 1. First Roadside Sign: On the sidewalk curb (x = 19.2, z = 38)
    const signZ1 = 38;
    const signGroup1 = new THREE.Group();
    signGroup1.position.set(19.2, 0, signZ1);

    const pole1 = new THREE.Mesh(poleGeo, steelMat);
    pole1.position.y = 2.4;
    signGroup1.add(pole1);

    const signData1 = DHAKA_JUNCTION_SIGNS[chunkIndex % DHAKA_JUNCTION_SIGNS.length];
    const signTexture1 = createDhakaDirectionalSignTexture(signData1);
    const signMat1 = new THREE.MeshBasicMaterial({ map: signTexture1, side: THREE.DoubleSide });

    const board1 = new THREE.Mesh(boardGeo, signMat1);
    board1.position.set(0, 3.4, 0);
    board1.rotation.y = Math.PI; // Faces oncoming player driving along +Z
    signGroup1.add(board1);

    const frame1 = new THREE.Mesh(frameGeo, steelMat);
    frame1.position.set(0, 3.4, 0.04);
    signGroup1.add(frame1);

    group.add(signGroup1);

    // 2. Second Roadside Sign: Further down on the sidewalk curb (x = 19.2, z = 92)
    const signZ2 = 92;
    const signGroup2 = new THREE.Group();
    signGroup2.position.set(19.2, 0, signZ2);

    const pole2 = new THREE.Mesh(poleGeo, steelMat);
    pole2.position.y = 2.4;
    signGroup2.add(pole2);

    const signData2 = DHAKA_JUNCTION_SIGNS[(chunkIndex + 1) % DHAKA_JUNCTION_SIGNS.length];
    const signTexture2 = createDhakaDirectionalSignTexture(signData2);
    const signMat2 = new THREE.MeshBasicMaterial({ map: signTexture2, side: THREE.DoubleSide });

    const board2 = new THREE.Mesh(boardGeo, signMat2);
    board2.position.set(0, 3.4, 0);
    board2.rotation.y = Math.PI;
    signGroup2.add(board2);

    const frame2 = new THREE.Mesh(frameGeo, steelMat);
    frame2.position.set(0, 3.4, 0.04);
    signGroup2.add(frame2);

    group.add(signGroup2);
  }

  update(playerZ) {
    // Keep directional sunlight centered around player for consistent shadows
    if (this.sunLight) {
      this.sunLight.position.z = playerZ + 40;
      this.sunLight.target.position.set(0, 0, playerZ);
      this.sunLight.target.updateMatrixWorld();
    }

    // Road chunk recycling
    const recycleThreshold = playerZ - this.chunkLength * 1.2;

    this.chunks.forEach(chunk => {
      if (chunk.group.position.z + chunk.length < recycleThreshold) {
        // Find furthest chunk position
        let maxZ = 0;
        this.chunks.forEach(c => {
          if (c.group.position.z > maxZ) maxZ = c.group.position.z;
        });

        const newZ = maxZ + this.chunkLength;
        const deltaZ = newZ - chunk.group.position.z;
        chunk.group.position.z = newZ;

        // Reposition any associated collidables
        this.collidables.forEach(c => {
          if (c.mesh && chunk.group.children.includes(c.mesh)) {
            c.box.translate(new THREE.Vector3(0, 0, deltaZ));
            c.hit = false; // Reset hit state for reuse
            if (c.mesh.visible !== undefined) c.mesh.visible = true;
          }
        });

        // Reposition solid flyover pillars belonging to this chunk
        this.solidObstacles.forEach(so => {
          if (so.chunkGroup === chunk.group) {
            so.box.translate(new THREE.Vector3(0, 0, deltaZ));
          }
        });

        // Reposition zebra crossings
        this.zebraCrossings.forEach(zc => {
          if (zc.chunkGroup === chunk.group) {
            zc.z += deltaZ;
            zc.zMin += deltaZ;
            zc.zMax += deltaZ;
          }
        });

        // Reposition stunt ramps
        this.stuntRamps.forEach(sr => {
          if (sr.chunkGroup === chunk.group) {
            sr.box.translate(new THREE.Vector3(0, 0, deltaZ));
            sr.hit = false;
          }
        });

        // Reposition protest blockades
        this.protestBlockades.forEach(pb => {
          if (pb.chunkGroup === chunk.group) {
            pb.box.translate(new THREE.Vector3(0, 0, deltaZ));
          }
        });
      }
    });
  }

  reset() {
    this.chunks.forEach((chunk, index) => {
      chunk.group.position.z = index * this.chunkLength;
    });
    this.collidables.forEach(c => {
      c.hit = false;
      if (c.mesh.visible !== undefined) c.mesh.visible = true;
    });
    this.solidObstacles.forEach(so => {
      const z = so.chunkGroup.position.z + so.localZ;
      so.box.setFromCenterAndSize(
        new THREE.Vector3(so.x, 4.0, z),
        new THREE.Vector3(so.width, so.height, so.depth)
      );
    });
    this.zebraCrossings.forEach(zc => {
      const z = zc.chunkGroup.position.z + zc.localZ;
      zc.z = z;
      zc.zMin = z - 2.5;
      zc.zMax = z + 2.5;
    });
    this.stuntRamps.forEach(sr => {
      sr.hit = false;
      const z = sr.chunkGroup.position.z + sr.localZ;
      sr.box.setFromCenterAndSize(
        new THREE.Vector3(-10.0, 0.6, z),
        new THREE.Vector3(sr.width, sr.height, sr.depth)
      );
    });
    this.protestBlockades.forEach(pb => {
      const z = pb.chunkGroup.position.z + pb.localZ;
      pb.box.setFromCenterAndSize(
        new THREE.Vector3(-2.0, 1.3, z),
        new THREE.Vector3(pb.width, pb.height, pb.depth)
      );
    });
  }
}
