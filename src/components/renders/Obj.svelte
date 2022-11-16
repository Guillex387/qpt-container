<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { WebGLRenderer, Scene, Mesh, PerspectiveCamera, MeshMatcapMaterial, GridHelper, DoubleSide } from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
  import Center from '../utils/Center.svelte';
  import Loader from '../utils/Loader.svelte';

  let viewElement: HTMLElement;
  let loading = true;
  export let src: string;

  let renderer: WebGLRenderer;
  let scene: Scene;
  let camera: PerspectiveCamera;
  let controls: OrbitControls;

  const init = () => {
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(viewElement.clientWidth, viewElement.clientHeight);
    renderer.setClearColor(0x2f3437);
    renderer.domElement.style.display = 'none';
    viewElement.appendChild(renderer.domElement);
    scene = new Scene();
    const loader = new OBJLoader();
    loader.load(src, object => {
      scene.add(object);
      object.traverse(child => {
        if (child instanceof Mesh) {
          let material = new MeshMatcapMaterial({ color: 0x99fbff });
          material.side = DoubleSide;
          child.material = material;
        }
      });
      loading = false;
      renderer.domElement.style.display = 'block';
    });
    const gridHelper = new GridHelper(40, 40, 0xff0000, 0xadadad);
    scene.add(gridHelper);
    camera = new PerspectiveCamera(45, viewElement.clientWidth / viewElement.clientHeight, 1, 100000);
    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 100);
    controls.update();
  };

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  const resize = () => {
    camera.aspect = viewElement.clientWidth / viewElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewElement.clientWidth, viewElement.clientHeight);
  };

  onMount(() => {
    init();
    animate();
    window.addEventListener('resize', resize);
  });
  onDestroy(() => {
    window.removeEventListener('resize', resize);
  });
</script>

<div bind:this={viewElement} class="w-full h-full" id="view">
  {#if loading}
    <Center>
      <Loader />
    </Center>
  {/if}
</div>
