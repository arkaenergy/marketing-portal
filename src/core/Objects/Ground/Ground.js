import * as THREE from 'three';
import GroundImage from './GroundImage';
import PolygonModel from '../PolygonModel';
//import * as Sky from 'three-sky';
import {
    INVALID_SCALE,
} from '../../utilities/constants';
import {
    VISUAL_STATES,
    MATERIAL_STATES,
    COLOR_MAPPINGS,
    GROUND_EDGE_LINE_WIDTH,
    GROUND_EDGE_LINE_COLOR,
} from '../../utilities/visualConstants';

import {
    scaleMetersToRatio,
    getAspectRatio,
    getDefaultGroundSize,
    updateMeshWithColor,
    convertArrayToVector,
} from '../../utilities/utils';
// import RectangleObstruction from '../model/Rectangle';
import BaseObject from '../BaseObject';
import Sky from '../../libs/Sky';
import InfiniteGridHelper from '../../libs/InfiniteGridHelper';
import Obstruction from '../Obstruction';

export default class Ground extends BaseObject {

    constructor(stage) {
        super(stage);

        this.stage = stage;
        this.id = 0;
        this.name = 'Ground';


        this.material = new THREE.MeshBasicMaterial();

        //Shadow Material
        this.shadowMaterial = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .GROUND[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
        });
        this.shadowMaterial.defines = this.shadowMaterial.defines || {};
        this.shadowMaterial.defines.CUSTOM = "";

        const planeGeometry = new THREE.PlaneGeometry(
            stage.imageDimensions.width,
            stage.imageDimensions.height,
        );
        this.plane = new THREE.Mesh(planeGeometry, this.material);
        this.plane.position.z = -0.065;

        const edgeMaterial = new THREE.LineBasicMaterial({
            color: GROUND_EDGE_LINE_COLOR,
            linewidth: GROUND_EDGE_LINE_WIDTH,
        });
        const edgeGeometry = new THREE.EdgesGeometry(planeGeometry);
        this.edgesMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.edgesMesh.visible = false;
        this.edgesMesh.position.z = 1;

        this.groundImage = null;
        this.gridLines = null;

        this.plane.castShadow = true;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.add(this.plane);
        this.objectsGroup.add(this.edgesMesh);

        this.canvas = stage.rendererManager.getDomElement();

        let gridObj =new InfiniteGridHelper(10, 100);
        this.grid =  gridObj.getmesh();
        this.sky = new Sky();

        this.initSkyGrid();
        //this.initGridLines();
        this.loadGroundImage(this.stage.getGroundImage());

        //this.updateVisualsAfterLoadingAndCreation();

