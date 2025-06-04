
const SUBARRAY_RACK_STYLE_FIXED = 'fixed-mount';
export async function fillFace(vertices, rackStyle = SUBARRAY_RACK_STYLE_FIXED, { isCustom } = { isCustom: false }) {
    this.mountType = SUBARRAY_RACK_STYLE_FIXED;
    const fixedMountProperties = this.getFixedMountProperties();
    this.tilt = fixedMountProperties.tilt;
    this.azimuth = fixedMountProperties.azimuth;
    this.structureType = fixedMountProperties.structureType;
    this.rowSpacingMode = fixedMountProperties.rowSpacingMode;
    this.panelOrientation = fixedMountProperties.panelOrientation;
    this.mountHeight = fixedMountProperties.mountHeight;
    this.tableSizeUp = fixedMountProperties.tableSizeUp;
    this.tableSizeWide = fixedMountProperties.tableSizeWide;
    this.tableSpacing = fixedMountProperties.tableSpacing;
    this.moduleSpacingUp = fixedMountProperties.moduleSpacingUp;
    this.moduleSpacingWide = fixedMountProperties.moduleSpacingWide;
    this.moduleProperties = fixedMountProperties.moduleProperties;
    this.panelProperties = fixedMountProperties.panelProperties;
    let { rowSpacing } = fixedMountProperties;
    if (fixedMountProperties.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
        const optimizedRowSpacing = this.getOptimisedRowSpacing();
        rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
    }
    this.rowSpacing = rowSpacing;

    const defaultVal = this.getDefaultValues();
    if (this.panelProperties === undefined) {
        this.panelProperties = defaultVal.panelProperties;
    }
    // adjust vertices to accommodate for raycaster precision during placeObject
    // vertices = utils.convertArrayToVector(utils.setbackPolygon(vertices, -0.001));
    vertices = utils.convertArrayTo3DVector(utils.setbackPolygon(vertices, -0.001));
    console.log('vertices:ffrom-subarray- ', vertices);
    // TODO: call onComplete after draw manager is refactored to return list of vertices

    // set outline points
    for (let vertex of vertices) {
        this.outlinePoints.push(
            new OutlinePoints(
                vertex.x,
                vertex.y,
                vertex.z,
                this,
                this.stage
            )
        );
    }

    if (!isCustom) {
        try {
            // update panel placement
            await this.placeObject(); // 1 to 20 sec
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Subarray: fillFace failed.', error);
            this.onCancel();
            return Promise.reject(error);
        }
    }
    else {
        try {
            await this.updateAssociatedModel();
        }
        catch (error) {
            console.error('ERROR: Subarray: placeObject failed', error);
            return Promise.reject(error);
        }
        if (rackStyle === SUBARRAY_RACK_STYLE_FLUSH) {
            const flushMountProperties = this.getFlushMountProperties();
            this.tilt = flushMountProperties.tilt;
            this.azimuth = flushMountProperties.azimuth;
        }
        this.updateGeometry();

        // show outline
        this.coreEdges.visible = true;
        // show outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }
    }
}