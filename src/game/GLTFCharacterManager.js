import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { getGamchaTexture, getTopiTexture } from './CharacterModelGenerator.js';

/**
 * GLTFCharacterManager.js
 * Loads and manages high-quality, realistic rigged 3D human character models (GLB/GLTF)
 * with authentic Bangladeshi Dhaka street styling, skeletal animation, and PBR shaders.
 */
class GLTFCharacterManagerClass {
  constructor() {
    this.loader = new GLTFLoader();
    this.loader.setMeshoptDecoder(MeshoptDecoder);
    this.loadedModels = {};
    this.isLoading = false;
    this.isReady = false;
    this.loadCallbacks = [];

    // Local model paths bundled in public/models
    this.modelUrls = {
      driver: './models/driver_male_rpm.glb',
      female: './models/pedestrian_female.glb',
      maleCasual: './models/driver_male_rpm.glb'
    };

    this.init();
  }

  async init() {
    this.isLoading = true;
    const promises = Object.entries(this.modelUrls).map(([key, url]) => {
      return new Promise((resolve) => {
        this.loader.load(
          url,
          (gltf) => {
            this.loadedModels[key] = gltf;
            resolve();
          },
          undefined,
          (err) => {
            console.warn(`[GLTFCharacterManager] Could not load ${url}:`, err);
            resolve();
          }
        );
      });
    });

    await Promise.all(promises);
    this.isLoading = false;
    this.isReady = true;

    // Trigger queued callbacks
    this.loadCallbacks.forEach((cb) => cb());
    this.loadCallbacks = [];
  }

  onReady(cb) {
    if (this.isReady) {
      cb();
    } else {
      this.loadCallbacks.push(cb);
    }
  }

  extractBones(root) {
    const bones = {};
    root.traverse((node) => {
      if (node.isBone && node.name) {
        const simpleName = node.name.replace(/^mixamorig:/, '');
        bones[simpleName] = node;
        bones[node.name] = node;
      }
    });
    return bones;
  }

