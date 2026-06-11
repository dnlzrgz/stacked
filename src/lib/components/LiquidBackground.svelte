<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	/**
	 * @typedef {Object} Props
	 * @property {string} color1
	 * @property {string} color2
	 * @property {string} color3
	 * @property {string} color4
	 * @property {string} color5
	 * @property {string} color6
	 * @property {number} speed
	 * @property {number} intensity
	 * @property {number} grainIntensity
	 * @property {number} gradientSize
	 */

	/** @type {Props} */
	const {
		color1 = '#ffba49',
		color2 = '#20a39e',
		color3 = '#e07be0',
		color4 = '#ff674d',
		color5 = '#272932',
		color6 = '#ed6a5e',
		speed = 1.5,
		intensity = 1.8,
		grainIntensity = 0.08,
		gradientSize = 0.45
	} = $props();

	/**
	 * Converts any CSS-parseable colour string to a {@link THREE.Vector3}
	 * with components in [0, 1].
	 *
	 * @param {string} css
	 * @returns {THREE.Vector3}
	 */
	function toVec3(css) {
		const { r, g, b } = new THREE.Color(css);
		return new THREE.Vector3(r, g, b);
	}

	class TouchTexture {
		constructor() {
			/** Texture resolution */
			this.size = 64;
			this.width = this.size;
			this.height = this.size;

			/** Numbers of frames a touch point has effect */
			this.maxAge = 64;

			/** Touch radius */
			this.radius = 0.25 * this.size;

			/** Animation speed delay */
			this.speed = 1 / this.maxAge;

			/** Active touch points */
			this.trail = [];

			/** Previous touch poisition */
			this.last = null;

			this.initTexture();
		}

		initTexture() {
			this.canvas = document.createElement('canvas');

			this.canvas.width = this.width;
			this.canvas.height = this.height;

			this.ctx = this.canvas.getContext('2d');

			this.ctx.fillStyle = 'black';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.texture = new THREE.CanvasTexture(this.canvas);
			this.texture.generateMipmaps = false;
			this.texture.minFilter = THREE.LinearFilter;
			this.texture.magFilter = THREE.LinearFilter;
			this.texture.wrapS = THREE.ClampToEdgeWrapping;
			this.texture.wrapT = THREE.ClampToEdgeWrapping;
		}

		/**
		 * @param {{x: number, y: number}} point
		 */
		addTouch(point) {
			let force = 0;
			let vx = 0;
			let vy = 0;
			const last = this.last;

			if (last) {
				const dx = point.x - last.x;
				const dy = point.y - last.y;

				if (dx === 0 && dy === 0) return;

				const dd = dx * dx + dy * dy;
				let d = Math.sqrt(dd);
				vx = dx / d;
				vy = dy / d;

				force = Math.min(dd * 20000, 2.0);
			}

			this.last = { x: point.x, y: point.y };
			this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
		}

		update() {
			this.clear();

			const speed = this.speed;

			for (let i = this.trail.length - 1; i >= 0; i--) {
				const point = this.trail[i];
				let f = point.force * speed * (1 - point.age / this.maxAge);

				point.x += point.vx * f;
				point.y += point.vy * f;
				point.age++;

				if (point.age > this.maxAge) {
					this.trail.splice(i, 1);
				} else {
					this.drawPoint(point);
				}
			}

			this.texture.needsUpdate = true;
		}

		clear() {
			this.ctx.fillStyle = 'black';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		/**
		 * @param {{ x:number, y:number, age:number, force:number, vx:number, vy:number }} point
		 */
		drawPoint(point) {
			const pos = { x: point.x * this.width, y: (1 - point.y) * this.height };
			let intensity = 1;
			if (point.age < this.maxAge * 0.3) {
				intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
			} else {
				const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
				intensity = -t * (t - 2);
			}

			intensity *= point.force;

			const radius = this.radius;
			const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
			let offset = this.size * 5;
			this.ctx.shadowOffsetX = offset;
			this.ctx.shadowOffsetY = offset;
			this.ctx.shadowBlur = radius;
			this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(255,0,0,1)';
			this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

	const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
    uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6;
    uniform float uSpeed; uniform float uIntensity;
    uniform sampler2D uTouchTexture; uniform float uGrainIntensity;
    uniform vec3 uDarkNavy; uniform float uGradientSize;
    uniform float uGradientCount; uniform float uColor1Weight; uniform float uColor2Weight;
    varying vec2 vUv;

    float grain(vec2 uv, float time) {
      vec2 grainUv = uv * uResolution * 0.5;
      float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
      return grainValue * 2.0 - 1.0;
    }

    vec3 getGradientColor(vec2 uv, float time) {
      float gradientRadius = uGradientSize;
      vec2 c1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
      vec2 c2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
      vec2 c3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
      vec2 c4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
      vec2 c5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
      vec2 c6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);
      
      float influence1 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c1));
      float influence2 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c2));
      float influence3 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c3));
      float influence4 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c4));
      float influence5 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c5));
      float influence6 = 1.0 - smoothstep(0.0, gradientRadius, length(uv - c6));
      
      vec3 color = vec3(0.0);
      color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
      color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
      color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
      color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
      color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
      color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;
      
      color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
      color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, 1.35);
      color = pow(color, vec3(0.92));
      return mix(uDarkNavy, color, max(length(color) * 1.2, 0.15));
    }

    void main() {
      vec2 uv = vUv;
      vec4 touchTex = texture2D(uTouchTexture, uv);
      uv.x += -(touchTex.r * 2.0 - 1.0) * 0.8 * touchTex.b;
      uv.y += -(touchTex.g * 2.0 - 1.0) * 0.8 * touchTex.b;
      
      float dist = length(uv - vec2(0.5));
      uv += vec2(sin(dist * 20.0 - uTime * 3.0) * 0.04 * touchTex.b + sin(dist * 15.0 - uTime * 2.0) * 0.03 * touchTex.b);
      
      vec3 color = getGradientColor(uv, uTime) + grain(uv, uTime) * uGrainIntensity;
      gl_FragColor = vec4(clamp(color, vec3(0.0), vec3(1.0)), 1.0);
    }
  `;

	const uniforms = {
		uTime: { value: 0 },
		uResolution: { value: new THREE.Vector2() },

		uColor1: { value: new THREE.Vector3() },
		uColor2: { value: new THREE.Vector3() },
		uColor3: { value: new THREE.Vector3() },
		uColor4: { value: new THREE.Vector3() },
		uColor5: { value: new THREE.Vector3() },
		uColor6: { value: new THREE.Vector3() },

		uSpeed: { value: 0 },
		uIntensity: { value: 0 },

		uTouchTexture: { value: null },
		uGrainIntensity: { value: grainIntensity },
		uDarkNavy: { value: new THREE.Vector3() },
		uGradientSize: { value: gradientSize },
		uColor1Weight: { value: 0.5 },
		uColor2Weight: { value: 1.8 }
	};

	$effect(() => {
		uniforms.uColor1.value.copy(toVec3(color1));
		uniforms.uColor2.value.copy(toVec3(color2));
		uniforms.uColor3.value.copy(toVec3(color3));
		uniforms.uColor4.value.copy(toVec3(color4));
		uniforms.uColor5.value.copy(toVec3(color5));
		uniforms.uColor6.value.copy(toVec3(color6));
		uniforms.uDarkNavy.value.copy(toVec3(color2));
		if (scene) scene.background = new THREE.Color(color2);
	});

	$effect(() => {
		uniforms.uSpeed.value = speed;
	});

	$effect(() => {
		uniforms.uIntensity.value = intensity;
	});

	$effect(() => {
		uniforms.uGrainIntensity.value = grainIntensity;
	});

	$effect(() => {
		uniforms.uGradientSize.value = gradientSize;
	});

	let container;
	let renderer, camera, scene, timer, mesh, touchTexture;
	let animationFrameId;

	function getViewSize() {
		const fovInRadians = (camera.fov * Math.PI) / 180;
		const height = Math.abs(camera.position.z * Math.tan(fovInRadians / 2) * 2);
		return { width: height * camera.aspect, height };
	}

	function handleResize() {
		if (!renderer) return;
		const w = window.innerWidth;
		const h = window.innerHeight;

		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
		uniforms.uResolution.value.set(w, h);

		const viewSize = getViewSize();
		if (mesh) {
			mesh.geometry.dispose();
			mesh.geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1);
		}
	}

	function handleMouseMove(e) {
		if (!touchTexture) return;
		touchTexture.addTouch({
			x: e.clientX / window.innerWidth,
			y: 1 - e.clientY / window.innerHeight
		});
	}

	function handleTouchMove(e) {
		if (e.touches.length === 0) return;
		handleMouseMove(e.touches[0]);
	}

	function tick(timestamp) {
		timer.update(timestamp);
		uniforms.uTime.value += Math.min(timer.getDelta(), 0.1);
		touchTexture.update();
		renderer.render(scene, camera);
		animationFrameId = requestAnimationFrame(tick);
	}

	onMount(() => {
		const w = window.innerWidth;
		const h = window.innerHeight;

		renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
		renderer.setSize(w, h);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
		camera.position.z = 50;

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x0a0e27);
		timer = new THREE.Timer();

		touchTexture = new TouchTexture();
		uniforms.uTouchTexture.value = touchTexture.texture;
		uniforms.uResolution.value.set(w, h);

		const viewSize = getViewSize();
		const geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1);
		const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });

		mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		animationFrameId = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (animationFrameId) cancelAnimationFrame(animationFrameId);

		if (renderer) {
			renderer.dispose();
			renderer.domElement.remove();
		}

		if (mesh) {
			mesh.geometry.dispose();
			mesh.material.dispose();
		}

		if (touchTexture) touchTexture.texture.dispose();
	});
</script>

<svelte:window
	on:resize={handleResize}
	on:mousemove={handleMouseMove}
	on:touchmove={handleTouchMove}
/>

<div
	bind:this={container}
	class="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden"
></div>
