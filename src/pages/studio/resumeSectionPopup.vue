<template>
    <div class="otpParentContainer">
        <el-dialog v-model="visiblePopupp" title="OTP" :close-on-click-modal="false" @close="handleClose" class="dialog">
            <p class="textPopup">
                Do you want to resume where you left?
            </p>
                <div class="footer">
                    <el-button @click="handleClose" class="noBtn">No</el-button>
                    <el-button @click="openStudio" type="primary" class="yesContinueBtn">
                        Yes
                    </el-button>
                </div>
        </el-dialog>
    </div>
</template>
  
<script >
import utils from '@/pages/siteSurvey/utils'
import { useStudioStore } from '../store/studioStore';
import { FLOOR_STATE } from './constants';
export default {

    props: {
        isResumeSectionPopupVisible: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            allIcon: utils.images,
            studioStore: useStudioStore(),
        };
    },

    computed: {
        visiblePopupp() {
            return this.$props.isResumeSectionPopupVisible;
        },
    },

    methods: {
        clearLocalStorage() {
            localStorage.removeItem('componentData');
            localStorage.removeItem('currentAppState');
            localStorage.removeItem('stageData');
            localStorage.removeItem('google-map-info');
            this.studioStore.$patch({
                currentAppState: FLOOR_STATE,
            });
            this.studioStore.$patch({
                basePolygonDrawn: false,
            });
            this.studioStore.$patch({
                atleast3PointsDrawn: false,
            });
            this.studioStore.$patch({
                obstructionPlacedInScene: false,
            });
            this.studioStore.$patch({
                undoEnabled : false,
            });
            this.studioStore.$patch({
                zoomValue : 3,
            });
        },
        handleClose() {
            this.$emit("close");
            this.clearLocalStorage();
        },
        openStudio() {
            this.$router.push({name : 'studio'});
        }
    },
};
</script>
  
<style scoped>
.otpParentContainer :deep() .el-dialog {
    width: 328px;
    margin-top: 24vh !important;
    border-radius: 8px;
    height: 224px;
}

.otpParentContainer :deep() .el-dialog__header {
    display: none;
}

.otpParentContainer :deep() .el-dialog__body {
    padding: 24px !important;
    height: 100%;
    display: grid;
    place-items: center;
}


.otpParentContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 24px 32px 24px;
    word-break: break-word;
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
    text-align: center;
}

.noBtn {
    font-size: 18px;
    font-weight: 600;
    width: 120px;
    height: 48px;
    border: 1px solid #999;
    color: #222;
    border-radius: 8px;
}

.yesContinueBtn {
    font-size: 18px;
    font-weight: 600;
    height: 48px;
    width: 120px;
    border-radius: 8px;
}

.textPopup {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    text-align: center;
    line-height: 1.38;
}

.footer {
    display: flex;
    gap: 16px;
}

@media (max-width: 640px) {
    .otpParentContainer :deep() .el-dialog {
        width: 90vw !important;
        border-radius: 8px;
    }

    .otpParentContainer :deep() .el-scrollbar__wrap {
        padding: 16px 16px 0px 16px;
        max-height: 70vh;
        margin-bottom: 16px;
    }

    .textPopup {
        max-width: 255px;
    }

    .otpInputs {
        width: 50px;
    }
}
</style>