<template>
  <div class="navParentContainer">
    <div class="navContainer">
      <div class="leftNav">
        <img v-bind:src="allIcon.get('Back-btn')" class="backArrow" v-if="isBackBtnShow || showRoofNo" @click="backBtnRouter"/>
        <p class="UpImg" v-if="isBackBtnShow">Upload {{stepNumber == 2 ? "Images" : "Videos"}} (Roof {{ this.roofNo }})</p>
        <p class="UpImg" v-if="isSiteSurvey">Site Survey</p>
        <p class="UpImg" v-if="showRoofNo">Search Location (Roof {{ this.roofNo }})</p>
      </div>
      <div class="rightNav">
        <!-- <img v-bind:src="allIcon.get('MaskGroup14')" class="logo" /> -->
        <img :src="finalImageSource" class="logo" />

      </div>
    </div>
    <div class="stepsContainer" v-if="isStepsShow">
      <div class="steps">
        <el-steps direction="horizontal" :active="stepNumber">
          <el-step title=""></el-step>
          <el-step title=""></el-step>
          <el-step title=""></el-step>
        </el-steps>
      </div>
    </div>
  </div>
</template>

<script>
import utils from '@/pages/siteSurvey/utils'
import API from '@/services/api';
import {isRnelDomain} from '@/services/api/index.js'
import { navbarLogo } from '../constants';

export default {
  name: "navbar",

  props: {
    isStepsShow: {
      type: Boolean,
      default: true,
    },
    isBackBtnShow: {
      type: Boolean,
      default: true
    },
    stepNumber: {
      type: Number,
      default: 1
    },
    isSiteSurvey: {
      type: Boolean,
      default: false
    },
    showRoofNo: {
      type: Boolean,
      default: false
    }
  },
  created(){
    this.getLogo();
  },

  data() {
    return {
      referenceID: this.$route.params.referenceID,
      roofNo: this.$route.params.roofNo,
      allIcon: utils.images,
      finalImageSource: null,
      isRnelDomain,
      
    };
  },

  methods: {
    backBtnRouter() {
      if(this.stepNumber == 2) {
        return  this.$router.push({ name: 'homeMapWithRoofNo', params: {referenceID :this.referenceID, roofNo : this.roofNo} });
      } else {
        return this.$router.push({ name: 'uploadPhotosWithRoofNo', params: {referenceID :this.referenceID, roofNo : this.roofNo} });
      }
    },
   async getLogo(){
      let orgInfo = JSON.parse(localStorage.getItem('org-info-marketing-portal'));
      if(!orgInfo && this.referenceID){
        try{
          let response = await API.IMAGES_AND_VIDEOS.FETCH_FILES(this.referenceID);
          orgInfo = response.data;
        }
        catch(e){
          console.error(e);
        }
      }
      let isTataUser = orgInfo?.isTataUser;
      let logo = orgInfo?.logo;

      if(this.$route.name == 'mapForDesignTool' || this.$route.name == 'reportSuccess'
        || this.$route.name == 'studio' || this.$route.name=='homePage' || this.$route.name=='reportSummary'){
        this.finalImageSource = navbarLogo;  // TODO: need to add check for studio instead of individual routes. Need to discuss with sharad.
      }
      else if(isTataUser){
        this.finalImageSource = this.allIcon.get('MaskGroup14')
      }
      else if(logo){
        this.finalImageSource = logo;
      }
      else{
        this.finalImageSource = null;
      }
    }
  }
};
</script>


<style scoped>
.navContainer {
  position: relative;
  height: 100px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  background-color: #fff;
  box-sizing: border-box;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.leftNav {
  display: flex;
  gap: 19px;
  align-items: center;
}

.UpImg {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  font-family: "Helvetica Neue";
}

.backArrow {
  cursor: pointer;
}

.logo {
  max-width: 168px;
  max-height: 81px;
}

.stepsContainer {
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.16);
  background-color: #e8edf2;
  height: 56px;
}
.steps {
  padding: 10px;
  max-width: 700px;
  margin: auto;
}

.navParentContainer :deep() .el-step__icon {
  height: 36px;
  width: 36px;
  background-color: #409eff;
  font-size: 18px;
  color: #fff;
}

.navParentContainer :deep() .el-step.is-horizontal .el-step__line {
  height: 2px;
  top: 16px;
  left: 0;
  right: 0;
  background: #ccc;
}

.navParentContainer :deep() .el-step__head.is-process {
  color: var(--el-text-color-primary);
  border-color: #fff;
}

.navParentContainer :deep() .el-step__head.is-process .el-step__icon {
  background-color: #fff;
  font-size: 18px;
  color: #ccc;
}

.navParentContainer :deep() .el-step__head.is-wait {
  color: var(--el-text-color-primary);
  border-color: #fff;
}

.navParentContainer :deep() .el-step__head.is-wait .el-step__icon {
  background-color: #fff;
  font-size: 18px;
  color: #ccc;
}

@media (max-width: 500px) {
  .navContainer {
    height: 56px;
    padding: 10px 16px;
  }

  .leftNav {
    gap: 12px;
  }

  .UpImg {
    font-size: 16px;
  }

  .logo {
    max-width: 100px;
    max-height: 42px;
  }

  .stepsContainer {
    height: 40px;
  }

  .navParentContainer :deep() .el-step__icon {
    height: 24px;
    width: 24px;
    font-size: 16px;
  }

  .steps {
    padding: 8px 16px;
  }

  .navParentContainer :deep() .el-step.is-horizontal .el-step__line {
    top: 10px;
  }
}
</style>