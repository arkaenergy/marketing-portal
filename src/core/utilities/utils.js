import * as THREE from 'three';
import Ground from '../Objects/Ground/Ground';
import Obstruction from '../Objects/Obstruction';
import * as JSTSConverter from "./JSTSConverter";
import PolygonModel from '../Objects/PolygonModel';
import * as JSTS from 'jsts';

/**
 *
 * @param {Array} vertices
 * @returns
 */
export function createBufferGeometry(vertices = []) {
    const geometry = new THREE.BufferGeometry();

    geometry.setFromPoints(vertices);

    return geometry;
}

export function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}
export const deg2Rad = (deg) => deg * (Math.PI / 180);
export const rad2Deg = (rad) => rad * (180 / Math.PI);

export function getDefaultGroundSize(stage) {
    return getImageDimensions(stage.latitude, stage.longitude, stage.zoom, 512, 512);
}

export function scaleRatioToMeters(scaleRatio, groundSize) {
    return groundSize * scaleRatio;
}

function getLatLngOfGivenPixel(lat, lng, zoom, width, height, pixelX, pixelY) {
    //     lat - center-latitude of the static-map
    //     lng - center-longitude of the static-map
    //     zoom - zoom of the static-map
    //     width - width of the static-map
    //     height - height of the static-map
    //     pixelX - x-coordinate of the pixel in the image
    //     pixelY - y-coordinate of the pixel in the image
    let x, y, s, tiles, centerPoint, mousePoint, mouseLatLng;
    x = pixelX - (width / 2);
    y = pixelY - (height / 2);
    s = Math.min(Math.max(Math.sin(lat * (Math.PI / 180)), -.9999), .9999);
    tiles = 1 << zoom;
    centerPoint = {
        x: 128 + lng * (256 / 360),
        y: 128 + 0.5 * Math.log((1 + s) / (1 - s)) *
            -(256 / (2 * Math.PI))
    };
    mousePoint = {
        x: (centerPoint.x * tiles) + x,
        y: (centerPoint.y * tiles) + y
    };
    mouseLatLng = {
        lat: (2 * Math.atan(Math.exp(((mousePoint.y / tiles) - 128) /
            -(256 / (2 * Math.PI)))) -
            Math.PI / 2) / (Math.PI / 180),
        lng: (((mousePoint.x / tiles) - 128) / (256 / 360))
    };
    return mouseLatLng;
}

function getDistanceBetweenTwoLatLng(lat1, lon1, lat2, lon2) {
    // local function to convert degrees to radians
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180;
    };
    // radius of earth in metres
    const R = 6371e3;

    const phi1 = Math.radians(lat1);
    const phi2 = Math.radians(lat2);
    const deltaPhi = Math.radians(lat2 - lat1);
    const deltaLambda = Math.radians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c
}

export function getImageDimensions(lat, lng, zoom, width, height) {

    // get top left and top right latitude and longitude
    let topLeftLatLng = getLatLngOfGivenPixel(lat, lng, zoom, width, height, 0, 0);
    let topRightLatLng = getLatLngOfGivenPixel(lat, lng, zoom, width, height, width, 0);

    // get distance between them
    let dist = getDistanceBetweenTwoLatLng(topLeftLatLng.lat, topLeftLatLng.lng, topRightLatLng.lat, topRightLatLng.lng);

    return {
        width: dist,
        height: dist
    }
}


export function getZoomInformationForQuickLook(stage, config, controls) {
    const selectedObjects = stage.selectionControls.getSelectedObjects();

    const zoomBuffer = getZoomBuffer(selectedObjects[0], config);

    const zoomLimit = getZoomLimit(
        selectedObjects[0],
        config,
    );

    // Calculate bounding box of all objects
    const allPoints = [];
    for (let i = 0; i < selectedObjects.length; i += 1) {
        if (selectedObjects[i].get2DVertices !== undefined) {
            // TODO: Refactor This.
            if (selectedObjects[i] instanceof Tree) {
                allPoints.push(...selectedObjects[i].get2DCrownVertices());
            }
            else {
                allPoints.push(...selectedObjects[i].get2DVertices());
            }
        }
    }
    if (allPoints.length === 0) {
        return null;
    }

    const boundingInformation =
        getBoundingInformationFromPoints(utils.convertArrayToVector(allPoints));

    // Calculate the new zoom and position to move the camera to
    const zoom = calculateZoomFromBoundingBox(
        boundingInformation,
        zoomBuffer,
        controls.getCameraFrustumWidth(),
        controls.getCameraFrustumHeight(),
        zoomLimit,
    );
    const centroid = getCentroidOfPoints(boundingInformation.points);

    return {
        centroid,
        zoom,
    };
}

