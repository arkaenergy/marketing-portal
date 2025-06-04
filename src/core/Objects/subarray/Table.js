import * as THREE from "three";
import Panel from "./Panel";
import Subarray from '../subarray/Subarray'
import Row from '../subarray/Row'
import BaseObject from "../BaseObject";
import * as raycastingUtils from "../../utilities/rayCastingUtils";
import * as JSTS from "jsts";
import * as utils from '../../utilities/utils';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_ASSOCIATED_MODEL_ERROR,
    SUBARRAY_RACK_STYLE_FLUSH,
    COLOR_MAPPINGS,
} from '../../utilities/constants';
import PolygonModel from "../PolygonModel";
import Ground from "../Ground/Ground";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';


export default class Table extends BaseObject {
    constructor(
        stage, tableMap, { withoutContainer } = { withoutContainer: false }, newFlow = false,
    ) {
        super(stage);

        this.stage = stage;
        this.id = parseInt(tableMap.id);
        this.name = `Table #${this.id.toString()}`;

        this.clickToAdd = false;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // TODO: shift table map to 0 0 0 when the new flow is not true
        const position = new THREE.Vector3();
        if (!newFlow) {
            let totalCorners = 0;
            for (let panelMap of tableMap.panels !== undefined ? tableMap.panels : []) {
                for (let i = 0, l = panelMap.corners.length; i < l; i += 1) {
                    position.x += panelMap.corners[i][0];
                    position.y += panelMap.corners[i][1];
                    position.z += panelMap.corners[i][2];
                    totalCorners += 1;
                }
            }
            position.divideScalar(totalCorners);
        }
        for (let panelMap of tableMap.panels !== undefined ? tableMap.panels : []) {
            for (let i = 0, l = panelMap.corners.length; i < l; i += 1) {
                panelMap.corners[i][0] = panelMap.corners[i][0] - position.x;
                panelMap.corners[i][1] = panelMap.corners[i][1] - position.y;
                panelMap.corners[i][2] = panelMap.corners[i][2] - position.z;
            }
            let panel = new Panel(stage, panelMap);
            this.addChild(panel);
        }

        this.useIndividualMesh = false;

        this.isMoved = tableMap.hasOwnProperty("isMoved") ? tableMap.isMoved : false;
        this.hidden = false;

        if (tableMap.hasOwnProperty("hidden") ? tableMap.hidden : false) {
            this.hideTable();
        }

        if (newFlow) { // new flow is only true in case of auto panel placement
            // as in the new flow the table is at origin and moved to the required position
            this.moveObject(tableMap.position.x, tableMap.position.y, tableMap.position.z);
        }
        else {
            // why this is added (this.moveObject(position.x, position.y, position.z);)
            // load Object and copy paste
            // this.moveObject(position.x, position.y, position.z);
            this.moveObject(tableMap.position.x, tableMap.position.y, tableMap.position.z);
        }
    }

    exportAsSTL() {
        let singleGeometry = new THREE.BufferGeometry();
        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const panelMesh = children[i].exportMesh();
            singleGeometry = BufferGeometryUtils.mergeBufferGeometries(panelMesh.geometry, panelMesh.matrix);
        }

        const mesh = new THREE.Mesh(singleGeometry, new THREE.MeshBasicMaterial());

