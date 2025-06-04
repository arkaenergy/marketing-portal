import * as THREE from 'three';
import BaseObject from './BaseObject';
import {
    CREATED_STATE,
    DELETED_STATE,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    COMPLEX_GEOMETRY_ERROR,
    HEIGHT_PER_FLOOR,
} from '../utilities/constants';
// import { verticesFromJSTSPolygon, verticesToJSTSPolygon, } from '../utilities/utils';
import * as raycastingUtils from '../utilities/rayCastingUtils';
import * as utils from '../utilities/utils';
import OutlinePoints from './OutlinePoints';
// import OutlinePoints from '../../core/objects/subObjects/OutlinePoints';
import DrawManager from '../managers/DrawManager';
import Subarray from './subarray/Subarray';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../utilities/visualConstants';
import Obstruction from './Obstruction';
import { fillFace } from './subarray/TempFillFace';
import createStructure from './structures/structureController';
// import * as visualUtils from '../../utils/visualUtils';
const MINIMUM_NUMBER_OF_POINTS = 3;

export default class PolygonModel extends BaseObject {
    constructor(stage, floorValue=null, isObstructionType = false) {
        super(stage);
        // standard norms
        this.stage = stage;
        if(!floorValue){
            floorValue = this.stage.floorValue;
        }
        this.floorValue = floorValue * HEIGHT_PER_FLOOR;
        this.id = this.stage.getModelId();
        this.name = `Model #${this.id.toString()}`;
        this.isObstruction = isObstructionType;
        this.objectsGroup = new THREE.Group();
        this.debugGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.debugGroup);
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.subarray = null;
        // materials
        // Translucent materials
        this.translucentMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.30,
            color: 0x409EFF,
        });
        this.translucentEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        // Solid Material-- used when sun simulation is on or in 3d
        this.solidMaterial = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.solidMaterial.defines = this.solidMaterial.defines || {};
        this.solidMaterial.defines.CUSTOM = '';
        this.edgesolidMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // list of outline points
        this.outlinePoints = [];

        // meshes and edges
        this.coreMesh = new THREE.Mesh(
            new THREE.BufferGeometry(),
            this.translucentMaterial2D,
        );
        // this.coreEdges = new THREE.LineSegments(
        //     new THREE.EdgesGeometry(this.coreMesh.geometry),
        //     this.translucentEdgeMaterial2D,
        // );
        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        // this.objectsGroup.add(this.coreEdges);
        // polygon model properties
        const defaultValues = this.getDefaultValues();
        this.baseHeight = 0;
        this.coreheight = 0;
        this.isSelected = false;

        // this.stage.stateManager.add({
        //     uuid: this.uuid,
        //     getStateCb: () => CREATED_STATE,
        //     withoutContainer: true,
        // });

    }

    changeColorOnSelect() {
        this.solidMaterial.emissive.setHex(0x00f0f0);
    }
    changeColorDeSelect() {
        this.solidMaterial.emissive.setHex(0x000000);
    }

    computeUVs(geometry) {
        this.stage.ground.plane.geometry.computeBoundingBox();
        let groundGeometry = this.stage.ground.plane.geometry;

        let max = groundGeometry.boundingBox.max,
            min = groundGeometry.boundingBox.min;
        let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
        let range = new THREE.Vector2(max.x - min.x, max.y - min.y);
        let faces = geometry.faces;

        geometry.faceVertexUvs[0] = [];

        for (let i = 0; i < faces.length; i++) {
            let v1 = geometry.vertices[faces[i].a],
                v2 = geometry.vertices[faces[i].b],
                v3 = geometry.vertices[faces[i].c];
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
                new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
                new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
            ]);
        }
        geometry.uvsNeedUpdate = true;
    }

    getState() {
        const polygonData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            coreHeight: this.coreHeight,
            parapetHeight: this.parapetHeight,
            parapetThickness: this.parapetThickness,
            tilt: this.tilt,
            lockedParameter: this.lockedParameter,
            topHeight: this.topHeight,
            azimuth: this.azimuth,
            setbackInside: this.setbackInside,
            setbackOutside: this.setbackOutside,
            ignored: this.ignored,
            placable: this.placable,
            rotationPoints: this.rotationPoints,
            obstruction: this.obstruction,
            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return polygonData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load polygon properties
            this.baseHeight = state.baseHeight;
            this.coreHeight = state.coreHeight;
            this.tilt = state.tilt;
            this.lockedParameter = state.lockedParameter;
            this.topHeight = state.topHeight;
            this.azimuth = state.azimuth;
            this.ignored = state.ignored;
            this.placable = state.placable;
            this.obstruction = state.obstruction;

            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));

            } else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            } else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // Remove outline points
                for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                }

                // create outline points
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
            } else {
                console.error('PolygonModel: loadState: Error in Loading Outline Points');
                return null;
            }

            // update geometry
            this.updateGeometry();
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: PolygonModel.getObjectType(),
            children: [],
        };

        // save id and name
        polygonModelData.id = this.id;
        polygonModelData.name = this.name;

        // save polygon properties
        polygonModelData.baseHeight = this.baseHeight;
        polygonModelData.coreHeight = this.coreHeight;
        polygonModelData.tilt = this.tilt;
        polygonModelData.lockedParameter = this.lockedParameter;
        polygonModelData.topHeight = this.topHeight;
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.ignored = this.ignored;
        polygonModelData.placable = this.placable;
        polygonModelData.obstruction = this.obstruction;
        polygonModelData.isObstruction = this.isObstruction;
        if (this.isObstruction) polygonModelData.flushType = this.flushType;
        // polygonModelData.rotationPoints = this.rotationPoints;

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            if (position !== undefined) {
                outlinePoints.push([
                    position.x,
                    position.y,
                    position.z,
                ]);
            }
        }
        polygonModelData.outlinePoints = outlinePoints;

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        return polygonModelData;
    }

    validateObject(polygonModelData) {
        let allOutlinePointsZero = true;
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            if (!(polygonModelData.outlinePoints[i][0] === 0 &&
                polygonModelData.outlinePoints[i][1] === 0 &&
                polygonModelData.outlinePoints[i][2] === 0)) {
                allOutlinePointsZero = false;
                break;
            }
        }
        if (allOutlinePointsZero) {
            return { isValid: false };
        }

        if (polygonModelData.topHeight === undefined) {
            polygonModelData.topHeight = 5;
        }

        return { isValid: true };
    }

    loadObject(polygonModelData, isPaste = false) {
        if (!this.validateObject(polygonModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Polygon data invalid: Polygon removed');
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = polygonModelData.id;
            this.name = polygonModelData.name;
        }

        // load polygon properties
        this.baseHeight = polygonModelData.topHeight;

        // this.rotationPoints = polygonModelData.rotationPoints;

        // set outline points
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                polygonModelData.outlinePoints[i].x,
                polygonModelData.outlinePoints[i].y,
                polygonModelData.outlinePoints[i].z,
                this,
                this.stage,
            ));
        }
        // update geometry
        this.updateGeometry();

        // load children
        const { children } = polygonModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === Subarray.getObjectType()) {
                const subarray = new Subarray(this.stage);
                subarray.loadObject(children[i], this, isPaste);
            }
            if (isPaste) {
                this.saveState({ withoutContainer: false });
            } else {
                this.saveState({ withoutContainer: true });
            }
        }
        this.stage.polygonModel = this;
        this.stage.studioStore.$patch({basePolygonDrawn:true});
        this.stage.studioStore.$patch({atleast3PointsDrawn:true});
    }

    // Drawing functions
    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    async onComplete(geometry) {
        // getting vertices from buffer geometry
        const vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i += 1) {
            vertices.push(new THREE.Vector3(
                geometry.attributes.position.array[(i * 3)],
                geometry.attributes.position.array[(i * 3) + 1],
                1,
            ));
        }

        const jstsGeom = utils.verticesToJSTSPolygon(vertices.map(v => [v.x, v.y])).buffer(0);
        const simplifiedVertices = utils.verticesFromJSTSPolygon(jstsGeom).map(v => new THREE.Vector3(...v));

        // Removing collinear vertices
        for (let i = 0; i < simplifiedVertices.length; i += 1) {
            const vertex = simplifiedVertices[i];
            const vertexNext = simplifiedVertices[(i + 1) % simplifiedVertices.length];
            const vertexPrev = simplifiedVertices[(i - 1 + simplifiedVertices.length) % simplifiedVertices.length];
            if (this.checkCollinear(vertex, vertexNext, vertexPrev)) {
                simplifiedVertices.splice(i, 1);
                i -= 1;
            }
        }

        // set outline points
        for (let i = 0, l = simplifiedVertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                simplifiedVertices[i].x,
                simplifiedVertices[i].y,
                simplifiedVertices[i].z,
                this,
                this.stage,
            ));
        }

        geometry.computeBoundingSphere();

        try {
            await this.placeObject();
            let stageData = JSON.parse(localStorage.getItem("stageData"));
            if(stageData.groundData){
                stageData.groundData.children.push({
                    id: this.id, 
                    outlinePoints: simplifiedVertices,
                    type: PolygonModel.getObjectType(),
                    topHeight: this.coreHeight,
                    children: this.children,
                });
                stageData.modelId = this.stage._MODEL_ID_INIT;
                stageData.obsId = this.stage._OBS_ID_INIT;
            }
            this.coreEdges = new THREE.EdgesGeometry(this.coreMesh.geometry.clone());
            this.line = new THREE.LineSegments(this.coreEdges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));
            this.objectsGroup.add(this.line);
            localStorage.setItem('stageData', JSON.stringify(stageData));
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: OnComplete failed.', error);
            this.onCancel();
            return Promise.reject(error);
        }
    }

    checkCollinear(a, b, c) {
        let t = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
        return Math.abs(t) < 0.01;
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    // Takes 4 inputs, azimuth, lockedParameter, and any two of top height, tilt and core height.
    computeTiltAndHeights(params) {
        this.coreMesh.geometry.computeBoundingSphere();
        const response = {
            tilt: params.tilt,
            coreHeight: params.coreHeight,
            topHeight: params.topHeight,
        };

        const {
            azimuth,
            coreHeight,
            topHeight,
            lockedParameter,
            tilt,
        } = params;

        let parent = null;
        let parentTilt = 0;
        let parentAzimuth = 180;
        if (params.parent !== undefined && params.parent !== null) {
            ({ parent } = params);
        } else {
            parent = this.getParent();
        }

        if (parent === null) {
            const placingInformation = this.getPlacingInformation(utils.drawingArrayTo2DArray(
                this.stage.drawManager.getVertices(),
                this.stage.drawManager.getNoOfVertices(),
            ), params);
            return (placingInformation.tiltAndHeights !== undefined) ?
                placingInformation.tiltAndHeights : response;
        }

        parentTilt = parent.getTilt();
        parentAzimuth = parent.getAzimuth();

        let vertices = [];
        if (params.vertices === undefined || params.vertices === null) {
            vertices = utils.convertArrayToVector(this.get2DVertices());
        } else {
            ({ vertices } = params);
        }

        switch (lockedParameter) {
            case TILT_LOCKED:
                response.tilt = modelUtils.computeTilt(
                    azimuth,
                    coreHeight,
                    topHeight,
                    vertices,
                    parent,
                );
                break;
            case CORE_HEIGHT_LOCKED:
                response.coreHeight = modelUtils.computeCoreHeight(
                    parentTilt,
                    parentAzimuth,
                    tilt,
                    azimuth,
                    vertices,
                    topHeight,
                );
                break;
            case TOP_HEIGHT_LOCKED:
                response.topHeight = modelUtils.computeTopHeight(
                    parentTilt,
                    parentAzimuth,
                    tilt,
                    azimuth,
                    vertices,
                    coreHeight,
                );
                break;
            default:
                console.error(`ERROR: PolygonModel: computeTiltAndHeights failed -
                Incorrect locked parameter ${lockedParameter}`);
        }
        return response;
    }

    // Geometry functions

    updateGeometry() {
        this.coreHeight = this.floorValue;
        this.baseHeight = 0;
        const vertices2DArray = this.get2DVertices();
        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);

        // create core
        const coreShape = new THREE.Shape(vertices2DVectorArray);
        const coreGeometry = new THREE.ExtrudeGeometry(
            coreShape, {
            depth: this.coreHeight,
            bevelEnabled: false,
        },
        );
        coreGeometry.translate(0, 0, this.baseHeight);

        this.coreMesh.visible = true;

        // updating outline points height
        let outlinePointHeightConstant = this.baseHeight + this.coreHeight;
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(
                0,
                0,
                outlinePointHeightConstant - this.outlinePoints[i].getPosition().z,
            );
        }

        // updating meshes and edges
        this.coreMesh.geometry = coreGeometry;
        this.coreEdges = new THREE.EdgesGeometry(coreGeometry.clone());
        this.line = new THREE.LineSegments(this.coreEdges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));
        this.objectsGroup.add(this.line);
        // this.coreEdges.position.z = this.coreMesh.position.z + 0.01;
    }

    // Placing functions

    getPlacingInformation(vertices) {
        const response = {};
        let numberOfPoints;

        // Getting vertices
        let vertices2DArray;
        if (vertices === null || vertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        } else {
            vertices2DArray = vertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        if (!raycastingUtils.areVerticesOnGround(vertices2DVectorArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
            polygonExists = false;
        }
        // if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
        //     utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
        //     const error = new Error(COMPLEX_GEOMETRY_ERROR);
        //     response.errors.push(error);
        //     response.cannotCompleteError = error;
        //     parentExists = false;
        // }
        return response;
    }
    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.baseHeight += deltaZ;
        // this.rotateObject(deltaX,deltaY,deltaZ)
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        // this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);
        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update children
        // const children = this.getChildren();
        // for (let i = 0, l = children.length; i < l; i += 1) {
        //     children[i].moveObject(deltaX, deltaY, deltaZ);
        // }
        // this.roofTextureGeometry.translate(0, 0, deltaZ);

        // this.saveState();
    }

    placeObject(deltaX = 0, deltaY = 0) {
        // move object
        // this.moveObject(deltaX, deltaY, 0);

        // if (placingInformation.errors.length !== 0) {
        //     const error = placingInformation.errors[0];
        //     // if (error.message === COMPLEX_GEOMETRY_ERROR) {
        //     //     this.stage.eventManager.setComplexPolygonModelRemoved();
        //     // } else if (error.message === OUT_OF_GROUND_ERROR) {
        //     //     this.stage.eventManager.setPolygonModelOutOfGroundRemoved();
        //     // } else if (error.message === VERTEX_EQUIVALENT_ERROR) {
        //     //     this.stage.eventManager.modelVertexEquivalentError();
        //     // } else if (error.message === INVALID_CORE_HEIGHT_ERROR) {
        //     //     this.stage.eventManager.invalidCoreHeightErrorForPolygon();
        //     // } else if (error.message === INVALID_TILT_ERROR) {
        //     //     this.stage.eventManager.invalidTiltErrorForPolygon();
        //     // }
        //     console.log(placingInformation.errors)
        //     this.removeObject();
        // }
        // get new parent and height while placing
        const newParent = stage.ground;
        const newHeight = this.stage.ground.height;

        // update new parent
        this.changeParent(newParent);

        // update new base height
        this.baseHeight = newHeight;
        this.updateGeometry();
        this.deSelect();
    }

    updateHeightOnFloorChange(floorValue) {
        this.floorValue = floorValue * HEIGHT_PER_FLOOR;
        this.updateGeometry();
        this.getChildren().forEach((obstruction)=> {
            obstruction.updateHeight(this.floorValue, this);
        })
    }

    handleDragStart() {
        this.setbackOutsideMesh.visible = false;
        this.previousIntersectingCableConduit = this.getIntersectingCablesConduit();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd(deltaX = 0, deltaY = 0) {
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();

        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
        try {
            await this.placeObject(deltaX, deltaY);
        } catch (e) {
            // error handled by place object
        } finally {
            this.stage.eventManager.completePolygonModelLoading(notificationObject);
        }
        this.previousIntersectingCableConduit = [];
    }

    handleDragCancel() {
        this.previousIntersectingCableConduit = [];
        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }


    handleVertexDragStart(vertex) {
        this.polygonMeasurement.handleVertexDragStart(vertex);
        this.previousIntersectingCableConduit = this.getIntersectingCablesConduit();
        this.previousHeight = this.getHighestZ();
    }

    handleVertexMove(vertex) {
        if (!(vertex instanceof RotationPoint) && this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: PolygonModel: vertex not in outlinePoints in handleVertexMove');
        }

        if (!this.isObstruction) {
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];

            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (!(vertex instanceof RotationPoint) && this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: PolygonModel: vertex not in outlinePoints in handleVertexPlace');
        }

        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        this.previousIntersectingCableConduit = [];
        try {
            // place object
            await this.placeObject();
            this.currentHeight = this.getHighestZ();
            const deltaZ = this.currentHeight - this.previousHeight;

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);
            // to update the mesh in the scene
            this.stage.mergeManager.mergeScene(this);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            await this.saveState();

            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    getDefaultValues() {
        return {
            coreHeight: 5,
        };
    }

    changePropertiesDuringCreation(properties) {
        if (Object.prototype.hasOwnProperty.call(properties, 'name') &&
            properties.name !== this.name) {
            this.name = properties.name;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'baseHeight') &&
            properties.baseHeight !== this.baseHeight) {
            this.baseHeight = properties.baseHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'coreHeight') &&
            properties.coreHeight !== this.coreHeight) {
            this.coreHeight = properties.coreHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetHeight') &&
            properties.parapetHeight !== this.parapetHeight) {
            this.parapetHeight = properties.parapetHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetThickness') &&
            properties.parapetThickness !== this.parapetThickness) {
            this.parapetThickness = properties.parapetThickness;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'lockedParameter') &&
            properties.lockedParameter !== this.lockedParameter) {
            this.lockedParameter = properties.lockedParameter;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'topHeight') &&
            this.topHeight !== properties.topHeight) {
            this.topHeight = properties.topHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'azimuth') &&
            properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            this.setbackInside = properties.setbackInside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackOutside') &&
            properties.setbackOutside !== this.setbackOutside) {
            this.setbackOutside = properties.setbackOutside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'ignored') &&
            properties.ignored !== this.ignored) {
            this.ignored = properties.ignored;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'placable') &&
            properties.placable !== this.placable) {
            this.placable = properties.placable;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'obstruction') &&
            properties.obstruction !== this.obstruction) {
            this.obstruction = properties.obstruction;
        }
    }

    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.POLYGON;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    updateVisualsAfterLoadingAndCreation() {
        this.materialState = this.stage.visualManager.getMaterialStateBasedOnConditions();
        this.stage.visualManager.switchDefaultVisualStatesInSequenceForObject(this);
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            this.parapetMesh.castShadow = true;
            if (this.coreMesh.material !== this.solidMaterial) {
                this.coreMesh.material = this.solidMaterial;
                // this.coreEdges.material = this.edgesolidMaterial;
                this.parapetMesh.material = this.parapetSolidMeshMaterial;
                this.parapetEdges.material = this.edgesolidMaterial;
            }
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            this.parapetMesh.castShadow = false;
            if (this.coreMesh.material !== this.translucentMaterial2D) {
                this.coreMesh.material = this.translucentMaterial2D;
                // this.coreEdges.material = this.translucentEdgeMaterial2D;
                this.parapetMesh.material = this.translucentMaterial2D;
                this.parapetEdges.material = this.translucentParapetEdgeMaterial2D;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        // visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges);
        visualUtils.updateMeshWithColor(newColors.PARAPET_COLOR, this.parapetMesh);
        visualUtils.updateMeshWithColor(newColors.PARAPET_EDGE_COLOR, this.parapetEdges);
        visualUtils.updateMeshWithColor(newColors.SETBACK_COLOR, this.setbackInsideMesh);
        visualUtils.updateMeshWithColor(newColors.SETBACK_COLOR, this.setbackOutsideMesh);

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        } else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    switchTo2d() {
        this.coreMesh.material = this.translucentMaterial2D;
        // this.objectsGroup.remove(this.line);
    }

    switchTo3d() {
        this.coreMesh.material = this.solidMaterial;
        this.objectsGroup.add(this.line);
    }

    // Helper functions

    get numVertices() {
        return this.outlinePoints.length;
    }

    get mesh() {
        return this.coreMesh;
    }

    get mesh2D() {
        return this.coreMesh;
    }

    get mesh3D() {
        return this.coreMesh;
    }

    get mergeMeshMaterial2D() {
        return this.translucentMaterial2D;
    }

    get mergeMeshMaterial3D() {
        return this.solidMaterial;
    }

    get mergeEdgeMaterial2D() {
        return this.translucentEdgeMaterial2D;
    }

    get mergeEdgeMaterial3D() {
        return this.edgesolidMaterial;
    }

    get2DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
            ]);
        }
        return vertices;
    }

    get3DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const outlinePoint = this.outlinePoints[i].getPosition();
            vertices.push([
                outlinePoint.x,
                outlinePoint.y,
                outlinePoint.z,
            ]);
        }
        return vertices;
    }

    getBaseHeight() {
        return this.baseHeight;
    }

    getHighestZ() {
        let highestZ = 0;
        let vertices = this.coreMesh.geometry.attributes.position.array;
        vertices = utils.convertArrayToVector(vertices);
        for (let i = this.numVertices; i < 2 * this.numVertices; i += 1) {
            if (vertices[i]) {
                highestZ = Math.max(highestZ, vertices[i].z);
            }
        }
        return highestZ;
    }

    getTopHeight() {
        return this.topHeight;
    }

    getLockedParameter() {
        return this.lockedParameter;
    }

    getCoreHeight() {
        return this.coreHeight;
    }

    getTilt() {
        return 0;
        // return this.tilt;
    }

    getAzimuth() {
        return 180;
        // return this.azimuth;
    }

    isIgnored() {
        return this.ignored;
    }

    getPossibleAzimuths({ isCreation } = { isCreation: false }) {
        // get the vertices in clockwise order
        const vertices = (isCreation) ?
            this.stage.drawManager.get2DVertices() : this.get2DVertices();
        if (vertices.length === 0) {
            return [];
        }
        if (utils.checkClockwise(vertices)) {
            vertices.reverse();
        }

        // getting normal for each pair
        vertices.push(vertices[0]);
        const azimuths = [];
        for (let idx = 0; idx < vertices.length - 1; idx += 1) {
            let angle = utils.toDegrees(Math.atan2(
                (vertices[idx + 1][1] - vertices[idx][1]), -(vertices[idx + 1][0] - vertices[idx][0]),
            ));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }

    getZOnTopSurface(x, y) {
        if (this.outlinePoints.length === 0) {
            console.error('ERROR: PolygonModel: has outline points null');
        }
        const v1 = this.outlinePoints[0].getPosition();
        let v2 = this.outlinePoints[1].getPosition();
        const v3 = this.outlinePoints[2].getPosition();
        v1.addScaledVector(v2, -1);
        v3.addScaledVector(v2, -1);
        v1.cross(v3);
        v2 = this.outlinePoints[1].getPosition();
        const d = -1 * ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
        return -1 * ((d / v1.z) + ((v1.y * y) / v1.z) + ((v1.x * x) / v1.z));
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getEdges() {
        const vertices = utils.convertArrayToVector(this.get2DVertices());
        const edges = [];
        for (let i = 0; i < vertices.length - 1; i += 1) {
            edges.push([
                vertices[i],
                vertices[i + 1],
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[vertices.length - 1].x !== vertices[0].x ||
                vertices[vertices.length - 1].y !== vertices[0].y)) {
            edges.push([
                vertices[vertices.length - 1],
                vertices[0],
            ]);
        }

        return edges;
    }

    async onFillFace({ isCustom } = { isCustom: false }) {
        // Removing previous subarray
        const subarray = new Subarray(this.stage);
        this.subarray = subarray;
        subarray.associatedModel = this;
        try {
            await subarray.fillFace(
                this.get3DVertices(),
                this.tilt,
            );
            this.structures = await createStructure({
                subarrayList: this.subarray,
                scene: this.stage.sceneManager.scene,
                structureDesignTemplate: this.subarray.template,
            });
            this.stage.sceneManager.scene.add(this.structures);
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: onFillFace failed', error);
            return Promise.reject(error);
        }
    }

    getChildrenModelUuids(ids) {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof PolygonModel || children[i] instanceof CylinderModel) {
                ids.push(children[i].uuid);
                children[i].getChildrenModelUuids(ids);
            }
        }
    }

    addObjectsToDragControls() {
        this.stage.dragControls.removeAll();
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        this.stage.dragControls.add(
            this.rotationPoints,
            this.rotationPoints.moveObject.bind(this.rotationPoints),
            this.rotationPoints.placeObject.bind(this.rotationPoints),
            this.rotationPoints.handleDragStart.bind(this.rotationPoints),
            this.rotationPoints.handleDragCancel.bind(this.rotationPoints),
        );

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            if (!this.isObstruction) {
                for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                    const v = this.edgeCentrePoints[i];
                    this.stage.dragControls.add(
                        v,
                        v.moveObject.bind(v),
                        v.placeObject.bind(v),
                        v.handleDragStart.bind(v),
                    );
                }
            }
        }
    }


    // Universal Functions

    onSelect() {
        // show outline points
        // for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
        //     this.outlinePoints[i].showObject();
        // }
        // add to drag
        // this.addObjectsToDragControls();
        this.isSelected = true;
        this.translucentMaterial2D.opacity = 0.85;
        this.stage.currentSelectedObject = this;
        // this.changeColorOnSelect();
    }

    deSelect() {
        // hide outline points
        // for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
        //     this.outlinePoints[i].hideObject();
        // }
        this.isSelected = false;
        this.translucentMaterial2D.opacity = 0.50;
        this.stage.currentSelectedObject = null;
    }

    removeObject() {

        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }

        // NOTE: deSelect should be after save since it will disable
        // drag controls and stop Undo/Redo container
        //select ground
        this.stage.ground.onSelect();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        let prevParent = null;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            prevParent = null;
        }

        // Remove outline points
        for (let j = this.outlinePoints.length - 1; j >= 0; j -= 1) {
            this.outlinePoints[j].removeObject();
            this.outlinePoints.splice(j, 1);
        }
        let stageData = JSON.parse(localStorage.getItem('stageData'));
        if(stageData.groundData){
            stageData.groundData.children = [];
            localStorage.setItem('stageData', JSON.stringify(stageData));
        }
    }

    // onSelect() {
    //     console.log('selected');
    // }

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const pointPosition = this.outlinePoints[i].getPosition();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count += 1;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    static getObjectType() {
        return 'PolygonModel';
    }
}