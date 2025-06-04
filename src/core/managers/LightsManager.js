import * as THREE from 'three';
import { getZoomAndCentroidForAllObjects } from '../utilities/utils';

export default class LightsManager {
    constructor(stage) {
        this.stage = stage;
        this.shadowEnabled = false;

        // Ambient light.
        this.ambientLightDefaultIntensity = 1;
        this.ambientLight = new THREE.AmbientLight(0x000000);
        this.ambientLight.castShadow = false;
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        this.objectsGroup = new THREE.Group();

        this.objectsGroupWithoutShadows = new THREE.Group();
        this.objectsGroupWithoutShadows.add(this.ambientLight);

        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.stage.sceneManager.scene.add(this.objectsGroupWithoutShadows);

        this.helperEnabled = false;
    }

    setLightPosition(position) {
        //start setting the sun when it comesclose to horizon : y in 3d is height of sun
        this.objectsGroup.position.x = position.x;
        this.objectsGroup.position.y = position.y;
        this.objectsGroup.position.z = position.z;
        this.setShadowMapParameters();
    }

    async switchToNormalView() {
        this.stage.hideStructure();
        this.stage.rotateSceneBack();
        this.stage.cameraManager.useOrthographicCamera();
        this.stage.controlsManager.use2dControls();

        const [zoom, centroid] = getZoomAndCentroidForAllObjects(this.stage);
        this.stage.controlsManager.get2DControls().setOrthographicCameraZoom(zoom);
        this.stage.controlsManager.get2DControls().setOrthographicCameraPosition(centroid);

        this.stage.rendererManager.renderer.shadowMap.autoUpdate = false;
        this.setHighResolutionShadows();
        this.disableShadows();
    }

    toggleShadows() {
        if (!this.shadowEnabled) {
            this.enableShadows();
        } else {
            this.disableShadows();
        }
    }

    enableShadows() {
        this.ambientLight.intensity = this.ambientLightSunSimulationIntensity;
        this.shadowEnabled = true;
        // can add required intensity  !!

    }

    disableShadows() {

        // Enable ambient light
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;
        this.shadowEnabled = false;
        // can add required intensity  !!
    }

}