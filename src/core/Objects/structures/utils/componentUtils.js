import { containsAll } from '../../utils/utils';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';

import { computeLegs, drawLegs } from '../components/legUtils';
import { computeFootings, drawFootings } from '../components/footingUtils';
import { computeRafters, drawRafters } from '../components/rafterUtils';
import { computePurlins, drawPurlins } from '../components/purlinUtils';
import { computeRailings, drawRailings } from '../components/railingUtils';
import { computeClips, drawClips } from '../components/clipUtils';
import { computeBackCover, drawBackCover } from '../components/backCoverUtils';
import { computeBlocks, drawBlocks } from '../components/blockUtils';
import { computeBracings, drawBracings } from '../components/bracingUtils';
import { computePillars, drawPillars } from '../components/pillarUtils';
import { computePillarConnectors, drawPillarConnectors } from '../components/pillarConnectorUtils';
import { computeLegConnectors, drawLegConnectors } from '../components/legConnectorUtils';
import { computeFrontBracings, drawFrontBracings } from '../components/frontBracingUtils';
import { computeSideBracings, drawSideBracings } from '../components/sideBracingUtils';
import {
    computeNumberOfTablesInBoundingBox,
    getBuffer,
} from './mathUtils';
import { DRAWING_CONSTANTS } from '../constants';
import { computeRodMesh, drawRodMesh } from '../components/rodMeshUtils';

const LOG = false;

function lg(entity, msg) {
    if (LOG) {
        console.log(`${entity} START`);
        console.log(msg);
        console.log(`${entity} END`);
    }
}

export function createFootings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['row', 'boundingBox'])) {
        throw new Error('createAndDrawFootings failed. Necessary information not supplied.');
    }

    const { row, boundingBox } = params;
    let footingPosition;
    let { footingCount } = params;

    const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
        subarrayDetails,
        boundingBox,
    );
    const footingParams = {
        boundingBox,
        row,
        footingSize: template.FOOTING.SIZE,
        tableSize: subarrayDetails.tableSize,
        footingBuffer: getBuffer(subarrayDetails, template.FOOTING.BUFFER),
        numberOfTablesInBoundingBox,
        // TODO: The issue is that some places we are using the template
        // and some places we are using the params.
        singleVerticalRow: template.FOOTING.SINGLE_VERTICAL_ROW,
        footingCount,
    };

    ({
        // eslint-disable-next-line prefer-const
        footingPosition,
        footingCount,
    } = computeFootings(footingParams));

    const footingDrawingParams = {
        footingSize: template.FOOTING.SIZE,
        azimuth: subarrayDetails.azimuth,
        footingPosition,
        footingStyle: template.FOOTING.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };
    drawFootings(footingDrawingParams, objectsGroup,template.NAME);

    return {
        footingPosition,
        footingCount,
        footingHeight: template.FOOTING.SIZE.HEIGHT,
    };
}

export function createLegs(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['row', 'boundingBox'])) {
        throw new Error('createAndDrawLegs failed. Necessary information not supplied.');
    }

    lg('Leg Params', params);

    const { row, boundingBox } = params;

    const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
        subarrayDetails,
        boundingBox,
    );

    const tiltedDistanceFromTop = (params.tiltedDistanceFromTop != null) ?
        params.tiltedDistanceFromTop : ((Object.hasOwnProperty.call(template, 'RAFTER') ?
            template.RAFTER.SIZE.HEIGHT : 0) + (Object.hasOwnProperty.call(template, 'PURLIN')
            ? template.PURLIN.SIZE.HEIGHT : 0));

    let legBaseHeight = 0;
    if (params.railingHeight) {
        legBaseHeight = params.railingHeight;
    }
    else if (params.footingHeight) {
        legBaseHeight = params.footingHeight;
    }

    const legParams = {
        boundingBox,
        row,
        tableSize: subarrayDetails.tableSize,
        legBuffer: getBuffer(subarrayDetails, template.LEG.BUFFER),
        numberOfTablesInBoundingBox,
        legCount: params.legCount ? params.legCount : params.footingCount,
        topZToLeave: tiltedDistanceFromTop,
        backLegsOnly: Object.hasOwnProperty.call(params, 'backLegsOnly') ? params.backLegsOnly : false,
        legBaseHeight,
        subarrayDetails,
        objectsGroup,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    const {
        legHeights,
        legPosition,
        legLines,
        legTilts,
    } = computeLegs(legParams);


    const legDrawingParams = {
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
        legPosition,
        legSize: template.LEG.SIZE,
        legHeights,
        legStyle: template.LEG.STYLE,
        legLines,
        legTilts,
        boundingBox,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    drawLegs(legDrawingParams, objectsGroup,template.NAME);

    return {
        legHeights,
        legPosition,
    };
}

export function createPurlins(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['boundingBox', 'legPosition'])) {
        throw new Error('createAndDrawPurlins failed. Necessary information not supplied.');
    }

    lg('Purlin Params', params);

    const {
        moduleDimensions,
        tableSize,
        orientation,
        moduleSpacing,
        tilt,
        azimuth,
    } = subarrayDetails;

    const { boundingBox } = params;

    let purlinBuffer;

    if (subarrayDetails.orientation === PANEL_ORIENTATION_PORTRAIT) {
        purlinBuffer = {
            TOP: template.PURLIN.BUFFER.TOP * moduleDimensions.length,
            BOTTOM: template.PURLIN.BUFFER.BOTTOM *
                moduleDimensions.length,
        };
    }
    else {
        purlinBuffer = {
            TOP: template.PURLIN.BUFFER.TOP * moduleDimensions.width,
            BOTTOM: template.PURLIN.BUFFER.BOTTOM *
                moduleDimensions.width,
        };
    }
    const purlinParams = {
        purlinBuffer,
        boundingBox,
        moduleLength: moduleDimensions.length,
        moduleWidth: moduleDimensions.width,
        tableSizeUp: tableSize.up,
        orientation,
        moduleSpacingUp: moduleSpacing.up,
        purlinSize: template.PURLIN.SIZE,
        legPosition: params.legPosition,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        footingBuffer: template.LEG.BUFFER,
        tilt,
    };

    const { purlinLines } = computePurlins(purlinParams);

    const purlinDrawingParams = {
        purlinLines,
        purlinColor: template.PURLIN.STYLE.COLOR,
        purlinSize: template.PURLIN.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth,
        tilt,
        purlinStyle: template.PURLIN.STYLE,
    };

    drawPurlins(purlinDrawingParams, objectsGroup, template.NAME);

    return {
        purlinLines,
    };
}

export function createRafters(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legHeights', 'legPosition'])) {
        throw new Error('createAndDrawRafters failed. Necessary information not supplied.');
    }

    const { tilt, orientation, azimuth } = subarrayDetails;

    const rafterParams = {
        legPosition: params.legPosition,
        legHeights: params.legHeights,
        purlinLines: params.purlinLines,
        boundingBoxZDifference: (template.PURLIN) ? template.PURLIN.SIZE.HEIGHT : 0,
        rafterSize: template.RAFTER.SIZE,
        tilt,
        orientation,
        rafterBuffer: template.RAFTER.BUFFER,
        footingBuffer: template.LEG.BUFFER,
        boundingBox: params.boundingBox,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    const { rafterLines } = computeRafters(rafterParams);

    const rafterDrawingParams = {
        rafterLines,
        rafterColor: template.RAFTER.STYLE.COLOR,
        rafterSize: template.RAFTER.SIZE,
        azimuth,
        tilt,
        rafterStyle: template.RAFTER.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawRafters(rafterDrawingParams, objectsGroup ,template.NAME);

    return { rafterLines };
}