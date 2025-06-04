<template>
  <div class="parentContainer" v-loading="isLoading">
    <Navbar :isStepsShow="false" :isBackBtnShow="false"/>
    <div class="container">
      <div class="cardCont">
        <p class="heading">Welcome!</p>
        <div class="sections">
          <div class="imgCont imgContOdd">
            
             <img :src="allIcon.get('google-maps')" class="img" />
          </div>
          <p class="content">
            Search and select the google map image of the building you wish to have solar on.
          </p>
        
          
        </div>
        <div class="sections">
          <div class="imgCont">
            <img v-bind:src="allIcon.get('Group2549')" class="img" />
          </div>
          <p class="content">
            {{iconContent}}
          </p>
        </div>
        <div class="sections" v-if="!referenceID ? false : true">
          <div class="imgCont">
            <img v-bind:src="allIcon.get('delete')" class="img" />
          </div>
          <p class="content">
            Complete the survey without closing the browser/tab. Closing may cause the loss of the captured images and videos.
          </p>
        </div>
        <div class="sections" v-if="isRefId">
          <div class="imgCont">
            <img v-bind:src="allIcon.get('cuboid')" class="img" />
          </div>
          <p class="content">
            Drag and drop the objects from the menu if present on the rooftop to mark them.
          </p>
        </div>
        <div class="sections"  v-if="isRefId">
          <div class="imgCont">
            <img v-bind:src="allIcon.get('electricity-bill')" class="img" />
          </div>
          <p class="content">
            Calculate the savings by entering the monthly bill details.
          </p>
        </div>
        <div class="sections"  v-if="isRefId">
          <div class="imgCont">
            <img v-bind:src="allIcon.get('subtraction')" class="img" />
          </div>
          <p class="content">
            Complete the design without closing the browser/tab. Closing may cause the loss of data.
          </p>
        </div>
      </div>
      <div class="btnContainer">
        <div class="chkbx">
          <el-checkbox
            v-model="isChecked"
            label="I understand the instructions and consent to my data being used for my solar quote."
            size="large"
          />
        </div>
        <el-button type="primary" class="ContinueBtn" @click="moveToNextRoute" 
        :disabled = "!isChecked ? true : false">Get Started</el-button>
      </div>
    </div>
    <ResumeSectionPopup
      v-if="isResumeSectionPopupVisible"
      :isResumeSectionPopupVisible="isResumeSectionPopupVisible"
      @close="isResumeSectionPopupVisible=false"
    />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import API from '@/services/api';
import utils from '@/pages/siteSurvey/utils'
import ResumeSectionPopup from '../studio/resumeSectionPopup.vue';
import {assignOrgInfoToLocalStorage} from '@/pages/siteSurvey/utils.js';


