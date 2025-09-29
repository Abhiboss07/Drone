// JavaScript for the 3D Drone Show and Mobile Menu (extracted from index.html)

// --- Mobile Menu ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile menu on click
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// --- Scroll reveal ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// --- Three.js Drone Show ---
window.addEventListener('load', () => {
    const canvas = document.getElementById('drone-show-canvas');
    const modelCanvas = document.getElementById('drone-model-canvas');
    if ((!canvas && !modelCanvas) || !window.THREE) return;

    // ---------- Swarm Show (right) ----------
    if (canvas) {
        const parentContainer = canvas.parentElement;
        if (!parentContainer) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0f172a, 100, 400);

    // Camera setup
        const camera = new THREE.PerspectiveCamera(
        75,
        parentContainer.clientWidth / parentContainer.clientHeight,
        0.1,
        1000
        );
        camera.position.z = 100;

    // Renderer setup
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(parentContainer.clientWidth, parentContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Drones setup
        const droneCount = 300;
        const drones = [];
        const droneGroup = new THREE.Group();

    const droneGeometry = new THREE.SphereGeometry(0.5, 8, 8);

        for (let i = 0; i < droneCount; i++) {
        const hue = Math.random();
        const droneMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(hue, 1, 0.5) });
        const drone = new THREE.Mesh(droneGeometry, droneMaterial);

        // Initial random position
        drone.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150
        );

            droneGroup.add(drone);
            drones.push(drone);
        }
        scene.add(droneGroup);

    // Animation variables
        let clock = new THREE.Clock();
        let time = 0;
        let currentPattern = 0;

    // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            time = clock.getElapsedTime();

        // Switch pattern every 10 seconds
            if (Math.floor(time) % 10 === 0 && Math.floor(time) !== currentPattern) {
            currentPattern = Math.floor(time);
            // Cycle through 3 patterns
            currentPattern = (currentPattern / 10) % 3;
            }

            drones.forEach((drone, index) => {
            const t = time + index * 0.1;

            let targetX, targetY, targetZ;

            // Pattern 1: Wave
                if (currentPattern === 0) {
                targetX = Math.cos(t * 0.5) * 50 + Math.sin(index * 0.5) * 10;
                targetY = Math.sin(t * 0.5) * 50 + Math.cos(index * 0.5) * 10;
                targetZ = Math.sin(t * 0.3 + index * 0.1) * 30;
                }
            // Pattern 2: Sphere
                else if (currentPattern === 1) {
                const phi = Math.acos(-1 + (2 * index) / droneCount);
                const theta = Math.sqrt(droneCount * Math.PI) * phi;
                targetX = 60 * Math.cos(theta + t) * Math.sin(phi);
                targetY = 60 * Math.sin(theta + t) * Math.sin(phi);
                targetZ = 60 * Math.cos(phi);
                }
            // Pattern 3: Helix
                else {
                const radius = 40;
                const height = (index / droneCount - 0.5) * 120;
                targetX = radius * Math.cos(height * 0.1 + t);
                targetY = height;
                targetZ = radius * Math.sin(height * 0.1 + t);
                }

            // Lerp (linear interpolation) for smooth transition
            drone.position.x += (targetX - drone.position.x) * 0.05;
            drone.position.y += (targetY - drone.position.y) * 0.05;
            drone.position.z += (targetZ - drone.position.z) * 0.05;
        });

            renderer.render(scene, camera);
        }
        animate();

    // Mouse controls for camera rotation
    let isMouseDown = false;
    let prevMouseX = 0, prevMouseY = 0;

        canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        });

        canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        });

        canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;

        droneGroup.rotation.y += deltaX * 0.005;
        droneGroup.rotation.x += deltaY * 0.005;

            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

    // Handle window resizing
        window.addEventListener('resize', () => {
        camera.aspect = parentContainer.clientWidth / parentContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(parentContainer.clientWidth, parentContainer.clientHeight);
        });
    }

    // ---------- Drone Model Viewer (left) ----------
    if (modelCanvas && THREE.OrbitControls) {
        const parent = modelCanvas.parentElement;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        const camera = new THREE.PerspectiveCamera(60, parent.clientWidth / parent.clientHeight, 0.1, 1000);
        camera.position.set(2.5, 1.8, 3.2);

        const renderer = new THREE.WebGLRenderer({ canvas: modelCanvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(parent.clientWidth, parent.clientHeight);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 1.2;
        controls.maxDistance = 8;

        // Lights
        const hemi = new THREE.HemisphereLight(0x99ccff, 0x223344, 0.8);
        scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 8, 4);
        scene.add(dir);

        // Simple drone made of primitives (educational placeholder for a full GLTF model)
        const materials = {
            frame: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 }),
            prop: new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.3, roughness: 0.2 }),
            cam: new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.6, roughness: 0.1, emissive: 0x0ea5e9, emissiveIntensity: 0.25 })
        };

        const group = new THREE.Group();
        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), materials.frame);
        body.name = 'Body Frame';
        group.add(body);
        // Arms
        const armGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 16);
        const arm1 = new THREE.Mesh(armGeom, materials.frame); arm1.rotation.z = Math.PI/2; arm1.position.set(0, 0.05, 0.55); arm1.name = 'Front Arm';
        const arm2 = new THREE.Mesh(armGeom, materials.frame); arm2.rotation.z = Math.PI/2; arm2.position.set(0, 0.05, -0.55); arm2.name = 'Rear Arm';
        group.add(arm1, arm2);
        // Props
        const propGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12);
        const discGeom = new THREE.CircleGeometry(0.35, 24);
        function makeProp(x, z, name){
            const shaft = new THREE.Mesh(propGeom, materials.prop);
            shaft.rotation.x = Math.PI/2; shaft.position.set(x, 0.45, z);
            const disc = new THREE.Mesh(discGeom, materials.prop);
            disc.rotation.x = -Math.PI/2; disc.position.set(x, 0.58, z);
            disc.name = name;
            const prop = new THREE.Group(); prop.add(shaft, disc); return prop;
        }
        const p1 = makeProp(0.8, 0.8, 'Propeller A');
        const p2 = makeProp(-0.8, 0.8, 'Propeller B');
        const p3 = makeProp(0.8, -0.8, 'Propeller C');
        const p4 = makeProp(-0.8, -0.8, 'Propeller D');
        group.add(p1, p2, p3, p4);
        // Camera gimbal
        const cam = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), materials.cam);
        cam.position.set(0, -0.05, 0.6); cam.name = 'Camera';
        group.add(cam);
        scene.add(group);

        // Raycaster for part highlight
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const partInfo = document.getElementById('part-info');
        let highlighted = null;
        function setHighlight(obj){
            if (highlighted === obj) return;
            if (highlighted) highlighted.scale.set(1,1,1);
            highlighted = obj;
            if (highlighted) highlighted.scale.set(1.08,1.08,1.08);
            if (partInfo) partInfo.textContent = highlighted ? `Part: ${highlighted.name}` : '';
        }
        modelCanvas.addEventListener('mousemove', (e) => {
            const rect = modelCanvas.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(group.children, true);
            setHighlight(intersects[0]?.object || null);
        });

        // Zoom buttons
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => controls.zoomIn ? controls.zoomIn(0.1) : camera.position.multiplyScalar(0.9));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => controls.zoomOut ? controls.zoomOut(0.1) : camera.position.multiplyScalar(1.1));

        // Animate
        function render(){
            requestAnimationFrame(render);
            p1.rotation.y += 0.2;
            p2.rotation.y -= 0.2;
            p3.rotation.y += 0.2;
            p4.rotation.y -= 0.2;
            controls.update();
            renderer.render(scene, camera);
        }
        render();

        window.addEventListener('resize', () => {
            camera.aspect = parent.clientWidth / parent.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(parent.clientWidth, parent.clientHeight);
        });
    }
});


