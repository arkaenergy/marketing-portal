import * as THREE from 'three';
import _ from 'lodash';
import Row from './Row';
import BaseObject from '../BaseObject';
import * as utils from '../../utilities/utils';
import * as raycastingUtils from '../../utilities/rayCastingUtils';
import {
    getTableMapCentroid,
    getDynamicOffsetBasedOnArea,
    getRays,
} from '../../utilities/subarrayUtils';
import {
    COMPLEX_GEOMETRY_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    SUBARRAY_RACK_STYLE_FLUSH,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    SUBARRAY_RACK_STYLE_FIXED,
    PANEL_TYPE_MONOCRYSTALLINE,
    SUBARRAY_DEFAULTS,
} from "../../utilities/constants";
import OutlinePoints from '../OutlinePoints';
import * as JSTS from 'jsts';
import PolygonModel from '../PolygonModel';
// import CylinderModel from '../model/CylinderModel';
// import panelPlacementModule from './SubarrayPanelPlacement';
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES, LINE_WIDTH } from '../../utilities/constants';
import API from '@/services/api/';
import Obstruction from '../Obstruction';

const MERGE_ROWS = 'MergeRows';
const ADD_TO_ROW = 'AddToRow';
const CREATE_NEW_ROW = 'CreateNewRow';

const MINIMUM_NUMBER_OF_POINTS = 3;

export default class Subarray extends BaseObject {
    constructor(stage) {
        super(stage);
        // standard norms
        this.stage = stage;
        this.id = this.stage.getSubarrayId();
        this.name = 'Subarray #' + this.id.toString();
        this.addTableFlow = false;
        this.structureUpdateRequired = false;
        this.inverterIds = [];

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.panelMeshMaterial = new THREE.MeshLambertMaterial({
            transparent: false,
            side:  THREE.DoubleSide,
            vertexColors: true,
        });
        this.panelEdgeMaterial = new THREE.LineBasicMaterial({
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PANEL_EDGE_COLOR,
        });

        this.mergedMesh = new THREE.Mesh(new THREE.BufferGeometry() ,this.panelMeshMaterial);
        this.mergedEdgemesh = new THREE.LineSegments(new THREE.BufferGeometry() ,this.panelEdgeMaterial);

        this.objectsGroup.add(this.mergedMesh);
        this.objectsGroup.add(this.mergedEdgemesh);

        // materials
        this._meshMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.4,
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._edgeMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // list of outline points
        this.outlinePoints = [];

        // mesh and edges
        this.coreMesh = new THREE.Mesh( new THREE.BufferGeometry(), this._meshMaterial);

        // hide mesh and edges
        this.coreMesh.visible = false;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);

        // associated model
        this.associatedModel = this.stage.ground;

        // subarray properties
        const defaultValues = this.getDefaultValues();
        this.tilt = defaultValues.tilt;
        this.azimuth = defaultValues.azimuth;
        this.structureType = defaultValues.structureType;
        this.panelOrientation = defaultValues.panelOrientation;
        this.mountHeight = defaultValues.mountHeight;
        this.tableSizeUp = defaultValues.tableSizeUp;
        this.tableSizeWide = parseInt(defaultValues.tableSizeWide, 10);
        this.tableSpacing = defaultValues.tableSpacing;
        this.moduleSpacingUp = defaultValues.moduleSpacingUp;
        this.moduleSpacingWide = defaultValues.moduleSpacingWide;
        this.moduleProperties = defaultValues.moduleProperties;
        this.panelProperties = defaultValues.panelProperties;
        this.rowSpacingMode = defaultValues.rowSpacingMode;
        if (defaultValues.rowSpacingMode === ROW_SPACING_MODE_MANUAL) {
            this.rowSpacing = defaultValues.rowSpacing;
        }
        else {
            const optimizedRowSpacing = this.getOptimisedRowSpacing();
            this.rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
        }
        this.mountType = defaultValues.mountType;
        this.bifacialEnabled = false;

        // TODO: Remove this after selection controls
        this.canvas = stage.rendererManager.getDomElement();

        this.PANEL_MODEL_ID = 0;

