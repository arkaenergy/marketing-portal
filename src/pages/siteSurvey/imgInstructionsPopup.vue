<template>
  <div class="parentImgPopupContainer">
    <el-dialog
      v-model="visiblePopupp"
      title="Instructions"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-scrollbar class="container">
        <h3 class="headings" v-if="hideImgPart">How to capture images?</h3>
        <ul class="ulContainer" v-if="hideImgPart">
          <li class="lists">
            Go through video below for a quick tutorial on how to capture site survey images.
          </li>
          <li class="lists">
            Capture and upload multiple clear images from all corners of roof by moving in clockwise
             direction. Replace blurred images. Image should include all movable and non-movable objects on roof.
          </li>
          <li class="lists">
            Capture the images in ample sunlight to ensure the roof is well-lit and all objects are clearly visible.
            Avoid capturing in low/dim light.
          </li>
          <!-- <img v-bind:src="allIcon.get('Group2215')" class="image" /> -->
        </ul>
        <h3 class="headings" v-if="hideVideoPart">How to record a video?</h3>
        <ul class="ulContainer" v-if="hideVideoPart">
          <li class="lists">
            Stand in the middle of the roof and record a 360-degree panoramic video of the roof.
             Capture clearly avoiding shaky movement and ensuring stable recording.
          </li>
          <li class="lists">
            Capture the video in ample sunlight to ensure the roof is well-lit and all the objects are clearly visible.
             Avoid recording in low/dim light.
          </li>
          <li class="lists">
            Complete the site survey without closing the browser/tab.
            Closing the tab or browser window may cause the loss of the captured video.
          </li>
          <!-- <img v-bind:src="allIcon.get('Group2215')" class="image" /> -->
        </ul>
      </el-scrollbar>
      <template #footer>
        <span class="dialog-footer">
          <!-- <div class="chkbx">
            <el-checkbox
              v-model="checked1"
              label="Do you agree that uploaded photos and videos to be used for designing?"
              size="large"
            />
          </div> -->
          <!-- this.$router.push({ name: "projectListViewHome" }); -->
          <el-button type="primary" class="ContinueBtn"  @click="handleClose"> Continue </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script >
import utils from '@/pages/siteSurvey/utils'
export default {
  props: {
    isImgInstructionsPopupVisible: {
      type: Boolean,
      default: false,
    },
    hideVideoPart: {
      type: Boolean,
      default: true
    },
    hideImgPart: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      referenceID: this.$route.params.referenceID,
      allIcon: utils.images,
    };
  },

  computed:{
    visiblePopupp() {
      return this.$props.isImgInstructionsPopupVisible;
      
    },
  },



  methods: {
    handleClose(){
      this.$emit("close");
    }
  },
};
</script>

<style scoped>
.parentImgPopupContainer :deep() .el-dialog {
  width: 600px !important;
  border-radius: 8px !important;
  margin-top: 7vh !important;
}

.parentImgPopupContainer :deep() .el-dialog__header {
  display: flex !important;
  align-items: center;
  height: 40px;
  width: 100%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 0px 24px;
  background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
}

.parentImgPopupContainer :deep() .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
}

.parentImgPopupContainer :deep() .el-dialog__headerbtn {
  top: -4px;
  display: none;
}

.parentImgPopupContainer :deep() .el-dialog__headerbtn .el-dialog__close {
  color: #222;
  font-size: 24px;
  font-weight: 600;
}

.parentImgPopupContainer :deep() .el-dialog__body {
  padding: 0px !important;
}


.parentImgPopupContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 16px 24px 0px 24px;
    word-break: break-word;
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
}

.headings {
  color: #1c3366;
  font-size: 14px;
  font-weight: 600;
}

.ulContainer {
  margin: 8px 0px 0px 0px;
}

.lists {
  font-size: 14px;
  color: #222;
  list-style-position: outside;
  margin-left: 16px;
  line-height: 1.14;
  margin-bottom: 8px;
}

.lists::marker {
  font-size: 16px;
  margin-left: 16px;
}

.image {
  border-radius: 8px;
  margin: 16px 0px;
  width: 100%;
}

.parentImgPopupContainer :deep() .el-dialog__footer {
  text-align: center;
  padding: 0px 28px 24px 28px !important;
}

.chkbx {
  text-align: left;
}

.parentImgPopupContainer :deep() .el-checkbox {
  align-items: flex-start;
}

.parentImgPopupContainer
  :deep() .el-checkbox.el-checkbox--large
  .el-checkbox__label {
  font-size: 14px;
  color: #222;
  white-space: initial;
}

.parentImgPopupContainer :deep() .el-checkbox__inner {
  border: 1px solid #222;
}

.parentImgPopupContainer
  :deep() .el-checkbox__input.is-checked
  .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

.ContinueBtn {
  height: 48px;
  width: 128px;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .parentImgPopupContainer :deep() .el-dialog {
    width: 90vw !important;
    margin-top: 4vh !important;
  }

  .parentImgPopupContainer :deep() .el-scrollbar__wrap  {
    padding: 16px 16px 0px 16px;
    max-height: 70vh;
    margin-bottom: 16px;
  }

  .image {
    margin: 4px 0px;
  }

  .parentImgPopupContainer :deep() .el-dialog__footer {
    padding: 0px 16px 24px 16px !important;
  }
}
</style>