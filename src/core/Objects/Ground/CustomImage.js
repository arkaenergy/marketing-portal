import * as THREE from 'three';

import {
    getCustomImageDimensions,
    scaleMetersToRatio,
    getAspectRatio,
    scaleRatioToMeters,
    getDefaultGroundSize,
} from '../../utilities/utils';
import * as utils from '../../utilities/utils';
import {
    COLOR_MAPPINGS,
    IMAGE_MODEL_OPACITY,
} from '../../utilities/visualConstants';
import { INVALID_SCALE } from '../../utilities/constants';

export default class CustomImage {
    constructor(stage, image, imageId, loadTexture = true) {
        this.stage = stage;
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: loadTexture,
            opacity: IMAGE_MODEL_OPACITY,
        });

        const planeGeometry =
            new THREE.PlaneGeometry(stage.imageDimensions.width, stage.imageDimensions.height);
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);

        this.position = new THREE.Vector3(0, 0, 0);

        if (loadTexture) {
            new THREE.TextureLoader().load(image, (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                const customImageDimensions = getCustomImageDimensions(
                    stage.imageDimensions,
                    {
                        width: texture.image.width,
                        height: texture.image.height,
                    },
                );
                this.plane.geometry = new THREE.PlaneGeometry(
                    customImageDimensions.width,
                    customImageDimensions.height,
                );
                this.plane.material.map = texture;
                this.plane.material.needsUpdate = true;
            });
        }

        this.image = image;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.add(this.plane);

        this.rotation = 0;
        this.scale = 1;

        this.imageId = imageId;
    }


    async applyTransformations(transformations) {
        if (transformations.scale !== undefined && transformations.scale !== null) {
            if (transformations.scale === INVALID_SCALE) {
                transformations.scale = getDefaultGroundSize(this.stage).width;
            }
            this.updateScale(scaleMetersToRatio(
                transformations.scale,
                await getAspectRatio(this.image),
                this.stage.getImageDimensions().width,
            ));
        }
        if (transformations.rotation !== undefined && transformations.rotation !== null) {
            this.updateRotation(transformations.rotation);
        }
        if (transformations.offset !== undefined && transformations.offset !== null) {
            this.moveObject(transformations.offset[0], transformations.offset[1]);
        }
    }
    updateWhilePlacing() {
        // do nothing
    }


    removeObject() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);

        this.stage.selectionControls.removeSelectedObject(this);
        // this.stage.dragControls.removeIfExists(this);
    }

    updateRotation(newRotation) {
        this.rotation = newRotation;
        this.updateGeometry();
    }

    updateScale(newScale, scaleCentre = this.getPosition()) {
        const centre = this.plane.position;
        const newPositionOfScaleOrigin = new THREE.Vector2(
            ((newScale / this.scale) * (scaleCentre.x - centre.x)) + centre.x,
            ((newScale / this.scale) * (scaleCentre.y - centre.y)) + centre.y,
        );
        this.moveObject(
            scaleCentre.x - newPositionOfScaleOrigin.x,
            scaleCentre.y - newPositionOfScaleOrigin.y,
        );

        this.scale = newScale;
        this.updateGeometry();
    }

    updateGeometry() {
        this.plane.scale.set(this.scale, this.scale, this.scale);
        this.plane.rotation.set(0, 0, -utils.deg2Rad(this.rotation));
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        const deltaVector = new THREE.Vector3(deltaX, deltaY, deltaZ);
        this.plane.position.add(deltaVector);
        this.position.add(deltaVector);
    }

    // In version 2, error visuals would be added.
    getPlacingInformation() {
        const response = {
            parent: null,
            height: 0,
            errors: [],
        };

        return response;
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    // Visual Functions
    // In version 2 different visuals would be added so leaving this here.

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.IMAGE_MODEL;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    removeTransparency() {
        this.plane.material.transparent = false;
    }

    updateVisualsBasedOnStates() {
        const newColors = this.getColorMap();

        utils.updateMeshWithColor(newColors.MESH_COLOR, this.plane);
    }

    enableDragging() {
        // this.stage.dragControls.add(
        //     this,
        //     this.handleDragMove.bind(this),
        // );
    }

    enableObjectLayer(layer) {
        this.plane.layers.enable(layer);
    }

    disableObjectLayer(layer) {
        this.plane.layers.disable(layer);
    }

    getAspectRatio() {
        return this.plane.material.map.image.width / this.plane.material.map.image.height;
    }

    getDimensions() {
        return {
            width: this.plane.material.map.image.width,
            height: this.plane.material.map.image.height,
        };
    }

    getPosition() {
        return this.position;
    }

    getImage() {
        return this.image;
    }

    getScale() {
        return this.scale;
    }

    getRotation() {
        return this.rotation;
    }

    getOffset() {
        return [this.getPosition().x, this.getPosition().y];
    }

    getScaleInMeters() {
        return scaleRatioToMeters(
            this.getScale(),
            this.stage.getImageDimensions().width,
        );
    }

    getImageId() {
        return this.imageId;
    }

    static getObjectType() {
        return 'CustomImage';
    }
}