export function getBoundingBox(vertices) {
    let box = {
        min: new THREE.Vector2(Infinity, Infinity),
        max: new THREE.Vector2(-Infinity, -Infinity)
    }

    for (let v of vertices) {
        if (v[0] < box.min.x) {
            box.min.x = v[0];
        }
        if (v[1] < box.min.y) {
            box.min.y = v[1];
        }
        if (v[0] > box.max.x) {
            box.max.x = v[0];
        }
        if (v[1] > box.max.y) {
            box.max.y = v[1];
        }
    }

    return box;
}
/**
 * Returns true if edge 1 and 2 intersects, with the point of intersection,
 * false if they do not intersect.
 * @param {*array of vector2 of length 2} edge1
 * @param {*array of vector2 of length 2} edge2
 * @returns {* an object in the format {
*  intersect: true/false,
*  point: the point of intersection}
* }
*/
export function lineIntersection(edge1, edge2) {
   // Find the four orientations needed for general and
   // special cases
   const o1 = orientation(edge1[0], edge1[1], edge2[0]);
   const o2 = orientation(edge1[0], edge1[1], edge2[1]);
   const o3 = orientation(edge2[0], edge2[1], edge1[0]);
   const o4 = orientation(edge2[0], edge2[1], edge1[1]);

   // General case
   if (o1 !== o2 && o3 !== o4) {
       const result = checkLineIntersection(edge1, edge2);
       if (result.onLine1 && result.onLine2) {
           return { intersect: true, point: new THREE.Vector2(result.x, result.y) };
       }
       return { intersect: false, point: new THREE.Vector2(Infinity, Infinity) };
   }

   // Special Cases
   // p1, q1 and p2 are colinear and p2 lies on segment p1q1
   if (o1 === 0 && onSegment(edge1[0], edge2[0], edge1[1])) {
       return { intersect: true, point: edge2[0] };
   }

   // p1, q1 and q2 are colinear and q2 lies on segment p1q1
   if (o2 === 0 && onSegment(edge1[0], edge2[1], edge1[1])) {
       return { intersect: true, point: edge2[1] };
   }

   // p2, q2 and p1 are colinear and p1 lies on segment p2q2
   if (o3 === 0 && onSegment(edge2[0], edge1[0], edge2[1])) {
       return { intersect: true, point: edge1[0] };
   }

   // p2, q2 and q1 are colinear and q1 lies on segment p2q2
   if (o4 === 0 && onSegment(edge2[0], edge1[1], edge2[1])) {
       return { intersect: true, point: edge1[1] };
   }

   // Doesn't fall in any of the above cases
   return { intersect: false, point: new THREE.Vector2(Infinity, Infinity) };
}


// get edges
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


export function getZoomAndCentroidForAllObjects(stage) {
    const allModels = utils.getAllChildren(stage.ground);
    const allModelVertices = [];
    for (let i = 0; i < allModels.length; i += 1) {
        allModelVertices.push(...allModels[i].get2DVertices());
    }
    const boundingBox = getBoundingBox(allModelVertices);
    const zoom = calculateZoomFromBoundingBox(
        {
            minX: boundingBox.min.x,
            maxX: boundingBox.max.x,
            minY: boundingBox.min.y,
            maxY: boundingBox.max.y,
        },
        {
            X: 1.1, Y: 1.1,
        },
        stage.controlsManager.get2DControls().getCameraFrustumWidth(),
        stage.controlsManager.get2DControls().getCameraFrustumHeight(),
    );

    return [
        zoom,
        getCentroidOfPoints([
            boundingBox.min,
            boundingBox.max,
        ]),
    ];
}

export function getCentroidOfPoints(points) {
    if (points.length === 0) {
        return null;
    }
    let formattedPoints = points;
    if (!(points[0] instanceof THREE.Vector2 || points[0] instanceof THREE.Vector3)) {
        formattedPoints = convertArrayToVector(points);
    }
    const count = formattedPoints.length;
    const centroid = (formattedPoints[0] instanceof THREE.Vector3) ?
        new THREE.Vector3() : new THREE.Vector2();
    for (let i = 0; i < formattedPoints.length; i += 1) {
        centroid.add(formattedPoints[i]);
    }
    centroid.divideScalar(count);
    return centroid;
}