        return [{
            mesh,
            name: `${this.getParent().getParent().name} ${this.getParent().name} ${this.name}`,
        }];
    }

    exportAsCollada() {
        let singleGeometry = new THREE.BufferGeometry();
        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const panelMesh = children[i].exportMesh();
            singleGeometry = BufferGeometryUtils.mergeBufferGeometries(panelMesh.geometry, panelMesh.matrix);
        }

        const mesh = new THREE.Mesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: 0x0062A3,
                transparent: false,
            }),
        );
        mesh.name = `${this.getParent().getParent().name} ${this.getParent().name} ${this.name}`;

        return [mesh];
    }

    saveObject(isCopy) {
        let tableData = {
            type: Table.getObjectType(),
            subarrayUUID: this.getParent().getParent().getUUID(),
        };

        // save id and name
        tableData.id = this.id;
        tableData.name = this.name;
        if (isCopy) {
            tableData.uuid = this.uuid;
        }
        // saving properties
        tableData.hidden = this.hidden;
        tableData.isMoved = this.isMoved;

        // save table map
        tableData.tableMap = this.getTableMap();

        return tableData;
    }

    loadObject(tableData, isPaste) {
        // load id and name
        if (!isPaste) {
            console.error('ERROR: Table: loadObject: Not implemented when not pasting');
        }

        this.id = this.getSubarray().getHighestTableId() + 1;
        this.name = "Table #" + this.id.toString();

        // get highest panel id in the subarray
        let highestPanelId = this.getSubarray().getHighestPanelId();

        // initialise table map
        this.hidden = false;
        this.isMoved = true;
        for (let panel of this.getChildren()) {
            panel.id = highestPanelId + 1;
            panel.name = "Panel #" + this.id.toString();
            highestPanelId += 1;
        }

        this.getSubarray().structureUpdateRequired = true;
    }

    getState() {
        const position = this.getPosition();
        return {
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            parent: this.getParent() ? this.getParent().uuid : null,
            hidden: this.hidden,
            position: {
                x: position.x,
                y: position.y,
                z: position.z,
            },
        };
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            const { parent, id, name, hidden, position } = state;
            this.id = id;
            this.name = name;
            this.hidden = hidden;

            this.updateVisualsAfterLoadingAndCreation();

            if (parent) {
                const parentObject = this.stage.getObject(parent);
                if (!this.getParent()) {
                    parentObject.addChild(this, undefined, true);
                } else if (parentObject !== this.getParent()) {
                    this.getParent().removeChild(this);
                    parentObject.addChild(this, undefined, true);
                }
            }

            this.setPosition(position);

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                this.stage.sceneManager.scene.add(this.objectsGroup);
            }
            this.getSubarray().structureUpdateRequired = true;
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        if (this.getParent()) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    // Geometry Manipulation

    moveObject(deltaX, deltaY, deltaZ = 0) {
        this.objectsGroup.position.set(
            this.objectsGroup.position.x + deltaX,
            this.objectsGroup.position.y + deltaY,
            this.objectsGroup.position.z + deltaZ,
        );

        this.moveDimensions(deltaX, deltaY, deltaZ = 0);

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject();
        }
    }

    setPosition(position) {
        this.objectsGroup.position.set(
            position.x,
            position.y,
            position.z,
        );
    }

    getLocalPosition(subarray) {
        if (subarray === undefined) {
            subarray = this.getSubarray();
        }
        return subarray.globalToLocalCoordinates(new THREE
            .Vector2(this.getPosition().x, this.getPosition().y), subarray.getBoundingBox());
    }

    getPlacingInformation(mousePoint) {
        const subarrayParentModel = this.getSubarray().getAssociatedModel();
        let position = this.getPosition();
        const offset = 0.01;
        let boundingBoxVertices = [
            [position.x - offset, position.y - offset],
            [position.x - offset, position.y + offset],
            [position.x + offset, position.y - offset],
            [position.x + offset, position.y + offset],
        ];
        if (mousePoint) {
            boundingBoxVertices = [
                [mousePoint.x - offset, mousePoint.y - offset],
                [mousePoint.x - offset, mousePoint.y + offset],
                [mousePoint.x + offset, mousePoint.y + offset],
                [mousePoint.x + offset, mousePoint.y - offset],
            ];
        }

        // Two conditions for placement = at least one vertex should be on the associated model of
        // the subarray & all vertices should be open (i.e. no vertex should have a model on top
        // of it on placement)

        const response = {};
        let parentExists = true;
        response.errors = [];

        const allModels =
            raycastingUtils.getAllModelsBelowVertices(boundingBoxVertices, this.stage);

        let newParent;
        for (let idx = 0, len = allModels.length; idx < len; idx += 1) {
            if (!allModels[idx][0].isIgnored()) {
                [newParent] = allModels[idx];
                break;
            }
        }

        if (newParent !== subarrayParentModel && !this.clickToAdd) {
            response.errors.push(new Error(OUT_OF_ASSOCIATED_MODEL_ERROR));
            parentExists = false;
        }
        if (Number.isNaN(this.getSubarray().getTiltWrtParentSurface(newParent))) {
            if (newParent.getTilt() !== this.getSubarray().getState().tilt && this.getSubarray().getState().mountType === SUBARRAY_RACK_STYLE_FLUSH) {
                parentExists = true;
            }
        }

        if (parentExists) {
            newParent = this.clickToAdd ? newParent : this.getSubarray().getAssociatedModel();
            response.parent = newParent;
        }
        return response;
    }

    updateWhilePlacing(placingInformation) {
        if (placingInformation.errors.length !== 0) {
            return;
        }
        // if (placingInformation.parent !== this.getSubarray().getParent()) {
        //     this.getSubarray().changeParent(placingInformation.parent);
        //     this.getSubarray().associatedModel = placingInformation.parent;
        //     this.getSubarray().createBoundaryFromParent();
        //     this.changeTableDuringCreation();
        // }
    }

    async updateWhileHovering(prevParent, parent) {
        if (this.parent == null || this.parent.parent == null) {
            return;
        }
        if (prevParent) {
            const parentSubarray = this.getSubarray();
            parentSubarray.changeParent(parent);
            const newSubarrayProperties = this.getSubarray().getState();
            if (newSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
                newSubarrayProperties.azimuth = parent.getAzimuth();
                newSubarrayProperties.tilt = parent.getTilt();
            }
            if (parent instanceof PolygonModel ||
                parent instanceof Ground) {
                parentSubarray.changeTablePropertiesDuringCreation(newSubarrayProperties);
                this.stage.eventManager.addTableMode(parentSubarray);
            }
        }
    }

    getSubarrayProperties(placedSubarray, placableSubarray) {
        if (placedSubarray != null && placedSubarray != undefined) {
            return {
                name: placedSubarray.name,
                azimuth: placedSubarray.azimuth,
                moduleProperties: placedSubarray.moduleProperties,
                bifacialEnabled: placedSubarray.bifacialEnabled,
                moduleSpacingUp: placedSubarray.moduleSpacingUp,
                moduleSpacingWide: placedSubarray.moduleSpacingWide,
                mountHeight: placedSubarray.mountHeight,
                mountType: placedSubarray.mountType,
                panelOrientation: placedSubarray.panelOrientation,
                rowSpacing: placedSubarray.rowSpacing,
                rowSpacingMode: placedSubarray.rowSpacingMode,
                structureType: placedSubarray.structureType,
                tableSizeUp: placedSubarray.tableSizeUp,
                tableSizeWide: placedSubarray.tableSizeWide,
                tableSpacing: placedSubarray.tableSpacing,
                tilt: placedSubarray.tilt,
            }
        }

        return {
            name: placableSubarray.name,
            azimuth: placableSubarray.azimuth,
            moduleProperties: placableSubarray.moduleProperties,
            bifacialEnabled: placableSubarray.bifacialEnabled,
            moduleSpacingUp: placableSubarray.moduleSpacingUp,
            moduleSpacingWide: placableSubarray.moduleSpacingWide,
            mountHeight: placableSubarray.mountHeight,
            mountType: placableSubarray.mountType,
            panelOrientation: placableSubarray.panelOrientation,
            rowSpacing: placableSubarray.rowSpacing,
            rowSpacingMode: placableSubarray.rowSpacingMode,
            structureType: placableSubarray.structureType,
            tableSizeUp: placableSubarray.tableSizeUp,
            tableSizeWide: placableSubarray.tableSizeWide,
            tableSpacing: placableSubarray.tableSpacing,
            tilt: placableSubarray.tilt,
        }
    }

    // TODO: add a function to update the subarrays for removed tables.
    removeIntersectingTables() {
        const intersectingTables =
            raycastingUtils.getAllTablesBelowVertices(this.get2DVertices(), this.stage);
        for (let i = 0, l = intersectingTables.length; i < l; i += 1) {
            if (intersectingTables[i] !== this) {
                intersectingTables[i].removeObject();
            }
        }
    }

    placeObject(deltaX = 0, deltaY = 0, options = {}) {
        const defaultOptions = {
            objectSelected: false,
        };
        const customOptions = Object.assign(defaultOptions, options);

        // mark table as moved for solar access calculation
        this.isMoved = true;

        this.moveObject(deltaX, deltaY, 0);

        // check if each panel in the table is placable in the current position
        const errorsWhilePlacing = this.getPlacingInformation().errors;

        if (errorsWhilePlacing.length !== 0 || this.stage.getRemainingDcSize() < 0) {
            this.removeObject(
                undefined,
                undefined, { objectSelected: customOptions.objectSelected },
            );
            if (errorsWhilePlacing.length !== 0) {
                this.stage.eventManager.customErrorMessage(errorsWhilePlacing[0].message, 'Table');
            } else {
                this.stage.eventManager.dcCapSizeExceeded();
            }

            return;
        }

        // show all hidden tables
        let hiddenTablesList = this.getSubarray().getHiddenTables();
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.showTable();
        }

        this.removeIntersectingTables();

        // hide remaining hidden tables
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.hideTable();
        }
        // change parent to new row and handel the consequences
        this.getSubarray().findAndSetNewParentForTable(this);

        // place table along z (only required when the roof is tilted)
        const lowestVertex = this.getLowestVertex();
        const associatedModelZ = Math.max(
            this.getSubarray().getAssociatedModel().getZOnTopSurface(
                lowestVertex.x,
                lowestVertex.y,
            ),
            0,
        );
        let deltaZ = this.getSubarray().getMountHeight() - (lowestVertex.z - associatedModelZ);
        this.moveObject(0, 0, deltaZ);

        // update dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        this.getSubarray().structureUpdateRequired = true;
        this.getSubarray().updateRail();
        this.saveState();
    }

    /**
     * removes the table from the scene and returns the intersecting tables
     * without using the actual flow of removeObject
     */
    removeIntersectingTablesFromScene() {
        const intersectingTables =
            raycastingUtils.getAllTablesBelowVertices(this.get2DVertices(), this.stage);
        const tablesRemoved = [];
        for (let i = 0, l = intersectingTables.length; i < l; i += 1) {
            if (intersectingTables[i] !== this) {
                if (intersectingTables[i].getSubarray().addTableFlow) {
                    this.stage.addTableMode
                        .removeIntersectedSubarray(intersectingTables[i].getSubarray());
                    intersectingTables[i].removeObject();
                } else {
                    intersectingTables[i].removePanelsMeshFromScene();
                    tablesRemoved.push(intersectingTables[i]);
                    // intersectingTables[i].getSubarray()
                    //     .mergeGeometriesForAllPanels({ excludeTables: [intersectingTables[i]] });
                }
            }
        }
        return tablesRemoved;
    }

    placeObjectForAddTable(deltaX = 0, deltaY = 0) {
        // mark table as moved for solar access calculation
        this.isMoved = true;

        this.moveObject(deltaX, deltaY, 0);

        // check if each panel in the table is placable in the current position
        const placingInformation = this.getPlacingInformation();
        const errorsWhilePlacing = placingInformation.errors;
        if (placingInformation.parent !== this.getSubarray().getParent() && placingInformation.parent) {
            this.getSubarray().changeParent(placingInformation.parent);
            this.getSubarray().associatedModel = placingInformation.parent;
            this.getSubarray().createBoundaryFromParent();
            this.changeTableDuringCreation();
        }

        if (this.clickToAdd && placingInformation.parent) {
            this.getSubarray().changeParent(placingInformation.parent);
            this.getSubarray().associatedModel = placingInformation.parent;
        }

        // show all hidden tables
        let hiddenTablesList = this.getSubarray().getHiddenTables();
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.showTable();
        }

        // const tablesRemoved = this.removeIntersectingTablesFromScene();

        // hide remaining hidden tables
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.hideTable();
        }

        this.getSubarray().removeOutlinePoints();
        // this.getSubarray().createConvexHull();

        const allSubarrayProperties = [];
        const allSubarraySiblings = this.getSubarray().getParent().getChildren();
        for (let i = 0, len = allSubarraySiblings.length; i < len; i += 1) {
            if (allSubarraySiblings[i] instanceof Subarray) {
                const property = allSubarraySiblings[i].getState();
                property.subarray = allSubarraySiblings[i];
                allSubarrayProperties.push(property);
            }
        }
        // place table along z (only required when the roof is tilted)
        const lowestVertex = this.getLowestVertex();
        const associatedModelZ = Math.max(
            this.getSubarray().getAssociatedModel().getZOnTopSurface(
                lowestVertex.x,
                lowestVertex.y,
            ),
            0,
        );
        const deltaZ = this.getSubarray().getMountHeight() - (lowestVertex.z - associatedModelZ);
        this.moveObject(0, 0, deltaZ);

        // update dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        if (this.getSubarray().rotationPoints) {
            this.getSubarray().createBoundaryFromBB();
            this.getSubarray().updateGeometry();
        }

        this.saveState();
        return {
            isSuccess: true,
            tablesRemoved: {},
        };
    }

    changeTableDuringCreation() {
        while (this.getChildren().length > 0) {
            this.getChildren()[0].removeObject();
        }
        const tableMap = this.getSubarray().getCustomTableMapForAddTable(
            new THREE.Vector3(), { withBBox: true },
        );
        const panelMaps = tableMap.panels !== undefined ? tableMap.panels : [];
        for (let i = 0, len = panelMaps.length; i < len; i += 1) {
            const panel = new Panel(this.stage, panelMaps[i]);
            this.addChild(panel);
            panel.switchVisualState(this.getVisualState(), true);
            panel.addToScene();
        }

        this.getSubarray().getTableDimensions(true);
        const position = this.getPosition(true);
        // TODO : change this method
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        this.moveObject(0, 0, highestZ - position.z);

        // JUGAD: need to do this temp action because of some bug in BufferGeometry for Panel.
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.stage.sceneManager.scene.add(this.objectsGroup);
    }

    shouldPropagate(model) {
        if (model instanceof Panel || model instanceof Subarray || model instanceof Table ||
            model instanceof Row) {
            return true;
        }
        return false;
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.TABLE;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    // Helper functions

    showTable() {
        if (this.hidden) {
            this.hidden = false;
            for (let child of this.getChildren()) {
                child.showPanel();
            }
            this.saveState();
        }
    }

    hideTable() {
        if (!this.hidden) {
            this.hidden = true;
            for (let child of this.getChildren()) {
                child.hidePanel();
            }
            this.saveState();
        }
    }

    showObjectLayer() {
        for (let child of this.getChildren()) {
            child.showObjectLayer();
        }
    }

    hideObjectLayer() {
        for (let child of this.getChildren()) {
            child.hideObjectLayer();
        }
    }

    isHidden() {
        return this.hidden;
    }

    getNumberOfPanels() {
        if (this.hidden) {
            return 0;
        }
        return this.getChildren().length;
    }

    getTableMap({ withSolarAccess } = { withSolarAccess: true }) {
        let tableMap = {
            id: this.id,
            panels: [],
            position: {
                x: this.getPosition().x,
                y: this.getPosition().y,
                z: this.getPosition().z,
            },
        };
        if (this.isMoved) tableMap.isMoved = this.isMoved;
        if (this.hidden) tableMap.hidden = this.hidden;

        for (let panel of this.getChildren()) {
            tableMap.panels.push(panel.getPanelMap({ withSolarAccess: withSolarAccess }));
        }
        return tableMap;
    }

    getSubarray() {
        return this.getParent().getParent();
    }

    get tableSize() {
        return this.getSubarray().tableSize;
    }

    get2DVertices() {
        const panels = this.getChildren();
        const coordinatePoints = [];
        for (let i = 0, l = panels.length; i < l; i += 1) {
            const panelVertices = panels[i].get2DVertices();
            for (let j = 0, len = panelVertices.length; j < len; j += 1) {
                coordinatePoints
                    .push(new JSTS.geom.Coordinate(panelVertices[j][0], panelVertices[j][1]));
            }
        }
        const convexHullCoordinates =
            new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints)
            .convexHull().getCoordinates();

        return utils.removeCollinearPoints(convexHullCoordinates
            .map(coordinate => [coordinate.x, coordinate.y]).slice(0, -1));
    }


    getEdges() {
        let edges = [];
        for (let panel of this.getChildren()) {
            edges.push(...panel.getEdges());
        }
        return edges;
    }

    getPosition(refresh = false) {
        return this.objectsGroup.position.clone();
    }

    getId() {
        return this.id;
    }

    // Universal Functions

    removeObject({ shouldSaveState, deleteEmptyParent } = { shouldSaveState: true, deleteEmptyParent: true },
        newFlow = true, { objectSelected } = { objectSelected: false },
    ) {
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        if (this.getSubarray().rotationPoints) {
            this.getSubarray().rotationPoints.removeObject();
        }
        this.getSubarray().structureUpdateRequired = true;
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }
        const row = this.getParent();
        row.removeChild(this, newFlow);

        this.removeDimensions();

        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }

        if (deleteEmptyParent) row.removeIfEmpty();

        // NOTE: deSelect should be after save since it will disable drag controls and
        // stop Undo/Redo container
        if (objectSelected) {
            this.stage.selectionControls.removeSelectedObject(this);
            this.stage.dragControls.removeIfExists(this);
        }
    }

    handleObjectsGroupAddition(objectsGroup) {
        if (this.useIndividualMesh) {
            this.objectsGroup.add(objectsGroup);
        }
    }

    handleObjectsGroupDeletion(objectsGroup) {
        this.objectsGroup.remove(objectsGroup);
    }

    removePanelsMeshFromScene() {
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            this.getChildren()[i].removeFromScene();
        }
    }

    addPanelMeshToScene() {
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            this.getChildren()[i].addToScene();
        }
    }

    showIndividualMesh() {
        this.useIndividualMesh = true;
        const children = this.getChildren();
        for (let i = 0; i < children.length; i += 1) {
            children[i].addToScene();
        }
    }

    hideIndividualMesh() {
        this.useIndividualMesh = false;
        const children = this.getChildren();
        for (let i = 0; i < children.length; i++) {
            children[i].removeFromScene();
        }
    }

    static getObjectType() {
        return 'Table';
    }
}