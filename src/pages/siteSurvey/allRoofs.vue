<template>
  <div class="parentContainer" v-loading="isLoading">
     <div :class="!isFirstFlowComplete == true ? 'overlay' : ''" ></div>
     <!-- <div :class="isFirstFlowComplete == true  ? 'overlayAdd' : ''" ></div> -->
    <Navbar :isStepsShow="false" :isBackBtnShow="false" :isSiteSurvey="true"/>
    <div class="container">
      <div class="cardsContainer">
        <div class="cards" v-for="(roof,roofIndex) in allRoofsDetails" :key="roofIndex" @click="routeToRoof(roofIndex)">
          <div class="">
            <h4 class="cardHeading">Roof {{ roofIndex +1 }}</h4>
            <div class="infoCont">
              <div class="flexCont">
                <img v-bind:src="allIcon.get('Group2241')" class="icons" />
                <p class="content">{{roof.imagesCount}} {{roof.imagesCount > 1 ? "Photos" : "Photo"}}</p>
              </div>
              <div class="flexCont">
                <img v-bind:src="allIcon.get('Group2240')" class="icons" />
                <p class="content">{{roof.videosCount}} {{roof.videosCount > 1 ? "Videos" : "Video"}}</p>
              </div>
            </div>
          </div>
          <img v-bind:src="allIcon.get('Group2172')" class="arrowIcon" />
        </div>
      </div>
      <div class="btnsContainer" :class="[!isFirstFlowComplete == true ? 'zIndex100' : '']">
        <div class="addCardCont">
          <img v-bind:src="allIcon.get('plusCircleFill')" class="circleFillIcon" />
          <el-button type="primary" class="addCard" @click="routeToNewRoof">Add New Roof</el-button>
          <div class="tooltipContainer" v-if="!isFirstFlowComplete">
            <p class="tooltipText">
              {{ tooltipText }}
            </p>
            <div class="tooltipBtnCont">
              <p class="nextBtn" @click="cancelAllTooltips()">Cancel</p>
            </div>
          </div>
        </div>
        <el-button type="primary" class="btn" @click="submitSuccessfully()">Complete Site Survey</el-button>
      </div>
    </div>
    <el-button type="primary" class="btnMD" @click="submitSuccessfully()">Complete Site Survey</el-button>
  </div>
</template>
  
<script>
import API from '@/services/api';
import utils from '@/pages/siteSurvey/utils'
import {assignOrgInfoToLocalStorage} from '@/pages/siteSurvey/utils.js';

export default {
  name: "allRoofs",
  created() {
    this.fetchAllInformation();
  },
  data() {
    return {

      isFirstFlowComplete: false,
      tooltipText: "Click here to upload photos and videos for new roof.",
      referenceID: this.$route.params.referenceID,
      isLoading: false,
      allRoofsDetails:[],
      allIcon: utils.images,
      
    };
  },
  methods: {
    async submitSuccessfully() {
      let response;
      let patchData =  { 
          is_completed: true,
          updated_details:[],
        }
      response = await API.IMAGES_AND_VIDEOS.PATCH_CURRENT_ROOF(this.referenceID,patchData);
      console.log('Patch', response)
      this.$router.push({ name: 'filesUploadSuccessfully'});
      this.$router.push({ name: 'filesUploadSuccessfully'});
    },

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
      if(response.data.site_survey_details && response.data.site_survey_details.length>0){ 
        let allSiteSurveyDetails = [... response.data.site_survey_details];
        for(let i=0;i<allSiteSurveyDetails.length;i++){
          let imagesCount=0;
          let videosCount=0;
          for(let j=0;j<allSiteSurveyDetails[i]['files'].length;j++){
            if(allSiteSurveyDetails[i]['files'][j].file_type=='image')
            imagesCount++;
            else if(allSiteSurveyDetails[i]['files'][j].file_type=='video')
            videosCount++;
          }
          let imagesAndVideosCount = {
            "imagesCount": imagesCount,
            "videosCount": videosCount,
          };
          this.allRoofsDetails.push(imagesAndVideosCount);
        }
      }
    },
    routeToRoof(roofIndex){
      this.$router.push({ name: 'homeMapWithRoofNo', params: {referenceID :this.referenceID, roofNo: roofIndex +1} })
    },
    routeToNewRoof(){
      this.$router.push({ name: 'homeMapWithRoofNo', params: {referenceID :this.referenceID, roofNo: this.allRoofsDetails.length +1} })
    },
    cancelAllTooltips(){
      this.isFirstFlowComplete = true;
    }
  },
};
</script>
  
  <style  scoped>
.parentContainer {
  background-color: #e8edf2;
  min-height: 100vh;
}

.zIndex100 {
  z-index: 100;
}

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 2;
}

.overlayAdd {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.2);
  z-index: 2;
}


