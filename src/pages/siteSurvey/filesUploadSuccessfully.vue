<template>
  <div class="parentCont">
  <div class="container">
    <img v-bind:src="allIcon.get('checkCircleFill')" class="successIcon" />
    <h3 class="heading" v-if="!forReportCheck">Submitted Successfully.</h3>
    <p class="content">
      {{confirmationText}}
    </p>
    <!-- <el-button type="primary" class="closeBtn" @click="closeWindow()">Exit</el-button> -->
  </div>
</div>
</template>

<script>
import utils from '@/pages/siteSurvey/utils'
export default {
  data() {
    return {
      allIcon: utils.images,
      forReportCheck: false,
      confirmationText : "Thank you for submitting the site survey. We will get back to you shortly.",
    };
  },
  created() {
    if(this.$route.name=='reportSuccess') {
      this.forReportCheck = true;
      this.confirmationText = "Your report has been sent to your email successfully. Our team will connect with you shortly.";
    }
  },
  methods: {
    closeWindow() {   
      location.href = 'https://www.thesolarlabs.com'
    },
  },
};
</script>

<style scoped>

.parentCont {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e8edf2;
}

.container {
  height: 312px;
  width: 496px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  background-color: #fff;
}

.successIcon {
  margin-bottom: 24px;
}

.heading {
  color: #19c114;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.content {
  color: #222;
  font-size: 16px;
  line-height: 1.57;
  margin-bottom: 24px;
  max-width: 356px;
}

.closeBtn {
  font-size: 15px;
  font-weight: 600;
  width: 120px;
  height: 41px;
}

@media (max-width: 1100px) {

  .container {
    height: 100vh;
    width: 100vw;
    border-radius: 0px;
  }

  .heading {
  font-size: 14px;
}

.content {
  font-size: 14px;
  max-width: 312px;
}

}

</style>
