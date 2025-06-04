import '../style.css'
import * as THREE from 'three';
import * as utils from './utilities/utils';
import CameraManager from './managers/CameraManager';
import RendererManager from './managers/RendererManager';
import ControlsManager from './managers/ControlsManger';
import { ACUNIT_OBSTRUCTION, CAMERA_TYPE_2D, MUMTY_OBSTRUCTION } from './utilities/constants';
import SceneManager from './managers/SceneManager';
import Ground from './Objects/Ground/Ground';
import LightsManager from './managers/LightsManager';
import VisualManager from './managers/VisualManager';
import DrawManager from './managers/DrawManager';
import PolygonModel from './Objects/PolygonModel';
import GroundImage from './Objects/Ground/GroundImage';
import { DragControls } from './libs/DragControls';
import Obstruction from './Objects/Obstruction';
import {useStudioStore} from '../pages/store/studioStore';
import { isIntersecting } from './utilities/rayCastingUtils';
export default class App {
    constructor() {
        /*replace event bus with store*/
        window.stage = this;
        this.eventBus = new THREE.EventDispatcher();
        this.designId = -1;
        this.objects = {};
        this.canvas = document.getElementById("design-canvas");
        this.sceneRotated = false;
        this.studioStore = useStudioStore();
        this.currentSelectedObject = null;
        this.obs = [];
        this.obstructionPositionArray = [];
        this.lastChangedObject = [];
    }

    loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData) {
        /* Adding an event listener to the window object. */
        //zoom;
        window.addEventListener("resize", this.appResize, false);
        window.addEventListener("scroll", this.appResize, false);

        /* Setting the latitude, longitude, zoom, imageDimensions and other properties. */
        this.loadMapData();
        this.imageDimensions =
            Object.prototype.hasOwnProperty.call(stageData, 'imageDimensions') ?
                stageData.imageDimensions :
                utils.getImageDimensions(this.latitude, this.longitude, this.zoom, 512, 512);

        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height,
            left: canvas.getBoundingClientRect().left,
            top: canvas.getBoundingClientRect().top
        };

        /* Creating a new instance of the Managers. */
        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager(this.screenDimensions, this.imageDimensions, CAMERA_TYPE_2D);
        this.rendererManager = new RendererManager(this.canvas);
        this.cameraManager.get2dCamera().y = 0;
        this.floorValue = stageData.floorValue ? stageData.floorValue : 1;
        this.ground = new Ground(this);
        //this.switchTo2d();
        this.fitCameraToObject();
        this.lightsManager = new LightsManager(this);
        this.drawManager = new DrawManager(this);
        this.visualManager = new VisualManager(this);
        this.ground.loadObject(stageData.groundData);
        this.loadObstructions(stageData.obstructionData);
        this.dragControls = new DragControls(this, this.cameraManager.camera, this.rendererManager.renderer.domElement);
        // this.dragControls.addEventListener('dragstart', function (event) {
        //     // event.object.material.emissive.set(0xaaaaaa);
        // });
        // this.dragControls.addEventListener('dragend', function (event) {
        //     // event.object.material.emissive.set(0x000000);
        // });
        this.dragControls.deactivate();
        // this.mumty = new Obstruction(this, MUMTY_OBSTRUCTION);
        this._SUBARRAY_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_SUBARRAY_ID_INIT') ?
            stageData._SUBARRAY_ID_INIT :
            0;

        this._MODEL_ID_INIT =
        Object.prototype.hasOwnProperty.call(stageData, 'modelId') ?
        stageData.modelId :
        0;
        this._OBS_ID_INIT =
        Object.prototype.hasOwnProperty.call(stageData, 'obsId') ?
        stageData.obsId :
        0;
        this.obstructionInScene();
    }

    loadMapData() {
        let mapInfo = JSON.parse(localStorage.getItem('google-map-info'))
        let sampleImage = `https://maps.googleapis.com/maps/api/staticmap?center=37.4200952208586900,-122.0822690926250400&scale=2&zoom=20&maptype=satellite&size=512x512&key=${import.meta.env.VITE_GOOGLE_API_KEY}`;
        mapInfo = mapInfo || {
            "url" : sampleImage,
            "lat": 37.4200952208586900,
            'lng': -122.0822690926250400,
            "zoom": 20
        };
        this.groundImage = mapInfo.url;
        this.latitude = mapInfo.lat;
        this.longitude = mapInfo.lng;
        this.zoom = mapInfo.zoom;
        return mapInfo;
        }

        saveMapManual() {
        let mapImageURL = `https://maps.googleapis.com/maps/api/staticmap?center=37.4200952208586900,-122.0822690926250400&scale=2&zoom=20&maptype=satellite&size=512x512&key=${import.meta.env.VITE_GOOGLE_API_KEY}`;
        let mapInfo = {
            "url": mapImageURL,
            "lat": 37.4200952208586900,
            'lng': -122.0822690926250400,
            "zoom": 20
        }
        localStorage.setItem("google-map-info", JSON.stringify(mapInfo))
    }

    loadObstructions(obstructionData) {
        if(!obstructionData){
            obstructionData = [];
            let stageData = JSON.parse(localStorage.getItem('stageData'));
            stageData.obstructionData = obstructionData;
            localStorage.setItem('stageData', JSON.stringify(stageData));
        }
        obstructionData.forEach(obs => {
            const obsItem = new Obstruction(this, this.floorValue, obs.type, obs.id);
            obsItem.loadObject(obs);
        });
    }

    initialize2D_3DControls(){
        this.controlsManager = new ControlsManager(
            this.cameraManager.get2dCamera(),
            this.cameraManager.get3dCamera(),
            this.canvas.parentElement,
            this.eventBus,
            this
        );
        this.lightsManager = new LightsManager(this);
        this.cameraManager.get2dCamera().y = 0;
        //this.addObject();

        this.switchTo2d();
        this.fitCameraToObject();
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        // this.cameraManager.perspectiveCamera.lookAt(0,0,0);
        // this.cameraManager.perspectiveCamera.updateProjectionMatrix();
        this.rendererManager.render(this.sceneManager.scene, this.cameraManager.camera);
        //this.updateCameraPosition();
    }

    obstructionScaled(scaleValue = 1){
        if(scaleValue === 0){
            scaleValue = 1;
        }
        if (this.currentSelectedObject instanceof Obstruction)
        this.storeScaleOfLastChangedObject(this.currentSelectedObject);
        if (this.currentSelectedObject instanceof Obstruction) this.currentSelectedObject.updateObstructionScale(scaleValue);
    } 

    obstructionRotated(rotationValue) {
        if (this.currentSelectedObject instanceof Obstruction) {
            this.currentSelectedObject.rotateObstruction(rotationValue);
        }
    }

    storePositionOfLastChangedObject(object, position) {
        this.lastChangedObject.push([object, 'pos']); 
        object.storeLastPosition({ ...position });
    }
    storeScaleOfLastChangedObject(object) {
        this.lastChangedObject.push([object, 'scale']);
        object.storeLastScale();
    }

    obstructionInScene(){
        if(this.ground.hasObstacles()){
            this.studioStore.$patch({undoEnabled: true});
            this.studioStore.$patch({obstructionPlacedInScene:true});
        }else{
            this.studioStore.$patch({undoEnabled: false});
            this.studioStore.$patch({obstructionPlacedInScene:false});
        }
    }

    handleUndo() {
        if (this.lastChangedObject.length > 0) {
            let undoneObject = this.lastChangedObject.pop();
            undoneObject[0].undo(undoneObject[1]);
            // if(undoneObject[1] == 'scale' && this.lastChangedObject[this.lastChangedObject.length-1][1] == 'pos'){
            //     this.handleUndo();
            // }
        }
    }
    removeSelectedObject(){
        if(this.currentSelectedObject instanceof Obstruction){
            this.currentSelectedObject.removeObject();
          }
    }

    getDcSize() {
        let dcSize = 0;
        if(this.polygonModel && this.polygonModel.subarray){
            dcSize += this.polygonModel.subarray.getDcSize();
        }
        return dcSize;
    }

    getGroundImage() {
        return this.groundImage;
    }
    switchTo2d() {
        this.controlsManager.use2dControls();
        this.cameraManager.useOrthographicCamera();
        this.rotateSceneBack();
        if( this.polygonModel ){
            this.polygonModel.switchTo2d();
            this.polygonModel.getChildren().forEach((obstruction) => {
                if(obstruction instanceof Obstruction){
                    obstruction.switchTo2d();
                }
            });
        }
    }
    switchTo3d() {
        this.controlsManager.use3dControls();
        this.cameraManager.usePerspectiveCamera();
        this.rotateScene();
        if( this.polygonModel ){
            this.polygonModel.switchTo3d();
            this.polygonModel.getChildren().forEach((obstruction) => {
                if(obstruction instanceof Obstruction){
                    obstruction.switchTo3d();
                }
            });
        }
    }
    setDesignId(designId) {
        this.designId = designId;
    }

    rotateScene() {
        if (!this.sceneRotated) {
            for (let child of this.sceneManager.scene.children) {
                child.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
            }
            this.sceneRotated = true;
        }
    }

    rotateSceneBack() {
        if (this.sceneRotated) {
            for (let child of this.sceneManager.scene.children) {
                child.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            }
            this.sceneRotated = false;
        }
    }

    updateCameraAzimuth(azimuth) {
        //store.commit(CONSTANTS.SET_CAMERA_AZIMUTH, azimuth);
    }

    appResize = () => {
        let resizeTimeout;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(this.resizeRendererAndCamera, 500);
    };

    saveCanvasImage() {
        let canvas = document.getElementById('design-canvas');
        const dataURL = canvas.toDataURL();
        // store data URL in localStorage
        localStorage.setItem('canvasImage', dataURL);
    }

    newPolygonModel(floorValue, isObstructionType = false) {
        this.floorValue = floorValue;
        this.studioStore.$patch({undoEnabled: true});
        this.polygonModel = new PolygonModel(this, floorValue, isObstructionType);
        this.polygonModel.initDrawingMode();
        return this.polygonModel;
    }

    deselectOtherSelectedMeshes(objectToBeSelected, _polygonEnabled) {
		this.allMeshes = utils.getAllObjectMeshes(_polygonEnabled);
		let objects = [];
		this.allMeshes.forEach((mesh) => {
            if (mesh) objects.push(mesh.parent.container);
		})
		objects = objects.filter((object) => object !== objectToBeSelected);
		objects.forEach((object) => {
			object.deSelect();
		})
        this.currentSelectedObject = objectToBeSelected;
	}

    initDrawObstructions(obstructionType) {
        let roofObstruction = new Obstruction(this, this.floorValue, obstructionType);
        roofObstruction.addObstructionInLocal();
        this.obstructionInScene();
        this.changeSlider(roofObstruction.scale);
        this.changeRotationSlider(roofObstruction.angle);
    }

    async loadGroundImage(groundImageData) {
        if (this.groundImage) {
            this.groundImage.remove();
        }
        this.groundImage = new GroundImage(this.stage, groundImageData, null, this);

        const aspectRatio = await getAspectRatio(groundImageData.url);

        const scale = scaleMetersToRatio(
            (groundImageData.scale === INVALID_SCALE) ?
            getDefaultGroundSize(this.stage).width :
            groundImageData.scale,
            aspectRatio,
            this.stage.getImageDimensions().width
        );

        this.groundImage.loadObject({
            scale,
            rotation: groundImageData.rotation,
            offset: (groundImageData.offset.length == 0) ? [0, 0] : groundImageData.offset,
        });
    }

    getImageDimensions() {
        return this.imageDimensions;
    }

    getImageDimensions() {
        return this.imageDimensions;
    }

    getWindowDims() {
        // TODO: navigator.userAgent is not reliable to check for iPhones.
        // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgent
        let isIphone = navigator.userAgent.includes('iPhone')
        
        // Because of UI elements in iOS Safari, outerHeight works better
        // to measure window height.
        let width, height
        if (isIphone) {
            width = window.outerWidth
            height = window.outerHeight
        } else {
            width = window.innerWidth
            height = window.innerHeight
        }
        return { width, height }
    }

    /* Resizes the canvas to the size of the window */
    resizeCanvas() {
        let windowDims = this.getWindowDims()
        this.canvas.width = windowDims.width;
        this.canvas.height = windowDims.height;
        this.resizeRendererAndCamera();
    }

    /* Resizing the renderer and camera. */
    // Resizes the canvas to the size of the window
    resizeRendererAndCamera = () => {
        //this.resizeCanvasToDisplaySize()
        let canvas = this.rendererManager.getDomElement();
        let parent = canvas.parentElement;
        let parentBoundingRect = parent.getBoundingClientRect();
        let parentPadding = parseInt(Object(window.getComputedStyle(parent, null)).getPropertyValue("padding-left"));
        let windowDims = this.getWindowDims()
        this.screenDimensions = {
            width: windowDims.width - 2 * parentPadding,
            height: windowDims.height - 2 * parentPadding,
            left: parentBoundingRect.left,
            top: parentBoundingRect.top
        };
        this.rendererManager.resizeRenderer(this.screenDimensions);
        this.cameraManager.updateCamera(this.screenDimensions, this.imageDimensions);
    };

    destroyStage() {
        window.removeEventListener("resize", this.appResize, false);
        window.removeEventListener("scroll", this.appResize, false);
    }

    main() {
        this.resizeCanvas();
        this.resizeRendererAndCamera();
        this.animate();
    }

    getModelId() {
        this._MODEL_ID_INIT++;
        return this._MODEL_ID_INIT;
    }
    getObsId() {
        this._OBS_ID_INIT++;
        return this._OBS_ID_INIT;
    }

    getSubarrayId() {
        this._SUBARRAY_ID_INIT++;
        return this._SUBARRAY_ID_INIT;
    }

    getNormalisedZoom() {
        // returns normalised zoom level based on image dimension
        // scale followed is that for 300x300, zoom is 1 and linear scale
        // NOTE: camera's 'z' is 500. Changing might affect it. Not accounted.
        // NOTE: Image's aspect ratio is assumed to be 1:1
        return ((300 / this.imageDimensions.width) * this.cameraManager.camera.zoom);
    }

    changeSlider(val = 6){
        const slider = document.getElementById("obstrSlider");
        // Set the value of the slider
        slider.ariaValueNow  = val;
        slider.ariaValueText = val;
        slider.style.bottom = (val-1)*(100/9) + '%';
        this.studioStore.$patch({zoomValue: val});
        return true;
    }

    changeRotationSlider(value = 90){
        let selector = document.getElementById('selector')
        let selectValue = document.getElementById('selectValue')
        let progressBar = document.getElementById('progressBar')
        selectValue.innerHTML = value+'&#xb0'
        selector.style.left = (parseInt(value)/180)*100 + '%'
        progressBar.style.width = (parseInt(value)/180)*100 + '%'
    }

    fitCameraToObject(object = this.ground.edgesMesh) {
        const box = new THREE.Box3().setFromObject(object);
        const orig_aspect_ratio = (this.cameraManager.orthographicCamera.right - this.cameraManager.orthographicCamera.left) / (this.cameraManager.orthographicCamera.top - this.cameraManager.orthographicCamera.bottom);

        let temAspectRatio = (box.max.x - box.min.x) / (box.max.y - box.min.y)

        let centerOnlyVertically = true

        if (centerOnlyVertically || temAspectRatio < orig_aspect_ratio) {
            // if (temAspectRatio < orig_aspect_ratio) {
            const adjusted_width = (box.max.y - box.min.y) * orig_aspect_ratio;

            this.cameraManager.orthographicCamera.top = box.max.y;
            this.cameraManager.orthographicCamera.bottom = box.min.y;
            this.cameraManager.orthographicCamera.left = -adjusted_width / 2;
            this.cameraManager.orthographicCamera.right = adjusted_width / 2;
        } else {
            const adjusted_height = (box.max.x - box.min.x) / orig_aspect_ratio;

            // To vertically center the template, this "sub" and the exact value -0.09 is required. 
            let sub = -(adjusted_height - (box.max.y - box.min.y)) / 2 - 0.09

            this.cameraManager.orthographicCamera.top = adjusted_height + sub;
            this.cameraManager.orthographicCamera.bottom = 0 + sub;
            this.cameraManager.orthographicCamera.left = box.min.x;
            this.cameraManager.orthographicCamera.right = box.max.x;

        }
        this.cameraManager.orthographicCamera.updateProjectionMatrix();
        //this.requestRender.bind(this)();
    }

    areOverlapping(selectedObject) {
        return isIntersecting(this.polygonModel.get2DVertices(), selectedObject.getVertices());
    }

    async placePanels() {
        await this.polygonModel.onFillFace().then(()=>{
            return Promise.resolve(true);
        }); 
    }

    removePanels() {
        this.polygonModel.subarray.removeObject();
        this.polygonModel.structures.clear();
    }

    panelMapExporter() {
        let panelMapArray = [];
        if(this.polygonModel && this.polygonModel.subarray){
            panelMapArray.push(this.polygonModel.subarray.getSubarrayMap(true));
        }
        return panelMapArray;
    }

}




