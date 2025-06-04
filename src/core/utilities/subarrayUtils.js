// TODO: reduce iteration steps by a lot.
import * as THREE from 'three';
import * as constants from '../../core/Objects/structures/structureConstants';
import { PANEL_ORIENTATION_PORTRAIT } from '../../core/Objects/structures/structureConstants';

export const DYNAMIC_OFFSET_ITERATION_STEPS = {
    5000: 100,
    10000: 40,
    Infinity: 15,
};

export function getTimeBasedRowSpacing(
    subarrayData,
    latitude,
    longitude,
    startDate = new Date(2019, 11, 21, 9),
    endDate = new Date(2019, 11, 21, 15),
) {
    //Quick fix for rowSpacing is 0 due to 0 tilt
    if(subarrayData.tilt === 0) {
        return 0.001;
    }
    /*
        Returns end to  start row spacing for a given fixed tilt subarray
        TODO: See how and if to take care of associatedObstacle's tilt
     */
    const sunPositions = getSunPositions(latitude, longitude, startDate, endDate, true, 30);
    const panelLength = subarrayData.panelOrientation === PANEL_ORIENTATION_PORTRAIT
        ? subarrayData.moduleProperties.moduleLength : subarrayData.moduleProperties.moduleWidth;
    const frameHeight = ((subarrayData.tableSizeUp * panelLength) +
        ((subarrayData.tableSizeUp - 1) * subarrayData.moduleSpacingUp))
        * Math.sin(toRadian(subarrayData.tilt));

    const allDistances = [0];
    for (let i = 0; i < sunPositions.length; i += 1) {
        const [sunAzimuth, sunZenith] = sunPositions[i];
        allDistances.push(Math.abs((frameHeight *
            Math.cos(toRadian(sunAzimuth - subarrayData.azimuth))) /
            Math.tan(toRadian(90 - sunZenith))));
    }

    return Math.round(1000 * Math.max(...allDistances)) / 1000;
}

export function getTableMapCentroid(tableMap) {
    const centroid = new THREE.Vector3();
    let totalVertices = 0;
    for (let i = 0; i < tableMap.panels.length; i += 1) {
        const panelMap = tableMap.panels[i];
        for (let j = 0; j < panelMap.corners.length; j += 1) {
            const corner = panelMap.corners[j];
            centroid.x += corner[0];
            centroid.y += corner[1];
            centroid.z += corner[2];
            totalVertices += 1;
        }
    }
    return centroid.divideScalar(totalVertices);
}

export function getDynamicOffsetBasedOnArea(area) {
    const areaMarkers = Object.keys(DYNAMIC_OFFSET_ITERATION_STEPS)
        .map(marker => parseFloat(marker));
    let dynamicOffsetDx;
    let dynamicOffsetDy;
    for (let idx = 0; idx < areaMarkers.length; idx += 1) {
        if (area < areaMarkers[idx]) {
            dynamicOffsetDx = DYNAMIC_OFFSET_ITERATION_STEPS[areaMarkers[idx]];
            dynamicOffsetDy = DYNAMIC_OFFSET_ITERATION_STEPS[areaMarkers[idx]];
            break;
        }
    }
    return {
        dynamicOffsetDx,
        dynamicOffsetDy,
    };
}

export function getRays(
    yOffset,
    tiltWrtParent,
    tableLength,
    rowSpacing,
    walkways,
    bBox,
    bBoxYLength,
) {
    const rays = [];
    const rowWidth = tableLength * Math.cos(tiltWrtParent);
    const direction1 = bBox[1].clone().sub(bBox[0]);
    direction1.normalize();
    const direction2 = bBox[2].clone().sub(bBox[3]);
    direction2.normalize();
    let topRowLine = yOffset;
    let bottomRowLine = yOffset + rowWidth;
    let i = 0;
    while (bottomRowLine <= bBoxYLength) {
        // check for parallel walkways
        while (i < walkways.length &&
            ((topRowLine <= walkways[i].x && bottomRowLine > walkways[i].x &&
                    bottomRowLine <= walkways[i].y) ||
                (topRowLine > walkways[i].x && bottomRowLine <= walkways[i].y) ||
                (topRowLine > walkways[i].x && topRowLine <= walkways[i].y &&
                    bottomRowLine > walkways[i].y) ||
                (topRowLine <= walkways[i].x && bottomRowLine >= walkways[i].y))) {
            topRowLine = walkways[i].y + (0.0005);
            bottomRowLine = topRowLine + rowWidth;
            i += 1;
        }
        rays.push([bBox[0].clone().addScaledVector(direction1, topRowLine),
            bBox[3].clone().addScaledVector(direction2, topRowLine),
            bBox[0].clone().addScaledVector(direction1, bottomRowLine),
            bBox[3].clone().addScaledVector(direction2, bottomRowLine),
        ]);
        topRowLine += (rowWidth + rowSpacing);
        bottomRowLine = topRowLine + rowWidth;
    }
    return rays;
}

export function getTemplate(templateName) {
    return Object.values(constants.TEMPLATES).filter(obj => obj.NAME === templateName)[0];
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

export function containsAll(object, items) {
    for (let i = 0; i < items.length; i += 1) {
        if (!object.hasOwnProperty(items[i])) {
            return false;
        }
    }
    return true;
}

export function computeNumberOfTablesInBoundingBox(subarrayDetails, boundingBox) {
    const moduleWidth = (subarrayDetails.orientation === PANEL_ORIENTATION_PORTRAIT) ?
        subarrayDetails.moduleDimensions.width : subarrayDetails.moduleDimensions.length;

    const width = boundingBox[0].distanceTo(boundingBox[1]);
    const tableLength = (subarrayDetails.tableSize.wide * moduleWidth) +
    ((subarrayDetails.tableSize.wide - 1) * subarrayDetails.moduleSpacing.wide);
    const numberOfTables = Math.round((width + subarrayDetails.tableSpacing) /
    (subarrayDetails.tableSpacing + tableLength));
    return numberOfTables;
}

export function getBuffer(subarrayDetails, templateBuffer) {
    let buffer;
    const { orientation, moduleDimensions } = subarrayDetails;
    if (orientation === PANEL_ORIENTATION_PORTRAIT) {
        buffer = {
            WIDE: templateBuffer.WIDE,
            UP: templateBuffer.UP * moduleDimensions.length,
        };
    }
    else {
        buffer = {
            WIDE: templateBuffer.WIDE,
            UP: templateBuffer.UP * moduleDimensions.width,
        };
    }

    // Copying other buffer values
    buffer = Object.assign(buffer, templateBuffer);

    return buffer;
}
