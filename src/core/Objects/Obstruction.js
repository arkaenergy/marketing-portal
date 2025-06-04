import * as THREE from "three";
import { ACUNIT_OBSTRUCTION, CHIMNEY_OBSTRUCTION, MUMTY_OBSTRUCTION, WATERTANK_OBSTRUCTION, HEIGHT_PER_FLOOR } from "../utilities/constants";
import { convertVectorToArray, deg2Rad } from "../utilities/utils";
import BaseObject from "./BaseObject";

export default class Obstruction extends BaseObject {
    constructor(stage, floorValue, type, id) {
        super(stage);
        this.stage = stage;
        this.scale = 3;
        this.angle = 90;
        this.obstructionBaseHeight = floorValue * HEIGHT_PER_FLOOR;
        this.baseHeight =  this.obstructionBaseHeight + this.scale / 2;
        // this.name = `Model #${this.id.toString()}`;
        this.id = id ? id : this.stage.getObsId();
        this.obstructionType = type;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.vertices = [];
        this.objectLastPosition = [];
        this.objectLastScale = [];
        this.material2D = new THREE.MeshBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.60,
        });
        this.material3D = new THREE.MeshBasicMaterial({
            color: 0xCCCCCC,
        });
        if (type === MUMTY_OBSTRUCTION) {
            this.createMumty(3);
        } else if (type === ACUNIT_OBSTRUCTION) {
            this.createAcUnit(3);
        } else if (type === CHIMNEY_OBSTRUCTION) {
            this.createChimney(3);
        } else if (type === WATERTANK_OBSTRUCTION) {
            this.createWaterTank(3);
        }
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.stage.deselectOtherSelectedMeshes(this);
        this.stage.currentSelectedObject = this;
        this.updateCoreEdges();
    }

    setParentOnCreation() {
        // update new parent
        if(this.stage.polygonModel){
            if (this.stage.areOverlapping(this)) {
                this.updateHeight((this.stage.floorValue * HEIGHT_PER_FLOOR) + 1.5 ,this.stage.polygonModel);
            } else {
                this.updateHeight(1.5 ,this.stage.ground);
            }
        }
    }

    createMumty(scaleValue) {
        this.geometry = new THREE.BoxGeometry(scaleValue, scaleValue, scaleValue);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.material2D,
        );
        this.mesh.position.set(0, 0, this.obstructionBaseHeight + scaleValue / 2);
        // this.vertices = [
        //     new THREE.Vector3(-1.5, 1.5),
        //     new THREE.Vector3(1.5, 1.5),
        //     new THREE.Vector3(1.5, -1.5),
        //     new THREE.Vector3(-1.5, -1.5),
        // ];
        this.initVertices = [
            new THREE.Vector3(-1.5, 1.5),
            new THREE.Vector3(1.5, 1.5),
            new THREE.Vector3(1.5, -1.5),
            new THREE.Vector3(-1.5, -1.5),
        ];
        this.objectsGroup.add(this.mesh);
        // this.stage.addToObjectsArray(this);
        this.stage.lastChangedObject.push([this, 'pos']);
        this.objectLastPosition.push({ ...this.mesh.position });
        this.setParentOnCreation();
    }

    getVertices() {
        const transformed = this.initVertices.map(v => v.clone().applyMatrix4(this.mesh.matrix));
        return convertVectorToArray(transformed);
    }

    createChimney(scaleValue) {
        this.geometry = new THREE.CylinderGeometry(scaleValue, scaleValue, scaleValue, 32).rotateX(Math.PI / 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material2D);
        this.mesh.position.set(0, 0, this.obstructionBaseHeight + scaleValue / 2);
        this.objectsGroup.add(this.mesh);
        // this.stage.addToObjectsArray(this);
        this.stage.lastChangedObject.push([this, 'pos']);
        this.objectLastPosition.push({ ...this.mesh.position });
        // this.vertices = this.getCirclePoints(32, 3, this.mesh.position.clone());
        this.initVertices = this.getCirclePoints(32, 3, this.mesh.position.clone());
        this.setParentOnCreation();
    }

    createAcUnit(scaleValue) {
        this.geometry = new THREE.BoxGeometry(scaleValue, scaleValue, scaleValue);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.material2D,
        );
        this.mesh.position.set(0, 0, this.obstructionBaseHeight + scaleValue / 2);
        this.objectsGroup.add(this.mesh);
        // this.vertices = [
        //     new THREE.Vector3(-1.5, 1.5),
        //     new THREE.Vector3(1.5, 1.5),
        //     new THREE.Vector3(1.5, -1.5),
        //     new THREE.Vector3(-1.5, -1.5),
        // ];
        this.initVertices = [
            new THREE.Vector3(-1.5, 1.5),
            new THREE.Vector3(1.5, 1.5),
            new THREE.Vector3(1.5, -1.5),
            new THREE.Vector3(-1.5, -1.5),
        ];
        // this.stage.addToObjectsArray(this);
        this.stage.lastChangedObject.push([this, 'pos']);
        this.objectLastPosition.push({ ...this.mesh.position });
        this.setParentOnCreation();
    }

    createWaterTank(scaleValue) {
        this.geometry = new THREE.CylinderGeometry(scaleValue, scaleValue, scaleValue, 32).rotateX(Math.PI / 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material2D);
        this.mesh.position.set(0, 0, this.obstructionBaseHeight + scaleValue / 2);
        this.objectsGroup.add(this.mesh);
        // this.stage.addToObjectsArray(this);
        this.stage.lastChangedObject.push([this, 'pos']);
        this.objectLastPosition.push({ ...this.mesh.position });
        // this.vertices = this.getCirclePoints(32, 3, this.mesh.position.clone());
        this.initVertices = this.getCirclePoints(32, 3, this.mesh.position.clone());
        this.setParentOnCreation();
    }
    /**
     * It takes a number of segments, a radius, and a center point and returns an array of points that are
     * evenly spaced around the circumference of a circle.
     * @param segment - number of points to draw
     * @param radius - The radius of the circle.
     * @param center - the center of the circle
     * @returns An array of Vector2 objects.
    */
    getCirclePoints(segment, radius, center) {
        let arr = [];
        let slice = 2 * Math.PI / segment;
        for (let i = 0; i < segment; i++) {
            let angle = slice * i;
            let newX = (center.x + radius * Math.cos(angle));
            let newY = (center.y + radius * Math.sin(angle));
            let p = new THREE.Vector3(newX, newY);
            arr.push(p);
        }
        return arr;
    }

    getObjectType(){
        return "Obstruction";
    }

    addObstructionInLocal(){
        let stageData = JSON.parse(localStorage.getItem("stageData"));
        if(stageData.obstructionData){
            const isSameId = (element) => element.id == this.id;
            let indInArr = stageData.obstructionData.findIndex(isSameId);
            if(indInArr !== -1){
                stageData.obstructionData.splice(indInArr, 1);
            }
            stageData.obstructionData.push({
                centerPoint: {x:this.getPosition().x, y: this.getPosition().y},
                baseHeight: this.baseHeight,
                scale: this.scale,
                angle: this.angle,
                type: this.obstructionType,
                id: this.id,
            });
        }
        stageData.modelId = this.stage._MODEL_ID_INIT;
        stageData.obsId = this.stage._OBS_ID_INIT;
        localStorage.setItem('stageData', JSON.stringify(stageData));
    }

    removeObstructionFromLocal(){
        let stageData = JSON.parse(localStorage.getItem("stageData"));
        if(stageData.obstructionData){
            const isSameId = (element) => element.id == this.id;
            let indInArr = stageData.obstructionData.findIndex(isSameId);
            if(indInArr !== -1){
                stageData.obstructionData.splice(indInArr, 1);
            }
        }
        localStorage.setItem('stageData', JSON.stringify(stageData));
    }

    loadObject(obsData) {
        let diffVec = this.getPosition();
        this.moveObject(-diffVec.x+obsData.centerPoint.x, -diffVec.y+obsData.centerPoint.y);
        this.updateObstructionScale(obsData.scale);
        if(obsData.angle) this.rotateObstruction(obsData.angle);
        this.setParentOnCreation();
    }

    storeLastPosition(position) {
        this.objectLastPosition.push({ ...position });
    }

    storeLastScale() {
        this.objectLastScale.push(this.scale);
    }

    undo(type = 'undef') {
        if (this.objectLastPosition.length <= 1 && this.objectLastScale.length === 0) {
            this.removeObject();
        }
        if (type === 'pos') {
            if (this.objectLastPosition.length > 0) {
                let position = this.objectLastPosition.pop();
                let delta = this.mesh.position.clone().sub(position).negate();
                this.moveObject(delta.x, delta.y);
                this.placeObject();
                //this.mesh.position.set(position.x, position.y, position.z);
            }
        } else if (type === 'scale') {
            if (this.objectLastPosition.length > 0) {
                let scale = this.objectLastScale.pop();
                this.updateObstructionScale(scale);
            }
        }
        this.deSelect();
    }
    // cube
     updateHeight(height = 0, newParent){
        //this.baseHeight =  ;
        // this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.obstructionBaseHeight + this.scale / 2);
        // let currentPos = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, );
        // let newPos = new 
        // let delta = this.mesh.position.clone().sub(new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.obstructionBaseHeight + this.scale / 2));
        this.moveObject(0 , 0,height - this.baseHeight);
        this.baseHeight = height;
        // update new parent
        this.changeParent(newParent);
        // update new base height
    }

    // scaleVertices(scale) {
    //     console.log('this.vertices: ',scale, [...this.vertices]);
    //     let vecScale = scale-3;
    //     let center = this.mesh.position.clone();
    //     center.z = 0;
    //     let vertices = this.vertices;
    //     let scaledVertices = [];
    //     for(let i = 0; i < vertices.length; i++) {
    //         var direction = new THREE.Vector3();
    //         direction.subVectors( vertices[i], center );
    //         if(vecScale > 0){
    //             direction.multiplyScalar(vecScale);
    //         }else{
    //             direction.negate();
    //             direction.multiplyScalar(vecScale);
    //         }
    //         scaledVertices.push(direction);
    //     }
    //     this.vertices = scaledVertices;
    //     console.log('scaled: ', scaledVertices);
    // }


    updateObstructionScale(scaleValue) {
        //this.scaleVertices(scaleValue);
        this.scale = scaleValue;
        scaleValue = scaleValue / 3;
        this.mesh.scale.set(scaleValue, scaleValue, 1);
        this.mesh.position.z = (this.baseHeight);
        this.placeObject();
    }

    rotateObstruction(angle) {
        let angleToRotate = parseInt(angle)-parseInt(this.angle);
        this.angle = parseInt(angle);
        this.mesh.rotateZ(deg2Rad(angleToRotate));
        this.placeObject();
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // this.baseHeight += deltaZ;
        this.mesh.applyMatrix4(new THREE.Matrix4().makeTranslation(deltaX, deltaY, deltaZ));
        if(this.line){
            this.line.applyMatrix4(new THREE.Matrix4().makeTranslation(deltaX, deltaY, deltaZ));
        }
        // for (let i = 0, l = this.vertices.length; i < l; i += 1) {
        //     this.vertices[i].x += deltaX;
        //     this.vertices[i].y += deltaY;
        //     this.vertices[i].z += deltaZ;
        // }
    }

    placeObject(deltaX = 0, deltaY = 0, deltaZ = 0) {
        // let delta = this.mesh.getPosition().sub(new THREE.Vector3(deltaX, deltaY, deltaZ));
        // this.mesh.translateX(deltaX);
        // this.mesh.translateY(deltaY);
        // this.mesh.translateZ(deltaZ);
        // for (var i = 0; i < this.vertices.length; i++) {
        //     this.vertices[i].x += deltaX;
        //     this.vertices[i].y += deltaY;
        //     this.vertices[i].z += deltaZ;
        // }
        // get new parent and height while placing
        this.setParentOnCreation();
        // const newParent = stage.ground;
        // const newHeight = this.stage.ground.height;

        // // update new parent
        // this.changeParent(newParent);

        // // update new base height
        // this.baseHeight = newHeight;
        // this.updateGeometry();
        //this.deSelect();
        this.addObstructionInLocal();
        this.updateCoreEdges();
    }

    removeObject() {
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }

        // NOTE: deSelect should be after save since it will disable
        // drag controls and stop Undo/Redo container
        //select ground . 
        this.stage.ground.onSelect();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        let prevParent = null;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            prevParent = null;
        }
        
        let cloneArray = [...this.stage.lastChangedObject];

        // temp stores the filtered array of obstructions that were deleted
        // it now has removed the positions of the deleted obstructions from the [lastChangedObject] array

        let temp = cloneArray.filter((ele) => {
            return ele[0].uuid !== this.uuid;
        });
        this.removeObstructionFromLocal();
        // update the lastChangedObject with filtered array
        this.stage.lastChangedObject = temp;
        stage.obstructionInScene();
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    onSelect() {
        this.material2D.opacity = 0.80;
        this.stage.currentSelectedObject = this;
        this.updateCoreEdges();
        this.stage.changeSlider(this.scale);
        this.stage.changeRotationSlider(this.angle);
    }

    
    deSelect() {
        this.material2D.opacity = 0.60;
        this.stage.currentSelectedObject = null;
        this.removeCoreEdges();
    }
    
    updateCoreEdges() {
        this.removeCoreEdges();
        this.coreEdges = new THREE.EdgesGeometry(this.geometry.clone().applyMatrix4(this.mesh.matrix));
        this.line = new THREE.LineSegments(this.coreEdges, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));
        this.objectsGroup.add(this.line);
    }
    removeCoreEdges() {
        this.objectsGroup.remove(this.line);
    }
    switchTo2d() {
        this.mesh.material = this.material2D;
        //this.objectsGroup.remove(this.line);
    }

    switchTo3d() {
        this.updateCoreEdges();
        this.mesh.material = this.material3D;
    }

}