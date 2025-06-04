import {
    createFootings,
    createLegs,
    createRafters,
    createPurlins,
} from './componentUtils';
import * as constants from './structureConstants';


function createDefaultFixedTiltStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
                footingCount: undefined,
            });

            params = Object.assign(
                params,
                createFootings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

export default{
    [constants.TEMPLATES.DEFAULT_FIXED_TILT.NAME]: (params, template) => {
        try { return createDefaultFixedTiltStructures(...params, template); } catch (ex) { console.log(ex); }
    },
};