export function getCenterClientValues(stage) {
    const normalizedCoords = new THREE.Vector3();
    normalizedCoords.x = stage.screenDimensions.left + (stage.screenDimensions.width / 2);
    normalizedCoords.y = stage.screenDimensions.top + (stage.screenDimensions.height / 2);
    normalizedCoords.z = 0;

    return normalizedCoords;
}

// Equation is in the form ax + by + cz + d = 0
export function getPlaneDistanceToOrigin(plane) {
    return (plane[3]) / (Math.sqrt((plane[0] ** 2) + (plane[1] ** 2) + (plane[2] ** 2)));
}

// Equation is in the form ax + by + cz + d = 0
export function getEquationOfPlane(normal, point) {
    const eq = [];
    eq[0] = normal.x;
    eq[1] = normal.y;
    eq[2] = normal.z;
    eq[3] = (normal.x * (-point.x)) + (normal.y * (-point.y)) + (normal.z * (-point.z));
    return eq;
}

/**
 * Checks if p1 is inside p2.
 * p1 and p2 are vertices of the polygons
 */
export function checkPolygonInsidePolygon(p1, p2) {
    const polygon1 = JSTSConverter.verticesToJSTSPolygon(p1);
    const polygon2 = JSTSConverter.verticesToJSTSPolygon(p2);
    return polygon1.coveredBy(polygon2);
}

/**
 * Get the lines intersection of two lines
 * @param edge1 - [{x: 0, y: 0}, {x: 1, y: 1}]
 * @param edge2 - the line that is being tested for intersection with the polygon
 * @param [EPSILON=0] - The tolerance for the intersection. If the intersection is within EPSILON of
 * the end of the line, it is considered to be on the line.
 * @returns The intersection point of two lines.
 */
export function checkLineIntersection(edge1, edge2, EPSILON = 0) {
    // if the lines intersect, the result contains the x and y of the intersection
    // (treating the lines as infinite) booleans for whether line1 or line2 contain the point
    const result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
    };
    const denominator = ((edge2[1].y - edge2[0].y) * (edge1[1].x - edge1[0].x)) -
        ((edge2[1].x - edge2[0].x) * (edge1[1].y - edge1[0].y));

    if (denominator === 0) {
        return result;
    }
    let a = edge1[0].y - edge2[0].y;
    let b = edge1[0].x - edge2[0].x;
    const numerator1 = ((edge2[1].x - edge2[0].x) * a) - ((edge2[1].y - edge2[0].y) * b);
    const numerator2 = ((edge1[1].x - edge1[0].x) * a) - ((edge1[1].y - edge1[0].y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = edge1[0].x + (a * (edge1[1].x - edge1[0].x));
    result.y = edge1[0].y + (a * (edge1[1].y - edge1[0].y));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > -EPSILON && a < 1 + EPSILON) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > -EPSILON && b < 1 + EPSILON) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}


// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    const val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));

    if (val === 0) return 0; // colinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

export function getTargetPlane(cameraPosition, targetPosition) {
    const normal = new THREE.Vector3().copy(cameraPosition).sub(targetPosition);
    const point = (new THREE.Vector3()).copy(targetPosition);
    const plane = getEquationOfPlane(normal, point);
    const distance = getPlaneDistanceToOrigin(plane);
    normal.setLength(1);

    const threePlane = new THREE.Plane(normal, distance);

    return threePlane;
}

export function getHighestZ(object) {
    let highestZ = 0;

    if (isGroundOrModel(object)) {
        for (let idx = 0; idx < object.children.length; idx += 1) {
            highestZ = Math.max(highestZ, getHighestZ(object.children[idx]));
        }
    }

    if (object instanceof PolygonModel) {
        highestZ = Math.max(highestZ, object.getHighestZ());
    }

    return highestZ;
}

export function isGroundOrModel(object) {
    return object instanceof Ground ||
        object instanceof PolygonModel
}

export function getAllObjectMeshes(_polygonEnabled = true) {
    const allObjectMeshes = [];
    const allModels = getAllModelType()
    getModels(stage.ground, allModels, _polygonEnabled);
    Object.keys(allModels).forEach((obj) => {
        for (let i = 0; i < allModels[obj].length; i += 1) {
            const object = allModels[obj][i];
            allObjectMeshes.push(object.mesh);
        }
    });
    return allObjectMeshes;
}

