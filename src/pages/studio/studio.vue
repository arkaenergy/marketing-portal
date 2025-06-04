<template>
  <div class="parentContainer">
    <canvas id="design-canvas" />
    <Layer v-if="isStageLoaded"/>
  </div>
</template>
<script>
import {
    loadStage,
    destroyStudio,
} from "../../core/utilities/componentManager"
import Layer from "./layer.vue";
import {main} from '../../main';
let stage = {};

export default {
    name: 'DesignCanvas',
    components: {
        Layer,
    },

    data() {
        return {
            isStageLoaded: false,
        };
    },

    props: {
        latitude: {
            type: Number,
            default: 28.612948,
        },
        longitude: {
            type: Number,
            default: 77.229557,
        },
        zoom: {
            type: Number,
            default: 19,
        },
        designSettings: {
            type: Object,
            default() {
                return {};
            },
        },
        mapImage: {
            type: Object,
            default() {
                return {};
            },
        },
        stageData: {
            type: Object,
            default() {
                return {};
            },
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        overviewMode: {
            type: Boolean,
            default: false,
        },
        designId: {
            type: Number,
            default: -1,
        },
    },
    mounted() {
        const designCanvas = document.getElementById('design-canvas');
        const parent = designCanvas.parentElement;
        const parentPadding = parseInt(
            window.getComputedStyle(parent, null).getPropertyValue('padding-left'),
            10,
            );
        designCanvas.width = screen.width;
        designCanvas.height = screen.height ;
        let savedStageData = this.stageData;
        if(localStorage.getItem('stageData')){
            savedStageData = JSON.parse(localStorage.getItem('stageData'));
        }else {
            localStorage.setItem('stageData', JSON.stringify(this.stageData));
        }
        stage = loadStage(
            designCanvas,
            this.latitude,
            this.longitude,
            this.zoom,
            this.designSettings,
            this.mapImage,
            savedStageData,
        );
        main.app.config.globalProperties.$stageInstance = stage;
        this.isStageLoaded = true;
        if (!this.editMode) {
            //stage.disableEditing();
            stage.setDesignId(this.designId);
        }

        if (this.overviewMode) {
            stage.switchTo3d();
        }
    },
    beforeDestroy() {
        stage.destroyStage();
        destroyStudio();
    },
};
</script>

<style  scoped>
@media (max-width: 1100px) {
  .parentContainer {
    position: relative;
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    background: rgb(222, 201, 201);
  }
}
</style>