  setupPBRMaterials(root) {
    root.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.roughness = Math.max(node.material.roughness || 0.6, 0.5);
          node.material.metalness = Math.min(node.material.metalness || 0.05, 0.1);
          node.material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Builds the realistic Bangladeshi rickshaw driver from driver_male_rpm.glb,
   * seated properly on the auto-rickshaw bench with hands holding the handlebars,
   * draped with red-and-white Dhaka Gamcha and white prayer cap.
   */
  createDriver() {
    const gltf = this.loadedModels.driver;
    if (!gltf) return null;

    const root = skeletonClone(gltf.scene);
    this.setupPBRMaterials(root);

    const bones = this.extractBones(root);

    // Scale to realistic driver proportions inside vehicle cockpit
    root.scale.set(0.95, 0.95, 0.95);
    // Position root so driver's hips sit firmly on seat cushion (y=0.65, z=1.18)
    // Hips bone is ~0.95m above root, so root.y = 0.65 - 0.95 = -0.30
    root.position.set(0, -0.30, 1.18);

    // Initial natural seated posture:
    // Thighs bent forward ~82 degrees
    if (bones.LeftUpLeg) {
      bones.LeftUpLeg.rotation.set(1.42, 0.08, -0.06);
    }
    if (bones.RightUpLeg) {
      bones.RightUpLeg.rotation.set(1.42, -0.08, 0.06);
    }

    // Knees bent down towards floorboard pedals
    if (bones.LeftLeg) {
      bones.LeftLeg.rotation.set(1.10, 0, 0);
    }
    if (bones.RightLeg) {
      bones.RightLeg.rotation.set(1.10, 0, 0);
    }

    // Feet resting flat on floorboard
    if (bones.LeftFoot) {
      bones.LeftFoot.rotation.set(-0.35, 0, 0);
    }
    if (bones.RightFoot) {
      bones.RightFoot.rotation.set(-0.35, 0, 0);
    }

    // Spine leaning slightly forward toward handlebars
    if (bones.Spine) {
      bones.Spine.rotation.set(0.18, 0, 0);
    }
    if (bones.Spine1) {
      bones.Spine1.rotation.set(0.08, 0, 0);
    }

    // Arms reaching forward with hands comfortably gripping handlebar grips:
    if (bones.LeftArm) {
      bones.LeftArm.rotation.set(0.00, -0.50, 1.25);
    }
    if (bones.LeftForeArm) {
      bones.LeftForeArm.rotation.set(0.25, -0.2, 0);
    }

    if (bones.RightArm) {
      bones.RightArm.rotation.set(0.00, 0.50, -1.25);
    }
    if (bones.RightForeArm) {
      bones.RightForeArm.rotation.set(0.25, 0.2, 0);
    }

    // Authentic Bangladeshi accessories:
    // 1. Red-and-White Checkered Gamcha (গামছা) draped naturally across left shoulder and chest
    const gamchaTex = getGamchaTexture();
    const gamchaMat = new THREE.MeshStandardMaterial({
      map: gamchaTex,
      roughness: 0.88
    });
    const gamchaGeo = new THREE.BoxGeometry(0.14, 0.44, 0.03);
    const gamcha = new THREE.Mesh(gamchaGeo, gamchaMat);
    gamcha.position.set(-0.15, 0.10, 0.10);
    gamcha.rotation.set(0.22, 0.05, 0.02);
    if (bones.Spine2 || bones.Spine1) {
      (bones.Spine2 || bones.Spine1).add(gamcha);
    } else {
      root.add(gamcha);
    }

    // 2. White Islamic Prayer Cap (জালি টুপি / Topi) attached snugly to Head bone
    if (bones.Head) {
      const topiTex = getTopiTexture();
      const topiMat = new THREE.MeshStandardMaterial({
        map: topiTex,
        roughness: 0.6
      });
      const topiGeo = new THREE.CylinderGeometry(0.102, 0.118, 0.075, 12);
      const topi = new THREE.Mesh(topiGeo, topiMat);
      topi.position.set(0, 0.13, 0.02);
      topi.rotation.set(0.12, 0, 0);
      bones.Head.add(topi);
    }

    let isPleading = false;

    return {
      root,
      bones,
      setPleadingPose(pleading) {
        isPleading = !!pleading;
      },
      update(dt, speed, steerAngle, isPanic, bodyRoll) {
        if (isPleading) {
          // Surrender / Pleading Pose: both hands raised up in terror beside head
          if (bones.LeftArm) bones.LeftArm.rotation.set(2.30, -0.70, -1.30);
          if (bones.RightArm) bones.RightArm.rotation.set(2.30, 0.70, 1.30);
          if (bones.LeftForeArm) bones.LeftForeArm.rotation.set(0.65, 0.35, 0);
          if (bones.RightForeArm) bones.RightForeArm.rotation.set(0.65, -0.35, 0);
          if (bones.Spine) bones.Spine.rotation.set(0.06, 0, 0);
          if (bones.Head) {
            // Trembling head looking up in comic fear
            bones.Head.rotation.y = Math.sin(Date.now() * 0.015) * 0.25;
            bones.Head.rotation.x = -0.22;
            bones.Head.rotation.z = 0;
          }
          return;
        }

        // --- NORMAL DRIVING POSE ---
        // Both hands firmly holding the handlebar grips with dynamic steering adjustment
        if (bones.LeftArm) {
          bones.LeftArm.rotation.set(0.00, -0.50 + steerAngle * 0.18, 1.25);
        }
        if (bones.RightArm) {
          bones.RightArm.rotation.set(0.00, 0.50 + steerAngle * 0.18, -1.25);
        }
        if (bones.LeftForeArm) {
          bones.LeftForeArm.rotation.set(0.25, -0.20, 0.00);
        }
        if (bones.RightForeArm) {
          bones.RightForeArm.rotation.set(0.25, 0.20, 0.00);
        }

        // Spine leans into turns naturally
        if (bones.Spine) {
          bones.Spine.rotation.z = -bodyRoll * 0.45;
          const accelPitch = (speed / 22) * 0.06;
          bones.Spine.rotation.x = 0.18 + accelPitch;
          bones.Spine.rotation.y = 0;
        }

        // Head turns naturally to look into the turn, or looks back in comedic panic
        if (bones.Head) {
          if (isPanic) {
            bones.Head.rotation.y = Math.sin(Date.now() * 0.008) * 0.85;
            bones.Head.rotation.x = 0.15;
            bones.Head.rotation.z = 0;
          } else {
            bones.Head.rotation.y = steerAngle * 0.40;
            bones.Head.rotation.x = -Math.abs(steerAngle) * 0.03;
            bones.Head.rotation.z = 0;
          }
        }
      }
    };
  }

  /**
   * Builds realistic pedestrians from authentic GLTF human models with skeletal walking.
   */
  createPedestrian(index = 0) {
    const keys = ['maleCasual', 'female'];
    const key = keys[index % keys.length];
    const gltf = this.loadedModels[key] || this.loadedModels.driver;
    if (!gltf) return null;

    const root = skeletonClone(gltf.scene);
    this.setupPBRMaterials(root);

    const bones = this.extractBones(root);

    const isFemale = key === 'female';
    const scale = isFemale ? 0.94 : (0.97 + (index % 3) * 0.03);
    root.scale.set(scale, scale, scale);

    return {
      root,
      bones,
      walkPhase: Math.random() * Math.PI * 2,
      baseHipsY: bones.Hips ? bones.Hips.position.y : 0,
      update(dt, speed = 1.4) {
        const stepCadence = (speed / 0.85) * Math.PI * 2;
        this.walkPhase = (this.walkPhase + dt * stepCadence) % (Math.PI * 2);
        const phase = this.walkPhase;

        // Thighs / UpLeg swing
        const legSwing = 0.36;
        if (bones.LeftUpLeg) bones.LeftUpLeg.rotation.x = Math.sin(phase) * legSwing;
        if (bones.RightUpLeg) bones.RightUpLeg.rotation.x = -Math.sin(phase) * legSwing;

        // Knee flexion (bends backwards during pickup)
        const leftKneeBend = Math.max(0, -Math.sin(phase)) * 0.55;
        const rightKneeBend = Math.max(0, Math.sin(phase)) * 0.55;
        if (bones.LeftLeg) bones.LeftLeg.rotation.x = leftKneeBend;
        if (bones.RightLeg) bones.RightLeg.rotation.x = rightKneeBend;

        // Feet leveling
        if (bones.LeftFoot) bones.LeftFoot.rotation.x = -leftKneeBend * 0.35;
        if (bones.RightFoot) bones.RightFoot.rotation.x = -rightKneeBend * 0.35;

        // Arm counter-swing (arms hanging naturally down along hips with forward/backward cadence)
        const armSwing = 0.22;
        if (bones.LeftArm) {
          bones.LeftArm.rotation.set(1.50, 0, -0.20 - Math.sin(phase) * armSwing);
        }
        if (bones.RightArm) {
          bones.RightArm.rotation.set(1.50, 0, 0.20 + Math.sin(phase) * armSwing);
        }

        // Slight natural elbow bend
        if (bones.LeftForeArm) bones.LeftForeArm.rotation.set(0.18 + leftKneeBend * 0.15, 0, 0);
        if (bones.RightForeArm) bones.RightForeArm.rotation.set(0.18 + rightKneeBend * 0.15, 0, 0);

        // Subtle pelvic vertical bounce and spine sway
        if (bones.Hips) {
          bones.Hips.position.y = this.baseHipsY + Math.abs(Math.sin(phase)) * 0.04;
        }
        if (bones.Spine) {
          bones.Spine.rotation.y = Math.sin(phase) * 0.06;
        }
      }
    };
  }

  /**
   * Builds an aggressive sprinting runner for the comic crowd pursuit mode.
   */
  createPursuitRunner(seed = 0) {
    const keys = ['maleCasual', 'female'];
    const key = keys[seed % keys.length];
    const gltf = this.loadedModels[key] || this.loadedModels.driver;
    if (!gltf) return null;

    const root = skeletonClone(gltf.scene);
    this.setupPBRMaterials(root);

    const bones = this.extractBones(root);
    root.scale.set(0.96, 0.96, 0.96);

    return {
      root,
      bones,
      runPhase: seed * 1.5,
      speed: 10.5 + (seed % 3) * 0.8,
      update(dt) {
        const stepCadence = (this.speed / 1.05) * Math.PI * 2;
        this.runPhase = (this.runPhase + dt * stepCadence) % (Math.PI * 2);
        const phase = this.runPhase;

        // Forward aggressive athletic sprint lean
        if (bones.Spine) {
          bones.Spine.rotation.x = 0.28;
        }

        // High knee lifts
        const runSwing = 0.85;
        if (bones.LeftUpLeg) bones.LeftUpLeg.rotation.x = Math.sin(phase) * runSwing;
        if (bones.RightUpLeg) bones.RightUpLeg.rotation.x = -Math.sin(phase) * runSwing;

        const leftLift = Math.max(0, -Math.sin(phase)) * 1.25;
        const rightLift = Math.max(0, Math.sin(phase)) * 1.25;
        if (bones.LeftLeg) bones.LeftLeg.rotation.x = leftLift;
        if (bones.RightLeg) bones.RightLeg.rotation.x = rightLift;

        // Powerful athletic arm pump with 90-degree bent elbows
        const armPump = 0.75;
        if (bones.LeftArm) {
          bones.LeftArm.rotation.set(1.40, 0, -0.25 - Math.sin(phase) * armPump);
        }
        if (bones.RightArm) {
          bones.RightArm.rotation.set(1.40, 0, 0.25 + Math.sin(phase) * armPump);
        }

        if (bones.LeftForeArm) bones.LeftForeArm.rotation.set(0.85, 0, 0);
        if (bones.RightForeArm) bones.RightForeArm.rotation.set(0.85, 0, 0);
      }
    };
  }
}

export const GLTFCharacterManager = new GLTFCharacterManagerClass();