export function getModels(object, result, _polygonEnabled) {
    const children = object.getChildren();
    for (let i = 0, len = children.length; i < len; i += 1) {
        if (children[i] instanceof PolygonModel ) {
            // if( _polygonEnabled){
            //     result.polygons.push(children[i]);
            // }
            getModels(children[i], result);
        } else if (children[i] instanceof Obstruction) {
            result.obstructions.push(children[i]);
        }
    }
}

export function getAllModelType() {
    return {
        polygons: [],
        obstructions: [],
        smartroofs: [],
        smartroofFaces: [],
        dormers: [],
        subArrays: [],
        cylinders: [],
        walkways: [],
        safetyline: [],
        trees: [],
        inverters: [],
        combinerBox: [],
        acdb: [],
        property: [],
        handrail: [],
        acCable: [],
        dcCable: [],
        dcdb: [],
        conduits: [],
        doubleConduit: [],
        doubleSeparateConduit: [],
        singleCableTray: [],
        doubleCableTray: [],
        DoubleSeparateCableTray: [],
        textbox: [],
    };
}

export async function getAspectRatio(imageSource) {
    const image = new Image();
    return new Promise((r) => {
        image.addEventListener('load', () => {
            r(image.width / image.height);
        });
        image.src = imageSource;
    });
}
export function scaleMetersToRatio(scaleMeters, aspectRatio, groundSize) {
    let scaleRatio;
    if (aspectRatio < 1) {
        scaleRatio = scaleMeters / (groundSize * aspectRatio);
    }
    scaleRatio = scaleMeters / groundSize;

    return parseFloat(scaleRatio.toFixed(3));
}

export function getCustomImageDimensions(stageImageDimensions, customImageDimensions) {
    const newDimensions = {};
    if (customImageDimensions.width > customImageDimensions.height) {
        newDimensions.width = stageImageDimensions.width;
        newDimensions.height = stageImageDimensions.width *
            (customImageDimensions.height / customImageDimensions.width);
    }
    else {
        newDimensions.height = stageImageDimensions.height;
        newDimensions.width = stageImageDimensions.height *
            (customImageDimensions.width / customImageDimensions.height);
    }
    return newDimensions;
}

export function drawingArrayTo2DArray(vertices, numVertices) {
    const newVertices = [];
    let count = 0;
    for (let i = 0; i <= numVertices; i += 1) {
        newVertices.push([
            vertices[count],
            vertices[count + 1],
        ]);
        count += 3;
    }
    return newVertices;
}

export function convertVectorToArray(vectorArray) {
    const array = [];
    vectorArray.forEach((vector) => {
        array.push([vector.x, vector.y]);
    });
    return array;
}

export function findPerpendicularDistance(point, line) {
    const pointX = point[0][0];
    const pointY = point[0][1];
    const lineStart = {
        x: line[0][0],
        y: line[0][1],
    };
    const lineEnd = {
        x: line[1][0],
        y: line[1][1],
    };
    const slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    const intercept = lineStart.y - (slope * lineStart.x);
    const result = Math.abs(((slope * pointX) - pointY) + intercept) / Math.sqrt((slope ** 2) + 1);
    return result;
}

export function convertArrayToVector(vertices) {
    let vectorVertices = [];
    for (let v of vertices) {
        if (v instanceof THREE.Vector2 || v instanceof THREE.Vector3) {
            return vertices;
        }
        vectorVertices.push(new THREE.Vector2(
            v[0],
            v[1]
        ));
    }
    return vectorVertices;
}

// export function verticesFromJSTSPolygon(polygon) {
//     const vertices = [];

//     const polygonCoordinates = polygon.getCoordinates();
//     for (let idx = 0; idx < polygonCoordinates.length - 1; idx += 1) {
//         vertices.push([
//             polygonCoordinates[idx].x,
//             polygonCoordinates[idx].y,
//             polygonCoordinates[idx].z,
//         ]);
//     }

//     return vertices;
// }

// export function verticesToJSTSPolygon(vertices) {
//     const coordinateArray = [];
//     for (let i = 0; i < vertices.length; i += 1) {
//         const vertex = vertices[i];
//         coordinateArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1], 10));
//     }
//     // vertices aren't ring but JSTS Polygon only takes linear ring
//     coordinateArray.push(coordinateArray[0]);

//     const geometryFactory = new JSTS.geom.GeometryFactory();
//     return geometryFactory.createPolygon(coordinateArray);
// }