        this.faces = new Set();
    }

    initSkyGrid() {
        this.sky.scale.setScalar(4500);
        this.stage.sceneManager.scene.add(this.sky);
        let effectController = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.003,
            mieDirectionalG: 0.8,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: !true
        };
        let uniforms = this.sky.material.uniforms;
        uniforms["turbidity"].value = effectController.turbidity;
        uniforms["rayleigh"].value = effectController.rayleigh;
        uniforms["mieCoefficient"].value = effectController.mieCoefficient;
        uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;
        uniforms["sunPosition"].value.set(400000, 400000, 400000);

        this.grid.castShadow = true;
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.y = -0.075;
        this.grid.position.z = -0.5;

        this.stage.sceneManager.scene.add(this.grid);
    }

    hideSkyAndGround() {
        this.grid.visible = false;
        this.sky.visible = false;
    }
    showSkyAndGround() {
        this.grid.visible = true;
        this.sky.visible = true;
    }

    getGroundImage() {
        return this.groundImage;
    }

    saveObject() {
        let groundData = {
            type: Ground.getObjectType(),
            children: []
        };
        // saving children
        for (let child of this.getChildren()) {
            groundData.children.push(child.saveObject());
        }
        return groundData;
    }

    addRoofTexture() {
        this.children.forEach(modelObj => {
            if ( modelObj instanceof PolygonModel) {
                modelObj.removeRoofTexture();
                modelObj.addMapTexture();
            }
        });
    }
    removeRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof PolygonModel) {
                modelObj.removeRoofTexture();
            }
        });
    }

    showRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof PolygonModel) {
                modelObj.showRoofTexture();
            }
        });
    }

    hideRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof PolygonModel) {
                modelObj.hideRoofTexture();
            }
        });
    }

    hideImage() {
        this.groundImage.hide();
    }

    showImage() {
        this.groundImage.show();
    }

    async loadGroundImage(groundImageData) {
        if (this.groundImage) {
            this.groundImage.remove();
        }
        this.groundImage = new GroundImage(this.stage, groundImageData, null, this);

        // const aspectRatio = await getAspectRatio(groundImageData.url);

        // const scale = scaleMetersToRatio(
        //     (groundImageData.scale === INVALID_SCALE) ?
        //     getDefaultGroundSize(this.stage).width :
        //     groundImageData.scale,
        //     aspectRatio,
        //     this.stage.getImageDimensions().width
        // );

        this.groundImage.loadObject();
            // scale,
            // rotation: groundImageData.rotation,
            // offset: (groundImageData.offset.length == 0) ? [0, 0] : groundImageData.offset,
    }

    initGridLines() {
        this.gridLines = new THREE.GridHelper(
            this.stage.getImageDimensions().width,
            this.stage.getImageDimensions().height,
        );
        this.gridLines.material.transparent = true;
        this.gridLines.material.opacity = 0.25;
        this.gridLines.material.color.set(0xbbbbbb);
        this.gridLines.rotateX(Math.PI / 2);
        this.gridLines.position.setZ(-0.06);
        this.objectsGroup.add(this.gridLines);
    }



    reset() {
        this.resetGridLines();
        this.resetEdges();
        this.resetGroundPlane();
    }

    resetEdges() {
        this.hideEdges();
        const scaleMultiplier = this.stage.getImageDimensions().width /
            (this.plane.geometry.vertices[1].x * 2);
        this.edgesMesh.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    resetGroundPlane() {
        const scaleMultiplier = this.stage.getImageDimensions().width /
            (this.plane.geometry.vertices[1].x * 2);
        this.plane.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    resetGridLines() {
        this.objectsGroup.remove(this.gridLines);
        this.initGridLines();
    }

    resizeGround(scaleMultiplier) {
        this.plane.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
        this.gridLines.geometry.scale(scaleMultiplier, 1, scaleMultiplier);
        this.edgesMesh.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    async loadObject(groundData) {
        if(!groundData){
            groundData = {children:[],};
            let stageData = JSON.parse(localStorage.getItem('stageData'));
            stageData.groundData = groundData;
            localStorage.setItem('stageData', JSON.stringify(stageData));
        }
        // load properties
        const groundChildren = groundData.children === undefined ? [] : groundData.children;
        for (let i = 0, len = groundChildren.length; i < len; i += 1) {
            if (groundChildren[i].type === PolygonModel.getObjectType()) {
                const polygonModel = new PolygonModel(this.stage, this.stage.floorValue);
                this.addChild(polygonModel);
                polygonModel.loadObject(groundChildren[i]);
                if (polygonModel.getParent() !== this) {
                    console.error('Ground: Mismatch in parent while loading PolygonModel');
                }
            } else {
                console.error('Ground: Invalid object type in loadObject', groundChildren[i].type);
            }
        }
        //this.stage.selectionControls.setSelectedObject(this);
    }

    hasObstacles(){
        const groundChildren = this.getChildren();
        for (let i = 0; i < groundChildren.length; i += 1) {
            if(groundChildren[i] instanceof Obstruction){
                return true;
            }
            let grandChild = groundChildren[i].getChildren();
            for (let j = 0; i < grandChild.length; j += 1) {
                if(grandChild[i] instanceof Obstruction){
                    return true;
                }
            }

        }
        return false;
    }


    get2DVertices() {
        let vertices = [];
        let x = this.stage.imageDimensions.width / 2;
        let y = this.stage.imageDimensions.height / 2;

        vertices.push([x, y]);
        vertices.push([-x, y]);
        vertices.push([-x, -y]);
        vertices.push([x, -y]);

        return vertices;
    }


    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.GROUND;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.groundImage.switchToSolidMaterial();

            this.plane.receiveShadow = true;
            this.plane.material = this.shadowMaterial;
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.groundImage.switchToTranslucentMaterial();

            this.plane.receiveShadow = false;
            this.plane.material = this.material;
        }
        const newColors = this.getColorMap();
        updateMeshWithColor(newColors.MESH_COLOR, this.plane);
        updateMeshWithColor(newColors.MESH_COLOR, this.groundImage.getPlane());
    }

    hideGroundImage() {
        this.groundImage.hide();
    }

    showGroundImage() {
        this.groundImage.show();
    }

    hideGrid() {
        this.gridLines.visible = false;
    }

    showGrid() {
        this.gridLines.visible = true;
    }

    // Universal Functions

    onSelect() {
        if(this.stage.ground.children[0]){
            this.stage.ground.children[0].deSelect();
        }
    }

    deSelect() {}

    getMinMax() {
        let minMaxVertices = [];
        let tempVertices = this.plane.geometry.attributes.position.array;
        for (let i = 0; i < tempVertices.length; i++) {
            minMaxVertices.push(
                [
                    tempVertices[i * 3],
                    tempVertices[i * 3 + 1],
                    tempVertices[i * 3 + 2]
                ]
            )
        }
        minMaxVertices = convertArrayToVector(minMaxVertices);
        const maxX = minMaxVertices[1].x;
        const minX = minMaxVertices[0].x;
        const maxY = minMaxVertices[1].y;
        const minY = minMaxVertices[2].y;

        return [minX, minY, maxX, maxY];
    }

    hideEdges() {
        this.edgesMesh.visible = false;
    }

    static getObjectType() {
        return 'Ground'
    }

}