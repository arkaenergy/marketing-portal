import * as THREE from 'three';
import * as utils from '../../utilities/utils';
import Table from './Table';
import BaseObject from '../BaseObject';
import {
    CREATED_STATE, DELETED_STATE, COLOR_MAPPINGS,
} from '../../utilities/constants';

export default class Row extends BaseObject {
    constructor(
        stage,
        rowMap,
        { withoutContainer } = { withoutContainer: false },
    ) {
        super(stage);
 
        this.stage = stage;

        this.id = parseInt(rowMap.id);
        this.name = `Row #${this.id.toString()}`;

        if (rowMap.localBBox !== undefined) {
            this.localBBox = {
                minX: rowMap.localBBox.minX,
                maxX: rowMap.localBBox.maxX,
                minY: rowMap.localBBox.minY,
                maxY: rowMap.localBBox.maxY,
            }
        }
    }
 
    // autoplacepanels gets call from makerows which gives how many rows should be there in an subarray and this function will create each panel to be placed in an row.
    async autoPlacePanels(parameter, { withoutContainer } = { withoutContainer: false }) {
        const { tableMap } = parameter;
        const { tableDimensions } = parameter;
        const { boundingBox } = parameter;
        const { bBoxDimensions } = parameter;
        const { relativeTilt } = parameter;
 
        let tableId = 1;
        let currentPosition = parameter.startPositionX + (tableDimensions.width / 2);
        while (currentPosition < parameter.endPositionX - (tableDimensions.width / 2)) {
            tableMap.position = utils.localToGlobalCoordinates(
                new THREE.Vector2(
                    currentPosition,
                    (parameter.topPositionY + parameter.bottomPositionY) / 2,
                ),
                boundingBox,
                bBoxDimensions,
            );
 
            tableMap.position.z = (tableMap.position.z +
                this.getParent().getMountHeight() +
                ((tableDimensions.length * Math.sin(relativeTilt)) /
                    (Math.cos(utils.deg2Rad(this.getSubarray().getParent().getTilt())) * 2)));
            tableMap.id = tableId;
           
            for (const panel of tableMap.panels) {
                panel.id = this.getParent().getPanelId();
            }
            // TODO: Shift the conversion from local to global coordinates in table and only send local position in table.
            const table =
                new Table(this.stage, tableMap, { withoutContainer },);
            this.addChild(table);
 
            currentPosition =
                currentPosition + tableDimensions.width + this.getParent().tableSpacing;
            tableId += 1;
        }
        this.localBBox = {
            minX: parameter.startPositionX,
            maxX: currentPosition - (tableDimensions.width / 2) - this.getParent().tableSpacing,
            minY: parameter.topPositionY,
            maxY: parameter.bottomPositionY,
        };
    }

    getState() {
        return {
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            parent: this.getParent() ? this.getParent().uuid : null,
            localBBox: {
                minX: this.getlocalBoundingBox().minX,
                maxX: this.getlocalBoundingBox().maxX,
                minY: this.getlocalBoundingBox().minY,
                maxY: this.getlocalBoundingBox().maxY,
            },
        };
    }
 
    loadState(state) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            const { parent, id, name, localBBox } = state;
 
            // load id and name
            this.id = id;
            this.name = name;
            this.localBBox = {
                minX: localBBox.minX,
                maxX: localBBox.maxX,
                minY: localBBox.minY,
                maxY: localBBox.maxY,
            };
 
            this.updateVisualsAfterLoadingAndCreation();
 