export function localToGlobalCoordinates(localCoordinate, bBox, bBoxDimensions) {
    const pointOnEdgeY1 = (new THREE.Vector3()).lerpVectors(
        bBox[0],
        bBox[1],
        localCoordinate.y / bBoxDimensions.yLength,
    );
    const pointOnEdgeY2 = (new THREE.Vector3()).lerpVectors(
        bBox[3],
        bBox[2],
        localCoordinate.y / bBoxDimensions.yLength,
    );
    return (new THREE.Vector3()).lerpVectors(
        pointOnEdgeY1,
        pointOnEdgeY2,
        localCoordinate.x / bBoxDimensions.xLength,
    );
}

export function getNormalizedCameraCoordinates(deviceX, deviceY, stage) {
    let normalizedCoords = new THREE.Vector3();
    normalizedCoords.x = ((deviceX - stage.screenDimensions.left) / stage.screenDimensions.width) * 2 - 1;
    normalizedCoords.y = -((deviceY - stage.screenDimensions.top) / stage.screenDimensions.height) * 2 + 1;
    // normalizedCoords.z = 0;

    normalizedCoords.unproject(stage.cameraManager.camera);

    return normalizedCoords;
}

export function drawingArrayToVectorArray(vertices, numVertices) {
    return convertArrayToVector(drawingArrayTo2DArray(vertices, numVertices));
}

// export function checkComplexGeometry(vertices) {
//     return verticesToJSTSPolygon(vertices).isSimple();
// }

// If two meshes are using same materials,
// then we cannot have different colors for those two meshes.
export function updateMeshWithColor(newColor, mesh) {
    if (newColor !== undefined && mesh !== undefined &&
        mesh !== null) {
        mesh.material.color = newColor;
    }
}

export function setMeshVisible(mesh) {
    if (mesh !== null && mesh !== undefined) {
        mesh.visible = true;
    }
}

export function setMeshInvisible(mesh) {
    if (mesh !== null && mesh !== undefined) {
        mesh.visible = false;
    }
}

export function verticesToJSTSPolygon(vertices) {
    const coordinateArray = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const vertex = vertices[i];
        coordinateArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1], 10));
    }
    // vertices aren't ring but JSTS Polygon only takes linear ring
    coordinateArray.push(coordinateArray[0]);

    const geometryFactory = new JSTS.geom.GeometryFactory();
    return geometryFactory.createPolygon(coordinateArray);
}

export function verticesFromJSTSPolygon(polygon) {
    const vertices = [];

    const polygonCoordinates = polygon.getCoordinates();
    for (let idx = 0; idx < polygonCoordinates.length - 1; idx += 1) {
        vertices.push([
            polygonCoordinates[idx].x,
            polygonCoordinates[idx].y,
            polygonCoordinates[idx].z,
        ]);
    }

    return vertices;
}

// getting setback points' array from outer points (array of array) and offset
export function setbackPolygon(outerPoints, offset) {
    if (outerPoints.length < 3) {
        console.error('No of vertices is less than 3');
        return outerPoints;
    }
    let outerPolygon = verticesToJSTSPolygon(outerPoints);

    const BufferOp = JSTS.operation.buffer.BufferOp;
    const BufferParameters = JSTS.operation.buffer.BufferParameters;
    let bufferParams = new BufferParameters(
        BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
        BufferParameters.CAP_FLAT,
        BufferParameters.JOIN_MITRE,
        BufferParameters.DEFAULT_MITRE_LIMIT
    );
    let innerPolygon = BufferOp.bufferOp(outerPolygon, offset, bufferParams);
    if (innerPolygon.getCoordinates().length < 4) {
        return [];
    }

    return verticesFromJSTSPolygon(innerPolygon);
}

export function checkLastEdgeIntersectionWithEdges(vertices) {
    if (vertices.length < 4) {
        return false;
    }
    let formattedVertices;
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    } else {
        formattedVertices = vertices;
    }

    const n = formattedVertices.length;
    const lastEdge = [formattedVertices[n - 2], formattedVertices[n - 1]];
    for (let i = 0; i < n - 2; i += 1) {
        const edge = [formattedVertices[i], formattedVertices[i + 1]];
        const lineIntersectionResult = checkLineIntersection(lastEdge, edge);
        const lineIntersectionPoint =
            new THREE.Vector2(lineIntersectionResult.x, lineIntersectionResult.y);
        if (lineIntersectionResult.onLine1 && lineIntersectionResult.onLine2 &&
            lineIntersectionPoint.distanceTo(edge[0]) > 0.001 &&
            lineIntersectionPoint.distanceTo(edge[1]) > 0.001) {
            return true;
        }
    }
    return false;
}

