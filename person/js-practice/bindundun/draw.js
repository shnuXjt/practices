import { AdditiveBlending, Color, DoubleSide, RGBADepthPacking, Scene, Vector3,
    TextureLoader, DirectionalLight, LoadingManager, TorusGeometry, Group, MeshPhysicalMaterial,
    MeshDepthMaterial, AnimationMixer, MeshLambertMaterial, AmbientLight, PerspectiveCamera,
    WebGLRenderer, BufferGeometry, PointsMaterial, Points, Clock, Mesh } from "/node_modules/three/build/three.module.js";
// import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import "/node_modules/three/build/three.min.js"
import "./node_modules/three/examples/js/controls/OrbitControls.js";
import "./node_modules/three/examples/js/loaders/GLTFLoader.js";

export class BDDDraw {
    skyTexture = './images/sky.jpg'; //天空图
    landSource = './models/land.glb'; // 地面资源
    bingDD = './models/bingdwendwen.glb'; // 冰墩墩资源
    treeSoure = './models/tree.gltf'; // 松树资源
    treeTexture = './images/tree.png'; // 松树贴图
    flagSource = './models/flag.glb'; // 旗帜资源
    flagTexture = './images/flag.png'; // 旗帜贴图
    snowTexture = './images/snow.png'; // 雪花贴图
    manager = new LoadingManager();
    loader = new THREE.GLTFLoader(this.manager);

    fiveCylesGroup = new Group();

    constructor(container) {
        this.container = container;
    }

    init() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.scene = new Scene();
        this.scene.background = new TextureLoader().load(this.skyTexture);

