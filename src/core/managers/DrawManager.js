import * as THREE from 'three';
import { v4 } from 'uuid';
import * as utils from '../utilities/utils';
import {
    MAX_DRAWING_POINTS,
    CREATED_STATE,
    DELETED_STATE,
    INVALID_PROPERTIES_ERROR,
    CROSSHAIR,
} from '../utilities/constants';
import { 
    VISUAL_STATES,  
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    LINE_WIDTH,
    POINT_SIZE,
    THIN_BORDER_OUTLINE_POINT_SIZE,
    THIN_BORDER_OUTLINE_POINT_IMAGE_URL,
} from '../utilities/visualConstants';
import OutlinePoints from '../../core/Objects/OutlinePoints';
import PolygonModel from '../../core/Objects/PolygonModel';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
// import * as visualUtils from '../utils/visualUtils';
import Mousetrap from 'mousetrap';
import { BufferGeometry } from 'three';

export default class DrawManager {
    constructor(stage) {
        this.stage = stage;
        this.name = "Temporary Drawing Shape";

        this.mousePoint = new THREE.Vector3();

        this.highestZ = 0;
        this.numVertices = 0;
        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.lineMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.rectMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5,
        });
        this.pointMaterial = new THREE.PointsMaterial({
            size: POINT_SIZE,
        });
        const firstPointSprite = new THREE.TextureLoader()
            .load(THIN_BORDER_OUTLINE_POINT_IMAGE_URL);
        this.firstPointMaterial = new THREE.PointsMaterial({
            size : THIN_BORDER_OUTLINE_POINT_SIZE,
            map: firstPointSprite,
        });
        this.lassoSelectionMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });

        this.circleMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });

        this.lineMesh = null;
        this.pointsMesh = null;
        this.rectMesh = null;
        this.firstPointMesh = null;

        this.circleMesh = null;
        this.circleSegments = 32;
        this.circleVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.canvas = stage.rendererManager.getDomElement();

        this.currentDrawingObject = null;
        this.onClickHandler = () => {};
        this.onCompleteHandler = () => {};
        this.onCancelHandler = () => {};

        this.enabled = false;

        // For measurements
        this.outlinePoints = [];
        this.validationError = null;

        // for state manager since this is not a baseObject
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;
    }

    getState() {
        const drawManagerData = {
            uuid: this.uuid,
            numVertices: this.numVertices,
            vertices: [],
        };

        for (let i = 0; i < this.numVertices; i++) {
            drawManagerData.vertices.push(
                [
                    this.vertices[i * 3],
                    this.vertices[i * 3 + 1],
                    this.vertices[i * 3 + 2]
                ]
            )
        }
        return drawManagerData;
    }

    loadState(state) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.uuid = state.uuid;
            this.numVertices = state.numVertices;            

            for (let i = 0; i < this.numVertices; i++) {
                this.vertices[i * 3] = state.vertices[i][0];
                this.vertices[i * 3 + 1] = state.vertices[i][1];
                this.vertices[i * 3 + 2] = state.vertices[i][2];                
            }
            this.vertices[this.numVertices * 3] = this.mousePoint.x
            this.vertices[this.numVertices * 3 + 1] = this.mousePoint.y
            this.vertices[this.numVertices * 3 + 2] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

            if (this.outlinePoints.length > this.numVertices + 1) {
                this.outlinePoints[this.numVertices + 1].removeObject();
                this.outlinePoints.splice(this.numVertices + 1);
                this.outlinePoints[this.numVertices].setPosition(this.mousePoint.x, this.mousePoint.y, this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y));   
            }
            else if (this.outlinePoints.length < this.numVertices + 1) {
                let index = this.outlinePoints.length - 1
                this.outlinePoints[index].setPosition(
                    this.vertices[index * 3],
                    this.vertices[index * 3 + 1],                            
                    this.vertices[index * 3 + 2],    
                )
                for (let i = this.outlinePoints.length; i < this.numVertices + 1; i++) {                   
                    this.outlinePoints.push(
                        new OutlinePoints(
                            this.vertices[i * 3],
                            this.vertices[i * 3 + 1],                            
                            this.vertices[i * 3 + 2],                                                        
                            this,
                            this.stage,
                            this.getCurrentDrawingObject().getColorMap(),
                        )
                    );
                }
            }  

            this.updatePolygonOnPropertiesChange();

            this.updateGeometry();

            // this.updateParentsAndErrors();
        }
    }

    clearState() {
        this.numVertices = 0;

        if (this.currentParent !== null && this.currentParent !== undefined) {
            this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
        }

        this.vertices[0] = this.mousePoint.x;
        this.vertices[1] = this.mousePoint.y;
        this.vertices[2] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

        for (let i = this.outlinePoints.length - 1; i >= 1; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        this.outlinePoints[0].setPosition(this.vertices[0], this.vertices[1], this.vertices[2]);

        this.updateGeometry();
    }


    // Drawing functions

    initFirstPoint() {
        const firstPointGeometry = new THREE.BufferGeometry();
        firstPointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        this.firstPointMesh = new THREE.Points(firstPointGeometry, this.firstPointMaterial);
        this.firstPointMesh.name = 'First point';
        this.firstPointMesh.geometry.setDrawRange(0, 1);
        this.firstPointMesh.frustumCulled = false;
        this.objectsGroup.add(this.firstPointMesh);    
    }

    initPoints(material) {
        // Geometry for drawing points
        let pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        // Use default point material for drawing points
        let pointMaterial = this.pointMaterial;

        // If there is a passed material for points, then use that
        if (material !== null) {
            pointMaterial = material;
        }

        this.pointsMesh = new THREE.Points(pointGeometry, pointMaterial);
        this.pointsMesh.name = 'Drawing Points';
        this.pointsMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        // added (this.pointsMesh) to objectsGroup inside onClick function to show outline point only on click
        // and keep the outline point hidden on initialization of drawing.
        // this.objectsGroup.add(this.pointsMesh);

        // initialise outline points
        this.outlinePoints = [];
        this.outlinePoints.push(new OutlinePoints(
            0,
            0,
            0,
            this,
            this.stage,
            this.currentDrawingObject.getColorMap(),
        ));
    }

    initLines(material) {
        // Geometry for drawing lines.
        // A separate geometry for shape and points to draw cylinder and points.
        this.lineGeometry = new LineGeometry();
        // this.lineGeometry.setPositions(this.vertices);

        // Use default material to draw lines
        // let { lineMaterial } = this;
        this.resol = new THREE.Vector2();
        this.stage.rendererManager.renderer.getSize(this.resol);
        this.lineMaterial = new LineMaterial( {
            linewidth: 5 / (this.stage.zoom / 10),
            color: 0x409EFF,
        });
        this.lineMaterial.resolution.set(this.resol.x, this.resol.y);
        // lineMaterial.color.set(0x409EFF);

        this.lineMesh = new Line2(this.lineGeometry, this.lineMaterial);
        this.lineMesh.name = 'Drawing Lines';
        this.lineMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.lineMesh);
    }

    initRectangle(material) {
        const rectGeometry = new THREE.ExtrudeGeometry(new THREE.Shape(), {
            depth: 0.1,
        });

        // Use default material to draw lines
        let rectMaterial = this.rectMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            rectMaterial = material;
        }

        this.rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
        this.rectMesh.visible = false;
        this.rectMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.rectMesh);
    }

    initDrawingPolygon(material) {
        const rectGeometry = new THREE.ExtrudeGeometry(new THREE.Shape(), {
            depth: 0.1,
        });

        // Use default material to draw lines
        let rectMaterial = this.rectMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            rectMaterial = material;
        }

        this.rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
        this.rectMesh.visible = false;
        this.rectMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.rectMesh);
    }

    initCircle(material) {
        let circleGeometry = new THREE.BufferGeometry();
        circleGeometry.setAttribute('position', new THREE.BufferAttribute(this.circleVertices, 3));

        let circleMaterial = this.circleMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            circleMaterial = material;
        }
        this.circleMesh = new THREE.Line(circleGeometry, circleMaterial);
        this.circleMesh.name = 'Circle Outline';
        this.circleMesh.geometry.setDrawRange(0, this.circleSegments + 1);
        this.circleMesh.frustumCulled = false;

        this.objectsGroup.add(this.circleMesh);
    }

    initialize(
        object,
        onCompleteHandler,
        onCancelHandler,
        shapeMaterial = null,
        pointMaterial = null,
    ) {
        this.currentDrawingObject = object;
        this.onCompleteHandler = onCompleteHandler;
        this.onCancelHandler = onCancelHandler;

        // Enable Drawing
        this.enable();
        this.stage.dragControls.deactivate();

        // Get max height in the scene and add a margin of 5 to ensure drawing is always on top
        this.highestZ = utils.getHighestZ(this.stage.ground) + 5;

        if (object instanceof PolygonModel) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                this.currentDrawingObject.getTilt(),
            );
        }
        else {
            console.error('DrawManager: initialize: Unknown object type', object);
        }

        // Add drawing shape and points to the scene
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // disable selection controls
        // this.stage.selectionControls.selectGroundAndDisable();
        // this.stage.dragControls.disable();

        // this.stage.stateManager.add({
        //     uuid: this.uuid,
        //     getStateCb: () => CREATED_STATE,
        //     withoutContainer: true,
        // });
    }

    reset() {
        this.mousePoint = new THREE.Vector3();
        this.numVertices = 0;
        this.highestZ = 0;

        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.lineMesh = null;
        this.pointsMesh = null;

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;

        this.currentDrawingObject = null;
        this.onClickHandler = () => {};
        this.onCompleteHandler = () => {};

        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        this.validationError = null;
    }

    enable() {
        if (!this.enabled) {
            this.currentParent = null;

            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('click', this.onClick, false);

            this.enabled = true;

            // this.stage.stateManager.startTempStack(TEMP_STACK_USED_BY_DRAW_MANAGER);
        }
        else {
            console.error('ERROR: DrawManager: Cannot enable drawing - Drawing already enabled');
        }
    }

    disable() {
        //clear previous snap line oncomplete of drawing 
        if (this.enabled) {
            if (this.currentParent !== null && this.currentParent !== undefined) {
                this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
            }

            this.canvas.removeEventListener('click', this.onClick, false);
            this.canvas.removeEventListener('mousemove', this.onMouseMove, false);            
            
            this.enabled = false;
            // this.stage.stateManager.stopTempStack();
            
            this.currentParent = null;
        }
        else {
            console.error("ERROR: DrawManager: Cannot disable drawing - Drawing already disabled");
        }
    }

    onComplete() {
        const currentParent = this.currentParent;
        this.disable();
        this.stage.studioStore.$patch({undoEnabled:false})
        this.stage.studioStore.$patch({basePolygonDrawn:true})
        this.stage.studioStore.$patch({atleast3PointsDrawn:true})

        // this.stage.stateManager.startContainer();

        this.onCompleteHandler(this.geometry);

        // enable selection controls
        // this.stage.selectionControls.enable();
        // this.stage.dragControls.enable();

        // this.stage.stateManager.stopContainer();


        // Reset all assigned variables
        this.reset();

        // this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        // this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
        // this.stage.newPolygonModel();
        this.stage.dragControls.activate();
        // this.stage.initialize2D_3DControls();
    }

    onCancel() {
        // Disable Drawing
        this.disable();

        // // Call Cancel handler of current drawing object
        // this.onCancelHandler();

        // // // Reset all assigned variables
        // // this.reset();

        // // select ground
        // this.stage.selectionControls.enable();
        // this.stage.eventManager.setObjectsSelected(this.stage.ground);
        // this.stage.dragControls.enable();

        // this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        // this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
    }


    // Geometry Functions

    updateGeometry() {
        if (this.currentDrawingObject instanceof PolygonModel) {
            this.updatePoint();
            this.updateLine();
        }
    }

    updateFirstPoint() {
        if (this.numVertices <= 1) {
            this.firstPointMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    updatePoint() {
        this.pointsMesh.geometry.setDrawRange(0, this.numVertices + 1);
        this.pointsMesh.geometry.attributes.position.needsUpdate = true;
    }

    updateLine() {
        let buffer = new Float32Array(this.vertices.slice(0,(this.outlinePoints.length)*3));
        this.lineGeometry = new LineGeometry();
        this.lineGeometry.setPositions(buffer);
        this.lineMesh.geometry = this.lineGeometry;
        this.stage.rendererManager.renderer.getSize(this.resol);
        this.lineMaterial.resolution.set(this.resol.x, this.resol.y); 
    }

    updateRectangle() {
        if(this.numVertices === 0) {
            this.rectMesh.visible = false;
        } 
        else if (this.numVertices === 1) {

            const vertex1 = new THREE.Vector2(this.vertices[0], this.vertices[1]);
            const vertex2 = new THREE.Vector2(this.mousePoint.x, this.mousePoint.y);

            if (vertex1.distanceTo(vertex2) >= 0) {
                const setbackPolygon = utils.setbackPolygon(
                    this.currentDrawingObject.get2DVertices(vertex1, vertex2),
                    -0.001,
                );
                if (setbackPolygon.length === 0) {
                    return;
                }
                const erodedVertices = utils.convertArrayToVector(setbackPolygon);
                erodedVertices.splice(2, 2);

                if (erodedVertices.length !== 0) {
                    // get walkway parent
                    let currentWalkwayParent;
                    try {
                        [currentWalkwayParent] = getTopCommonModelBelowVertices(
                            utils.convertVectorToArray(erodedVertices),
                            this.stage,
                        );
                    }
                    catch (ex) {
                        return;
                    }
                    if (this.walkwayParent !== currentWalkwayParent) {
                        this.walkwayParent = currentWalkwayParent;
                        this.updateDrawingSurfaceParams(this.walkwayParent.getAzimuth(), this.walkwayParent.getTilt());
                        this.updateZOfAllVertices();
                        this.updatePoint();                
                        this.updateMeasurements({ updateAll: true });
                    }

                    const shape = new THREE.Shape(this.currentDrawingObject.getTiltAdjustedVertices(
                        new THREE.Vector3(this.vertices[0], this.vertices[1]),
                        new THREE.Vector3(this.vertices[3], this.vertices[4]),
                        currentWalkwayParent,
                    ));

                    const geometry = new THREE.ExtrudeGeometry(
                        shape,
                        {
                            depth: this.currentDrawingObject.coreHeight,
                            bevelEnabled: false,
                        }
                    );
                    
                    geometry.translate(0, 0, this.highestZ);
                    
                    this.rectMesh.geometry = geometry;
                    
                    this.rectMesh.visible = true;
                }
            }
        }    
    }

    updatePolygonOnPropertiesChange() {
        if (
            this.currentDrawingObject instanceof PolygonModel
        ) {
            
            // || this.currentDrawingObject instanceof CylinderModel
            this.updateDrawingSurfaceParams(this.currentDrawingObject.getAzimuth(), this.currentDrawingObject.getTilt())
            this.updateZOfAllVertices();
            
            this.updatePoint();
            this.updateLine();
            //this.updateMeasurements({ updateAll: true });
        }
    }

    updateZOfAllVertices() {
        for (let i = 0; i < this.numVertices + 1; i++) {
            this.vertices[i * 3 + 2] = this.getZOnDrawingSurface(this.vertices[i * 3], this.vertices[i * 3 + 1]);
            this.outlinePoints[i].setPosition(this.vertices[i * 3], this.vertices[i * 3 + 1], this.vertices[i * 3 + 2])
        }        
    }

    getNewPointAfterClick() {
        const requiredDistance = 0.0012;
        // add fixed z value for the polygon here based on input (number of floors).
        const newZ = 1;
        const newPoint = new THREE.Vector3();
        const lastPoint = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        lastPoint.z = newZ;
        let secondLastPoint;
        if (this.outlinePoints.length > 1) {
            secondLastPoint = this.outlinePoints[this.outlinePoints.length - 2].getPosition();
            secondLastPoint.z = newZ;
        }
        if (this.numVertices < 1) {
            newPoint.copy(lastPoint.addScalar(requiredDistance));
        }
        else {
            const alpha = requiredDistance / lastPoint.distanceTo(secondLastPoint);
            newPoint.copy(secondLastPoint).lerp(lastPoint, 1 + alpha);
        }
        // console.log('newPoint: ', newPoint);
        newPoint.z = newZ;
        return newPoint;
    }

    addPoint() {
        const newPointAfterClick = this.getNewPointAfterClick();
        if (this.currentDrawingObject instanceof PolygonModel) {
            // update number of vertices
            this.numVertices++;

            // add outline point
            this.vertices[this.numVertices * 3] = newPointAfterClick.x;
            this.vertices[(this.numVertices * 3) + 1] = newPointAfterClick.y;
            this.vertices[(this.numVertices * 3) + 2] = newPointAfterClick.z;
            this.outlinePoints.push(new OutlinePoints(
                this.vertices[this.numVertices * 3],
                this.vertices[this.numVertices * 3 + 1],
                this.vertices[this.numVertices * 3 + 2],
                this,
                this.stage,
                this.currentDrawingObject.getColorMap(),
            ));
            this.updateGeometry();

            // this.updateParentsAndErrors();

            // this.stage.eventManager.setObjectsCreated(this.currentDrawingObject, { onlyUpdateGetters: true });
        }
        if (this.numVertices > 2) {
            this.stage.studioStore.$patch({ atleast3PointsDrawn: true })
        } else {
            this.stage.studioStore.$patch({ atleast3PointsDrawn: false })
        }
        let completePrecision =  Math.abs(this.stage.ground.edgesMesh.geometry.boundingBox.max.x)/80;
        if(completePrecision < 0.3){
            completePrecision = 0.3;
        }
        if (this.outlinePoints.length > 3) {
            if (Math.abs((this.vertices[0]) - (newPointAfterClick.x)) < completePrecision
                && Math.abs((this.vertices[1]) - (newPointAfterClick.y)) < completePrecision
            ) {

                this.onComplete();
            }
        }
    }

    resetDrawManager() {
        for (var i = this.numVertices; i >= 0; i--) {
            this.removePoint();
        }
    }

    removePoint() {
        if (this.currentDrawingObject instanceof PolygonModel && this.numVertices != 0) {
            // update number of vertices


            // add outline point
            this.vertices[this.numVertices * 3] = 0;
            this.vertices[(this.numVertices * 3) + 1] = 0;
            this.vertices[(this.numVertices * 3) + 2] = 0;
            this.outlinePoints.pop();
            this.numVertices--;
            this.vertices[this.numVertices * 3] = this.vertices[(this.numVertices - 1) * 3];
            this.vertices[this.numVertices * 3 + 1] = this.vertices[(this.numVertices - 1) * 3 + 1];;
            this.vertices[this.numVertices * 3 + 2] = 5;

            this.outlinePoints[this.numVertices].setPosition(this.vertices[this.numVertices * 3], this.vertices[this.numVertices * 3 + 1], this.vertices[this.numVertices * 3 + 2]);

            this.updateGeometry();

            this.updateGeometry();

            // this.updateParentsAndErrors();

            // this.stage.eventManager.setObjectsCreated(this.currentDrawingObject, { onlyUpdateGetters: true });
        }
        if(this.numVertices < 3){
            this.stage.studioStore.$patch({atleast3PointsDrawn:false})
        }else{
            this.stage.studioStore.$patch({atleast3PointsDrawn:true})
        }
    }

    getMousePoint(event) {
        // const snappedPoint = this.stage.snapManager.vertexSnap(event);
        const mousePoint =
            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
        return mousePoint;
    }

    // Event handling functions

    onMouseMove = (event) => {
        this.mousePoint = this.getMousePoint(event);

        this.vertices[ this.numVertices * 3 ] = this.mousePoint.x;
        this.vertices[ this.numVertices * 3 + 1 ] = this.mousePoint.y;
        this.vertices[ this.numVertices * 3 + 2 ] = 5;

        this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);

        this.updateGeometry();
    };

    onClick = (event) => {
        if (this.pointsMesh) this.objectsGroup.add(this.pointsMesh);
        // this.stage.controlsManager._2dControls.disable();
        this.mousePoint = this.getMousePoint(event);

        this.vertices[ this.numVertices * 3 ] = this.mousePoint.x;
        this.vertices[ this.numVertices * 3 + 1 ] = this.mousePoint.y;
        this.vertices[ this.numVertices * 3 + 2 ] = 5;

        this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);

        if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
            const points = utils.drawingArrayTo2DArray(this.vertices, this.numVertices);
            let placingInformation;
            placingInformation = this.currentDrawingObject.getPlacingInformation(points, true);
            const isSafe = placingInformation.pointUnplaceableError === null;
            if (isSafe) {
                this.addPoint();
            }
            else {
                this.stage.eventManager
                    .customErrorMessage(placingInformation.pointUnplaceableError.message);
            }
        }
    };


    handleOnCancel() {
        if(this.tabCount === 1) {
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('click', this.onClick, false);
            this.lengthMeasurements[this.lengthMeasurements.length - 1].disableTextSelection();
            if (this.arcMeasurements[this.arcMeasurements.length - 1]) {
                this.arcMeasurements[this.arcMeasurements.length - 1].disableTextSelection();
            }
            this.stage.textSelectionControls.deSelectSelectedTextObject();
            this.tabCount = 0;

            // set TopBar status
             this.stage.eventManager.setTopBarWhileDrawing(
                     this.onComplete, this.onCancel, this.currentDrawingObject, this
             );
        }
    }

    handleVertexMove(vertex){
        // this is for OutlinePoints which are not in visible state in DrawManager
    }

    handleVertexPlace(vertex){
        let position = vertex.getPosition();

        const allPoints = utils.drawingArrayTo2DArray(this.vertices, this.numVertices - 1);
        allPoints.push([
            position.x, position.y
        ]);
        const placingInformation = this.currentDrawingObject.getPlacingInformation(allPoints);

        if (placingInformation.pointUnplaceableError === null ||
                placingInformation.pointUnplaceableError === undefined) {
            // turn off editMode
            this.tabCount = 0;

            // set TopBar status
            this.stage.eventManager.setTopBarWhileDrawing(
                this.onComplete, this.onCancel, this.currentDrawingObject, this
            ).then(() => {
                this.vertices[ this.numVertices * 3 ] = position.x;
                this.vertices[ this.numVertices * 3 + 1 ] = position.y;
                this.vertices[ this.numVertices * 3 + 2 ] = this.getZOnDrawingSurface(position.x, position.y);

                this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);
                this.canvas.addEventListener('mousemove', this.onMouseMove, false);
                this.canvas.addEventListener('click', this.onClick, false); 
                this.mousePoint = position.clone();
                this.addPoint();                             
            });            
        }
        else {
            this.lengthMeasurements[this.lengthMeasurements.length - 1].setTextEditable({ shouldCreateContainer: false, shouldCompleteOnNoChange: true });
            this.stage.eventManager.customErrorMessage(placingInformation.pointUnplaceableError.message);
        }
    }

    getColorForStateWhenDrawing(state) {
        let newColor = null;
        if (this.currentDrawingObject instanceof PolygonModel) {
            newColor = COLOR_MAPPINGS.POLYGON[MATERIAL_STATES.TRANSLUCENT][state];
        }
        return newColor;
    }

    updateParentsAndErrors() {
            this.updateMeshesWithNewColor(this
                .getColorForStateWhenDrawing(VISUAL_STATES.DEFAULT_STATES.DEFAULT));
    }

    updateMeshesWithNewColor(newColor) {
        utils.updateMeshWithColor(newColor.MESH_COLOR, this.rectMesh);
        utils.updateMeshWithColor(newColor.FIRST_POINT_DRAWING_COLOR, this.firstPointMesh);

        if (newColor.OUTLINE_POINT_COLOR === undefined) {
            utils.updateMeshWithColor(newColor.EDGE_COLOR, this.pointsMesh);
            utils.updateMeshWithColor(newColor.EDGE_COLOR, this.lineMesh);
        }
        else {
            utils.updateMeshWithColor(newColor.OUTLINE_POINT_COLOR, this.pointsMesh);
            utils.updateMeshWithColor(newColor.EDGE_COLOR, this.lineMesh);
        }
    }

    updatePropertiesValidationError(isValid) {
        if (isValid) {
            this.validationError = null;
        }
        else {
            this.validationError = new Error(INVALID_PROPERTIES_ERROR);
            this.updateMeshesWithNewColor(this
                .getColorForStateWhenDrawing(VISUAL_STATES.DRAWING_ERROR));
        }
    }
    
    // Helper functions
    get geometry() {
        let geometry;

        if (this.pointsMesh !== null) {
            geometry = this.pointsMesh.geometry.clone();
        }

        if (this.currentDrawingObject instanceof PolygonModel) {
            geometry.noOfVertices = this.numVertices;
        }

        return geometry;
    }

    getNoOfVertices() {
        return this.numVertices;
    }

    getVertices() {
        return this.vertices;
    }

    get2DVertices() {
        if (!this.isEnabled()) {
            console.error("ERROR: DrawManager - get2DVertices - DrawManager is not initialized");
            return [];
        }
        const vertices = [];

        for (let i = 0; i < this.numVertices; i += 1) {
            vertices.push([
                this.vertices[ i * 3 ],
                this.vertices[ i * 3 + 1]
            ]);
        }

        return vertices;
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

        if (this.numVertices > 2 &&
            (vertices[ this.numVertices - 1 ].x !== vertices[ 0 ].x ||
                vertices[ this.numVertices - 1 ].y !== vertices[ 0 ].y)) {
            edges.push([
                vertices[ this.numVertices - 1 ],
                vertices[ 0 ]
            ]);
        }

        return edges;
    }

    getCurrentDrawingObject() {
        return this.currentDrawingObject;
    }

    updateDrawingSurfaceParams(azimuth, tilt) {        
        let placingPoint;
        if (0 <= azimuth && azimuth < 90) {
            placingPoint = new THREE.Vector3( this.stage.imageDimensions.width / 2, this.stage.imageDimensions.height / 2, this.highestZ );
        }
        else if (90 <= azimuth && azimuth < 180) {
            placingPoint = new THREE.Vector3( this.stage.imageDimensions.width / 2, -this.stage.imageDimensions.height / 2, this.highestZ );
        } 
        else if (180 <= azimuth && azimuth < 270) {
            placingPoint = new THREE.Vector3( -this.stage.imageDimensions.width / 2, -this.stage.imageDimensions.height / 2, this.highestZ );
        }
        else {
            placingPoint = new THREE.Vector3( -this.stage.imageDimensions.width / 2, this.stage.imageDimensions.height / 2, this.highestZ );
        }                
        this.dspA = Math.sin(tilt * Math.PI / 180) * Math.sin(azimuth * Math.PI / 180);
        this.dspB = Math.sin(tilt * Math.PI / 180) * Math.cos(azimuth * Math.PI / 180);
        this.dspC = Math.cos(tilt * Math.PI / 180);
        this.dspD = (-1 * (this.dspA * placingPoint.x + this.dspB * placingPoint.y + this.dspC * placingPoint.z));        
    }

    getZOnDrawingSurface(x, y) {
        return (-1 * (this.dspA * x + this.dspB * y + this.dspD)) / this.dspC;
    }

    isEnabled() {
        return this.enabled;
    }

    getValidationError() {
        return this.validationError;
    }
}
