// import { MATERIAL_STATES, VISUAL_STATES } from '../utilities/constants';

export default class VisualManager {
    constructor(stage) {
        this.stage = stage;
        this.in3D = false;
        this.visualStates = [];
    }

    removeVisualState(visualState) {
        const index = this.visualStates.indexOf(visualState);
        if (index !== -1) {
            this.visualStates.splice(index, 1);
        }
    }

    addVisualState(visualState) {
        this.removeVisualState(visualState);
        this.visualStates.push(visualState);
    }

    containsVisualState(visualState) {
        return this.visualStates.indexOf(visualState) !== -1;
    }

    switchDefaultVisualStatesInSequenceForObject(object) {
        const visualStates = this.getDefaultVisualStates();
        for (let i = 0; i < visualStates.length; i += 1) {
            object.switchVisualState(visualStates[i], false);
        }
    }

    getDefaultVisualStates() {
        if (this.visualStates.length === 0) {
            return [VISUAL_STATES.DEFAULT_STATES.DEFAULT];
        }
        return this.visualStates;
    }

    getMaterialStateBasedOnConditions() {
        if ((this.getShadowEnabled() || this.getIn3D()) &&
            !this.getEditingEnabled()) {
            return MATERIAL_STATES.SOLID;
        }
        return MATERIAL_STATES.TRANSLUCENT;
    }

    updateVisualsFor2D() {
        this.in3D = false;
        this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
    }

    updateVisualsFor3D() {
        this.in3D = true;
        this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
    }

    updateVisualsForEditing(enabled) {
        if (enabled) {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, true);
        }
        else {
            this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
        }
    }

    getShadowEnabled() {
        return this.stage.lightsManager.isShadowEnabled();
    }

    getEditingEnabled() {
        return this.stage.drawManager.isEnabled() ||
        this.stage.dragControls.getIsMoved() ||
        this.stage.placeManager.isEnabled();
    }

    getIn3D() {
        return this.in3D;
    }
}
