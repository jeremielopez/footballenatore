import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


@Component({
    selector: 'app-home-header',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public cube: THREE.Mesh;
    public light: THREE.DirectionalLight;
    public world: CANNON.World;

    public maxSpeed = 0.3;

    private upSpeed = 0;
    private rightSpeed = 0;
    private leftSpeed = 0;

    private rightPressed: boolean;
    private leftPressed: boolean;
    private upPressed: boolean;
    private xPressed: boolean;

    @ViewChild('content', { static: true })
    public content!: ElementRef;

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
    ) { }

    ngOnInit(): void {
        if (this.isBrowser()) {
            this.render();


            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }, false);

            this.content.nativeElement.addEventListener('touchstart', (ev: any) => {
                this.upPressed = true;

                const location = ev.changedTouches[0].clientX;
                const altitude = ev.changedTouches[0].clientY;

                const left = window.innerWidth / 2.5;
                const right = 2 * (window.innerWidth / 2.5);
                const up = window.innerHeight / 2;

                if (location < left) {
                    this.leftPressed = true;
                }

                if (location > right) {
                    this.rightPressed = true;
                }

                if (altitude < up) {
                    this.xPressed = true;
                }


                ev.preventDefault();
            });

            this.content.nativeElement.addEventListener('touchmove', (ev: any) => {
                const location = ev.changedTouches[0].clientX;
                const altitude = ev.changedTouches[0].clientY;

                const left = window.innerWidth / 2.5;
                const right = 2 * (window.innerWidth / 2.5);
                const up = window.innerHeight / 2;

                if (location < left) {
                    this.leftPressed = true;
                } else {
                    this.leftPressed = false;
                }

                if (location > right) {
                    this.rightPressed = true;
                } else {
                    this.rightPressed = false;
                }

                if (altitude < up) {
                    this.xPressed = true;
                } else {
                    this.xPressed = false;
                }

                ev.preventDefault();
            });

            this.content.nativeElement.addEventListener('touchend', (ev: any) => {
                this.upPressed = false;
                this.leftPressed = false;
                this.rightPressed = false;
                this.xPressed = false;
                ev.preventDefault();
            });

            document.addEventListener('keydown', ev => {
                switch (ev.code) {
                    case 'ArrowLeft':
                        this.leftPressed = true;
                        break;

                    case 'ArrowRight':
                        this.rightPressed = true;
                        break;

                    case 'ArrowUp':
                        this.upPressed = true;
                        break;

                    case 'KeyX':
                        this.xPressed = true;
                        break;

                    default:
                        break;
                }
            }, false);

            document.addEventListener('keyup', ev => {
                switch (ev.code) {
                    case 'ArrowLeft':
                        this.leftPressed = false;
                        break;

                    case 'ArrowRight':
                        this.rightPressed = false;
                        break;

                    case 'ArrowUp':
                        this.upPressed = false;
                        break;

                    case 'KeyX':
                        this.xPressed = false;
                        break;

                    default:
                        break;
                }
            }, false);
        }
    }

    public isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private initPhysics(): void {
        this.world = new CANNON.World();

        const dt = 1.0 / 60.0;
        const damping = 0.01;

        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.gravity.set(0, -10, 0);
    }

    private render(): void {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.005);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.content.nativeElement.appendChild(this.renderer.domElement);

        this.addBox();
        this.addPlane();
        this.addLight();
        this.addSkybox();
        for (let index = 0; index < 5; index++) {
            this.addCone(-index * 40 - 7);
        }
        this.addSoccerGoal();

        this.animate();
    }

    private addBox(): void {
        const geometry = new THREE.SphereGeometry(1, 32, 32);

        const texture = new THREE.TextureLoader().load('../../../../assets/textures/metal.jpg');
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });


        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
    }

    private addLight(): void {
        this.light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.light.position.set(2, 2, 1);
        this.light.shadow.autoUpdate = true;
        this.light.castShadow = true;
        this.light.intensity = 1;

        if (this.cube) {
            this.light.target = this.cube;
        }

        this.scene.add(this.light);
    }


    private addPlane(): void {
        const geometry = new THREE.PlaneGeometry(10000, 10000, 10000);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(0, -0.8, 0);
        const texture = new THREE.TextureLoader().load('../../../../assets/textures/grass2.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 2000;
        texture.repeat.y = 2000;
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);
    }


    private addSkybox(): void {
        const sky = new Sky();
        sky.scale.setScalar(100000);
        this.scene.add(sky);

        const skyUniforms = sky.material.uniforms;

        const sun = new THREE.Vector3();

        const theta = Math.PI * (0.7);
        const phi = 2 * Math.PI * (-0.4);

        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);

        skyUniforms.sunPosition.value.copy(sun);

        this.renderer.toneMappingExposure = 0.5;
    }


    private addCone(z: number): void {
        const loader = new GLTFLoader();
        loader.load('../../../../assets/3d-models/cone/model.gltf', gltf => {
            const gltfScene = gltf.scene;

            gltfScene.position.x = 6;
            gltfScene.position.y = -15;
            gltfScene.position.z = z - 20;
            gltfScene.scale.set(10, 10, 10);

            this.scene.add(gltfScene);
        });
        loader.load('../../../../assets/3d-models/cone/model.gltf', gltf => {
            const gltfScene = gltf.scene;

            gltfScene.position.x = -3;
            gltfScene.position.y = -15;
            gltfScene.position.z = z;
            gltfScene.scale.set(10, 10, 10);

            this.scene.add(gltfScene);
        });
    }


    public addSoccerGoal(): void {
        const loader = new GLTFLoader();
        loader.load('../../../../assets/3d-models/soccer-goal/soccer_goal2.gltf', gltf => {
            const gltfScene = gltf.scene;

            gltfScene.position.x = -3;
            gltfScene.position.y = 5;
            gltfScene.position.z = -500;

            gltfScene.rotation.y = Math.PI;

            this.scene.add(gltfScene);
        });
    }


    private animate(): void {
        if (this.upPressed) {
            if (this.upSpeed < this.maxSpeed) {
                this.upSpeed += 0.01;
            }
            if (this.upSpeed > this.maxSpeed) {
                this.upSpeed -= 0.01;
            }
        } else {
            if (this.upSpeed > 0) {
                this.upSpeed -= 0.01;
            }
        }

        if (this.leftPressed && this.upSpeed > 0) {
            if (this.leftSpeed < this.maxSpeed) {
                this.leftSpeed += 0.01;
                this.camera.rotation.y += 0.007;
            }
            if (this.leftSpeed > this.maxSpeed) {
                this.leftSpeed -= 0.01;
                this.camera.rotation.y -= 0.007;
            }
        } else {
            if (this.leftSpeed > 0) {
                this.leftSpeed -= 0.01;
                this.camera.rotation.y -= 0.007;
            }
        }

        if (this.rightPressed && this.upSpeed > 0) {
            if (this.rightSpeed < this.maxSpeed) {
                this.rightSpeed += 0.01;
                this.camera.rotation.y -= 0.007;
            }
            if (this.rightSpeed > this.maxSpeed) {
                this.rightSpeed -= 0.01;
                this.camera.rotation.y += 0.007;
            }
        } else {
            if (this.rightSpeed > 0) {
                this.rightSpeed -= 0.01;
                this.camera.rotation.y += 0.007;
            }
        }

        if (this.xPressed) {
            this.maxSpeed = 1;
        } else {
            this.maxSpeed = 0.3;
        }

        this.cube.position.z -= this.upSpeed;
        this.cube.rotation.x -= this.upSpeed;
        this.cube.position.x -= this.leftSpeed;
        this.cube.rotation.z -= this.leftSpeed;
        this.cube.position.x += this.rightSpeed;
        this.cube.rotation.z -= this.rightSpeed;


        this.renderer.render(this.scene, this.camera);

        this.camera.position.x = this.cube.position.x;
        this.camera.position.y = this.cube.position.y + 1.5;
        this.camera.position.z = this.cube.position.z + 6;

        this.light.position.x = this.cube.position.x + 2;
        this.light.position.y = this.cube.position.y + 1;
        this.light.position.z = this.cube.position.z + 1;

        requestAnimationFrame(() => this.animate());
    }
}