export default {
  name: "homePage",

  components: {
    ResumeSectionPopup
  },

  async created() {
    if(this.referenceID) this.fetchAllInformation();
  },
  data() {
    return {
      isChecked: false,
      referenceID: this.$route.params.referenceID,
      isRedirectToAllRoofs : false,
      isLoading: false,
      allIcon: utils.images,
      isStudioPage: null,
      isUploadFilesPage: null,
      isResumeSectionPopupVisible: false
    };
  },
  mounted() {
    if(localStorage.stageData && localStorage.currentAppState){
      this.isResumeSectionPopupVisible = true;
    }
  },
  computed: {
    isRefId() {
      if(!this.referenceID) return true;
    },

    iconContent() {
      if(!this.referenceID) {
        return "Select each corner of the roof one by one to draw a polygon.";
      } else {
        return "Upload photos and videos of the rooftop.";
      }
    }
  },

  methods:{
    async fetchAllInformation(){
      this.isLoading = true;
      let response;
      try{
        response = await API.IMAGES_AND_VIDEOS.FETCH_FILES(this.referenceID);
        assignOrgInfoToLocalStorage(response?.data);
      }
      catch(e){
        console.error(e);
        ElMessage({
          message: 'Failed to fetch Information!',
          type: 'error',
        })
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      utils.isCompletedTrue(response);
      // this means that we have atleast 1 roof so redirect to all roofs on moving ahead
      if(response.data.site_survey_details && response.data.site_survey_details.length>0){ 
        this.isRedirectToAllRoofs = true;
      }
    },
    moveToNextRoute(){
      if(this.isRedirectToAllRoofs){
        // redirect to all roofs page
        this.$router.push({ name: 'allRoofsRef', params: {referenceID :this.referenceID} })
      } else if(!this.referenceID) {
        this.$router.push({ name: 'mapForDesignTool' })
      } else{
        this.$router.push({ name: 'homeMapWithRoofNo', params: {referenceID :this.referenceID, roofNo:1} })
      }
    }
  }
};
</script>

<style  scoped>
.parentContainer {
  background-color: #e8edf2;
  min-height: 100vh;
}
.container {
  background-color: #fff;
  width: 80vw;
  margin: 1px auto;
  min-height: calc(100vh - 102px);
}

.cardCont {
  padding: 40px 32px 40px 32px;
}

.heading {
  color: #1c3366;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 24px;
}

.sections {
  display: flex;
  gap: 24px;
  align-items: center;
  border-radius: 8px;
  padding: 16px 24px;
}

.sections:nth-child(even) {
  background-color: #f1f4f6;
}

.imgCont {
  border: 4px solid #e8edf2;
  border-radius: 50%;
  padding: 14px;
  height: 72px;
  width: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imgContOdd {
  border: 4px solid #fff;
}

.img {
}

.content {
  font-size: 18px;
  line-height: 1.4;
  color: #222;
}

.btnContainer {
  padding: 16px 32px 32px 48px;
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background-color: #fff;
}

.chkbx {
  text-align: left;
}

.parentContainer :deep() .el-checkbox {
  align-items: center;
}

.parentContainer :deep() .el-checkbox.el-checkbox--large .el-checkbox__label {
  font-size: 16px;
  color: #222;
  white-space: initial;
  padding-left: 16px;
  line-height: 1.38;
}

.parentContainer :deep() .el-checkbox__inner {
  border: 1px solid #999;
  width: 24px;
  height: 24px;
}

.parentContainer :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

.parentContainer :deep() .el-checkbox__inner::after {
  height: 13px;
  left: 8px;
  border-width: 2px;
}

.parentContainer :deep() .el-button.is-disabled {
  color: #ccc;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
  border: none;
}

.ContinueBtn {
  height: 48px;
  width: 144px;
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .container {
    position: relative;
    width: 100vw;
    min-height: calc(100vh - 102px);
  }

  .cardCont {
    padding: 24px;
  }

  .heading {
    margin-bottom: 13px;
  }

  .sections {
    padding: 20px 12px;
    gap: 16px;
    border-radius: 4px;
  }

  .content {
    font-size: 16px;
    line-height: 1.29;
  }

  .imgCont {
    height: 46px;
    width: 46px;
  }

  .img {
    width: 23px;
  }

  .btnContainer {
    position: fixed;
    width: 100%;
    bottom: 0px;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px;
    border-top: none;
    box-shadow: 1px -2px 2px 0 rgba(0, 0, 0, 0.08);
    gap: 0px;
  }

  .chkbx {
    padding: 24px 24px 8px 24px;
  }

  .ContinueBtn {
    width: 100%;
    border-radius: 0px;
  }

  .parentContainer :deep() .el-checkbox__inner {
    width: 24px;
    height: 24px;
  }

  .parentContainer :deep() .el-checkbox {
    align-items: flex-start;
  }

  .parentContainer :deep() .el-checkbox.el-checkbox--large .el-checkbox__label {
    padding-left: 16px;
  }
}

@media (max-width: 500px) {
  .container {
    min-height: calc(100vh - 58px);
    padding-bottom: 120px;
  }

  .cardCont {
    padding: 16px;
  }

  .sections {
    padding: 16px 8px;
  }

  .content {
    font-size: 14px;
  }


  .chkbx {
    padding: 16px 16px 0px 16px;
  }

  .parentContainer :deep() .el-checkbox__inner {
    width: 16px;
    height: 16px;
    top: 3px;
  }

  .parentContainer :deep() .el-checkbox__inner::after {
    height: 8px;
    left: 5px;
    border-width: 1px;
  }

  .parentContainer :deep() .el-checkbox.el-checkbox--large .el-checkbox__label {
    padding-left: 8px;
  }

  .btnContainer {
    gap: 16px;
  }

}
</style>