        this.inverterLerpPosition = 0;
        this.linkedMppts = [];
        this.inverters = [];
    }

    getState() {
        // IMPORTANT: Currently not handeling the case when we delete of inverter
        // const linkedMppts = [];
        // for (let i = 0, l = this.linkedMppts.length; i < l; i += 1) {
        //     linkedMppts.push(this.linkedMppts[i]);
        // }
        return {
            type: Subarray.getObjectType(),
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            addTableFlow: this.addTableFlow,
            moduleProperties: {
                moduleId: this.moduleProperties.moduleId,
                moduleMake: this.moduleProperties.moduleMake,
                moduleSize: this.moduleProperties.moduleSize,
                moduleLength: this.moduleProperties.moduleLength,
                moduleWidth: this.moduleProperties.moduleWidth,
            },
            panelProperties: this.panelProperties,
            mountType: this.mountType,
            rowSpacing: this.rowSpacing,
            rowSpacingMode: this.rowSpacingMode,
            tilt: this.tilt,
            structureType: this.structureType,
            azimuth: this.azimuth,
            panelOrientation: this.panelOrientation,
            mountHeight: this.mountHeight,
            tableSizeUp: this.tableSizeUp,
            tableSizeWide: this.tableSizeWide,
            tableSpacing: this.tableSpacing,
            moduleSpacingUp: this.moduleSpacingUp,
            moduleSpacingWide: this.moduleSpacingWide,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
            boundingBox: this.getBoundingBox(),
            inverterLerpPosition: this.inverterLerpPosition,
            // IMPORTANT: Currently not handeling the case when we delete of invertes
            // linkedMppts,
            // inverters: this.inverters,
        };
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;
            this.addTableFlow = state.addTableFlow;
            // load subarray properties
            this.moduleProperties = {
                moduleId: state.moduleProperties.moduleId,
                moduleMake: state.moduleProperties.moduleMake,
                moduleSize: state.moduleProperties.moduleSize,
                moduleLength: state.moduleProperties.moduleLength,
                moduleWidth: state.moduleProperties.moduleWidth,
            };
            this.panelProperties = state.panelProperties;
            this.mountType = state.mountType;
            this.rowSpacing = state.rowSpacing;
            this.structureType = state.structureType; // TBC what is load state
            this.rowSpacingMode = state.rowSpacingMode;
            this.tilt = state.tilt;
            this.azimuth = state.azimuth;
            this.panelOrientation = state.panelOrientation;
            this.mountHeight = state.mountHeight;
            this.tableSizeUp = state.tableSizeUp;
            this.tableSizeWide = state.tableSizeWide;
            this.tableSpacing = state.tableSpacing;
            this.moduleSpacingUp = state.moduleSpacingUp;
            this.moduleSpacingWide = state.moduleSpacingWide;
            this.boundingBox = state.boundingBox;
            this.inverterLerpPosition = state.inverterLerpPosition;
            // IMPORTANT: Currently not handeling the case when we delete an inverter
            // this.inverters = state.inverters;
            // this.linkedMppts = [];
            // for (let i = 0, l = state.linkedMppts.length; i < l; i += 1) {
            //     this.linkedMppts.push(state.linkedMppts[i]);
            // }
            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }
            this.associatedModel = this.getParent();

            this.validateStructures();

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
            }
            else {
                // update outline points
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('PolygonModel: loadState: outlinePoints length don\'t match');
                    return null;
                }
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
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
        //updating the rails after redo on delete
        let prevParent;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            if (prevParent instanceof SmartroofFace) {
                prevParent.updateRails();
            }
            prevParent = null;
        }
        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    saveObject() {
        let subarrayData = {
            type: Subarray.getObjectType(),
        };

        // save id and name
        subarrayData.id = this.id;
        subarrayData.name = this.name;
        subarrayData.addTableFlow = this.addTableFlow;
        // save subarray properties
        subarrayData.moduleProperties = {
            moduleId: this.moduleProperties.moduleId,
            moduleMake: this.moduleProperties.moduleMake,
            moduleSize: this.moduleProperties.moduleSize,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
        };
        subarrayData.panelProperties = this.panelProperties;
        subarrayData.rowSpacing = this.rowSpacing;
        subarrayData.rowSpacingMode = this.rowSpacingMode;
        subarrayData.tilt = this.tilt;
        subarrayData.structureType = this.structureType;
        subarrayData.azimuth = this.azimuth;
        subarrayData.panelOrientation = this.panelOrientation;
        subarrayData.mountHeight = this.mountHeight;
        subarrayData.tableSizeUp = this.tableSizeUp;
        subarrayData.tableSizeWide = this.tableSizeWide;
        subarrayData.tableSpacing = this.tableSpacing;
        subarrayData.moduleSpacingUp = this.moduleSpacingUp;
        subarrayData.moduleSpacingWide = this.moduleSpacingWide;
        subarrayData.mountType = this.mountType;
        subarrayData.inverterLerpPosition = this.inverterLerpPosition;

        subarrayData.inverterIds = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            subarrayData.inverterIds.push(this.inverters[i].id);
        }
        subarrayData.bifacialEnabled = this.bifacialEnabled;

        // saving outline points
        let outlinePoints = [];
        for (let outlinePoint of this.outlinePoints) {
            outlinePoints.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ])
        }
        subarrayData.outlinePoints = outlinePoints;
       
        // save subarray map
        subarrayData.subarrayMap = this.getSubarrayMap();
        return subarrayData;
    }

    async loadObject(subarrayData, parentModel, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = subarrayData.id;
            this.name = subarrayData.name;
        }

        this.addTableFlow = subarrayData.addTableFlow;
        // load subarray properties
        this.moduleProperties = {
            moduleId: subarrayData.moduleProperties.moduleId,
            moduleMake: subarrayData.moduleProperties.moduleMake,
            moduleSize: subarrayData.moduleProperties.moduleSize,
            moduleLength: subarrayData.moduleProperties.moduleLength,
            moduleWidth: subarrayData.moduleProperties.moduleWidth,
        };
        if (subarrayData.panelProperties === undefined || (subarrayData.panelProperties.id !== this.moduleProperties.moduleId)) {
            if(window.location.pathname.includes("studio")){
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.panelProperties = selectedPanel;
            }
        }
        else {
            this.panelProperties = subarrayData.panelProperties;
        }
        this.rowSpacing = subarrayData.rowSpacing;
        this.rowSpacingMode = subarrayData.rowSpacingMode;
        this.tilt = subarrayData.tilt;
        this.structureType = subarrayData.structureType;
        this.azimuth = subarrayData.azimuth;
        this.panelOrientation = subarrayData.panelOrientation;
        this.mountHeight = subarrayData.mountHeight;
        this.tableSizeUp = subarrayData.tableSizeUp;
        this.tableSizeWide = subarrayData.tableSizeWide;
        this.tableSpacing = subarrayData.tableSpacing;
        this.moduleSpacingUp = subarrayData.moduleSpacingUp;
        this.moduleSpacingWide = subarrayData.moduleSpacingWide;
        this.mountType = subarrayData.mountType;
        this.bifacialEnabled = subarrayData.bifacialEnabled;

        if (subarrayData.inverterLerpPosition !== undefined) {
            this.inverterLerpPosition = subarrayData.inverterLerpPosition;
        }

        // load subarray outline vertices (points)
        if (parentModel !== null) {
            this.associatedModel = parentModel;
            this.associatedModel.addChild(this);
        }

        if (subarrayData.inverterIds !== undefined) {
            this.inverterIds = subarrayData.inverterIds;
        }
        // load inverters accoding to this..
        // if (subarrayData.inverterIds !== undefined) {
        //     for (let i = 0, l = subarrayData.inverterIds.length; i < l; i += 1) {
        //         this.inverterIds.push(subarrayData.inverterIds);
        //     }
        // }

        // TODO: Identify the real cause
        if (subarrayData.outlinePoints.length === 0) {
            if (subarrayData.subarrayMap.rows.length === 0) {
                this.removeObject();
                return;
            }
            let coordinatePoints = [];
            for (let row of subarrayData.subarrayMap.rows) {
                for (let table of row.frames) {
                    for (let panel of table.panels) {
                        for (let corner of panel.corners) {
                            coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                        }
                    }
                }
            }
            let convexHullCoordinates = new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints).convexHull().getCoordinates().slice(0, -1);
            subarrayData.outlinePoints = convexHullCoordinates.map(coordinate => [coordinate.x, coordinate.y, 0]);
        }

        // set outline points
        for (let outlinePoint of subarrayData.outlinePoints) {
            this.outlinePoints.push(
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage
                )
            );
        }
        // update geometry
        this.updateGeometry();

        if (isPaste) {
            // load subarray map
            this.makeSubarray(subarrayData.subarrayMap, { withoutContainer: false });
        }
        else {
            // manuplating the subarray map to create row blocks
            subarrayData.subarrayMap = this.createRowBlocksInSubarrayMap(subarrayData.subarrayMap);
            this.makeSubarray(subarrayData.subarrayMap, { withoutContainer: true });
        }

        this.validateStructures();
        this.ensureValidSubarrayDCSize();
    }

    createConvexHull() {
        if (this.outlinePoints.length === 0) {
            const coordinatePoints = [];
            const subarrayMap = this.getSubarrayMap();
            const subarrayOffset = 0.25;
            for (let i = 0, rowLen = subarrayMap.rows.length; i < rowLen; i += 1) {
                const row = subarrayMap.rows[i];
                for (let j = 0, frameLen = row.frames.length; j < frameLen; j += 1) {
                    const frame = row.frames[j];
                    for (let k = 0, panelLen = frame.panels.length; k < panelLen; k += 1) {
                        const panel = frame.panels[k];
                        for (let l = 0, cornerLen = panel.corners.length; l < cornerLen; l += 1) {
                            const corner = panel.corners[l];
                            coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                        }
                    }
                }
            }
            const convexHullCoordinates =
                new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints)
                    .convexHull().getCoordinates();
            const simplifiedConvexHull = utils.removeCollinearPoints(convexHullCoordinates
                .map(coordinate => [coordinate.x, coordinate.y]).slice(0, -1));
            const outlinePoints = utils.setbackPolygon(
                simplifiedConvexHull,
                subarrayOffset,
            );
            for (let i = 0, len = outlinePoints.length; i < len; i += 1) {
                this.outlinePoints.push(new OutlinePoints(
                    outlinePoints[i][0],
                    outlinePoints[i][1],
                    0,
                    this,
                    this.stage,
                ));
            }
            this.updateGeometry();
        }
    }

    createBoundaryFromParent() {
        const vertices = this.getParent().get2DVertices();
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i][0],
                vertices[i][1],
                0,
                this,
                this.stage,
            ));
        }
        this.updateGeometry();
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
        let vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i++) {
            vertices.push(
                new THREE.Vector3(
                    geometry.attributes.position.array[i * 3],
                    geometry.attributes.position.array[i * 3 + 1],
                    geometry.attributes.position.array[i * 3 + 2],
                )
            )
        }

        // set outline points
        for (let vertex of vertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    vertex.x,
                    vertex.y,
                    vertex.z,
                    this,
                    this.stage
                )
            );
        }

        try {
            // update panel placement
            await this.placeObject();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Subarray: OnComplete failed.', error);
            this.onCancel();
            return Promise.reject(false);
        }

    }

    onCancel() {

        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    getBoundingBox(reset = false) {
        // order of vertices
        // top-left
        // bottom-left
        // bottom-right
        // top-right
        if (this.boundingBox === undefined || reset) {
            this.coreMesh.geometry.computeBoundingSphere();
            const subarraySphere = this.coreMesh.geometry.boundingSphere;
            subarraySphere.center.z = this.getParent().coreHeight;
            // 2D directions
            let bBoxDirectionUp = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                -this.azimuth * (Math.PI / 180),
            ); //  tilt's zero is from the base and azimuth is clockwise (in scene)
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionUp = utils.posResetFor2D(bBoxDirectionUp);

            let bBoxDirectionLeft = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                (-this.azimuth + 90) * (Math.PI / 180),
            );
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionLeft = utils.posResetFor2D(bBoxDirectionLeft);

            // finding 3D directions using the slope of parent
            const pointUp = subarraySphere.center.clone().addScaledVector(bBoxDirectionUp, 1);
            const pointLeft = subarraySphere.center.clone().addScaledVector(bBoxDirectionLeft, 1);

            // getting the z-coordinates of the points along the slope of the parent polygon
            pointUp.z = this.getParent().coreHeight;
            pointLeft.z = this.getParent().coreHeight;

            // now these direction are along the slope of the parent in 3D
            bBoxDirectionUp = pointUp.sub(subarraySphere.center);
            bBoxDirectionLeft = pointLeft.sub(subarraySphere.center);

            bBoxDirectionUp.normalize();
            bBoxDirectionLeft.normalize();

            // this is also normal of the parent surface
            const bBoxNormal = new THREE.Vector3();
            bBoxNormal.crossVectors(bBoxDirectionUp, bBoxDirectionLeft);
            bBoxNormal.normalize();

            const vertices = [];
            const diagonalVector = bBoxDirectionLeft.clone()
                .multiplyScalar(subarraySphere.radius * Math.SQRT2);
            const verticesOrderAngle = [-45, 45, 135, -135];

            verticesOrderAngle.forEach((angle) => {
                vertices.push(subarraySphere.center
                    .clone()
                    .add(diagonalVector
                        .clone()
                        .applyAxisAngle(bBoxNormal, utils.deg2Rad(angle))));
            });
            this.boundingBox = vertices;
        }
        return this.boundingBox;
    }

    // Geometry functions
    updateGeometry() {
        let vertices2DArray = this.get2DVertices();
        let vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);

        // create core
        let coreShape = new THREE.Shape(vertices2DVectorArray);
        let coreGeometry = new THREE.ShapeGeometry(coreShape);

        // TODO: Optimise here: Height calculation is done twice

        // update core geometry vertices height
        // for (let vertex of coreGeometry.vertices) {
        //     vertex.z = this.associatedModel.getZOnTopSurface(vertex.x, vertex.y);
        // }
        coreGeometry.translate(0, 0, this.associatedModel.coreHeight);

        // updating outline points height
        let constantForParapetAccommodation = 0;
        for (let outlinePoint of this.outlinePoints) {
            let position = outlinePoint.getPosition();
            outlinePoint.moveObjectWithoutConsequences(0, 0);
        }

        // updating mesh and edges
        this.coreMesh.geometry = coreGeometry;
        this.boundingBox = this.getBoundingBox({ reset: true});
        let outlineHeightAccommodationConstant = 1;
        this.boundingBox = this.getBoundingBox({ reset: true });
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);

        this.mergedMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.mergedEdgemesh.geometry.translate(deltaX, deltaY, deltaZ);

        // update the bounding box
        if (this.getParent() !== null) {
            this.boundingBox = this.getBoundingBox({ reset: true });
        }

        // update outline points without consequences
        for (let v of this.outlinePoints) {
            v.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update children
        for (let child of this.getChildren()) {
            child.moveObject(deltaX, deltaY, deltaZ);
        }

    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.outlinePoints[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;

        this.updateGeometry();
    }

    getPlacingInformation(drawingVertices) {
        const response = {};
        let numberOfPoints;
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        // Getting vertices
        let vertices2DArray;
        if (drawingVertices === null || drawingVertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        }
        else {
            vertices2DArray = drawingVertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
            parentExists = true;
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        let erodedVertices = [];
        if (polygonExists) {
            if (vertices2DArray.length > 3) {
                erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            }
            else {
                const erodedVectorVertices = utils.generateSetbackGeometry(
                    [0.001, 0.001, 0.001],
                    this.getEdges(),
                    vertices2DArray,
                    'setbackInside',
                );
                erodedVertices = utils.convertVectorArrayTo2DArray(erodedVectorVertices);
            }

            if (erodedVertices.length === 0) {
                const error = new Error(POLYGON_WITH_NO_AREA_ERROR);
                response.errors.push(error);
                response.cannotCompleteError = error;
                parentExists = false;
            }

            if (parentExists) {
                const allModels =
                    raycastingUtils.getAllCommonModelsBelowVertices(erodedVertices, this.stage);
                //getAllCommonModelsBelowVertices is used instead of getAllModelsBelowVertices because such object is 
                // required whose all vertices cover the subarray instead of the highest object in that area.
                for (let idx = 0, len = allModels.length; idx < len; idx += 1) {
                    if (!allModels[idx][0].isIgnored()) {
                        [response.parent, response.height] = allModels[idx];
                        break;
                    }
                }
            }
        }

        return response;
    }

    async fillFace(vertices, rackStyle = SUBARRAY_RACK_STYLE_FIXED, { isCustom } = { isCustom: false }) {
        if (rackStyle === SUBARRAY_RACK_STYLE_FLUSH) {
            this.mountType = SUBARRAY_RACK_STYLE_FLUSH;
            const flushMountProperties = this.getFlushMountProperties();
            this.tilt = flushMountProperties.tilt;
            this.structureType = flushMountProperties.structureType;
            
            this.azimuth = flushMountProperties.azimuth;
            this.rowSpacingMode = flushMountProperties.rowSpacingMode;
            this.rowSpacing = flushMountProperties.rowSpacing;
            this.panelOrientation = flushMountProperties.panelOrientation;
            this.mountHeight = flushMountProperties.mountHeight;
            this.tableSizeUp = flushMountProperties.tableSizeUp;
            this.tableSizeWide = flushMountProperties.tableSizeWide;
            this.tableSpacing = flushMountProperties.tableSpacing;
            this.moduleSpacingUp = flushMountProperties.moduleSpacingUp;
            this.moduleSpacingWide = flushMountProperties.moduleSpacingWide;
            this.moduleProperties = flushMountProperties.moduleProperties;
            this.panelProperties = flushMountProperties.panelProperties;
        }
        else {
            this.mountType = SUBARRAY_RACK_STYLE_FIXED;
            const fixedMountProperties = this.getFixedMountProperties();
            this.tilt = fixedMountProperties.tilt;
            this.azimuth = fixedMountProperties.azimuth;
            this.structureType = fixedMountProperties.structureType;
            this.rowSpacingMode = fixedMountProperties.rowSpacingMode;
            this.panelOrientation = fixedMountProperties.panelOrientation;
            this.mountHeight = fixedMountProperties.mountHeight;
            this.tableSizeUp = fixedMountProperties.tableSizeUp;
            this.tableSizeWide = fixedMountProperties.tableSizeWide;
            this.tableSpacing = fixedMountProperties.tableSpacing;
            this.moduleSpacingUp = fixedMountProperties.moduleSpacingUp;
            this.moduleSpacingWide = fixedMountProperties.moduleSpacingWide;
            this.moduleProperties = fixedMountProperties.moduleProperties;
            this.panelProperties = fixedMountProperties.panelProperties;
            let { rowSpacing } = fixedMountProperties;
            if (fixedMountProperties.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
                const optimizedRowSpacing = this.getOptimisedRowSpacing();
                rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
            }
            this.rowSpacing = rowSpacing;
        }
        if (this.panelProperties === undefined) {
            this.panelProperties = {
                characteristics: {
                    cell_number: 60,
                    cell_type: 'Polycrystalline',
                    length: 1.632,
                    manufacturer: 'ANJI Technology Co., Ltd.',
                    model: '260',
                    p_mp_ref: 260,
                    series: 'AJP-M660 260-275',
                    v_max: 1000,
                    width: 0.995,
                },
                id: 153,
                image: null,
                image_link: null,
                is_selected: true,
                model: 'AJP-M660 260-275 260',
            };
        }
        // adjust vertices to accommodate for raycaster precision during placeObject
        // vertices = utils.convertArrayToVector(utils.setbackPolygon(vertices, -0.001));
        vertices = utils.setbackPolygon(vertices, -0.001).map(arr => new THREE.Vector3(...arr));
        // TODO: call onComplete after draw manager is refactored to return list of vertices

        // set outline points
        for (let vertex of vertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    vertex.x,
                    vertex.y,
                    vertex.z,
                    this,
                    this.stage
                )
            );
        }

        if (!isCustom) {
            try {
                // update panel placement
                await this.placeObject(); // 1 to 20 sec
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: Subarray: fillFace failed.', error);
                this.onCancel();
                return Promise.reject(error);
            }
        }
        else {
            try {
                await this.updateAssociatedModel();
            }
            catch (error) {
                console.error('ERROR: Subarray: placeObject failed', error);
                return Promise.reject(error);
            }
            if (rackStyle === SUBARRAY_RACK_STYLE_FLUSH) {
                const flushMountProperties = this.getFlushMountProperties();
                this.tilt = flushMountProperties.tilt;
                this.azimuth = flushMountProperties.azimuth;
            }
            this.updateGeometry();

            // show outline points
            for (let outlinePoint of this.outlinePoints) {
                outlinePoint.showObject();
            }
        }
    }

    autoPanelPlacement(modelVertices, model, panelMap, solarAccessMap, solarAccessThreshold) {
        this.associatedModel = model;

        if (this.getParent() !== model) {
            model.addChild(this);
        }

        // adjust vertices to accommodate for raycaster precision during placeObject
        modelVertices = utils.setbackPolygon(modelVertices, -0.001);

        // set outline points
        for (let outlinePoint of modelVertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage
                )
            );
        }

        // update geometry
        this.updateGeometry();

        // set subarray properties
        this.rowSpacing = panelMap.rowSpacing;
        this.tilt = panelMap.tilt;
        this.azimuth = panelMap.azimuth;
        this.panelOrientation = panelMap.landscape ?
            PANEL_ORIENTATION_LANDSCAPE : PANEL_ORIENTATION_PORTRAIT;
        this.mountHeight = panelMap.mountHeight;
        this.tableSizeUp = panelMap.frameSizeUp;
        this.tableSizeWide = panelMap.frameSizeWide;
        this.tableSpacing = panelMap.frameSpacing;
        this.moduleSpacingUp = panelMap.moduleSpacingUp;
        this.moduleSpacingWide = panelMap.moduleSpacingWide;
        panelMap = this.setCorrectPanelCoordinates(panelMap);
        panelMap = this.createRowBlocksInSubarrayMap(panelMap);
        this.makeSubarray(panelMap);
        this.ensureValidSubarrayDCSize({ showError: false });
        this.updateSolarAccess(solarAccessMap);
        this.optimiseOnSolarAccess(solarAccessThreshold);

    }

    getTiltWrtParentSurface(parent = this.getParent()) {
        const reverseTilt = (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) > 90
        )
        &&
        (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) < 270
        );

        // eliminating the cases when the calculation is not required.
        if (!reverseTilt && (parent.getTilt() > this.tilt)) {
            return NaN;
        }

        if (parent.getAzimuth() === this.azimuth ||
        parent.getTilt() === 0
        ) {
            return utils.deg2Rad(this.tilt - parent.getTilt());
        }

        const bBox = this.getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();

        const groundNormal = new THREE.Vector3(0, 0, 1);
        const parentNormal = rightDirection.clone().cross(upDirection);
        let panelPlaneNormal;

        const c = Math.cos(utils.deg2Rad(this.tilt));

        const xD = rightDirection.x;
        const yD = rightDirection.y;
        const zD = rightDirection.z;

        let a;
        let b;

        if (Math.abs(xD) < 0.0001) {
            b = 0;
            a = Math.sqrt(1 - (c ** 2)) * (upDirection.x > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else if (Math.abs(yD) < 0.0001) {
            a = 0;
            b = Math.sqrt(1 - (c ** 2)) * (upDirection.y > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else {
            const A = (xD ** 2) + (yD ** 2);
            const B = 2 * xD * zD * c;
            const C = (((zD ** 2) * (c ** 2)) + ((yD ** 2) * (c ** 2))) - (yD ** 2);

            // Note
            // Precision is set to 13 for 64 bit systems.
            // Having lower precision will affect edge cases like azimuth close to 180˚
            const D = _.round((B ** 2) - (4 * A * C), 13);
            if (D >= 0) {
                let validOrderedPanelPlaceNormals = [];

                a = (-B + Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                a = (-B - Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                validOrderedPanelPlaceNormals = validOrderedPanelPlaceNormals.filter(item => Math.abs(utils.rad2Deg(item.tiltWRTGround) - this.tilt) <= 0.05, this);
                if (validOrderedPanelPlaceNormals.length === 0) {
                    return NaN;
                }

                validOrderedPanelPlaceNormals.sort((itemA, itemB) => itemA.tiltWRTParent - itemB.tiltWRTParent);

                panelPlaneNormal = (reverseTilt ? validOrderedPanelPlaceNormals[validOrderedPanelPlaceNormals.length - 1] : validOrderedPanelPlaceNormals[0]).panelNormal;
            }
            else {
                return NaN;
            }
        }
        const relativeTilt = parentNormal.angleTo(panelPlaneNormal);
        return relativeTilt;
    }

    getTableCoordinates(
        centerPosition,
        tableSizeUp,
        tableSizeWide,
        panelWidth,
        panelLength,
        azimuth,
        tilt,
        moduleSpacingUp,
        moduleSpacingWide,
        tiltWrtParent,
        bBox = null,
    ) {
        let directionLeft = new THREE.Vector3();
        let directionUp = new THREE.Vector3();
        if (bBox !== null) {
            directionLeft = bBox[0].clone().sub(bBox[3]);
            directionLeft.normalize();
            directionUp = bBox[0].clone().sub(bBox[1]);
            directionUp.applyAxisAngle(directionLeft, -tiltWrtParent);
            directionUp.normalize();
        }
        else {
            directionUp.setFromSphericalCoords(
                1,
                (90 - tilt) * (Math.PI / 180),
                -azimuth * (Math.PI / 180),
            ); //  tilt's zero is from the base and azimuth is clockwise
            // rotation required because in 2d the Y-axis is upwards not outwards
            directionUp = posResetFor2D(directionUp);

            directionLeft.setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                (-azimuth + 90) * (Math.PI / 180),
            );
            // rotation required because in 2d the Y-axis is upwards not outwards
            directionLeft = posResetFor2D(directionLeft);
        }

        const topLeft = new THREE.Vector3(centerPosition[0], centerPosition[1], centerPosition[2]);
        topLeft.addScaledVector(
            directionUp,
            (tableSizeUp * (panelLength / 2)) + ((tableSizeUp - 1) * (moduleSpacingUp / 2)),
        ); // moving up
        topLeft.addScaledVector(
            directionLeft,
            (tableSizeWide * (panelWidth / 2)) + ((tableSizeWide - 1) * (moduleSpacingWide / 2)),
        ); // moving left

        const iteratorDown = topLeft.clone();
        const directionRight = directionLeft.clone().negate();
        const directionDown = directionUp.clone().negate();

        const panelsArr = [];

        for (let tableUp = 1; tableUp <= tableSizeUp; tableUp += 1) {
            const iteratorRight = iteratorDown.clone();
            for (let tableWide = 1; tableWide <= tableSizeWide; tableWide += 1) {
                const panelTopLeft = iteratorRight.clone();
                const panelTopRight = (iteratorRight.clone())
                    .addScaledVector(directionRight, panelWidth);
                const panelBottomLeft = (iteratorRight.clone())
                    .addScaledVector(directionDown, panelLength);
                const panelBottomRight = (panelTopRight.clone())
                    .addScaledVector(directionDown, panelLength);
                // storing in arrays (as required)
                const corners = [];
                corners.push([panelTopRight.x, panelTopRight.y, panelTopRight.z]);
                corners.push([panelTopLeft.x, panelTopLeft.y, panelTopLeft.z]);
                corners.push([panelBottomLeft.x, panelBottomLeft.y, panelBottomLeft.z]);
                corners.push([panelBottomRight.x, panelBottomRight.y, panelBottomRight.z]);
                panelsArr.push({
                    id: (tableSizeWide * (tableUp - 1)) + tableWide,
                    solarAccess: 0,
                    corners,
                });

                iteratorRight.addScaledVector(
                    directionRight,
                    panelWidth + moduleSpacingWide,
                ); // move right by one panel width and spacing
            }
            iteratorDown.addScaledVector(
                directionDown,
                panelLength + moduleSpacingUp,
            ); // move down by one panel length and spacing
        }
        return panelsArr;
    }

    getTemplateTableMap({ withBBox } = { withBBox: true }) {
        let { moduleLength } = this.moduleProperties;
        let { moduleWidth } = this.moduleProperties;
        const bBox = withBBox ? this.getBoundingBox() : null;
        if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
            moduleWidth = this.moduleProperties.moduleLength;
            moduleLength = this.moduleProperties.moduleWidth;
        }

        return {
            hidden: false,
            panels: this.getTableCoordinates(
                [0, 0, 0], this.tableSizeUp, this.tableSizeWide, moduleWidth, moduleLength,
                this.azimuth, this.tilt,
                this.moduleSpacingUp, this.moduleSpacingWide,
                this.getTiltWrtParentSurface(), bBox,
            ),
            id: 1,
            isMoved: false,
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
    }

    getTableDimensions(reset = false) {
        if (reset || this.tableDimensions === undefined) {
            let { moduleLength } = this.moduleProperties;
            let { moduleWidth } = this.moduleProperties;
            if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
                moduleWidth = this.moduleProperties.moduleLength;
                moduleLength = this.moduleProperties.moduleWidth;
            }
            this.tableDimensions = {
                length: (((this.tableSizeUp - 1) * this.moduleSpacingUp) +
                    (this.tableSizeUp * moduleLength)),
                width: (((this.tableSizeWide - 1) * this.moduleSpacingWide) +
                    (this.tableSizeWide * moduleWidth)),
                height: (((this.tableSizeUp - 1) * this.moduleSpacingUp) +
                    (this.tableSizeUp * moduleLength)) * Math.sin(this.tilt * (Math.PI / 180)),
            };
        }
        return this.tableDimensions;
    }

    getEdgesFromGeometry(geometry) {
        const edges = [];
        for (let geomIdx = 0, length = geometry.getNumGeometries(); geomIdx < length; geomIdx += 1) {
            const polygon = geometry.getGeometryN(geomIdx);
            // eslint-disable-next-line no-underscore-dangle
            const shellVertices = polygon._shell.getCoordinates();
            for (let vertexIdx = 0; vertexIdx < shellVertices.length - 1; vertexIdx += 1) {
                edges.push([shellVertices[vertexIdx], shellVertices[vertexIdx + 1]]);
            }

            // eslint-disable-next-line no-underscore-dangle
            const holes = polygon._holes;
            for (let i = 0; i < holes.length; i += 1) {
                const holeVertices = holes[i].getCoordinates();
                for (let vertexIdx = 0; vertexIdx < holeVertices.length - 1; vertexIdx += 1) {
                    edges.push([holeVertices[vertexIdx], holeVertices[vertexIdx + 1]]);
                }
            }
        }
        return edges;
    }

    getRowsForDx(dx, possibleRows, boundingBox, bBoxDimensions, tableMap, tableDimensions, relativeTilt) {
        let rowLength = 0;
        const rows = [];
        for (let rowIdx = 0; rowIdx < possibleRows.length; rowIdx += 1) {
            let walkwayJustification = dx;
            for (let obsRowsIdx = 0; obsRowsIdx < possibleRows[rowIdx]
                .obsRows.length; obsRowsIdx += 1) {
                const rowStartPoint = possibleRows[rowIdx].obsRows[obsRowsIdx].start;
                const rowEndPoint = possibleRows[rowIdx].obsRows[obsRowsIdx].end;
                let justifiedStartPoint = rowStartPoint.x;
                if (this.isJustified) {
                    const tableWidthMultiple = Math.ceil(Math
                        .abs(walkwayJustification - rowStartPoint.x) /
                        (tableDimensions.width + this.tableSpacing));
                    justifiedStartPoint = walkwayJustification + ((tableWidthMultiple) *
                        (tableDimensions.width + this.tableSpacing));
                    if (justifiedStartPoint - (tableDimensions.width + this.tableSpacing) >
                        rowStartPoint.x) {
                        justifiedStartPoint -= (tableDimensions.width + this.tableSpacing);
                    }
                }
                const noOfTables = Math.floor((rowEndPoint.x - justifiedStartPoint) /
                    (tableDimensions.width + this.moduleSpacingWide));
                if (noOfTables > 0) {
                    rowLength += noOfTables;
                    const row = {
                        startPositionX: justifiedStartPoint,
                        endPositionX: rowEndPoint.x,
                        topPositionY: possibleRows[rowIdx].maxY,
                        bottomPositionY: possibleRows[rowIdx].minY,
                        boundingBox,
                        bBoxDimensions,
                        tableMap,
                        tableDimensions,
                        relativeTilt,
                    };
                    rows.push(row);
                }
            }
        }
        return [rows, rowLength];
    }

    makeRows(rows, { withoutContainer } = { withoutContainer: false }) {
        let rowsLength = rows.length;
        if (this.objectType === 'Gazebo') {
            rows[0] = rows;
            rowsLength = 1;
        }
        for (let i = 0; i < rowsLength; i += 1) {
            const rowMap = {
                id: i,
                frames: [],
            };
            const row = new Row(this.stage, rowMap, { withoutContainer }, true);
            this.addChild(row);
            row.autoPlacePanels(rows[i], { withoutContainer });
        }
        this.mergeGeometriesForAllPanels();
    }

    globalToLocalCoordinates(point, bBox) {
        let globalPoint;
        // getting the z coordinate
        globalPoint = new THREE.Vector3(point.x, point.y, 0);
        globalPoint.z = this.getParent().coreHeight;
        // signed angle between the top edge of bBox and
        // the line connecting first point of bBox and the globalPoint
        const line1 = bBox[1].clone().sub(bBox[0]);
        const line2 = bBox[3].clone().sub(bBox[0]);
        const planeNormal = line1.clone().cross(line2);
        const line3 = globalPoint.clone().sub(bBox[0]);
        const angle = line3.angleTo(line2) * Math.sign(planeNormal.dot(line3.clone().cross(line2)));

        const magnitude = globalPoint.distanceTo(bBox[0]);
        return new THREE.Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }

    getRowsForGivenOffset(
        givenDx, dy, dynamicOffsetDx, walkwaysLocalYCoordinates,
        boundingBox, bBoxDimensions, tableMap, tableDimensions, relativeTilt, iterateThroughDx = true,
        placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
    ) {
        const possibleRows = [];
        const lines = getRays(
            dy, relativeTilt, tableDimensions.length, this.rowSpacing,
            walkwaysLocalYCoordinates, boundingBox, bBoxDimensions.yLength,
        );
        for(let i=0; i<lines.length; i++) {
            const obstaclePoints1 = [];
            const obstaclePoints2 = [];
            const edge1 = [lines[i][0], lines[i][1]];
            const edge2 = [lines[i][2], lines[i][3]];
            const obsRows = [];
            const placableStartEnd = [];
            const obstacleStartEnd = [];
            const topLocalPositionY = this
                .globalToLocalCoordinates(lines[i][0], boundingBox).y;
            const bottomLocalPositionY = this
                .globalToLocalCoordinates(lines[i][2], boundingBox).y;
            for(let j=0; j<placablePolygonEdge.length; j++) {
                let point1 = utils.checkLineIntersection(placablePolygonEdge[j], edge1);
                let point2 = utils.checkLineIntersection(placablePolygonEdge[j], edge2);
                if (point1.onLine1 && point1.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point1.x, point1.y), boundingBox);
                    obstaclePoints1.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
                if (point2.onLine1 && point2.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point2.x, point2.y), boundingBox);
                    obstaclePoints2.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
            }
            obstaclePoints1.sort((a, b) => a.x - b.x);
            obstaclePoints2.sort((a, b) => a.x - b.x);
            if(obstaclePoints1.length>0 && obstaclePoints2.length>0) {
                let idx1 = 0;
                let idx2 = 0;
                let start, end;
                while(obstaclePoints1.length > idx1 && obstaclePoints2.length > idx2) {
                    if(obstaclePoints1[idx1].x > obstaclePoints2[idx2].x) {
                        start = obstaclePoints1[idx1];
                        if(obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2].x) {
                            end = obstaclePoints1[idx1 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx1 += 2;
                            continue;
                        }

                    }
                    else {
                        start = obstaclePoints2[idx2];
                        if(obstaclePoints2[idx2 + 1].x < obstaclePoints1[idx1].x) {
                            end = obstaclePoints2[idx2 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx2 += 2;
                            continue;
                        }

                    }
                    if (obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2 + 1].x) {
                        end = obstaclePoints1[idx1 + 1];
                        idx1 += 2;
                        if(idx1 < obstaclePoints1.length) {
                            if(obstaclePoints1[idx1].x > obstaclePoints2[idx2 + 1].x) {
                                idx2 += 2;
                            }
                        }
                    }
                    else {
                        end = obstaclePoints2[idx2 + 1];
                        idx2 += 2;
                        if(idx2 < obstaclePoints2.length) {
                            if(obstaclePoints2[idx2].x > obstaclePoints1[idx1 + 1].x) {
                                idx1 += 2;
                            }
                        }
                    }
                    if(start > end) {
                        let temp = start;
                        start = end;
                        end = temp;
                    }
                    placableStartEnd.push({start:start, end:end});
                }
            }
            if(placableStartEnd.length>0) {
                for(let j=0; j<allObstacleEdges.length; j++) {
                    const obstacleEdges = allObstacleEdges[j];
                    let minX = null;
                    let maxX = null;
                    for(let k=0; k<obstacleEdges.length; k++) {
                        let obsTopCoordinate,  obsBottomCoordinate, obsEdge1 = null, obsEdge2 = null ;
                        obsTopCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][0], boundingBox);
                        obsBottomCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][1], boundingBox);
                        if(obsTopCoordinate.y < obsBottomCoordinate.y) {
                            let temp = obsBottomCoordinate;
                            obsBottomCoordinate = obsTopCoordinate;
                            obsTopCoordinate = temp;
                        }
                        let point1 = utils.checkLineIntersection(obstacleEdges[k], edge1);
                        let point2 = utils.checkLineIntersection(obstacleEdges[k], edge2);
                        const obstacleEdge = obstacleEdges[k];
                        if(point1.onLine1 && point1.onLine2 && point2.onLine1 && point2.onLine2){
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                        }
                        else if(point1.onLine1 && point1.onLine2) {
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x:obsTopCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        else if(point2.onLine1 && point2.onLine2) {
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                            obsEdge1 = {x:obsBottomCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                        }
                        else if(topLocalPositionY<=obsTopCoordinate.y && bottomLocalPositionY>=obsBottomCoordinate.y) {
                            obsEdge1 = {x:obsTopCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                            obsEdge2 = {x:obsBottomCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        if(obsEdge1 && obsEdge2) {
                            if(minX == null){
                                if(obsEdge1.x < obsEdge2.x) {
                                    minX = obsEdge1;
                                    maxX = obsEdge2;
                                }
                                else {
                                    minX = obsEdge2;
                                    maxX = obsEdge1;
                                }
                            }
                            else {
                                if(obsEdge2.x > obsEdge1.x) {
                                    if(minX.x > obsEdge1.x) {
                                        minX = obsEdge1;
                                    }
                                    if(maxX.x < obsEdge2.x) {
                                        maxX = obsEdge2;
                                    }
                                }
                                else {
                                    if(minX.x > obsEdge2.x) {
                                        minX = obsEdge2;
                                    }
                                    if(maxX.x < obsEdge1.x) {
                                        maxX = obsEdge1;
                                    }
                                }
                            }
                        }
                    }
                    if(minX && maxX) {
                        if(minX > maxX) {
                            let temp = minX;
                            minX = maxX;
                            maxX = temp;
                        }
                        obstacleStartEnd.push({start:minX, end:maxX});
                    }
                }
                let clonedObsPoints = [];
                obstacleStartEnd.sort((a,b) => a.start.x - b.start.x);
                if( obstacleStartEnd.length > 0) {
                    clonedObsPoints.push( obstacleStartEnd[0]);
                    let idx = 1;
                    while(obstacleStartEnd.length > idx) {
                        let clonedIdx = clonedObsPoints.length;
                        if(clonedObsPoints[clonedIdx - 1].end.x <  obstacleStartEnd[idx].start.x) {
                            clonedObsPoints.push(obstacleStartEnd[idx]);
                        }
                        else {
                            if(clonedObsPoints[clonedIdx - 1].start.x > obstacleStartEnd[idx].start.x) {
                                clonedObsPoints[clonedIdx - 1].start = obstacleStartEnd[idx].start;
                            }
                            if(clonedObsPoints[clonedIdx - 1].end.x < obstacleStartEnd[idx].end.x) {
                                clonedObsPoints[clonedIdx - 1].end = obstacleStartEnd[idx].end;
                            }
                        }
                        idx += 1;
                    }
                }
                placableStartEnd.sort((a,b) => a.start.x - b.start.x);
                clonedObsPoints.sort((a,b) => a.start.x - b.start.x);
                let obsIdx = 0, placableIdx = 0;
                let start = placableStartEnd[0].start, end = placableStartEnd[0].end;
                while(clonedObsPoints.length > obsIdx && placableStartEnd.length > placableIdx) {
                    if(clonedObsPoints[obsIdx].end.x < start.x) {
                        while(clonedObsPoints.length > obsIdx && clonedObsPoints[obsIdx].end.x < start.x) {
                            obsIdx += 1;
                        }
                    }
                    else if(clonedObsPoints[obsIdx].start.x < start.x && clonedObsPoints[obsIdx].end.x > start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                    }
                    else if(start.x < clonedObsPoints[obsIdx].start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                       obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                       start = clonedObsPoints[obsIdx].end;
                       obsIdx += 1;
                    }
                    else if(clonedObsPoints[obsIdx].start.x < end.x && end.x < clonedObsPoints[obsIdx].end.x) {
                        obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                        placableIdx += 1;
                        while(placableStartEnd.length > placableIdx && start.x >= end.x ) {
                            if(start.x < placableStartEnd[placableIdx].end.x) {
                                if(placableStartEnd[placableIdx].start.x >= start.x) {
                                    start = placableStartEnd[placableIdx].start;
                                }
                                end = placableStartEnd[placableIdx].end;
                                break;
                            }
                            placableIdx += 1;
                        }
                    }
                    else {
                        obsRows.push({start: start, end:end});
                        placableIdx += 1;
                        if(placableStartEnd.length <= placableIdx) {
                            start = end;
                            break;
                        }
                        start = placableStartEnd[placableIdx].start;
                        end = placableStartEnd[placableIdx].end;
                    }

                }
                //console.log(obsRows);
                placableIdx += 1;
                while(placableStartEnd.length > placableIdx) {
                    obsRows.push({start: start, end:end});
                    start = placableStartEnd[placableIdx].start;
                    end = placableStartEnd[placableIdx].end;
                    placableIdx += 1;
                }
                if(start.x < end.x) {
                    obsRows.push({start: start, end:end});
                }
                possibleRows.push({
                    obsRows,
                    minY: bottomLocalPositionY,
                    maxY: topLocalPositionY,
                });
                obsRows.slice(0);
            }
        }
        let efficientRows = [];
        let maxRowLength = 0;
        let efficientDx = 0;
        if (iterateThroughDx) {
            let rowLength = 0;
            let rows = [];
            const dxIncrement = (tableDimensions.width + this.tableSpacing) /
                dynamicOffsetDx;
            for (let dx = 0; dx < tableDimensions.width + this.tableSpacing; dx += dxIncrement) {
                [rows, rowLength] = this
                    .getRowsForDx(
                        dx, possibleRows, boundingBox, bBoxDimensions,
                        tableMap, tableDimensions, relativeTilt,
                    );
                if (rowLength > maxRowLength) {
                    efficientRows = rows.slice(0);
                    maxRowLength = rowLength;
                    efficientDx = dx;
                }
            }
        }
        else {
            [efficientRows, maxRowLength] = this
                .getRowsForDx(
                    givenDx, possibleRows, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt,
                );
        }
        return [efficientRows, maxRowLength, efficientDx];
    }

    autoPlacePanels({ withoutContainer, noRefresh } =
        { withoutContainer: false, noRefresh: false }) {
        // update bounding box rotated along the azimuth of the rows
        // and tilted along the parent surface
        const boundingBox = this.getBoundingBox({ reset: true });
        const bBoxDimensions = {
            xLength: boundingBox[0].distanceTo(boundingBox[1]),
            yLength: boundingBox[0].distanceTo(boundingBox[3]),
        };
        const relativeTilt = this.getTiltWrtParentSurface();
        if (Number.isNaN(relativeTilt)) {
            this.removeObject();
            throw new Error('This combination of  Tilt and azimuth is not possible on this surface');
        }
        const tableMap = this.getTemplateTableMap();
        const tableDimensions = this.getTableDimensions({ reset: true });
        // get placable polygon and walkways polygon
        let placablePolygon = utils.verticesToJSTSPolygon(this.get3DVertices());
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        if (this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel) {
            let parentPolygon = utils
                .verticesToJSTSPolygon(this.getParent().get3DVertices());
            parentPolygon = utils.getReducedPrecisionJSTSGeometry(parentPolygon);
            placablePolygon = placablePolygon.intersection(parentPolygon);
        }
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        const placablePolygonEdge = this.getEdgesFromGeometry(placablePolygon);
        const walkwaysLocalYCoordinates = [];

        const siblings = this.getParent().getChildren().filter(sibling => sibling !== this);
        //quick-fix
        const siblingObstacles = [];
        const allObstacleEdges = [];
        const allWalkwayObstacleEdges = [];

        for (let idx = 0, len = siblings.length; idx < len; idx += 1) {
            if (siblings[idx] instanceof Obstruction) {
                let siblingPolygon = utils
                    .getReducedPrecisionJSTSGeometry(utils
                        .verticesToJSTSPolygon(siblings[idx].getVertices()));
                siblingObstacles.push(siblings[idx].getVertices());
                const outsideSetbackShapes = [];
                const shapesLen = outsideSetbackShapes.length;
                if (shapesLen > 0) {
                    for (let i = 0; i < shapesLen; i += 1) {
                        outsideSetbackShapes[i].vertices = outsideSetbackShapes[i].vertices
                            .map(vertex => [vertex.x, vertex.y]);
                        outsideSetbackShapes[i].holeVertices = outsideSetbackShapes[i]
                            .holeVertices
                            .map(vertex => [vertex.x, vertex.y]);
                    }
                    siblingPolygon = utils.getReducedPrecisionJSTSGeometry(
                        siblingPolygon.union(
                            utils.getReducedPrecisionJSTSGeometry(
                                utils.setbackToJSTSPolygon(outsideSetbackShapes))));

                }
                const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                    const obstacleEdges = this.getEdgesFromGeometry(siblingPolygon);
                    allObstacleEdges.push(obstacleEdges);
                }
            }
        }

        let efficientRows = [];
        let maxRowLength = 0;
        this.isJustified = true;

        const { dynamicOffsetDx, dynamicOffsetDy } = getDynamicOffsetBasedOnArea(this.getArea());

        if (noRefresh && this.finaldx !== undefined && this.finaldy !== undefined) {
            [efficientRows, maxRowLength] = this.getRowsForGivenOffset(
                this.finaldx, this.finaldy, dynamicOffsetDx, walkwaysLocalYCoordinates,  boundingBox, bBoxDimensions,
                tableMap, tableDimensions, relativeTilt, false, placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
            );
        }
        else {
            // loop for dy
            const dyIncrement = (tableDimensions.length + this.rowSpacing) /
                dynamicOffsetDy;

            for (let dy = 0; dy < tableDimensions.length + this.rowSpacing; dy += dyIncrement) {
                const [rows, rowLength, dx] = this.getRowsForGivenOffset(
                    0, dy, dynamicOffsetDx, walkwaysLocalYCoordinates, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt, true, placablePolygonEdge,
                    allObstacleEdges, allWalkwayObstacleEdges
                );
                if (rowLength > maxRowLength) {
                    maxRowLength = rowLength;
                    efficientRows = rows.slice(0);
                    this.finaldx = dx;
                    this.finaldy = dy;
                }

            }
        }
        this.makeRows(efficientRows, { withoutContainer });
    }

    clearSubarray() {
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({ shouldSaveState: false, deleteEmptyParent: false });
        }

        this.PANEL_MODEL_ID = 0;
    }

    async updatePanelPlacement({ withoutContainer, noRefresh } =
        { withoutContainer: false, noRefresh: false }) {
        this.inverterLerpPosition = 0;
        // Wait for 300 ms before starting any work so that notification come
        // await new Promise(resolve => setTimeout(resolve, 300));
        // remove if panels placed already
        this.clearSubarray();

        // place panels
        try {
            this.autoPlacePanels({ withoutContainer, noRefresh });
        }
        catch (error) {
            return Promise.reject(error);
        }

        if (this.removeIfEmpty(false)) {

            return Promise.reject(new Error('Empty Subarray'));
        }
        return Promise.resolve(true);
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        try {
            await this.updateAssociatedModel();
        }
        catch (error) {
            console.error('ERROR: Subarray: placeObject failed', error);
            return Promise.reject(error);
        }
        // if the subarray was flush mount, then change tilt, azimuth
        if (this.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
            const flushMountProperties = this.getFlushMountProperties();
            this.tilt = flushMountProperties.tilt;
            this.azimuth = flushMountProperties.azimuth;
        }

        // update geometry
        this.updateGeometry();

        const inverters = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            inverters.push(this.inverters[i]);
        }

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].removeObject()
        }
        this.inverters = [];

        try {
            // update panel placement
            if (!this.addTableFlow) {
                await this.updatePanelPlacement();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Subarray: placeObject failed', error);
            return Promise.reject(error);
        }
    }

    async updateAssociatedModel() {
        this.changeParent(this.associatedModel);
        return Promise.resolve(true);
    }

    handleDragStart() {
        return false;
    }

    handleDragMove(deltaX, deltaY) {
        return false;
    }

    async handleDragEnd() {
        return false;
    }

    handleVertexDragStart(vertex){
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Subarray: vertex not in outlinePoints in handleVertexMove');
        }
        this.updateGeometry();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Subarray: vertex not in outlinePoints in handleVertexPlace');
        }
        let notificationObject = this.stage.eventManager.setUpdatePanelPlacementLoading();

        try {
            // place object
            await this.placeObject();

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);

            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);


            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);
            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
            return Promise.reject(error);
        }
    }

    // Properties Update functions

    // TODO: Add update for when module is changed
    async updateObject(properties) {
        let updatePanelsRequired = false;

        const mountHeightParams = {
            changed: false,
            prevValue: null,
        };

        let structureUpdated = false;

        if (properties.hasOwnProperty('moduleProperties')) {
            if (
                properties.moduleProperties.hasOwnProperty('moduleId') &&
                this.moduleProperties.moduleId !== properties.moduleProperties.moduleId
            ) {
                this.moduleProperties.moduleId = properties.moduleProperties.moduleId;
                this.moduleProperties.moduleMake = properties.moduleProperties.moduleMake;
                this.moduleProperties.moduleSize = properties.moduleProperties.moduleSize;
                this.panelProperties = properties.moduleProperties.panelProperties;

                if (
                    this.moduleProperties.moduleLength !== parseFloat(properties.moduleProperties.moduleLength) ||
                    this.moduleProperties.moduleWidth !== parseFloat(properties.moduleProperties.moduleWidth)
                ) {
                    updatePanelsRequired = true;
                }
                
                this.moduleProperties.moduleLength = parseFloat(properties.moduleProperties.moduleLength);
                this.moduleProperties.moduleWidth = parseFloat(properties.moduleProperties.moduleWidth);
            }
        }
        if (properties.hasOwnProperty('name')
            && properties.name !== this.name) {
            this.name = properties.name;
        }
        if (properties.hasOwnProperty('rowSpacing')
            && properties.rowSpacing !== this.rowSpacing) {
            this.rowSpacing = properties.rowSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('rowSpacingMode')
            && properties.rowSpacingMode !== this.rowSpacingMode) {
            this.rowSpacingMode = properties.rowSpacingMode;
        }
        if (properties.hasOwnProperty('tilt')
            && properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('structureType')
            && properties.structureType !== this.structureType) {
            this.structureType = properties.structureType;
            structureUpdated = true;
        }
        if (properties.hasOwnProperty('azimuth')
            && properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('panelOrientation')
            && properties.panelOrientation !== this.panelOrientation) {
            this.panelOrientation = properties.panelOrientation;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('mountHeight')
            && properties.mountHeight !== this.mountHeight) {
            mountHeightParams.changed = true;
            mountHeightParams.prevValue = this.mountHeight;
            this.mountHeight = properties.mountHeight;
        }
        if (properties.hasOwnProperty('tableSizeUp')
            && properties.tableSizeUp !== this.tableSizeUp) {
            this.tableSizeUp = properties.tableSizeUp;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('tableSizeWide')
            && properties.tableSizeWide !== this.tableSizeWide) {
            this.tableSizeWide = properties.tableSizeWide;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('tableSpacing')
            && properties.tableSpacing !== this.tableSpacing) {
            this.tableSpacing = properties.tableSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('moduleSpacingUp')
            && properties.moduleSpacingUp !== this.moduleSpacingUp) {
            this.moduleSpacingUp = properties.moduleSpacingUp;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('moduleSpacingWide')
            && properties.moduleSpacingWide !== this.moduleSpacingWide) {
            this.moduleSpacingWide = properties.moduleSpacingWide;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('mountType')
            && properties.mountType !== this.mountType) {
            this.mountType = properties.mountType;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'bifacialEnabled')
        && properties.bifacialEnabled !== this.bifacialEnabled) {
            this.bifacialEnabled = properties.bifacialEnabled;
        }

        this.validateStructures();
        this.stage.eventManager.setObjectsSelected(this);

        if (updatePanelsRequired) {
            const inverters = [];

            for (let i = 0, l = this.inverters.length; i < l; i += 1) {
                inverters.push(this.inverters[i]);
            }
    
            for (let i = 0, l = inverters.length; i < l; i += 1) {
                inverters[i].removeObject();
            }

            this.inverters = [];
            try {
                await this.updatePanelPlacement();
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: Subarray: updateObject failed', error);
                // TODO: Restore previous properties and call new/update panel placement - don't know what
                return Promise.resolve(false);
            }
        }
        else if (mountHeightParams.changed) {
            this.changeMountHeight(mountHeightParams.prevValue);
            return Promise.resolve(true);
        }
        else if (structureUpdated) {
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(true);
        }
    }

    changeTablePropertiesDuringCreation(properties) {
        // // calculating shift in centroid
        // let { moduleLength } = this.moduleProperties;
        // let { moduleWidth } = this.moduleProperties;
        // if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
        //     moduleWidth = this.moduleProperties.moduleLength;
        //     moduleLength = this.moduleProperties.moduleWidth;
        // }
        // let panels = getTableCoordinates(
        //     [0, 0, 0], this.tableSizeUp, this.tableSizeWide,
        //     moduleWidth, moduleLength, this.azimuth, this.tilt,
        //     this.moduleSpacingUp, this.moduleSpacingWide,
        //     this.getTiltWrtParentSurface(), this.getBoundingBox(),
        // );

        // // convert to local coordinates
        // const bBox = this.getBoundingBox();
        // let minXOld = Infinity;
        // let maxXOld = -Infinity;
        // let minYOld = Infinity;
        // let maxYOld = -Infinity;
        // for (let panel of panels) {
        //     for (let corner of panel.corners) {
        //         const modCorner = this.globalToLocalCoordinates({x: corner[0], y: corner[1]}, bBox)
        //         if (modCorner.x > maxXOld) maxXOld = modCorner.x;
        //         if (modCorner.x < minXOld) minXOld = modCorner.x;
        //         if (modCorner.y > maxYOld) maxYOld = modCorner.y;
        //         if (modCorner.y < minYOld) minYOld = modCorner.y;
        //     }
        // }

        this.changePropertiesDuringCreation(properties);
        this.boundingBox = this.getBoundingBox({ reset: true });
        this.getChildren()[0].getChildren()[0].changeTableDuringCreation();

        // // calculating shift in centroid
        // moduleLength = this.moduleProperties.moduleLength;
        // moduleWidth = this.moduleProperties.moduleWidth;
        // if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
        //     moduleWidth = this.moduleProperties.moduleLength;
        //     moduleLength = this.moduleProperties.moduleWidth;
        // }
        // panels = getTableCoordinates(
        //     [0, 0, 0], this.tableSizeUp, this.tableSizeWide,
        //     moduleWidth, moduleLength, this.azimuth, this.tilt,
        //     this.moduleSpacingUp, this.moduleSpacingWide,
        //     this.getTiltWrtParentSurface(), this.getBoundingBox(),
        // );

        // // convert to local coordinates
        // let minXNew = Infinity;
        // let maxXNew = -Infinity;
        // let minYNew = Infinity;
        // let maxYNew = -Infinity;
        // for (let panel of panels) {
        //     for (let corner of panel.corners) {
        //         const modCorner = this.globalToLocalCoordinates({x: corner[0], y: corner[1]}, bBox)
        //         if (modCorner.x > maxXNew) maxXNew = modCorner.x;
        //         if (modCorner.x < minXNew) minXNew = modCorner.x;
        //         if (modCorner.y > maxYNew) maxYNew = modCorner.y;
        //         if (modCorner.y < minYNew) minYNew = modCorner.y;
        //     }
        // }

        // const bBoxDimensions = {
        //     xLength: bBox[0].distanceTo(bBox[1]),
        //     yLength: bBox[0].distanceTo(bBox[3]),
        // };
        // const centroidShift = localToGlobalCoordinates(
        //     new THREE.Vector2(((maxXOld - minXOld) - (maxXNew - minXNew)) / 2, 0),
        //     bBox,
        //     bBoxDimensions,
        // ).sub(localToGlobalCoordinates(
        //     new THREE.Vector2(0, 0),
        //     bBox,
        //     bBoxDimensions,
        // ));
        // this.stage.snapManager.updateCentroidForAddTableSnap(
        //     centroidShift,
        //     this.getChildren()[0].getChildren()[0],
        // );
    }

    changePropertiesDuringCreation(properties) {
        // jugad FIX: for changing the length and width
        // until arka panels load
        const arkaPanelIdSet = new Set([23925, 24016, 24017]);
        if (arkaPanelIdSet.has(properties.moduleProperties.moduleId)) {
            if (properties.moduleProperties.moduleLength !== 1.12
                && properties.moduleProperties.moduleWidth !== 0.465
                && properties.moduleProperties.moduleWidth !== 0.435
            ) {
                properties.moduleProperties.moduleLength = 1.12;
                if (properties.moduleProperties.moduleId === 23925) {
                    properties.moduleProperties.moduleWidth = 0.465;
                }
                else {
                    properties.moduleProperties.moduleWidth = 0.435;
                }
            }
        }
        if (properties.hasOwnProperty('moduleProperties')) {
            if (properties.moduleProperties.hasOwnProperty('moduleId') &&
              (this.moduleProperties.moduleId !== properties.moduleProperties.moduleId
              || this.moduleProperties.moduleMake !== properties.moduleProperties.moduleMake)) {
                this.moduleProperties.moduleId = properties.moduleProperties.moduleId;
                this.moduleProperties.moduleMake = properties.moduleProperties.moduleMake;
                this.moduleProperties.moduleSize = properties.moduleProperties.moduleSize;
                this.moduleProperties.moduleLength = parseFloat(properties.moduleProperties.moduleLength);
                this.moduleProperties.moduleWidth = parseFloat(properties.moduleProperties.moduleWidth);
                this.panelProperties = properties.moduleProperties.panelProperties;
            }
        }
        if (properties.hasOwnProperty('name')
            && properties.name !== this.name) {
            this.name = properties.name;
        }
        if (properties.hasOwnProperty('rowSpacing')
            && properties.rowSpacing !== this.rowSpacing) {
            this.rowSpacing = properties.rowSpacing;
        }
        if (properties.hasOwnProperty('rowSpacingMode')
            && properties.rowSpacingMode !== this.rowSpacingMode) {
            this.rowSpacingMode = properties.rowSpacingMode;
        }
        if (properties.hasOwnProperty('tilt')
            && properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (properties.hasOwnProperty('structureType')
            && properties.structureType !== this.structureType) {
            this.structureType = properties.structureType;
            }
        if (properties.hasOwnProperty('azimuth')
            && properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (properties.hasOwnProperty('panelOrientation')
            && properties.panelOrientation !== this.panelOrientation) {
            this.panelOrientation = properties.panelOrientation;
        }
        if (properties.hasOwnProperty('mountHeight')
            && properties.mountHeight !== this.mountHeight) {
            this.mountHeight = properties.mountHeight;
        }
        if (properties.hasOwnProperty('tableSizeUp')
            && properties.tableSizeUp !== this.tableSizeUp) {
            this.tableSizeUp = properties.tableSizeUp;
        }
        if (properties.hasOwnProperty('tableSizeWide')
            && properties.tableSizeWide !== this.tableSizeWide) {
            this.tableSizeWide = properties.tableSizeWide;
        }
        if (properties.hasOwnProperty('tableSpacing')
            && properties.tableSpacing !== this.tableSpacing) {
            this.tableSpacing = properties.tableSpacing;
        }
        if (properties.hasOwnProperty('moduleSpacingUp')
            && properties.moduleSpacingUp !== this.moduleSpacingUp) {
            this.moduleSpacingUp = properties.moduleSpacingUp;
        }
        if (properties.hasOwnProperty('moduleSpacingWide')
            && properties.moduleSpacingWide !== this.moduleSpacingWide) {
            this.moduleSpacingWide = properties.moduleSpacingWide;
        }
        if (properties.hasOwnProperty('mountType')
            && properties.mountType !== this.mountType) {
            this.mountType = properties.mountType;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'bifacialEnabled')
        && properties.bifacialEnabled !== this.bifacialEnabled) {
            this.bifacialEnabled = properties.bifacialEnabled;
        }
    }

    changeMountHeight(prevValue) {
        const deltaZ = this.mountHeight - prevValue;

        const children = this.getChildren();
        for (let idx = 0, len = children.length; idx < len; idx += 1) {
            children[idx].moveObject(0, 0, deltaZ);
        }

        this.resetGrandParentSolarAccess();

        // resetting the solar access of this subarray.
        this.resetSolarAccess();
        this.mergeGeometriesForAllPanels();
    }


    // Helper functions

    get2DVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            vertices.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y
            ])
        }
        return vertices;
    }

    get3DVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            let position = outlinePoint.getPosition();
            vertices.push([
                position.x,
                position.y,
                this.getParent().coreHeight,
            ]);
        }
        return vertices;
    }

    getHighestZ() {
        return this.mountHeight + this.getTableDimensions().height;
    }

    getArea() {
        const vertices = this.get2DVertices();
        const modVertices = vertices.map((vertex) => {
            return {
                x: vertex[ 0 ],
                y: vertex[ 1 ]
            }
        });
        return Math.abs(THREE.ShapeUtils.area(modVertices) / Math.cos(this.tilt * Math.PI / 180));
    }

    getAzimuth() {
        return this.azimuth;
    }

    getTilt(){
        return this.tilt;
    }

    getSructureType() {
        return this.structureType;
    }

    getPanelOrientation(){
        return this.panelOrientation;
    }

    getNumberOfPanels() {
        let nPanels = 0;
        for (let child of this.getChildren()) {
            nPanels += child.getNumberOfPanels();
        }
        return nPanels;
    }

    getEdges() {
        let vertices = utils.convertArrayToVector(this.get2DVertices());
        let edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([
                vertices[ i ],
                vertices[ i + 1 ]
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[ vertices.length - 1 ].x !== vertices[ 0 ].x ||
                vertices[ vertices.length - 1 ].y !== vertices[ 0 ].y)) {
            edges.push([
                vertices[ vertices.length - 1 ],
                vertices[ 0 ]
            ]);
        }

        return edges;
    }

    getNumberOfTables() {
        return this.getNumberOfPanels() / (this.tableSizeUp * this.tableSizeWide);
    }

    getPanelSize() {
        return this.moduleProperties.moduleSize;
    }

    getTableSize() {
        return this.moduleProperties.moduleSize * this.tableSizeUp * this.tableSizeWide;
    }

    get mesh() {
        return this.mergedMesh;
    }

    get tableSize() {
        return {
            up: this.tableSizeUp,
            wide: this.tableSizeWide,
        }
    }

    getDcSize() {
        return this.moduleProperties.moduleSize * this.getNumberOfPanels();
    }

    getModuleId() {
        return this.moduleProperties.moduleId;
    }

    getModuleMake() {
        return this.moduleProperties.moduleMake;
    }

    getModuleCharacteristics() {
        return this.panelProperties.characteristics;
    }

    getCellType() {
        return this.panelProperties.characteristics.cell_type;
    }

    getPanelProperties() {
        return this.panelProperties;
    }

    getModuleDimensions() {
        return {
            length: this.moduleProperties.moduleLength,
            width: this.moduleProperties.moduleWidth,
        }
    }

    getModuleSpacing(){
        return {
            up: this.moduleSpacingUp,
            wide: this.moduleSpacingWide
        };
    }

    getTableSpacing(){
        return this.tableSpacing;
    }

    getRowSpacing() {
        return this.rowSpacing;
    }

    getAzimuthIn3D() {
        const tableMap = this.getTemplateTableMap();
        const panelMapCorners = tableMap.panels[0].corners;
        // panel map corners are in anti-clockwise order
        // (3 - 0) cross (0 - 1) will give the panelNormal
        const edge1 = new THREE.Vector3(
            panelMapCorners[0][0] - panelMapCorners[1][0],
            panelMapCorners[0][1] - panelMapCorners[1][1],
            panelMapCorners[0][2] - panelMapCorners[1][2],
        );
        const edge2 = new THREE.Vector3(
            panelMapCorners[3][0] - panelMapCorners[0][0],
            panelMapCorners[3][1] - panelMapCorners[0][1],
            panelMapCorners[3][2] - panelMapCorners[0][2],
        );
        const panelNormal = edge2.clone().cross(edge1);
        panelNormal.z = 0;
        panelNormal.normalize();
        if (Math.abs(panelNormal.x) < 0.0001) {
            return panelNormal.y > 0 ? 0 : 180;
        }
        const angle = Math.atan(panelNormal.y / panelNormal.x);
        if (panelNormal.x < 0) {
            return 270 - utils.rad2Deg(angle);
        }
        return 90 - utils.rad2Deg(angle);
    }

    getSubarrayMap(forSolar = false) {
        let subarrayMap = {
            uuid: this.getUUID(),
            id: this.id,
            rowSpacing: this.rowSpacing,
            tilt: parseFloat(this.tilt),
            // To be Tested the structure type thing
            structureType: this.structureType,
            azimuth: this.azimuth,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
            landscape: this.panelOrientation === PANEL_ORIENTATION_LANDSCAPE,
            mountHeight: this.mountHeight,
            frameSizeUp: this.tableSizeUp,
            frameSizeWide: this.tableSizeWide,
            frameSpacing: this.tableSpacing,
            moduleSpacingUp: this.moduleSpacingUp,
            moduleSpacingWide: this.moduleSpacingWide,
            associatedObstacle: this.associatedModel ? this.associatedModel.id : null,
            surfaceTilt: this.objectType === 'Gazebo' ? 0 : this.getParent().getTilt(),
            moduleProperties: this.moduleProperties,
            panelProperties: this.panelProperties,
            rows: [],
            bifacialEnabled: this.bifacialEnabled,
        };
        if (forSolar) {
            subarrayMap.azimuth = _.round(this.getAzimuthIn3D(), 2);
        }
        for (let row of this.getChildren()) {
            subarrayMap.rows.push(row.getRowMap());
        }
        return subarrayMap;
    }

    getTables() {
        const rows = this.getChildren();
        const tables = [];
        for (let i = 0, l = rows.length; i < l; i += 1) {
            tables.push(...rows[i].getChildren());
        }
        return tables;
    }

    getPanels() {
        const panels = [];
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                panels.push(...tables[i].getChildren());
            }
        }
        return panels;
    }

    getPanelWithId(id) {
        const panels = this.getPanels();
        for (let i = 0, l = panels.length; i < l;  i += 1) {
            if (panels[i].getId() === id) {
                return panels[i];
            }
        }
        return null;
    }

    getTotalSolarAccess() {
        let totalSolarAccess = 0;
        for (let child of this.getChildren()) {
            totalSolarAccess += child.getTotalSolarAccess();
        }
        return totalSolarAccess;
    }

    getAverageSolarAccess() {
        let nPanels = this.getNumberOfPanels();
        if (nPanels > 0)
            return this.getTotalSolarAccess() / nPanels;
        else
            return 0;
    }

    getAssociatedModel() {
        return this.associatedModel;
    }

    getMountHeight() {
        return this.mountHeight;
    }

    getHiddenTables(hiddenTablesList) {
        hiddenTablesList = hiddenTablesList === undefined ? [] : hiddenTablesList;
        for (let row of this.getChildren()) {
            row.getHiddenTables(hiddenTablesList);
        }
        return hiddenTablesList;
    }

    findAndSetNewParentForTable(table) {
        const previousParent = table.getParent();
        if (previousParent !== null && previousParent !== undefined) {
            previousParent.removeChild(table, true);
            if (previousParent.getChildren().length < 1) {
                previousParent.removeObject({ shouldSaveState: false, deleteEmptyParent: false });
            }
        }
        const newRowParameters = this.getNewRowParameters(table);
        if (newRowParameters.type === ADD_TO_ROW) {
            const newRow = this.getChildren()[newRowParameters.rowIndex[0]];
            table.id = newRow.getHighestTableId() + 1;
            newRow.addChild(table, null, true);
        }
        else if (newRowParameters.type === CREATE_NEW_ROW) {
            const rowMap = {
                id: this.getHighestRowId() + 1,
                frames: [],
            };
            const newRow = new Row(
                this.stage,
                rowMap,
                { withoutContainer: false },
                true,
            );
            this.addChild(newRow, newRowParameters.rowIndex[0]);
            newRow.addChild(table, null, true);
        }
        else if (newRowParameters.type === MERGE_ROWS) {
            const newRow = this.getChildren()[newRowParameters.rowIndex[0]];
            table.id = newRow.getHighestTableId() + 1;
            newRow.addChild(table, null, true);
            this.mergeRows(newRow, this.getChildren()[newRowParameters.rowIndex[1]]);
        }
    }

    getNewRowParameters(targetTable) {
        const rows = this.getChildren();
        const tableDimensions = this.getTableDimensions();
        const len = rows.length;
        const localPosition = targetTable.getLocalPosition(this);
        if (len === 0) { // no rows in subarray
            return {
                type: CREATE_NEW_ROW,
                rowIndex: [0],
            };
        }
        const rowParameters = {
            type: '',
            rowIndex: [],
        };
        for (let idx = 0; idx < len; idx += 1) {
            // taking a margin of 0.001 meter.
            if (Math.abs(localPosition.y -
                ((rows[idx].getlocalBoundingBox().minY + rows[idx].getlocalBoundingBox().maxY)
                    / 2))
                    <= 0.001) {
                if ((localPosition.x >=
                        (rows[idx].getlocalBoundingBox().minX - (tableDimensions.width / 2)
                            - this.tableSpacing - 0.001)
                ) &&
                    (localPosition.x <=
                        (rows[idx].getlocalBoundingBox().maxX + (tableDimensions.width / 2)
                                + this.tableSpacing + 0.001))) {
                    rowParameters.type = ADD_TO_ROW;
                    rowParameters.rowIndex.push(idx);
                    if (rowParameters.rowIndex.length === 2) {
                        rowParameters.type = MERGE_ROWS;
                        break;
                    }
                }
            }
            // TODO:This might be used to sort the rows.
            // else {
            //     if(localPosition.y < ((rows[idx].getlocalBoundingBox().minY
            //    + rows[idx].getlocalBoundingBox().maxY) / 2)){
            //         if(rowParameters.rowIndex.length === 0) {
            //             rowParameters.type = CREATE_NEW_ROW;
            //             rowParameters.rowIndex = [idx];
            //         }
            //         break;
            //     }
            // }
        }
        if (rowParameters.type === '') {
            rowParameters.type = CREATE_NEW_ROW;
            rowParameters.rowIndex = len;
        }
        return rowParameters;
    }

    mergeRows(row1, row2) { // row2 is deleted and its tables are added to row1
        const len = row2.getChildren().length;
        for (let i = 0; i < len; i += 1) {
            const child = row2.removeChild(row2.getChildren()[0]); // removes the child at 0th index
            row1.addChild(child, null, { newFlow: true });
        }
        this.removeChild(row2);
    }

    // checks if the subarray was build from old panel placement
    // by checking the panel height
    setCorrectPanelCoordinates(subarrayMap) {
        const moduleLength = this.panelOrientation === PANEL_ORIENTATION_PORTRAIT ?
            this.moduleProperties.moduleLength : this.moduleProperties.moduleWidth;
        const moduleZlength = moduleLength * Math.sin(this.tilt * (Math.PI / 180));
        for(let rowMap of subarrayMap.rows) {
            for(let tableMap of rowMap.frames) {
                let ratio = 1;
                for(let panelMap of tableMap.panels) {
                    const p1 = panelMap.corners[1];
                    const p2 = panelMap.corners[2];
                    const zDiff = p1[2] - p2[2];
                    if(Math.abs(moduleZlength - zDiff) >= 0.0001) {
                        ratio = moduleZlength / zDiff;
                        break;
                    }
                }
                if(ratio !== 1) {
                    let lowestZ = Infinity;
                    // find the lowest point in table
                    for(let panel of tableMap.panels) {
                        for(let corner of panel.corners) {
                            if(corner[2] < lowestZ) {
                                lowestZ = corner[2];
                            }
                        }
                    }
                    for(let panel of tableMap.panels) {
                        for(let corner of panel.corners) {
                            corner[2] = lowestZ + (corner[2] - lowestZ) * ratio;
                        }
                    }
                }
            }
        }
        return subarrayMap;
    }

    createRowBlocksInSubarrayMap(subarrayMap) {
        const tableMaps = [];
        this.getBoundingBox({ reset: true });
        for(let rowMap of subarrayMap.rows) {
            for(let tableMap of rowMap.frames) {
                tableMap.position = getTableMapCentroid(tableMap);
                tableMap.localPosition = this.globalToLocalCoordinates(new 
                    THREE.Vector2(tableMap.position.x, tableMap.position.y), this.getBoundingBox());
                tableMaps.push(tableMap);
            }
        }
        tableMaps.sort((a, b) => a.localPosition.y - b.localPosition.y);
        if (tableMaps.length > 0) {
            let previousYPosition = tableMaps[0].localPosition.y;
            let sameYTables = [];
            const rows = [];
            const { width } = this.getTableDimensions();
            for (let i = 0, len = tableMaps.length; i <= len; i += 1) {
                // i !== len condition is to proces the last
                // sameYTables after the tableMaps are finished.
                if (i !== len && (tableMaps[i].localPosition.y - previousYPosition <= 0.001)) {
                    sameYTables.push(tableMaps[i]);
                }
                else {
                    sameYTables.sort((a, b) => a.localPosition.x - b.localPosition.x);
                    let previousXPosition =
                        sameYTables[0].localPosition.x - width - this.tableSpacing;
                    let row = [];
                    for (let j = 0, { length } = sameYTables; j < length; j += 1) {
                        if (Math.abs(sameYTables[j].localPosition.x - previousXPosition -
                            width - this.tableSpacing) <= 0.001) {
                            row.push(sameYTables[j]);
                        }
                        else {
                            rows.push(row);
                            row = [];
                            row.push(sameYTables[j]);
                        }
                        previousXPosition = sameYTables[j].localPosition.x;
                    }
                    if (row.length > 0) {
                        rows.push(row);
                    }
                    sameYTables = [];
                    sameYTables.push(tableMaps[i]);
                }
                if (i !== len) {
                    previousYPosition = tableMaps[i].localPosition.y;
                }
            }
            subarrayMap.rows = [];
            const tiltDiff = this.getTiltWrtParentSurface();
            for (let idx = 0, { length } = rows; idx < length; idx += 1) {
                if (rows[idx].length > 0) {
                    const rowMap = {
                        id: idx,
                        frames: [],
                        localBBox: {
                            minX: rows[idx][0].localPosition.x -
                                (this.getTableDimensions().width / 2),
                            maxX: rows[idx][rows[idx].length - 1].localPosition.x +
                                (this.getTableDimensions().width / 2),
                            minY: rows[idx][0].localPosition.y -
                                ((this.getTableDimensions().length / 2) *
                                Math.cos(tiltDiff)),
                            maxY: rows[idx][0].localPosition.y +
                                ((this.getTableDimensions().length / 2) *
                                Math.cos(tiltDiff)),
                        },
                    };
                    for (let i = 0, len = rows[idx].length; i < len; i += 1) {
                        rowMap.frames.push(rows[idx][i]);
                    }
                    subarrayMap.rows.push(rowMap);
                }
            }
        }
        return subarrayMap;
    }

    getHighestPanelId() {
        let highestPanelId = -Infinity;
        for (const row of this.getChildren()) {
            for (const table of row.getChildren()) {
                for (const panel of table.getChildren()) {
                    if (panel.getId() > highestPanelId) {
                        highestPanelId = panel.getId();
                    }
                }
            }
        }
        return highestPanelId;
    }

    getHighestTableId() {
        let highestTableId = -Infinity;
        for (const row of this.getChildren()) {
            for (const table of row.getChildren()) {
                if (table.getId() > highestTableId) {
                    highestTableId = table.getId();
                }
            }
        }
        return highestTableId;
    }

    getHighestRowId() {
        let highestId = -Infinity;
        for (let i = 0, { length } = this.getChildren(); i < length; i += 1) {
            if (this.getChildren()[i].getId() > highestId) {
                highestId = this.getChildren()[i].getId();
            }
        }
        return highestId;
    }

    getOptimisedRowSpacing(params = {}) {
        return 0.25;
    }
    async onSubarrayRotationEnd() {
        this.showObjectLayer();
        if (this.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
            this.rowSpacing = this.getOptimisedRowSpacing();
        }
        await this.placeObject();
    }
    getPossibleAzimuths({ isCreation } = { isCreation: false }) {
        // get the vertices in clockwise order
        const vertices = (isCreation && !this.addTableFlow)
            ? this.stage.drawManager.get2DVertices() : this.get2DVertices();
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
                (vertices[idx + 1][1] - vertices[idx][1]),
                -(vertices[idx + 1][0] - vertices[idx][0]),
            ));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }

    highlight() {
        this.coreMesh.visible = true;
    }

    unHighlight() {
        this.coreMesh.visible = false;
    }

    getDefaultValues() {
        const subarrayDefaults = SUBARRAY_DEFAULTS;

        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: subarrayDefaults.azimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            mountType: SUBARRAY_RACK_STYLE_FIXED,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacing: subarrayDefaults.rowSpacing,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
            monocrystallinepanels: false,
        };
    }

    getFlushMountProperties() {
        const associatedTilt = this.associatedModel.getTilt();
        // Remove restriction on azimuth for flush mounts when tilt is 0. The azimuth is directly obtained from the parent object.
        // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
        const associatedAzimuth = this.associatedModel.getAzimuth();
        const subarrayDefaults = SUBARRAY_DEFAULTS;
        return {
            tilt: associatedTilt,
            azimuth: associatedAzimuth,
            structureType: subarrayDefaults.structureType,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            rowSpacing: subarrayDefaults.rowSpacing,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
        };
    }

    getFixedMountProperties() {
        const subarrayDefaults = SUBARRAY_DEFAULTS;
        // Remove restriction on azimuth for flush mounts when tilt is 0. The azimuth is directly obtained from the parent object.
        // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
        const associatedAzimuth = this.associatedModel.getAzimuth();
        let { rowSpacing } = subarrayDefaults;
        if (subarrayDefaults.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
            const optimizedRowSpacing = this.getOptimisedRowSpacing({
                panelOrientation: subarrayDefaults.panelOrientation,
                moduleProperties: subarrayDefaults.moduleProperties,
                tableSizeUp: subarrayDefaults.tableSizeUp,
                moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                tilt: subarrayDefaults.tilt,
                azimuth: subarrayDefaults.azimuth,
            });
            rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
        }
        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: associatedAzimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            rowSpacing,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
        };
    }

    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.SUBARRAY;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    switchVisualState(newVisualState, recursive) {
        super.switchVisualState(newVisualState, recursive);
        if (this.visualState === VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS) {
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsBasedOnStates() {
        this.updateVisualsBasedOnStatesForCombinedPanelsMesh();
        const newColors = this.getColorMap();
        utils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        }
        else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    updateVisualsBasedOnStatesForCombinedPanelsMesh() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.mergedMesh.castShadow = true;
            this.mergedMesh.receiveShadow = true;
            this.mergedMesh.material.needsUpdate = true;
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.mergedMesh.castShadow = false;
            this.mergedMesh.receiveShadow = false;
            this.mergedMesh.material.needsUpdate = true;
        }
        this.mergeGeometriesForAllPanels();
    }

    removeOutlinePoints() {
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    // Stringing Mode

    enableSubarrayForStringing() {
        // this.showIndividualPanelMeshes();
        // this.hideMergedMeshes();
        this.showStringedPanels();
    }

    disableSubarrayForStringing() {
        // TODO: just change the color of the mesh
        this.mergeGeometriesForAllPanels({
            excludeTables: [],
            defaultMeshColor: 0x4A6A79,
        });
    }

    exitStringingMode() {
        // this.hideIndividualPanelMeshes();
        // this.showMergedMeshes();
        this.mergeGeometriesForAllPanels();
    }

    showStringedPanels() {

    }

    // Universal Functions

    onSelect() {
        // show outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this)
        );
        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let v of this.outlinePoints) {
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v)
                );
            }
        }
    }

    deSelect() {
        // hide outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
    }

    showIndividualPanelMeshes() {
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                tables[i].showIndividualMesh();
            }
        }
    }

    hideIndividualPanelMeshes() {
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                tables[i].hideIndividualMesh();
            }
        }
    }

    hideMergedMeshes() {
        this.objectsGroup.remove(this.mergedMesh);
        this.objectsGroup.remove(this.mergedEdgemesh);
    }

    showMergedMeshes() {
        this.objectsGroup.add(this.mergedMesh);
        this.objectsGroup.add(this.mergedEdgemesh);
    }

    hideObject() {
        this.objectsGroup.visible = false;
        this._hiddenTables = this.getHiddenTables();
        for (let row of this.getChildren()) {
            row.hideObject();
        }
        for (let v of this.outlinePoints)
            v.hideObject();
    }

    showObjectWithoutOutlinePoints() {
        this.objectsGroup.visible = true;
        for (let row of this.getChildren()) {
            row.showObject(this._hiddenTables);
        }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (let row of this.getChildren()) {
            row.showObject(this._hiddenTables);
        }
        for (let v of this.outlinePoints)
            v.showObject();
    }

    showObjectLayer() {
        for(let child of this.objectsGroup.children){
            child.layers.enable(0);
        }
        for (let row of this.getChildren()) {
            row.showObjectLayer();
        }
    }

    hideObjectLayer(){
        for(let child of this.objectsGroup.children){
            child.layers.disable(0);
        }
        for (let row of this.getChildren()) {
            row.hideObjectLayer();
        }
    }

    removeObject({ shouldSaveState } = {shouldSaveState: false}) {
        let i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({shouldSaveState: shouldSaveState, deleteEmptyParent: false});
        }

        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if(this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i,1);
        }

        const inverters = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            inverters.push(this.inverters[i]);
        }

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].removeObject()
        }
        this.inverters = [];
        // remove from quadtree
    }

    /**
     * merge all the geometries of panels then merge them
     * in one single geometry and mesh.
     */
    mergeGeometriesForAllPanels(
        {
            excludeTables,
            excludePanels,
            defaultMeshColor,
        } = {
            excludeTables: [],
            excludePanels: [],
            defaultMeshColor: COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
                [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR,
        }) {
        // get geometries for all the panels
        // then merge them
        if (defaultMeshColor === undefined) {
            defaultMeshColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR;
        }
        if (this.getPanelProperties() !== undefined) {
            if ((this.getCellType() === PANEL_TYPE_MONOCRYSTALLINE) && this.getDefaultValues().monocrystallinepanels) {
                    defaultMeshColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
                    [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR_MONO;
            }
        }
        const withSolarAccess = this.stage
            .visualManager.containsVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS);
        let defaultColorRGB = null;
        if (!withSolarAccess) {
            const threejsColor = new THREE.Color(defaultMeshColor);
            defaultColorRGB  = {_rgb: [
                parseInt(threejsColor.r * 256),
                parseInt(threejsColor.g * 256),
                parseInt(threejsColor.b * 256),
                1,
            ]}
        }
        const geometries = [];
        const children = this.getChildren();
        const vertices = [];
        const panelColors = [];
        for (const row of children) {
            for (const table of row.children) {
                let excludeThisTable = false;
                if(excludeTables != undefined){
                    for (let i = 0, l = excludeTables.length; i < l; i += 1) {
                        if (excludeTables[i] === table) {
                            excludeThisTable = true;
                            break;
                        }
                    }
                }                
                if (!excludeThisTable && !table.isHidden()) {
                    for (const panel of table.children) {
                        let excludeThisPanel = false;
                        if(excludePanels != undefined){
                            for(let i = 0; i < excludePanels.length; i += 1) {
                                if(excludePanels[i] === panel) {
                                    excludeThisPanel = true;
                                    break;
                                }
                            }
                        }
                        if(!excludeThisPanel && !panel.isHidden()){
                            geometries.push(panel.panelMesh.geometry);
                            vertices.push(...(panel.getGeometry3DVertices()));
                            // panelColors.push(this.stage
                            //     .solarAccessColorMap(withSolarAccess ? panel.solarAccess.toFixed(2) : 0));
                            if (withSolarAccess) {
                                panelColors.push(this.stage.solarAccessColorMap(panel.solarAccess.toFixed(2)));
                            }
                            else {
                                panelColors.push(defaultColorRGB);
                            }
                        }
                    }
                }
            }
        }
        // setting up vertices
        const typedVertices = new Float32Array(vertices.length);
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            typedVertices[i] = vertices[i];
        }
        const mergedGeometry = new THREE.BufferGeometry();
        mergedGeometry.setAttribute('position', new THREE.BufferAttribute(typedVertices, 3));

        // setting up vertex-coloring
        const colors = new Uint8Array(vertices.length);
        for (let i = 0, l = colors.length; i < l; i += 1) {
            colors[i] = panelColors[Math.floor(i / 18)]._rgb[i % 3];
        }
        const normalized = true;
        const colorAttrib = new THREE.BufferAttribute(colors, 3, normalized);
        mergedGeometry.setAttribute('color', colorAttrib);

        this.mergedMesh.geometry = mergedGeometry;
        this.mergedEdgemesh.geometry = new THREE.EdgesGeometry(mergedGeometry);

        this.mergedMesh.geometry.computeVertexNormals();
        // Jugaad: need to find a better solution for this.
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.stage.sceneManager.scene.add(this.objectsGroup);
    }

    /**
     * Gives the nearest table out of all the tables in
     * the suarray to the given point
     * @param {Vector3} point
     */
    getNearestTableToPoint(point) {
        const rows = this.getChildren();
        let nearestDistance = Infinity;
        let nearestTable = null;
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                const position = tables[i].getPosition();
                position.setZ(0);
                const currDistance = position.distanceToSquared(point)
                if (currDistance < nearestDistance) {
                    nearestDistance = currDistance;
                    nearestTable = tables[i];
                }
            }
        }
        if (nearestTable === null) {
            console.error('how can the subarray exist if no table???');
        }
        return nearestTable;
    }

    removeIfEmpty(showError = true) {
        if (this.getNumberOfPanels() === 0) {
            this.removeObject();
            if (!this.addTableFlow && showError) {
                this.stage.eventManager.subarrayEmptyError();
            }
            return true;
        }
        return false;
    }

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let point of this.outlinePoints) {
            let pointPosition = point.getPosition();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count++;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getPanelId() {
        this.PANEL_MODEL_ID++;
        return this.PANEL_MODEL_ID;
    }

    static getObjectType() {
        return 'Subarray'
    }
}