            // update parent
            const parentObject = this.stage.getObject(parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }
        }
    }
 
    clearState() {
        if (this.getParent()) {
            this.getParent().removeChild(this);
        }
    }
 
    // parent/child operation fucntions
 
    divideRow(table) {
        const tableIndex = this.getChildren().indexOf(table);
        const tablesForNewRow = this.children.splice(0, tableIndex);
        if (tablesForNewRow.length !== 0) {
            const rowMap = {
                id: this.getParent().getHighestRowId() + 1,
                frames: [],
                localBBox: {
                    minX: tablesForNewRow[0].getLocalPosition(this.getParent()).x -
                        (this.getParent().getTableDimensions().width / 2),
                    maxX: tablesForNewRow[tablesForNewRow.length - 1]
                        .getLocalPosition(this.getParent()).x +
                        (this.getParent().getTableDimensions().width / 2),
                    minY: this.localBBox.minY,
                    maxY: this.localBBox.maxY,
                },
            };
            const newRow = new Row(
                this.stage, rowMap,
                { withoutContainer: false },
            );
            for (let i = 0, l = tablesForNewRow.length; i < l; i += 1) {
                tablesForNewRow[i].parent = null;
                newRow.addChild(tablesForNewRow[i]);
                // tablesForNewRow[i].saveState();
            }
            newRow.refreshTableIds();
            for (let i = 0, l = newRow.getChildren().length; i < l; i += 1) {
                newRow.getChildren()[i].saveState();
            }
            this.getParent().addChild(newRow, this.getParent().getChildren().indexOf(this));
            newRow.saveState();
        }
        this.refreshTableIds();
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            this.getChildren()[i].saveState();
        }
        if (this.getChildren().length > 1) {
            this.localBBox.minX = this.getChildren()[1]
                .getLocalPosition(this.getParent()).x -
                    (this.getParent().getTableDimensions().width / 2);
            this.saveState();
        }
    }
 
    // overriding original function to add Table at correct index.
    addChild(table, index) {
        super.addChild(table);
    }
 
    removeChild(child, divideRow = false) {
        if (divideRow && this.getChildren().length > 1) {
            this.divideRow(child);
        }
        const removedChild = super.removeChild(child);
        // if (this.getParent()) {
        //     // remove rails after deletion of rows
        //     this.getParent().updateRail();
        // }
        return removedChild;
    }
 
    getTableInsertionIndex(table) {
        const xPosition = table.getLocalPosition(this.getParent()).x;
        for (let i = 0, { length } = this.getChildren(); i < length; i += 1) {
            if (this.getChildren()[i].getLocalPosition(this.getParent()).x > xPosition) {
                return i;
            }
        }
        return this.getChildren().length;
    }
 
    refreshTableIds() {
        for (let i = 0, { length } = this.getChildren(); i < length; i += 1) {
            this.getChildren()[i].id = i + 1;
        }
    }
 
    updateLocalBoundingBox() {
        const tableDimensions = this.getParent().getTableDimensions(true);
        const tiltDiff = this.getParent().getTiltWrtParentSurface() ? this.getParent().getTiltWrtParentSurface() : 0;
        if (this.getChildren().length > 0) {
            const firstChildLocalPosition =
                this.getChildren()[0].getLocalPosition(this.getParent());
            const lastChildLocalPosition = this.getChildren()[this.getChildren().length - 1]
                .getLocalPosition(this.getParent());

            this.localBBox = {
                minX: firstChildLocalPosition.x -
                    (tableDimensions.width / 2),
                maxX: lastChildLocalPosition.x +
                    (tableDimensions.width / 2),
                minY: firstChildLocalPosition.y -
                    ((tableDimensions.length / 2) *
                    Math.cos(tiltDiff)),
                maxY: firstChildLocalPosition.y +
                    ((tableDimensions.length / 2) *
                    Math.cos(tiltDiff)),
            };
        }
    }
 
    // Geometry Manipulation
 
    moveObject(deltaX, deltaY, deltaZ) {
        // change for the child
        for (const child of this.getChildren()) {
            child.moveObject(deltaX, deltaY, deltaZ);
        }
    }
 
    // Helper functions
 
    getlocalBoundingBox() {
        if (this.localBBox === undefined) {
        }
        this.updateLocalBoundingBox();
        return this.localBBox;
    }
 
    // TODO: Needs refactoring in subarray refactor
    get3DBoundingBoxesExcludingHiddenTables() {
        // Jugaad fix- to fix the order of tables in 3d
        this.getChildren().sort((a, b) => a.getLocalPosition(this.getParent()).x - b.getLocalPosition(this.getParent()).x);
        this.updateLocalBoundingBox();
        const tables = this.getChildren();
        let startIndex = -1;
        let endIndex = 0;
        const boundingBoxes = [];
 
        const tableSpacing = this.getSubarray().getTableSpacing();
        // Condition for creating the table blocks is if table spacing is more than module spacing
        // and if table spacing is more than 0.05 (Intuitive number taken for creating row blocks)
        if (this.getSubarray().getModuleSpacing().wide < tableSpacing && tableSpacing > 0.05) {
            tables.forEach((table, idx) => {
                if (!table.isHidden()) {
                    let box = this.get3DBBoxBetween2Tables(idx, idx);
                    if (box) {
                        boundingBoxes.push(box);
                    }
                    // boundingBoxes.push(this.get3DBBoxBetween2Tables(idx, idx));
                }
            });
        }
        else {
            tables.forEach((table, idx) => {
                if (!(table.isHidden())) {
                    if (startIndex === -1) {
                        startIndex = idx;
                    }
                }
                else if (startIndex !== -1) {
                    endIndex = idx - 1;
                    let box = this.get3DBBoxBetween2Tables(startIndex, endIndex);
                    if (box) {
                        boundingBoxes.push(box);
                    }
                    // boundingBoxes.push(this.get3DBBoxBetween2Tables(startIndex, endIndex));
                    startIndex = -1;
                }
            });
            if (startIndex !== -1) {
                let box = this.get3DBBoxBetween2Tables(startIndex, tables.length - 1);
                if (box) {
                    boundingBoxes.push(box);
                }
                // boundingBoxes.push(this.get3DBBoxBetween2Tables(startIndex, tables.length - 1));
            }
        }
        return boundingBoxes;
    }
 
    get3DBBoxBetween2Tables(tableIndex1, tableIndex2) { // from table 1 to table 2
        // points are in the order
        // top left
        // top right
        // bottom right
        // bottom left
        const mountHeight = this.getParent().getMountHeight();
        const tableDimensions = this.getParent().getTableDimensions(true);
        const bBox = this.getParent().getBoundingBox();
        const bBoxDimensions = {
            xLength: bBox[0].distanceTo(bBox[1]),
            yLength: bBox[0].distanceTo(bBox[3]),
        };
        const leftPositionX = this.getChildren()[tableIndex1].getLocalPosition(this.getParent()).x -
            (tableDimensions.width / 2);
        const rightPositionX = this.getChildren()[tableIndex2].getLocalPosition(this.getParent()).x +
            (tableDimensions.width / 2);

        const topLeft = utils.localToGlobalCoordinates(
            new THREE.Vector2(leftPositionX, this.localBBox.minY),
            bBox,
            bBoxDimensions,
        ).add(new THREE.Vector3(0, 0, mountHeight + tableDimensions.height));

        const topRight = utils.localToGlobalCoordinates(
            new THREE.Vector2(rightPositionX, this.localBBox.minY),
            bBox,
            bBoxDimensions,
        ).add(new THREE.Vector3(0, 0, mountHeight + tableDimensions.height));

        const bottomRight = utils.localToGlobalCoordinates(
            new THREE.Vector2(rightPositionX, this.localBBox.maxY),
            bBox,
            bBoxDimensions,
        ).add(new THREE.Vector3(0, 0, mountHeight));

        const bottomLeft = utils.localToGlobalCoordinates(
            new THREE.Vector2(leftPositionX, this.localBBox.maxY),
            bBox,
            bBoxDimensions,
        ).add(new THREE.Vector3(0, 0, mountHeight));
        if ((utils.checkPolygonInsidePolygon([
            [topLeft.x, topLeft.y],
            [topRight.x, topRight.y],
            [bottomRight.x, bottomRight.y],
            [bottomLeft.x, bottomLeft.y],
        ], this.getParent().getParent().get2DVertices()))) {
            return [
                topLeft, topRight, bottomRight, bottomLeft,
            ];
        }

        return undefined;
    }
 
    getDcSize() {
        return this.getNumberOfPanels() * this.getSubarray().getPanelSize();
    }
 
    getNumberOfPanels() {
        let nPanels = 0;
        for (const child of this.getChildren()) {
            nPanels += child.getNumberOfPanels();
        }
        return nPanels;
    }
 
    getNumberOfPanelsIncludingHidden() {
        let nPanels = 0;
        for (let i = this.getChildren().length; i >= 0; i--) {
            if (this.getChildren()[i] instanceof Table) {
                const nTablePanels = this.getChildren()[i].getNumberOfPanelsIncludingHidden();
                if (nTablePanels === 0) {
                    this.getChildren()[i].removeObject({ shouldSaveState: false });
                }
                nPanels += nTablePanels;
            }
        }
        return nPanels;
    }
 
    getRowMap() {
        const rowMap = {
            id: this.id,
            localBBox: {
                minX: this.getlocalBoundingBox().minX,
                maxX: this.getlocalBoundingBox().maxX,
                minY: this.getlocalBoundingBox().minY,
                maxY: this.getlocalBoundingBox().maxY,
            },
            frames: [],
        };
        for (const table of this.getChildren()) {
            rowMap.frames.push(table.getTableMap());
        }
        return rowMap;
    }
 
    getId() {
        return this.id;
    }
 
    getSubarray() {
        return this.getParent();
    }
 
    // Visual Functions
 
    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.ROW;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }
 
    // Universal functions
 
    removeObject(options) {
        const defaultOptions = {
            shouldSaveState: true,
            deleteEmptyParent: true,
            showError: true,
        };
        const customOptions = Object.assign(defaultOptions, options);
 
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({
                shouldSaveState: customOptions.shouldSaveState,
                deleteEmptyParent: false,
            },
            false,
            );
        }
 
        const subarray = this.getParent();
        this.getParent().removeChild(this);
 
        // if (customOptions.shouldSaveState) {
        //     this.stage.stateManager.add({
        //         uuid: this.uuid,
        //         getStateCb: () => DELETED_STATE,
        //     });
        // }
 
        if (customOptions.deleteEmptyParent) subarray.removeIfEmpty(customOptions.showError);
    }
 
    hideObject() {
        for (const table of this.getChildren()) {
            table.hideTable();
        }
    }
 
    showObject(hiddenTablesList) {
        for (const table of this.getChildren()) {
            if (!hiddenTablesList.includes(table)) {
                table.showTable();
            }
        }
    }
 
    showObjectLayer() {
        for (const table of this.getChildren()) {
            table.showObjectLayer();
        }
    }
 
    hideObjectLayer() {
        for (const table of this.getChildren()) {
            table.hideObjectLayer();
        }
    }
 
    removeIfEmpty() {
        if (this.getNumberOfPanels() < 1) {
            this.removeObject();
        }
    }
}
 

