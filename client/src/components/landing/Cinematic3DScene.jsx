import { useEffect, useRef } from "react";
import * as THREE from "three";
import useTheme from "../../hooks/useTheme";

/**
 * Cinematic3DScene — Premium Minimal 3D Landing Experience
 *
 * A restrained, architectural 3D scene driven by scroll depth (0.0 → 1.0).
 * Two elegant, minimal cylindrical/capsule 3D forms represent two people exchanging knowledge
 * across 5 stages:
 *   DISCOVER → MATCH → EXCHANGE → LEARN → GROW
 *
 * Avatars:
 * - Minimal, abstract cylindrical forms with subtle head/upper-body separation.
 * - Smooth bevels, matte PBR materials, and subtle inner core luminescence.
 * - Proportional & chromatic differentiation:
 *   - Person A: Sleek deep-slate capsule with emerald accent ring & inner glow.
 *   - Person B: Warm graphite capsule with warm gold accent ring & inner glow.
 * - No facial features, limbs, or literal anatomy — pure product-design sculpture.
 *
 * Choreography:
 * - Subtle floating motion, gentle axial rotation, and soft contact shadows.
 * - Stage-driven approach, luminous connection arc, and cubic Bezier skill flight.
 * - Camera choreography with responsive viewport awareness.
 */