// returns true if the geometry is self intersecting
export function checkComplexGeometry(vertices) {
    return !verticesToJSTSPolygon(vertices).isSimple();
}

export function checkVertexEquivalency(vertices) {
    let formattedVertices = vertices;
    if (vertices.length === 0) {
        return false;
    }
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    }
    const totalVertices = formattedVertices.length;
    let firstIndex = 0;
    const lastIndex = totalVertices - 1;
    if (totalVertices > 3) {
        firstIndex = 1;
    }
    for (let i = 1; i < totalVertices; i += 1) {
        const prevIndex = (i === 0) ? formattedVertices.length - 1 : i - 1;
        const nextIndex = (i === formattedVertices.length - 1) ? 1 : i + 1;
        if (firstIndex !== lastIndex && firstIndex < totalVertices) {
            if (formattedVertices[lastIndex].distanceTo(formattedVertices[firstIndex]) < 0.00001) {
                return true;
            }
        }
        if ((i !== nextIndex &&
            formattedVertices[i].distanceTo(formattedVertices[nextIndex]) < 0.00001) ||
            (i !== prevIndex &&
                formattedVertices[i].distanceTo(formattedVertices[prevIndex]) < 0.00001)) {
            return true;
        }
        firstIndex += 1;
    }

    return false;
}

// Checks if the point lies on the line. Line is an array of vectors or arrays,
// point is an array or vector
export function checkIfPointLiesOnLineSegment(line, point, EPSILON = 0) {
    let formattedLine;
    let formattedPoint;
    if (!(point instanceof THREE.Vector2 || point instanceof THREE.Vector3)) {
        [formattedPoint] = convertArrayToVector([point]);
    } else {
        formattedPoint = point;
    }
    if (!(line[0] instanceof THREE.Vector2 || line[0] instanceof THREE.Vector3)) {
        formattedLine = convertArrayToVector(line);
    } else {
        formattedLine = line;
    }
    if (formattedLine[0] === formattedPoint || formattedLine[1] === formattedPoint) {
        return true;
    }

    const slope = (formattedLine[0].y - formattedLine[1].y) /
        (formattedLine[0].x - formattedLine[1].x);
    const constant = formattedLine[0].y - (slope * formattedLine[0].x);

    const liesOnLine = Math.abs(formattedPoint.y - ((slope * formattedPoint.x) + constant)) < 0.1;

    if (liesOnLine) {
        const maxX = Math.max(line[0].x, line[1].x);
        const maxY = Math.max(line[0].y, line[1].y);

        const minX = Math.min(line[0].x, line[1].x);
        const minY = Math.min(line[0].y, line[1].y);

        if (formattedPoint.y > maxY - EPSILON || formattedPoint.y < minY + EPSILON ||
            formattedPoint.x > maxX - EPSILON || formattedPoint.x < minX + EPSILON) {
            return false;
        }
        return true;
    }

    return false;
}

export function checkIfLastVertexOnEdges(vertices) {
    let formattedVertices;
    if (vertices.length < 3) {
        return false;
    }
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    } else {
        formattedVertices = vertices;
    }
    const pointToCheck = formattedVertices[formattedVertices.length - 1];
    for (let i = 0; i < formattedVertices.length - 2; i += 1) {
        if (checkIfPointLiesOnLineSegment(
            [formattedVertices[i], formattedVertices[i + 1]],
            pointToCheck,
        ) &&
            formattedVertices[i].distanceTo(pointToCheck) > 0.001 &&
            formattedVertices[i + 1].distanceTo(pointToCheck) > 0.001) {
            return true;
        }
    }
    return false;
}

export function posResetFor2D(vector) {
    let temp = vector.y;
    vector.setY(-vector.z);
    vector.setZ(temp);
    return vector;
}

const precisionModel = new JSTS.geom.PrecisionModel(1000);
export function getReducedPrecisionJSTSGeometry(geometry) {
    try {
        const reducedGeo = JSTS.precision.GeometryPrecisionReducer.reduce(geometry, precisionModel);
        return reducedGeo;
    } catch (error) {
        const geometryFactory = new JSTS.geom.GeometryFactory();
        return geometryFactory.createPolygon([]);
    }
}