.tooltipContainer {
  visibility: visible;
  width: 315px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  bottom: -43px;
  left: 60px;
  margin-left: -60px;
  padding: 10px;
  border-radius: 4px;
}

.tooltipContainer {
  visibility: visible;
  bottom: -103px;
}

.tooltipContainer::after {
  content: "";
  position: absolute;
  top: -14px;
  left: 4vw;
  border-width: 7px;
  border-style: solid;
  border-color: transparent transparent #409eff transparent;
}

.tooltipContainerTwo {
  visibility: visible;
  width: 315px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  bottom: -94px;
  left: 58px;
  margin-left: -60px;
  padding: 10px;
  border-radius: 4px;
}

.tooltipContainerTwo {
  visibility: visible;
}

.tooltipContainerTwo::after {
  content: "";
  position: absolute;
  top: -14px;
  left: 4%;
  border-width: 7px;
  border-style: solid;
  border-color: transparent transparent #409eff transparent;
}

.tooltipContainerAddCorner {
  visibility: visible;
  width: 315px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  top: -94px;
  left: 58px;
  margin-left: -60px;
  padding: 10px;
  border-radius: 4px;
}

.tooltipContainerAddCorner {
  visibility: visible;
}

.tooltipContainerAddCorner::after {
  content: "";
  position: absolute;
  bottom: -14px;
  left: 4%;
  border-width: 7px;
  border-style: solid;
  border-color: #409eff transparent transparent transparent;
}

.tooltipText {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.tooltipBtnCont {
  display: flex;
  justify-content: flex-end;
  gap: 22px;
  margin-top: 16px;
}

.skipBtn,
.nextBtn {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.skipBtn {
  color: #ccc;
  font-weight: 500;
}

.container {
  position: relative;
  padding: 24px 32px 40px 32px;
  background-color: #fff;
  width: 80vw;
  margin: 1px auto;
  min-height: calc(100vh - 102px);
}

.cards {
  margin-bottom: 16px;
  border-radius: 4px;
  position: relative;
  box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.12);
  border: 1px solid #e0e0e0;
  background-color: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}

.cardHeading {
    color: #1c3366;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.content {
    font-size: 16px;
    color: #777;
}

.flexCont,
.infoCont {
    display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.infoCont {
    gap: 24px;
}

.arrowIcon {
    transform: rotate(90deg);
    cursor: pointer;
}

.addCardCont {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.addCard {
  color: #1c3366;
  font-size: 18px;
  font-weight: 600;
  background-color: #fff;
  border: none;
  padding: 0px;
}

.btnsContainer {
  width: 100%;
  background: #fff;
  padding-right: 24px;
  padding: 4px 4px 4px 4px;
  display: flex;
  position: relative;
  justify-content: space-between;
}

.circleFillIcon {
  cursor: pointer;
}

.btn {
  font-size: 18px;
  font-weight: 600;
  padding: 24px 16px;
}

.btnMD {
  display: none;
}

@media (max-width: 1100px) {
  .container {
    width: 100vw;
    padding: 24px;
    min-height: calc(100vh - 102px);
    margin-bottom: 50px;
  }


  .tooltipContainer::after {
    content: "";
    position: absolute;
    top: -14px;
    left: 40vw;
    border-width: 7px;
    border-style: solid;
    border-color: transparent transparent #409eff transparent;
  }

  .cards {
    margin-bottom: 10px;
  }

  .addCardCont {
    justify-content: flex-end;
  }

  .btn {
    display: none;
  }

  .btnMD {
    display: inherit;
    position: fixed;
    bottom: 0px;
    width: 100%;
    height: 47px;
    font-size: 18px;
    font-weight: 600;
    color: #f9f9f9;
    border-radius: 0px;
  }
  .btnsContainer {
    width: 100vw;
    background: #fff;
    margin-left: -24px;
    padding-right: 24px;
    padding: 4px 24px 4px 4px;
  }

  .relativePos {
    margin: 0px;
  }

  .tooltipContainer {
    bottom: -90px;
    left: 59vw;
    width: 44%;
  }

  .tooltipContainerTwo {
    width: 216px;
    bottom: -125px
  }

  .tooltipContainerAddCorner {
    right: 16px;
    left: auto;
  }

  .tooltipContainer::after {
    left: 37vw;
  }
}

@media (max-width: 500px) {
  .container {
    width: 100vw;
    padding: 16px;
    min-height: calc(100vh - 58px);
    margin-bottom: 50px;
  }

  .addCard {
    font-size: 14px;
  }

  .circleFillIcon {
    width: 18px;
  }

  .flexCont {
    gap: 4px;
  }

  .infoCont {
    gap: 16px;
  }

  .tooltipContainer {
    bottom: -100px;
    width: 54%;
    left: 55vw;
  }

  .tooltipContainerTwo {
    width: 216px;
    bottom: -120px
  }

  .btnsContainer {
    margin-left: -16px;
  }
}
</style>
  