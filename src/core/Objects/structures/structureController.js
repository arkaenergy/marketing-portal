import * as THREE from 'three';
import * as subarrayUtils from '../../utilities/subarrayUtils';
import createStructureFromTemplate from './templateUtils';
import mergeAll from './utils/mergeMeshes';


/**
 * It creates structure
 * @param {*appParams subarrayList and structure design template}
 */
export default async function createStructure(appParams) {
    const objectsGroup = new THREE.Group();
    const { subarrayList, structureDesignTemplate } = appParams;

    const subarray = subarrayList;
    if (subarray.structureType !== undefined && subarray.structureType !== null) {
        const template = subarrayUtils.getTemplate(subarray.structureType);
        const subarrayProperties = subarrayUtils.getSubarrayPropertiesFromSubarray(subarray);

        const boundingBoxes = [];
        const rows = subarray.getChildren();
        for (let j = 0; j < rows.length; j += 1) {
            boundingBoxes.push([...rows[j].get3DBoundingBoxesExcludingHiddenTables()]);
        }
        const params = [
            rows,
            boundingBoxes,
            subarrayProperties,
            objectsGroup,
        ];
        await createStructureFromTemplate[template.NAME](params, template)
    }
    // return objectsGroup;
    const mergedMesh = mergeAll(objectsGroup);
    return mergedMesh;
}



