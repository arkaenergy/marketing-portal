<template>
  <div class="dialog-global">
    <el-dialog
      v-model="visiblePopup"
      :width="dialogWidth()"
      :before-close="handleClose"
    >
    <!-- :title="dialogTitle" -->

    <template v-slot:title>
      <div class="custom-header" v-show="dialogTitle!==''">
        <h2 class="custom-title">{{ dialogTitle }}</h2>
      </div>
    </template>
      <slot name="body">
        <span>This is a message</span>
      </slot>
      <span slot:footer class="dialog-footer">
        <div v-show="requireFooterButtons">
          <el-button @click="handleClose" v-if="!disableCancel"
            >Cancel</el-button
          >
          <el-button
            :type="footerButtonType"
            @click="handleClick"
            :disabled="disableButton"
            >{{ footerButtonText }}</el-button
          >
        </div>

        <div class="loads-footer border-top" v-show="requireLoadsFooterButtons">
          <el-button class="cancel-button button-text">Cancel</el-button>
          <el-button class="update-button button-text" type="primary">{{
            footerButtonText
          }}</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "GlobalDialog",
  props: {
    dialogTitle: {
      type: String,
      required: true,
      default: "",
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    footerButtonText: {
      type: String,
      default: "Confirm",
      required: false,
    },
    width: {
      type: String,
      default: "30%",
      required: false,
    },
    footerButtonType: {
      type: String,
      default: "primary", // Success Info Warning Danger
      required: false,
    },
    disableCancel: {
      type: Boolean,
      default: false,
      required: false,
    },
    disableButton: {
      type: Boolean,
      default: false,
      required: false,
    },
    requireFooterButtons: {
      type: Boolean,
      default: false,
      required: false,
    },
    requireLoadsFooterButtons: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  methods: {
    handleClose() {
      this.$emit("handleClose");
    },
    handleClick() {
      this.$emit("handleClick");
      this.$emit("handleClose");
    },
    dialogWidth() {
      // Define the width for screens smaller than desktop and in between
      const maxWidthForMobile = "90%";
      const maxWidthForTablet = "77%";

      // Use a media query to check the screen width and set the appropriate width
      if (window.matchMedia("(max-width: 767px)").matches) {
        // Smaller than desktop (e.g., mobile)
        console.log("mobile width");
        return maxWidthForMobile;
      } else if (
        window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches
      ) {
        // In between desktop and tablet
        console.log("tablet width");
        return maxWidthForTablet;
      } else if (
        window.matchMedia("(min-width: 1024px) and (max-width: 1200px)").matches
      ) {
        // In between desktop and tablet
        console.log("mid desktop width");
        return "60%";
      } else if (
        window.matchMedia("(min-width: 1201px) and (max-width: 1300px)").matches
      ) {
        // In between desktop and tablet
        console.log("mid desktop width");
        return "50%";
      } else {
        // Desktop
        console.log("desktop width");
        console.log(this.$props.width);
        return this.$props.width;
      }
    },
  },
  computed: {
    visiblePopup() {
      return this.$props.dialogVisible;
    },
  },
};
</script>
<style scoped>
::v-deep .el-dialog {
  border-radius: 8px;
}

::v-deep .el-dialog__headerbtn i {
  font-size: 24px;
  color: #222222;
}

.dialog-global ::v-deep .el-dialog__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog-global ::v-deep .el-dialog__header {
  /*border-bottom: 1px solid var(--grey-grey-75, #bfbfbf);*/
  margin-right: 0;
  padding: 1rem 0;
}
/*.dialog-global ::v-deep .el-dialog__title {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Poppins;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}*/

.dialog-global ::v-deep .el-dialog__header .custom-title{
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Poppins;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-left:1.25rem;
}
.dialog-global ::v-deep .el-dialog__header .custom-header{
  border-bottom: 1px solid var(--grey-grey-75, #bfbfbf);
  padding-bottom: 1rem;
  margin-right: 0;
}
/* Footer buttons styling*/
.loads-footer {
  display: flex;
  padding: 24px;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: stretch;
}

.loads-footer :deep() .el-button--primary {
  background-color: #f7941d;
  border-color: #f7941d;
}
.cancel-button {
  background-color: #ffffff;
  border-color: #f7941d;
}

.cancel-button:deep() span {
  color: #f7941d;
}

.button-text {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.25px;
}

:deep() .el-button > span {
  font-family: "Poppins";
}
</style>