export default function Cinematic3DScene({ scrollProgressRef, onSkillHover }) {
  const mountRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ──────────────────────────────────────────────
    // 0. RESPONSIVE DETECTION
    // ──────────────────────────────────────────────
    let isMobile = container.clientWidth < 768;
    let isTablet = container.clientWidth >= 768 && container.clientWidth < 1024;

    // ──────────────────────────────────────────────
    // 1. SCENE, CAMERA, RENDERER
    // ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x0a0d0b : 0xf3f2ec, isMobile ? 0.04 : 0.028);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 50 : isTablet ? 44 : 40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.3, 6.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.12 : 1.02;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ──────────────────────────────────────────────
    // 2. STUDIO LIGHTING — Restrained & Cinematic
    // ──────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1a2420 : 0xf0ede4,
      isDark ? 1.6 : 2.0
    );
    scene.add(ambientLight);

    // Key light — warm directional from upper-right
    const keyLight = new THREE.DirectionalLight(
      isDark ? 0xe8e4d8 : 0xfaf8f0,
      isDark ? 2.6 : 2.2
    );
    keyLight.position.set(4, 6, 5);
    if (!isMobile) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.radius = 4;
      keyLight.shadow.bias = -0.001;
    }
    scene.add(keyLight);

    // Fill light — cool-toned emerald from left
    const fillLight = new THREE.DirectionalLight(
      isDark ? 0x3fa873 : 0x1b4332,
      isDark ? 0.65 : 0.45
    );
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);

    // Center compatibility glow
    const centerGlow = new THREE.PointLight(
      isDark ? 0x3fa873 : 0x2d6a4f,
      0, 8, 2
    );
    centerGlow.position.set(0, 0, 1);
    scene.add(centerGlow);

    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(
      isDark ? 0x2a3e30 : 0xd8d4c8,
      isDark ? 0.8 : 0.5
    );
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    // ──────────────────────────────────────────────
    // 3. MINIMAL ABSTRACT CYLINDRICAL AVATARS
    //    Pure architectural forms: sleek body capsule + accent ring + head dome
    // ──────────────────────────────────────────────
    const buildAbstractCylindricalAvatar = (isPersonA) => {
      const rootGroup = new THREE.Group();

      // Palette definition
      const bodyColor = isPersonA
        ? (isDark ? 0x22272a : 0x3a3f44) // Deep slate
        : (isDark ? 0x2a2724 : 0x443f3b); // Warm graphite

      const ringColor = isPersonA
        ? (isDark ? 0x3fa873 : 0x1b4332) // Emerald
        : (isDark ? 0xd4af37 : 0x9c7a20); // Warm gold

      const coreEmissive = isPersonA
        ? (isDark ? 0x1a4030 : 0x0d2818)
        : (isDark ? 0x5a4a08 : 0x3a3010);

      // Materials
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.72,
        metalness: 0.12,
      });

      const ringMat = new THREE.MeshStandardMaterial({
        color: ringColor,
        roughness: 0.35,
        metalness: 0.65,
      });

      const coreMat = new THREE.MeshStandardMaterial({
        color: ringColor,
        roughness: 0.45,
        metalness: 0.15,
        emissive: coreEmissive,
        emissiveIntensity: 0.6,
      });

      // Dimensions & proportions
      const bodyRadius = isPersonA ? 0.155 : 0.170;
      const bodyLength = isPersonA ? 0.52 : 0.46;
      const headRadius = isPersonA ? 0.125 : 0.135;

      // ── Main Body Capsule ──
      const bodyGeom = new THREE.CapsuleGeometry(bodyRadius, bodyLength, 16, 32);
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.y = 0.05;
      bodyMesh.castShadow = !isMobile;
      bodyMesh.receiveShadow = true;
      rootGroup.add(bodyMesh);

      // ── Separation Accent Ring ──
      const ringY = 0.05 + bodyLength / 2 + 0.02;
      const ringGeom = new THREE.CylinderGeometry(bodyRadius * 1.03, bodyRadius * 1.03, 0.022, 32);
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.y = ringY;
      ringMesh.castShadow = !isMobile;
      rootGroup.add(ringMesh);

      // ── Upper Head Dome / Capsule ──
      const headY = ringY + headRadius + 0.015;
      const headGeom = new THREE.SphereGeometry(headRadius, 32, 24);
      headGeom.scale(1.0, 1.08, 1.0);
      const headMesh = new THREE.Mesh(headGeom, bodyMat);
      headMesh.position.y = headY;
      headMesh.castShadow = !isMobile;
      rootGroup.add(headMesh);

      // ── Inner Luminous Core Sphere ──
      const coreGeom = new THREE.SphereGeometry(0.065, 16, 16);
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      coreMesh.position.y = 0.12;
      rootGroup.add(coreMesh);

      // ── Soft Contact Shadow Disc directly at base ──
      const shadowDiscGeom = new THREE.CircleGeometry(bodyRadius * 1.5, 24);
      const shadowDiscMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: isDark ? 0.35 : 0.20,
      });
      const shadowDisc = new THREE.Mesh(shadowDiscGeom, shadowDiscMat);
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = -0.32;
      rootGroup.add(shadowDisc);

      return {
        group: rootGroup,
        bodyMesh,
        headMesh,
        coreMesh,
        coreMat,
        isPersonA,
      };
    };

    const personA = buildAbstractCylindricalAvatar(true);
    const personB = buildAbstractCylindricalAvatar(false);

    const personAGroup = personA.group;
    const personBGroup = personB.group;
    scene.add(personAGroup);
    scene.add(personBGroup);

    // ──────────────────────────────────────────────
    // 4. SKILL CAPSULES — Frosted Minimal Tokens
    // ──────────────────────────────────────────────
    const skillCapsuleGeom = new THREE.BoxGeometry(0.48, 0.14, 0.08, 2, 2, 2);
    const posAttr = skillCapsuleGeom.getAttribute("position");
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const bevelFactor = 0.02;
      const sx = Math.sign(x) * Math.max(0, Math.abs(x) - bevelFactor * (Math.abs(y) / 0.07 + Math.abs(z) / 0.04) * 0.3);
      posAttr.setX(i, sx);
    }
    posAttr.needsUpdate = true;
    skillCapsuleGeom.computeVertexNormals();

    const skillCapsuleMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x2a3028 : 0xeceae4,
      roughness: 0.45,
      metalness: 0.05,
      transmission: isDark ? 0.15 : 0.08,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.3,
      clearcoatRoughness: 0.6,
    });

    const connectionLineMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      transparent: true,
      opacity: 0,
    });

    const createSkillLabel = (text) => {
      const canvas = document.createElement("canvas");
      canvas.width = 192;
      canvas.height = 56;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 192, 56);
      ctx.fillStyle = isDark ? "rgba(240,238,230,0.92)" : "rgba(22,22,15,0.88)";
      ctx.font = "500 15px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 96, 28);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    };

    const allSkillConfigs = [
      { id: "react", name: "React", owner: "A", angle: -0.3, radius: 0.85, height: 0.35, isExchanging: true, destination: "B" },
      { id: "python", name: "Python", owner: "A", angle: 0.8, radius: 0.95, height: -0.1, mobileHidden: true },
      { id: "nodejs", name: "Node.js", owner: "A", angle: 1.9, radius: 0.75, height: 0.55 },
      { id: "figma", name: "Figma", owner: "B", angle: Math.PI + 0.3, radius: 0.85, height: 0.3, isExchanging: true, destination: "A" },
      { id: "javascript", name: "JavaScript", owner: "B", angle: Math.PI - 0.7, radius: 0.9, height: -0.05, mobileHidden: true },
      { id: "uiux", name: "UI/UX", owner: "B", angle: Math.PI - 1.8, radius: 0.8, height: 0.5 },
    ];

    const skillConfigs = isMobile
      ? allSkillConfigs.filter((cfg) => !cfg.mobileHidden)
      : allSkillConfigs;

    const skillObjects = [];
    const interactiveMeshes = [];

    skillConfigs.forEach((cfg) => {
      const group = new THREE.Group();
      const mat = skillCapsuleMat.clone();
      const mesh = new THREE.Mesh(skillCapsuleGeom, mat);
      mesh.castShadow = !isMobile;
      mesh.userData = { skillId: cfg.id, skillName: cfg.name };
      group.add(mesh);
      interactiveMeshes.push(mesh);

      const labelTexture = createSkillLabel(cfg.name);
      const spriteMat = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.55, 0.16, 1);
      sprite.position.y = 0.14;
      group.add(sprite);

      scene.add(group);
      skillObjects.push({
        ...cfg,
        group,
        mesh,
        material: mat,
        sprite,
        baseAngle: cfg.angle,
        baseRadius: isMobile ? cfg.radius * 0.7 : cfg.radius,
        baseHeight: cfg.height,
      });
    });

    // ──────────────────────────────────────────────
    // 5. CONNECTION ARC & PARTICLE TRAIL
    // ──────────────────────────────────────────────
    const arcSegments = isMobile ? 32 : 48;
    const arcPositions = new Float32Array(arcSegments * 3);
    const arcGeom = new THREE.BufferGeometry();
    arcGeom.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3));
    const connectionArc = new THREE.Line(arcGeom, connectionLineMat);
    scene.add(connectionArc);

    const trailCount = 16;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailGeom = new THREE.BufferGeometry();
    trailGeom.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      size: isDark ? 0.04 : 0.035,
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
    });
    const trailParticles = new THREE.Points(trailGeom, trailMat);
    scene.add(trailParticles);

    // ──────────────────────────────────────────────
    // 6. AMBIENT PARTICLES & DEPTH LAYERS
    // ──────────────────────────────────────────────
    const dustCount = isMobile ? 12 : 25;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      size: 0.02,
      transparent: true,
      opacity: isDark ? 0.25 : 0.15,
    });
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // Background spheres
    const bgNodeCount = isMobile ? 4 : 8;
    const bgNodeGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const bgNodeMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e2420 : 0xd8d5cc,
      roughness: 0.9,
      metalness: 0.02,
      transparent: true,
      opacity: 0.35,
    });
    for (let i = 0; i < bgNodeCount; i++) {
      const bgNode = new THREE.Mesh(bgNodeGeom, bgNodeMat);
      const angle = (i / bgNodeCount) * Math.PI * 2;
      const r = 4.5 + Math.random() * 2;
      bgNode.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 3,
        -3 - Math.random() * 4
      );
      bgNode.scale.setScalar(0.5 + Math.random() * 1.0);
      scene.add(bgNode);
    }

    // Foreground motes (desktop)
    if (!isMobile) {
      const fgMoteCount = 5;
      const fgMoteGeom = new THREE.SphereGeometry(0.015, 6, 6);
      const fgMoteMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x3fa873 : 0x1b4332,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.2,
      });
      for (let i = 0; i < fgMoteCount; i++) {
        const mote = new THREE.Mesh(fgMoteGeom, fgMoteMat);
        mote.position.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 3,
          2 + Math.random() * 2
        );
        scene.add(mote);
      }
    }

    // ──────────────────────────────────────────────
    // 7. GROW — Community Constellation
    // ──────────────────────────────────────────────
    const communityCount = isMobile ? 8 : 12;
    const communityNodeGeom = new THREE.SphereGeometry(0.06, 12, 12);
    const communityNodes = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < communityCount; i++) {
      const theta = goldenAngle * i;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / communityCount);
      const radius = (isMobile ? 2.0 : 2.6) + (i % 3) * (isMobile ? 0.4 : 0.6);
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.cos(phi) * 0.7;
      const z = radius * Math.sin(theta) * Math.sin(phi) * 0.5;

      const nodeMat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? (isDark ? 0x3fa873 : 0x1b4332) : (isDark ? 0x4a4840 : 0x9a9688),
        roughness: 0.7,
        metalness: 0.1,
        emissive: i % 3 === 0 ? (isDark ? 0x1a3020 : 0x0d1810) : 0x000000,
        emissiveIntensity: 0.3,
      });
      const nodeMesh = new THREE.Mesh(communityNodeGeom, nodeMat);
      nodeMesh.scale.set(0, 0, 0);
      scene.add(nodeMesh);
      communityNodes.push({ mesh: nodeMesh, target: new THREE.Vector3(x, y, z) });
    }

    // Community connection lines
    const communityLineCount = communityCount * 2;
    const communityLinePos = new Float32Array(communityLineCount * 6);
    const communityLineGeom = new THREE.BufferGeometry();
    communityLineGeom.setAttribute("position", new THREE.BufferAttribute(communityLinePos, 3));
    const communityLineMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      transparent: true,
      opacity: 0,
    });
    const communityLines = new THREE.LineSegments(communityLineGeom, communityLineMat);
    scene.add(communityLines);

    // Collaboration pulse ring (Learn stage)
    const pulseGeom = new THREE.RingGeometry(0.01, 0.35, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(pulseGeom, pulseMat);
    pulseRing.rotation.y = Math.PI / 2;
    scene.add(pulseRing);

    // Ground shadow plane
    const groundGeom = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: isDark ? 0.20 : 0.10 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.65;
    ground.receiveShadow = true;
    scene.add(ground);

    // ──────────────────────────────────────────────
    // 8. RAYCASTING (Desktop only)
    // ──────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    let hoveredMesh = null;

    const handlePointerMove = (e) => {
      if (isMobile) return;
      const rect = container.getBoundingClientRect();
      targetMouse.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // ──────────────────────────────────────────────
    // 9. ANIMATION LOOP
    // ──────────────────────────────────────────────
    let currentProgress = 0;
    const clock = new THREE.Clock();
    let animId;

    const desktopSep = { wide: 2.6, close: 0.90, settle: 0.70, grow: 0.80 };
    const mobileSep  = { wide: 1.4, close: 0.50, settle: 0.40, grow: 0.50 };

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Scroll progress smoothing
      const rawTarget = typeof scrollProgressRef?.current === "number" ? scrollProgressRef.current : 0;
      const target = Math.max(0, Math.min(1, rawTarget));
      const diff = target - currentProgress;
      const smoothFactor = Math.min(0.18, 0.06 + Math.abs(diff) * 0.3);
      currentProgress += diff * smoothFactor;
      const p = currentProgress;

      if (!isMobile) {
        mouse.lerp(targetMouse, 0.05);
      }

      // Hover Raycasting
      if (!isMobile) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(interactiveMeshes);
        if (hits.length > 0) {
          const hit = hits[0].object;
          if (hoveredMesh !== hit) {
            if (hoveredMesh) {
              hoveredMesh.scale.set(1, 1, 1);
              if (hoveredMesh.material.emissive) {
                hoveredMesh.material.emissive.set(0x000000);
                hoveredMesh.material.emissiveIntensity = 0;
              }
            }
            hoveredMesh = hit;
            hoveredMesh.scale.set(1.06, 1.06, 1.06);
            if (hoveredMesh.material.emissive) {
              hoveredMesh.material.emissive.set(isDark ? 0x1a3020 : 0x0d1810);
              hoveredMesh.material.emissiveIntensity = 0.4;
            }
            if (onSkillHover) onSkillHover(hit.userData.skillName);
          }
        } else if (hoveredMesh) {
          hoveredMesh.scale.set(1, 1, 1);
          if (hoveredMesh.material.emissive) {
            hoveredMesh.material.emissive.set(0x000000);
            hoveredMesh.material.emissiveIntensity = 0;
          }
          hoveredMesh = null;
          if (onSkillHover) onSkillHover(null);
        }
      }

      // ══════════════════════════════════════════════
      // STAGE CHOREOGRAPHY & AVATAR MOVEMENT
      // ══════════════════════════════════════════════
      const sep = isMobile ? mobileSep : desktopSep;

      const approachT = THREE.MathUtils.smoothstep(p, 0, 0.50);
      const settleT = THREE.MathUtils.smoothstep(p, 0.50, 0.75);
      const growT = THREE.MathUtils.smoothstep(p, 0.75, 1.0);

      const separation = THREE.MathUtils.lerp(sep.wide, sep.close, approachT);
      const finalSeparation = THREE.MathUtils.lerp(separation, sep.settle, settleT);
      const growSeparation = THREE.MathUtils.lerp(finalSeparation, sep.grow, growT);

      // Subtle floating oscillation & axial sway
      const idleA = prefersReducedMotion ? 0 : Math.sin(time * 0.8) * 0.02;
      const idleB = prefersReducedMotion ? 0 : Math.sin(time * 0.8 + 1.5) * 0.02;

      const mobileYOffset = isMobile ? -0.25 : 0;
      personAGroup.position.set(-growSeparation, idleA + mobileYOffset, 0);
      personBGroup.position.set(growSeparation, idleB + mobileYOffset, 0);

      // Subtle breathing scale
      if (!prefersReducedMotion) {
        const breatheA = 1 + Math.sin(time * 1.2) * 0.008;
        const breatheB = 1 + Math.sin(time * 1.2 + 2) * 0.008;
        personAGroup.scale.set(breatheA, breatheA, breatheA);
        personBGroup.scale.set(breatheB, breatheB, breatheB);

        // Gentle axial tilt toward each other as they approach (Match stage)
        const tiltInward = THREE.MathUtils.smoothstep(p, 0.15, 0.45) * 0.06;
        personAGroup.rotation.z = -tiltInward;
        personBGroup.rotation.z = tiltInward;

        // Gentle axial rotation
        personAGroup.rotation.y = Math.sin(time * 0.4) * 0.08 + THREE.MathUtils.smoothstep(p, 0.2, 0.5) * 0.2;
        personBGroup.rotation.y = -Math.sin(time * 0.4 + 1.0) * 0.08 - THREE.MathUtils.smoothstep(p, 0.2, 0.5) * 0.2;
      }

      // Inner core glow pulsing
      personA.coreMat.emissiveIntensity = 0.4 + Math.sin(time * 1.5) * 0.2;
      personB.coreMat.emissiveIntensity = 0.3 + Math.sin(time * 1.5 + 1.8) * 0.2;

      const pA = personAGroup.position;
      const pB = personBGroup.position;

      // ── CENTER GLOW & MATCH DEPTH ──
      centerGlow.intensity = THREE.MathUtils.smoothstep(p, 0.15, 0.35) * (isMobile ? 1.8 : 2.5)
        * (1 - THREE.MathUtils.smoothstep(p, 0.7, 0.9) * 0.6);

      // ── CONNECTION ARC ──
      const arcOpacity = THREE.MathUtils.smoothstep(p, 0.12, 0.28)
        * (1 - THREE.MathUtils.smoothstep(p, 0.85, 1.0) * 0.5);
      connectionLineMat.opacity = arcOpacity * 0.7;

      const midY = Math.sin(p * Math.PI * 0.8) * 0.15;
      for (let i = 0; i < arcSegments; i++) {
        const t = i / (arcSegments - 1);
        arcPositions[i * 3] = THREE.MathUtils.lerp(pA.x, pB.x, t);
        arcPositions[i * 3 + 1] = THREE.MathUtils.lerp(pA.y, pB.y, t) + Math.sin(t * Math.PI) * midY;
        arcPositions[i * 3 + 2] = Math.sin(t * Math.PI) * (isMobile ? 0.08 : 0.15);
      }
      arcGeom.attributes.position.needsUpdate = true;

      // ── SKILL CAPSULE BEHAVIORS ──
      skillObjects.forEach((skill) => {
        if (!prefersReducedMotion) {
          skill.mesh.rotation.y += delta * 0.15;
        }

        if (skill.isExchanging) {
          if (p < 0.32) {
            // Discover & early Match: orbit near owner
            const host = skill.owner === "A" ? pA : pB;
            const angle = skill.baseAngle + (prefersReducedMotion ? 0 : time * 0.25);
            const orbitR = skill.baseRadius * (1 - approachT * 0.2);
            skill.group.position.set(
              host.x + Math.cos(angle) * orbitR,
              skill.baseHeight + mobileYOffset + (prefersReducedMotion ? 0 : Math.sin(time * 0.6 + skill.baseAngle) * 0.03),
              Math.sin(angle) * (isMobile ? 0.12 : 0.2)
            );
          } else if (p < 0.68) {
            // Exchange: smooth cubic Bezier flight between avatars
            const exchangeT = THREE.MathUtils.smoothstep(p, 0.35, 0.65);
            const fromHost = skill.owner === "A" ? pA : pB;
            const toHost = skill.destination === "B" ? pB : pA;

            const t = exchangeT;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;

            const startX = fromHost.x + (skill.owner === "A" ? 0.3 : -0.3);
            const endX = toHost.x + (skill.destination === "B" ? -0.3 : 0.3);
            const ctrl1X = THREE.MathUtils.lerp(startX, endX, 0.3);
            const ctrl2X = THREE.MathUtils.lerp(startX, endX, 0.7);
            const startY = skill.baseHeight + mobileYOffset;
            const endY = skill.baseHeight + mobileYOffset;
            const peakY = skill.id === "react" ? 0.45 : 0.2;
            const ctrl1Y = startY + peakY * 1.2;
            const ctrl2Y = endY + peakY * 1.2;
            const ctrl1Z = (skill.id === "react" ? 0.3 : -0.2) * (isMobile ? 0.5 : 1);
            const ctrl2Z = (skill.id === "react" ? 0.25 : -0.15) * (isMobile ? 0.5 : 1);

            const x = mt3 * startX + 3 * mt2 * t * ctrl1X + 3 * mt * t2 * ctrl2X + t3 * endX;
            const y = mt3 * startY + 3 * mt2 * t * ctrl1Y + 3 * mt * t2 * ctrl2Y + t3 * endY;
            const z = mt3 * 0 + 3 * mt2 * t * ctrl1Z + 3 * mt * t2 * ctrl2Z + t3 * 0;

            skill.group.position.set(x, y, z);

            // Update particle trail
            const trailStart = skill.id === "react" ? 0 : 8;
            const visibility = Math.sin(exchangeT * Math.PI);
            trailMat.opacity = visibility * 0.6;
            for (let j = 0; j < 8; j++) {
              const trailT = Math.max(0, exchangeT - (j / 8) * 0.15);
              const tmt = 1 - trailT;
              const idx = (trailStart + j) * 3;
              trailPositions[idx] = tmt * tmt * tmt * startX + 3 * tmt * tmt * trailT * ctrl1X + 3 * tmt * trailT * trailT * ctrl2X + trailT * trailT * trailT * endX + (Math.random() - 0.5) * 0.02;
              trailPositions[idx + 1] = tmt * tmt * tmt * startY + 3 * tmt * tmt * trailT * ctrl1Y + 3 * tmt * trailT * trailT * ctrl2Y + trailT * trailT * trailT * endY + (Math.random() - 0.5) * 0.02;
              trailPositions[idx + 2] = tmt * tmt * tmt * 0 + 3 * tmt * tmt * trailT * ctrl1Z + 3 * tmt * trailT * trailT * ctrl2Z + trailT * trailT * trailT * 0 + (Math.random() - 0.5) * 0.02;
            }
            trailGeom.attributes.position.needsUpdate = true;
          } else {
            // Learn stage: settle near new host
            const newHost = skill.destination === "B" ? pB : pA;
            const angle = skill.baseAngle + (prefersReducedMotion ? 0 : time * 0.2);
            const settledR = skill.baseRadius * 0.7;
            skill.group.position.set(
              newHost.x + Math.cos(angle) * settledR,
              skill.baseHeight + mobileYOffset + (prefersReducedMotion ? 0 : Math.sin(time * 0.5 + skill.baseAngle) * 0.02),
              Math.sin(angle) * (isMobile ? 0.08 : 0.15)
            );
          }
        } else {
          // Orbiting skills
          const host = skill.owner === "A" ? pA : pB;
          const angle = skill.baseAngle + (prefersReducedMotion ? 0 : time * 0.2);
          const radius = skill.baseRadius * (1 - THREE.MathUtils.smoothstep(p, 0.3, 0.6) * 0.15);
          const fadeScale = 1 - THREE.MathUtils.smoothstep(p, 0.35, 0.5) * 0.3
            + THREE.MathUtils.smoothstep(p, 0.65, 0.78) * 0.3;
          skill.group.scale.set(fadeScale, fadeScale, fadeScale);
          skill.group.position.set(
            host.x + Math.cos(angle) * radius,
            skill.baseHeight + mobileYOffset + (prefersReducedMotion ? 0 : Math.sin(time * 0.5 + skill.baseAngle * 2) * 0.025),
            Math.sin(angle) * (isMobile ? 0.08 : 0.15)
          );
        }
      });

      // Collaboration pulse ring (Learn stage: 60%-85%)
      const learnT = THREE.MathUtils.smoothstep(p, 0.6, 0.75);
      const learnFade = THREE.MathUtils.smoothstep(p, 0.78, 0.88);
      const pulseActive = learnT * (1 - learnFade);
      pulseMat.opacity = pulseActive * 0.25;
      const pulseScale = 0.3 + (Math.sin(time * 2) * 0.5 + 0.5) * (isMobile ? 0.3 : 0.5);
      pulseRing.scale.set(pulseScale, pulseScale, pulseScale);
      pulseRing.position.set((pA.x + pB.x) / 2, (pA.y + pB.y) / 2, 0.1);

      // Community constellation (Grow stage: 80%-100%)
      const communityT = THREE.MathUtils.smoothstep(p, 0.8, 1.0);
      communityLineMat.opacity = communityT * 0.35;

      let lineIdx = 0;
      communityNodes.forEach((node, idx) => {
        const s = communityT;
        node.mesh.scale.set(s, s, s);
        const pos = node.target.clone().multiplyScalar(communityT);
        pos.y += prefersReducedMotion ? 0 : Math.sin(time * 0.6 + idx * 0.8) * 0.03;
        node.mesh.position.copy(pos);

        if (communityT > 0.1 && lineIdx < communityLineCount * 6 - 12) {
          const anchor = idx % 2 === 0 ? pA : pB;
          communityLinePos[lineIdx++] = anchor.x;
          communityLinePos[lineIdx++] = anchor.y;
          communityLinePos[lineIdx++] = anchor.z;
          communityLinePos[lineIdx++] = pos.x;
          communityLinePos[lineIdx++] = pos.y;
          communityLinePos[lineIdx++] = pos.z;
        }
      });
      while (lineIdx < communityLineCount * 6) {
        communityLinePos[lineIdx++] = 0;
      }
      communityLineGeom.attributes.position.needsUpdate = true;

      // ══════════════════════════════════════════════
      // CINEMATIC CAMERA — Smooth Choreography
      // ══════════════════════════════════════════════
      const camWaypoints = isMobile ? [
        { x: 0,    y: 0.2,  z: 5.5 },  // Discover
        { x: 0,    y: 0.1,  z: 4.0 },  // Match
        { x: 0.2,  y: 0.2,  z: 3.6 },  // Exchange
        { x: -0.1, y: 0.1,  z: 3.8 },  // Learn
        { x: 0,    y: 1.0,  z: 6.5 },  // Grow
      ] : [
        { x: 0,    y: 0.3,  z: 6.0 },
        { x: 0,    y: 0.15, z: 4.2 },
        { x: 0.7,  y: 0.3,  z: 3.8 },
        { x: -0.2, y: 0.2,  z: 4.2 },
        { x: 0,    y: 1.6,  z: 8.5 },
      ];

      let camX, camY, camZ;
      if (p <= 0.25) {
        const t = THREE.MathUtils.smoothstep(p, 0, 0.25);
        camX = THREE.MathUtils.lerp(camWaypoints[0].x, camWaypoints[1].x, t);
        camY = THREE.MathUtils.lerp(camWaypoints[0].y, camWaypoints[1].y, t);
        camZ = THREE.MathUtils.lerp(camWaypoints[0].z, camWaypoints[1].z, t);
      } else if (p <= 0.50) {
        const t = THREE.MathUtils.smoothstep(p, 0.25, 0.50);
        camX = THREE.MathUtils.lerp(camWaypoints[1].x, camWaypoints[2].x, t);
        camY = THREE.MathUtils.lerp(camWaypoints[1].y, camWaypoints[2].y, t);
        camZ = THREE.MathUtils.lerp(camWaypoints[1].z, camWaypoints[2].z, t);
      } else if (p <= 0.75) {
        const t = THREE.MathUtils.smoothstep(p, 0.50, 0.75);
        camX = THREE.MathUtils.lerp(camWaypoints[2].x, camWaypoints[3].x, t);
        camY = THREE.MathUtils.lerp(camWaypoints[2].y, camWaypoints[3].y, t);
        camZ = THREE.MathUtils.lerp(camWaypoints[2].z, camWaypoints[3].z, t);
      } else {
        const t = THREE.MathUtils.smoothstep(p, 0.75, 1.0);
        camX = THREE.MathUtils.lerp(camWaypoints[3].x, camWaypoints[4].x, t);
        camY = THREE.MathUtils.lerp(camWaypoints[3].y, camWaypoints[4].y, t);
        camZ = THREE.MathUtils.lerp(camWaypoints[3].z, camWaypoints[4].z, t);
      }

      // Parallax & idle sway
      if (!prefersReducedMotion && !isMobile) {
        const parallaxScale = isTablet ? 0.5 : 1;
        camX += Math.sin(time * 0.25) * 0.06 * parallaxScale + mouse.x * 0.2 * parallaxScale;
        camY += Math.cos(time * 0.2) * 0.04 * parallaxScale + mouse.y * 0.12 * parallaxScale;
      }

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, THREE.MathUtils.lerp(mobileYOffset, 0.15 + mobileYOffset, p), 0);

      if (!prefersReducedMotion) {
        dustParticles.rotation.y = time * 0.008;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // ──────────────────────────────────────────────
    // 10. RESIZE & CLEANUP
    // ──────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      isMobile = w < 768;
      isTablet = w >= 768 && w < 1024;

      camera.aspect = w / container.clientHeight;
      camera.fov = isMobile ? 50 : isTablet ? 44 : 40;
      camera.updateProjectionMatrix();
      renderer.setSize(w, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-auto select-none z-0"
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    />
  );
}
