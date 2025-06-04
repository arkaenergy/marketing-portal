<template>
  <div class="parentContainer">
    <el-dialog
      v-model="visiblePopupp"
      title="Instructions"
      :before-close="handleClose"
    >
      <div class="container">
        <img :src="allIcon.get('checkCircleFill')" class="successIcon" />
        <h3 class="heading">Files Uploaded Successfully.</h3>
        <p class="content">
          Thank you for submitting the site survey. We will get back to you
          shortly.
        </p>
      </div>
      <!-- <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" class="closeBtn" @click="handleClose">Close</el-button>
        </span>
      </template> -->
    </el-dialog>
  </div>
</template>

<script >
import utils from '@/pages/siteSurvey/utils'
export default {
  props: {
    isFileUploadSuccessfullyPopupVisible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      allIcon: utils.images,
      
    };
  },

  methods: {
    closeModal() {
      this.$emit("cancelDelete");
    },

    visiblePopupp() {
      return this.$props.isFileUploadSuccessfullyPopupVisible;
    },

    handleClose(){
      this.$emit("close");
    }
  },
};
</script>

<style scoped>
.parentContainer :deep() .el-dialog {
  width: 392px;
  border-radius: 8px;
  margin-top: 24vh;
}

.parentContainer :deep() .el-dialog__header {
  display: none;
}

.parentContainer :deep() .el-dialog__body {
  padding: 33px 15px 24px 15px;
}

.parentContainer :deep() .el-dialog__footer {
  padding: 0px 28px 31px 28px;
  text-align: center;
}

.container {
  text-align: center;
}

.heading {
  color: #19c114;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
  margin-top: 23px;
}

.content {
  font-size: 16px;
  color: #222;
  line-height: 1.38;
}

.closeBtn {
  width: 120px;
  height: 41px;
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 440px) {
  .parentContainer :deep() .el-dialog {
    width: 90vw !important;
  }

  .heading {
    margin-top: 16px;
  }
}
</style>