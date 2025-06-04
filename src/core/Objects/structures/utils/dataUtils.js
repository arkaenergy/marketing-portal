import * as THREE from 'three';
import * as constants from '../../structures/structureConstants';
import { PANEL_ORIENTATION_PORTRAIT } from '../../structures/structureConstants';
import { convertArrayToVector, lineIntersection} from '../../../utilities/utils';

export function getTemplate(templateName) {
    return Object.values(constants.TEMPLATES).filter(obj => obj.NAME === templateName)[0];
}

export const deg2Rad = (deg) => deg * (Math.PI / 180);


export function getEdges(vertices2DArray) {
    let vertices = convertArrayToVector(vertices2DArray);
    let edges = [];

    for (let i = 0; i < vertices.length - 1; i++) {
        edges.push([
            vertices[i],
            vertices[i + 1]
        ]);
    }

    if (vertices2DArray.length > 2 &&
        (vertices[vertices2DArray.length - 1].x !== vertices[0].x ||
            vertices[vertices2DArray.length - 1].y !== vertices[0].y)) {
        edges.push([
            vertices[vertices2DArray.length - 1],
            vertices[0]
        ]);
    }
    return edges;
}

export function checkPointInsideVertices(vertices, point) {
    const outsidePoint = new THREE.Vector2(Infinity, Infinity);
    for (let i = 0, l = vertices.length; i < l; i += 1) {
        if (vertices[i][0] < outsidePoint.x) {
            outsidePoint.x = vertices[i][0];
        }
        if (vertices[i][1] < outsidePoint.y) {
            outsidePoint.y = vertices[i][1];
        }
    }
    outsidePoint.subScalar(2);
    const extEdge = [outsidePoint, new THREE.Vector2(point[0], point[1])];

    const edgesOfVertices = getEdges(vertices);

    let noOfIntersection = 0;
    let prevPoint = new THREE.Vector2(-Infinity, -Infinity);
    for (let j = 0, mEdgeLen = edgesOfVertices.length; j < mEdgeLen; j += 1) {
        const check = lineIntersection(extEdge, edgesOfVertices[j]);
        if (check.intersect && !prevPoint.equals(check.point)) {
            prevPoint = check.point;
            noOfIntersection += 1;
        }
    }

    if (noOfIntersection % 2 === 1) {
        return true;
    }
    return false;
}

export function getSubarrayPropertiesFromSubarray(subarray) {
    const subarrayPanelOrientation = subarray.panelOrientation;
    const moduleDimensions = {
        length: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleLength : subarray.moduleLength,
        width: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleWidth : subarray.moduleWidth,
    };
    const moduleid = subarray.moduleProperties !== undefined ?
        subarray.moduleProperties.moduleId : subarray.moduleId;

    let moduleHorizontalLength;
    let moduleVerticalLength;

    if (subarrayPanelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        moduleHorizontalLength = moduleDimensions.width;
        moduleVerticalLength = moduleDimensions.length;
    }
    else {
        moduleHorizontalLength = moduleDimensions.length;
        moduleVerticalLength = moduleDimensions.width;
    }

    const tableVerticalLength = (moduleVerticalLength * subarray.tableSizeUp) +
        (subarray.moduleSpacingUp * (subarray.tableSizeUp - 1));

    return {
        azimuth: subarray.azimuth,
        tilt: subarray.tilt,
        orientation: subarrayPanelOrientation,
        moduleDimensions,
        moduleid,
        moduleSpacing: { up: subarray.moduleSpacingUp, wide: subarray.moduleSpacingWide },
        tableSize: { up: subarray.tableSizeUp, wide: subarray.tableSizeWide },
        parentTilt: subarray.getParent().getTilt(),
        mountHeight: subarray.mountHeight,
        rowSpacing: subarray.rowSpacing,
        tableSpacing: subarray.tableSpacing,
        moduleHorizontalLength,
        moduleVerticalLength,
        pitch: subarray.rowSpacing + moduleDimensions.width,
        mountType: subarray.mountType,
        tableVerticalLength,
    };
}

export function getSubarrayPropertiesForDefaultSettings(subarray) {
    const subarrayPanelOrientation = subarray.panelOrientation;
    const moduleDimensions = {
        length: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleLength : subarray.moduleLength,
        width: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleWidth : subarray.moduleWidth,
    };
    const moduleid = subarray.moduleProperties !== undefined ?
        subarray.moduleProperties.moduleId : subarray.moduleId;

    let moduleHorizontalLength;
    let moduleVerticalLength;

    if (subarrayPanelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        moduleHorizontalLength = moduleDimensions.width;
        moduleVerticalLength = moduleDimensions.length;
    }
    else {
        moduleHorizontalLength = moduleDimensions.length;
        moduleVerticalLength = moduleDimensions.width;
    }

    const tableVerticalLength = (moduleVerticalLength * subarray.tableSizeUp) +
        (subarray.moduleSpacingUp * (subarray.tableSizeUp - 1));

    return {
        azimuth: subarray.azimuth,
        tilt: subarray.tilt,
        orientation: subarrayPanelOrientation,
        moduleDimensions,
        moduleid,
        moduleSpacing: { up: subarray.moduleSpacingUp, wide: subarray.moduleSpacingWide },
        tableSize: { up: subarray.tableSizeUp, wide: subarray.tableSizeWide },
        parentTilt: 0,
        mountHeight: subarray.mountHeight,
        rowSpacing: subarray.rowSpacing,
        tableSpacing: subarray.tableSpacing,
        moduleHorizontalLength,
        moduleVerticalLength,
        pitch: subarray.rowSpacing + moduleDimensions.width,
        mountType: 'Fixed Tilt',
        tableVerticalLength,
    };
}