        this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(new Vector3(0, 0, 0));
    }

    addLight() {
        // 直射光
        const light = new DirectionalLight(0xffffff, 1);
        light.intensity = 1;
        light.position.set(16, 16, 8);
        light.castShadow = true;
        light.shadow.mapSize.width = 512 * 12;
        light.shadow.mapSize.height = 512 * 12; // mapSize?
        light.shadow.camera.top = 40;
        light.shadow.camera.bottom = -40;
        light.shadow.camera.left = -40;
        light.shadow.camera.right = 40;
        this.scene.add(light);

        // 环境光
        const ambientLight = new AmbientLight(0xcfffff);
        ambientLight.intensity = 1;
        this.scene.add(ambientLight);
    }

    // 创建地面； 可以使用threejs自带的 平面网格 + 凹凸贴图实现； 也可以使用 Blender 自建模型实现
    makeGround() {
        this.loader.load(this.landSource, (mesh) => {
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.metalness = .1;
                    child.material.roughness = .8;
                    // 地面
                    if (child.name === 'Mesh_2') {
                        child.material.metalness = .5;
                        child.receiveShadow = true;
                    }
                }
            })
            mesh.scene.rotation.y = Math.PI / 4;
            mesh.scene.position.set(15, -20, 0);
            mesh.scene.scale.set(.9, .9, .9);
            this.ground = mesh.scene;
            this.scene.add(this.ground);
        })
    }

    // 制作冰墩墩
    makeBingDD() {
        this.loader.load(this.bingDD, (mesh) => {
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    // 内部
                    if (child.name === "oldtiger001") {
                        child.material.metalness = .5;
                        child.material.roughness = .8;
                    }
                    // 半透明外壳
                    if (child.name === "oldtiger002") {
                        child.material.transparent = true;
                        child.material.opacity = .5;
                        child.material.metalness = .2;
                        child.material.roughness = 0;
                        child.material.refractionRatio = 1;
                        child.castShadow = true;
                    }
                }
            });
            mesh.scene.rotation.y = Math.PI / 24;
            mesh.scene.position.set(-8, -12, 0);
            mesh.scene.scale.set(24, 24, 24);
            this.scene.add(mesh.scene);
        })
    }

    // 创建奥运五环; 使用TorusGeometry; 材质使用 MeshLamberMaterial； 构成顺序为蓝黑红黄绿的五环
    makeFiveCyles() {
        const meshes = [];
        const fiveCyles = [
            { key: "cycle_0", color: 0x0885c2, position: { x: -250, y: 0, z: 0 } },
            { key: "cycle_1", color: 0x000000, position: { x: -10, y: 0, z: 5 } },
            { key: "cycle_2", color: 0xed334e, position: { x: 230, y: 0, z: 0 } },
            { key: "cycle_3", color: 0xfbb132, position: { x: -125, y: -100, z: -5 } },
            { key: "cycle_4", color: 0x1c8b3c, position: { x: 115, y: -100, z: 10 } }

        ];

        fiveCyles.map(item => {
            const cycleMesh = new Mesh(new TorusGeometry(100, 10, 10, 50), new MeshLambertMaterial({ color: new Color(item.color), side: DoubleSide }));
            cycleMesh.castShadow = true;
            cycleMesh.position.set(item.position.x, item.position.y, item.position.z);
            meshes.push(cycleMesh);
            this.fiveCylesGroup.add(cycleMesh);
        })

        this.fiveCylesGroup.scale.set(.036, .036, .036);
        this.fiveCylesGroup.position.set(0, 10, -8);
        this.scene.add(this.fiveCylesGroup);
    }

    // 创建旗帜，用blender制作的模型
    makeFlag() {
        this.loader.load(this.flagSource, (mesh) => {
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    // 旗帜
                    if (child.name === "mesh_0001") {
                        child.material.metalness = .1;
                        child.material.roughness = .1;
                        child.material.map = new TextureLoader().load(this.flagTexture);
                    }

                    // 旗杆
                    if (child.name === "柱体") {
                        child.material.metalness = .6;
                        child.material.roughness = 0;
                        child.material.refractionRatio = 1;
                        child.material.color = new Color(0xeeeeee);
                    }
                }
            })

            mesh.scene.rotation.y = Math.PI / 24;
            mesh.scene.position.set(2, -7, -1);
            mesh.scene.scale.set(4, 4, 4);
            // 动画
            const meshAnimation = mesh.animations[0];
            this.mixer = new AnimationMixer(mesh.scene);
            let animationClip = meshAnimation;
            const clipAction = this.mixer.clipAction(animationClip).play();
            animationClip = clipAction.getClip();
            this.scene.add(mesh.scene);
        })
    }

    // 增加松树作为装饰; 因为树的模型比较复杂，并且多个面的渲染会降低页面性能，造成卡顿； 这里使用两个交叉的面作为基座，然后贴上贴图，使其具有3D感
    // 为了使树只在贴图透明部分透明、其他地方不透明，并且可以产生树状阴影而不是长方体阴影，
    // 需要给树模型添加如下 MeshPhysicalMaterial、MeshDepthMaterial 两种材质，
    // 两种材质使用同样的纹理贴图，其中 MeshDepthMaterial 添加到模型的 custromMaterial 属性上
    makePineTree() {
        const treeMaterial = new MeshPhysicalMaterial({
            map: new TextureLoader().load(this.treeTexture),
            transparent: true,
            side: DoubleSide,
            metalness: .2,
            roughness: .8,
            depthTest: true,
            depthWrite: false,
            skining: false,
            fog: false,
            reflectivity: 0.1,
            refractionRatio: 0
        });
        const treeCustomDepthMaterial = new MeshDepthMaterial({
            depthPacking: RGBADepthPacking,
            map: new TextureLoader().load(this.treeTexture),
            alphaTest: 0.5
        });
        this.loader.load(this.treeSoure, (mesh) => {
            mesh.scene.traverse(child => {
                if (child.isMesh) {
                    child.material = treeMaterial;
                    child.customMaterial = treeCustomDepthMaterial;
                }
            });
            mesh.scene.position.set(14, -9, 0);
            mesh.scene.scale.set(16, 16, 16);
            this.scene.add(mesh.scene);
            // 再克隆两颗
            const tree2 = mesh.scene.clone();
            tree2.position.set(10, -8, -15);
            tree2.scale.set(18, 18, 18);
            this.scene.add(tree2);
        })
        
    }

    // 添加雪花,运用粒子 THREE.Points
    /**
     * Threejs中，雨🌧️，雪❄️， 云☁️， 星辰✨等生活中常见的粒子可以用 THREE.Points来实现
     * -- new THREE.Points(geometry, material)
     * material: PointsMaterial:
     *  属性: .blending: 主要控制纹理融合的叠加方式
     *          NormalBlending 默认值
     *          AdditiveBlending 加法融合模式
     *          SubtractiveBlending 减法融合模式
     *          MultiplyBlending 乘法融合模式
     *          CustomBlending 自定义融合模式 ： .blendSrc, .blendDst 或 .blendEquation 属性组合使用
     *  属性：.sizeAttenuation: 粒子大小是否会被相机深度衰减，默认为 true （仅透视相机）
     * 
     */
    makeSnowflake() {
        const texture = new TextureLoader().load(this.snowTexture);
        const geometry = new BufferGeometry();
        const range = 100;
        const pointsNum = 1500;
        const pointsMaterial = new PointsMaterial({
            size: 1,
            transparent: true,
            opacity: 0.8,
            map: texture,
            // 背景融合
            blending: AdditiveBlending,
            // 景深衰弱
            sizeAttenuation: true,
            depthTest: false
        });

        const points = [];
        for (let i = 0; i < pointsNum; i++) {
            const vertice = new Vector3(Math.random() * range - range / 2, Math.random() * range * 1.5, Math.random() * range - range / 2);
            // 纵向移速
            vertice.velocityY = 0.1 + Math.random() / 3;
            // 横向移速
            vertice.velocityX = (Math.random() - 0.5) / 3;
            // 加入到几何体中
            points.push(vertice);
        }
        geometry.setFromPoints(points);
        geometry.center();
        this.points = geometry.clone().getAttribute('position').array;
        this.pointsMesh = new Points(geometry, pointsMaterial);
        this.pointsMesh.position.y = -30;
        this.scene.add(this.pointsMesh);
    }

    // 视觉镜头控制
    makeView() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.enableDamping = true;
        // 禁用平移
        this.controls.enablePan = false;
        // 禁用缩放
        this.controls.enableZoom = false;
        // 垂直旋转角度限制
        this.controls.minPolarAngle = 1.4;
        this.controls.maxPolarAngle = 1.8;
        // 水平旋转角度限制
        this.controls.minAzimuthAngle = -.6;
        this.controls.maxAzimuthAngle = .6;
    }

    resize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.controls && this.controls.update();
        // 旗帜动画更新
        this.mixer && this.mixer.update(new Clock().getDelta());
        // 镜头动画
        // TWEEN && TWEEN.update();
        // 五环自转
        this.fiveCylesGroup && (this.fiveCylesGroup.rotation.y += .01);
        // 顶点变动以后需要更新，否则无法实现雨滴特效
        this.pointsMesh && (this.pointsMesh.geometry.getAttribute('position').needsUpdate = true);
        // 雪花动画更新
        const vertices = this.pointsMesh && this.pointsMesh.geometry.getAttribute('position');
        const positions = vertices && vertices.array;
        if (positions.length) {
            for (let i = 0; i < positions.length;) {
                positions[i] = positions[i] - (Math.random() - 0.5) / 3;
                positions[i + 1] = positions[i + 1] - (0.1 + Math.random() / 3);
                if (positions[i] < 0) {
                    positions[i] = this.points[i];
                }

                if (positions[i + 1] < 0) {
                    positions[i + 1] = this.points[i + 1];
                }
                i += 3;
            }
        }
        
        // (vertices || []).array.forEach(v => {

        //     v.y = v.y - (v.velocityY);
        //     v.x = v.x - (v.velocityX);
        //     if (v.y <= 0) v.y = 60;
        //     if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1;
        // })
    }

    draw() {
        this.init();
        this.addLight();
        this.makeGround();
        this.makeBingDD();
        this.makeFiveCyles();
        this.makeFlag();
        this.makePineTree();
        this.makeSnowflake();
        this.makeView();
        this.resize();
        this.animate();
    }
}