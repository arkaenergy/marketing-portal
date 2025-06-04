<template>
  <div class="parentContainer">
    <template v-for="(card, card_index) in totalInputs" :key="card_index">
     <div :class="card.isCardTooltipVisile || !isFirstFlowComplete == true || !isContinueBtnMDShow ? 'overlay' : ''" ></div>
     <div :class="isAddCornerTooltipVisible == true  ? 'overlayAdd' : ''" ></div>
    </template>
    <Navbar :stepNumber="3" />
    <div class="container">
      <p class="heading">
        How to record a video? <span class="click" @click="isImgInstructionsPopupVisible = true">Click Here</span>
      </p>
      <div class="cardsContainer">
        <div :class="['cards',card.isCardTooltipVisile == true ? 'zIndex100' : '']" v-for="(card, card_index) in totalInputs" :key="card_index">
          <button @click="toggle(card_index)" class="accordion" :class="[card.isOpen ?'active' : '']">
            {{card.id.charAt(0).toUpperCase()}}{{card.id.slice(1)}} ({{ card.imageDetails.length }})
            <img v-bind:src="allIcon.get('Group2172')" class="whiteArrFAQ" />
          </button>
          <div class="panel" v-show="card.isOpen"  v-loading="!allVideosLoaded">
            <div class="imgContainer" v-for="(image,index) in card.imageDetails" :key="index" v-loading="!image.imageURL">
              <video width="400" controls class="imgs" :src="image.imageURL">
                  Your browser does not support HTML5 video.
              </video>
              <img v-bind:src="allIcon.get('Group2170')" class="crossIcon" @click="patchExistingRoofInfo(image.imageName, card_index, index, true)"/>
            </div>
            <div class="relativePos">
            <label :for="card_index" class="labelBtn">
            <div class="imgContainer upldImgCntnr">
              <img v-bind:src="allIcon.get('cloudArrowUp')" class="cloudImg" />
              <p class="upldImgTxt">Upload Video</p>
              <input type="file" :id="card_index" @change="showFilePreview($event, card_index)" multiple="multiple" style="width: -webkit-fill-available;" accept="video/*"/><br/>
            </div>
          </label>
          <div class="tooltipContainerTwo" v-if="card.isCardTooltipVisile && !card.isCardTooltipOneVisible">
            <p class="tooltipText">
              {{ card.tooltipDes[1] }}
            </p>
            <div class="tooltipBtnCont">
              <p class="skipBtn" @click="openInput()">Yes</p>
              <p class="nextBtn" @click="switchTooltipCard(card_index)">No</p>
            </div>
          </div>
        </div>
      </div>
          <div class="tooltipContainer" v-if="card.isCardTooltipVisile && card.isCardTooltipOneVisible">
            <p class="tooltipText">
              {{ card.tooltipDes[0] }}
            </p>
            <div class="tooltipBtnCont">
              <p class="nextBtn" @click="cancelAllTooltips(card_index)">Cancel</p>
            </div>
          </div>
          <div class="tooltipContainerLocation" v-if="!card.isCardTooltipVisile && !card.isCardTooltipOneVisible && !isFirstFlowComplete">
            <p class="tooltipText">
              {{addNewCornerTooltip}}
            </p>
            <div class="tooltipBtnCont">
              <p class="nextBtn" @click="cancelAllTooltips(card_index)">Cancel</p>
            </div>
          </div>
        </div>
      </div>
      <div  :class="['btnsContainer', !isFirstFlowComplete && !inputs[0].isCardTooltipVisile && !inputs[0].isCardTooltipOneVisible == true ? 'zIndex100' : '']">
        <div class= addCardCont>
          <div class="tooltipContainerAddCorner" v-if="isAddCornerTooltipVisible">
            <p class="tooltipText">
              {{addNewCornerTooltip}}
            </p>
            <div class="tooltipBtnCont">
              <p class="nextBtn" @click="onClickNo(card_index)">Cancel</p>
            </div>
          </div>
          <img v-bind:src="allIcon.get('plusCircleFill')" @click="addInput" class="circleFillIcon" />
          <el-button type="primary" class="addCard" @click="addInput">Add New Location</el-button>  
        </div>        
        <el-button type="primary" class="btn" @click="dialogVisible = true" :disabled="isContinueBtnDisabled || isVideoGettingUploaded">Submit
          <div class="tooltipContainerDisBtn" v-if="isContinueBtnDisabled == true">
            <p class="tooltipTextDis">
              Please upload the rooftop video for location 1 to continue.
            </p>
          </div>
        </el-button>
        <el-dialog
          v-model="dialogVisible"
          title="Tips"
        >
          <p class="textPopup">
            Do you want to add photos and videos for another rooftop?
          </p>
          <template #footer>
            <span class="dialog-footer">
              <el-button  class="noBtn" @click="onContinueClick()"
              >Yes</el-button
              >
              <el-button
                :loading="isButtonLoading"
                type="primary"
                @click="noSubmitBtn()"
                class="yesContinueBtn"
              >
                No, Submit
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
    <el-button type="primary" class="btnMD" v-if="isContinueBtnMDShow" 
      @click="isContinueBtnMDShow = false" :disabled="isContinueBtnDisabled || isVideoGettingUploaded">Submit
      <div class="tooltipContainerDisBtn" v-if="isContinueBtnDisabled == true">
            <p class="tooltipTextDis">
              Please upload the rooftop video for location 1 to continue.
            </p>
      </div>
    </el-button>
    <div class="containerMD" v-else   :class="[!isContinueBtnMDShow  == true ? 'zIndex100' : '']">
      <p class="rus">Do you want to add photos and videos for another rooftop?</p>
      <div class="flexCont">
        <el-button class="noBtnMD" @click="onContinueClick()"
          >Yes</el-button
        >
        <el-button type="primary" :loading="isButtonLoading" class="yesCnfrmBtnMD" @click="noSubmitBtn()"
          >No, Submit</el-button
        >
      </div>
    </div>
    <FileUploadSuccessfullyPopup
      v-if="isFileUploadSuccessfullyPopupVisible"
      :isFileUploadSuccessfullyPopupVisible="isFileUploadSuccessfullyPopupVisible"
      @close="isFileUploadSuccessfullyPopupVisible=false"
    />
    <ImgInstructionsPopup
      v-if="isImgInstructionsPopupVisible"
      :isImgInstructionsPopupVisible="isImgInstructionsPopupVisible"
      :hideImgPart="false"
      @close="isImgInstructionsPopupVisible=false"
    />
  </div>
</template>
  
<script>
import { v4 } from 'uuid';
import Navbar from "@/components/Navbar.vue";
import { saveAs } from "file-saver";
import FileUploadSuccessfullyPopup from "@/pages/siteSurvey/fileUploadSuccessfullyPopup.vue";
import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';
import {containerName} from '@/services/api/index.js';
import API from '@/services/api';
import {sasToken} from '@/services/api/index.js'
import {storageAccountName} from '@/services/api/index.js';
import ImgInstructionsPopup from "@/pages/siteSurvey/imgInstructionsPopup.vue";
import utils from '@/pages/siteSurvey/utils'

export default {
  name: "uploadVideos",
  components: {
    FileUploadSuccessfullyPopup,
    ImgInstructionsPopup,
  },
  data() {
    return {
        isVideoGettingUploaded: false,
        allIcon: utils.images,
        isFirstFlowComplete: false,
        currentCardIndex: 1,
        allVideosLoaded: false,
        image: null,
        tooltipDes: ["Index1", "Index2"],
        isCardTooltipVisile: true,
        isCardTooltipOneVisible: true,
        isOpen: false,
        counter: 1,
        inputs: [{
        id: 'location 1',
        imageDetails: [],
        isOpen: true,
        tooltipDes: [`Click here to record and upload a 360-degree panoramic video from the middle of your rooftop.`, `Do you want to capture and upload more videos for corner 1.`],
        isCardTooltipVisile: false,
        isCardTooltipOneVisible: true,
        
      }],
      imageResponse: null,
      roofId: null,
      referenceID: this.$route.params.referenceID,
      isFileUploadSuccessfullyPopupVisible: false,
      isImgInstructionsPopupVisible: false,
      roofNo: this.$route.params.roofNo,
      dialogVisible: false,
      isContinueBtnMDShow: true,
      addNewCornerTooltip: "Click here if you want to upload a video from another location.",
      isAddCornerTooltipVisible: false,
      isContinueBtnDisabled: true,
      isCardVidCount: 0,
    };
  },

  created(){
    this.fetchAllInformation();
    this.isImgInstructionsPopupVisible = true;
  },

  computed:{
      totalInputs(){
        return this.inputs;
      }
  },

  methods: {

    openInput(){
      let fake = document.querySelector('.skipBtn');
      fake.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('0').click()
      })
    },

    onContinueClick() {
      this.$router.push({ name: 'allRoofsRef', params: {referenceID :this.referenceID} });
    },

    async noSubmitBtn() {
      let response;
      let patchData =  { 
          is_completed: true,
          updated_details:[],
        }
      response = await API.IMAGES_AND_VIDEOS.PATCH_CURRENT_ROOF(this.referenceID,patchData);
      this.$router.push({ name: 'filesUploadSuccessfully'});
    },


    onClickNo(cardIndex){
      this.inputs[this.currentCardIndex].isCardTooltipVisile = false;
      this.isAddCornerTooltipVisible = false;
    },

    isCardContainImages() {
      for(let i=0;i<this.inputs.length;i++){
        if(this.inputs[i].imageDetails.length > 0) {
          this.inputs[i].isCardTooltipVisile = false;
          this.isFirstFlowComplete = true;
          // this.inputs[i+1].isCardTooltipVisile = true;
          // break;
        }
        else{
          // continue
          this.inputs[i].isCardTooltipVisile = true;
          break;

        }
      }
    },



    toggle(index) {
      this.inputs[index]["isOpen"] = !this.inputs[index]["isOpen"];
    },



    switchTooltipCard(cardIndex) {
      // if(this.inputs[cardIndex].isCardTooltipVisile == true) {
      //   this.inputs[cardIndex].isCardTooltipVisile = false;
      //   this.inputs[cardIndex].isCardTooltipOneVisible = false;

      // } else {
        
      // }
      // this.currentCardIndex = cardIndex+1;
        this.inputs[cardIndex].isCardTooltipVisile = false;
        this.isFirstFlowComplete = false;
        this.inputs[cardIndex].isCardTooltipOneVisible = false;
    },

    cancelAllTooltips(cardIndex) {
      this.inputs[cardIndex].isCardTooltipVisile = false;
      this.isFirstFlowComplete = true;
    },





    async patchExistingRoofInfo(imageName, cardIndex, imageIndex=null, toDelete = false){
      let patchData = {};
      if(!toDelete){
        patchData = {
          // "latitude": this.updatedCenter.lat,
          // "longitude": this.updatedCenter.lng,
          // "zoom": this.zoom,
          // "roof_details": "roof1",
          "token": this.referenceID,
          "updated_details": [
            {
              "id": this.roofId,
              "uploaded_files":[
                {
                  "file_name": imageName,
                  "file_info": `location ${cardIndex}`,
                  "file_type": "video"
                },
              ]
            }
          ]
        }
      }
      else{
        this.inputs[cardIndex]["imageDetails"].splice(imageIndex, 1);
        if(this.inputs[cardIndex]["imageDetails"].length == 0 && cardIndex <= 0) {
            this.isCardVidCount--;
          }
        patchData = {
        // "latitude": this.updatedCenter.lat,
        // "longitude": this.updatedCenter.lng,
        // "zoom": this.zoom,
        // "roof_details": "roof1",
        "token": this.referenceID,
        "updated_details": [
          {
            "id": this.roofId,
            "deleted_files":[imageName]
          }
        ]
      }
      }
      try{
        const response = await API.IMAGES_AND_VIDEOS.PATCH_CURRENT_ROOF(this.referenceID, patchData);
      }
      catch(e){
        console.error(e);
        ElMessage({
          message: 'Failed to Update Roof Information!',
          type: 'error',
        })
        return 0;
      }
    },

    async fetchAllInformation(){
      this.isLoading = true;
      let response;
      try{
        response = await API.IMAGES_AND_VIDEOS.FETCH_FILES(this.referenceID);
        let isMsgShow = utils.isCompletedTrue(response);
        // this if condition is to check whether we are getting message for file sumbitted successfully or not.
        if (isMsgShow) {
          return;
        }
        this.roofId = response.data.site_survey_details[this.roofNo-1]['id']; 
        let allFiles = response.data.site_survey_details[this.roofNo-1].files;
        var imageFiles = [];
        for(let i=0;i<allFiles.length;i++){
          if(allFiles[i].file_type == "video"){
            let cornerNumber = allFiles[i].file_info.replace(/^\D+/g, "");
            cornerNumber-=1;
            let imageObject = {
              id: `location ${cornerNumber}`,
              imageDetails: [],
              isOpen: true,
            };
            if(imageFiles.length==0 || !imageFiles[cornerNumber]){
            imageFiles[cornerNumber] = imageObject;
            }
            imageFiles[cornerNumber]["imageDetails"].push({
              imageName: allFiles[i].file_name,
              imageURL: allFiles[i].file_url,
            });
          }
        }
        for(let j=0;j<imageFiles.length;j++){
          if(imageFiles[j]){
            if(j==0){
              this.inputs[this.inputs.length-1]["imageDetails"] = imageFiles[j]["imageDetails"]
            }else{
              this.addInput();
              this.inputs[this.inputs.length-1]["imageDetails"] = imageFiles[j]["imageDetails"]
            }
          }else{
            if(j){
              this.addInput();
            }
          }
        }
        this.allVideosLoaded = true;
        for(let k=0;k<this.inputs.length;k++) {
          if(this.inputs[k]["imageDetails"].length > 0 && k <= 0) {
            this.isCardVidCount++;
          }
        }
        this.isCardContainImages();
      }
      catch(e){
        console.error(e);
        ElMessage({
          message: 'Failed to fetch Information!',
          type: 'error',
        })
        this.allVideosLoaded = true;
        return;
      }
      this.isLoading = false;
      // this.convertMapImageToBlob();
    },

    async deleteBlobIfItExists(containerClient, blobName){
      // include: Delete the base blob and all of its snapshots.
      // only: Delete only the blob's snapshots and not the blob itself.
      const options = {
        deleteSnapshots: 'include' // or 'only'
      }

      // Create blob client from container client
      const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.deleteIfExists(options);

      },

      async downloadFiles(){
        try {
            if (fileList.selectedOptions.length > 0) {
                reportStatus("Downloading files...");
                for await (const option of fileList.selectedOptions) {
                    var blobName = option.text;
                    const blobServiceClient = new BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`);
                    const props = await blobServiceClient.getProperties();
                    props.cors.push({ allowedOrigins: '*', allowedMethods: '*'});
                    const containerClient = blobServiceClient.getContainerClient(containerName);
                    const blobClient = containerClient.getBlobClient(blobName);
                    const downloadBlockBlobResponse = await blobClient.download(blobName, 0, undefined);
                    const data = await downloadBlockBlobResponse.blobBody;
                    // Saves file to the user's downloads directory
                    FileSaver.saveAs(data, blobName); // FileSaver.js
                }
            } else {
                
            }
        } catch (error) {
          
        }
      },

      async createBlobInContainer(containerClient, file, cornerIndex, currentImageName){
      // create blobClient for container
      const blobClient = containerClient.getBlockBlobClient(currentImageName);
      // set mimetype as determined from browser with file upload control
      const options = { blobHTTPHeaders: { blobContentType: file.type } };

      // upload file
      let response = await blobClient.uploadData(file, options);
      let imageResponse = this.patchExistingRoofInfo(currentImageName, cornerIndex);
      },


      async getBlobsInContainer(containerClient){
      const returnedBlobUrls= [];

      // get list of blobs in container
      // eslint-disable-next-line
      for await (const blob of containerClient.listBlobsFlat()) {
        // if image is public, just construct URL
        returnedBlobUrls.push(
          `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
        );
      }

      return returnedBlobUrls;
      },


      async uploadFileToBlob(file, cornerIndex, currentImageName){
      if (!file) return [];

      // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
      const blobService = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
      );
      // get Container - full public read access
      const containerClient = blobService.getContainerClient(containerName);
      // upload file
      await this.createBlobInContainer(containerClient, file, cornerIndex, currentImageName);
      // get list of blobs in container
      return this.getBlobsInContainer(containerClient);
      },




      async showFilePreview(e, index) {
      this.cardTooltipSwitch(index);
      this.isVideoGettingUploaded = true;
      let files = e.target.files || e.dataTransfer.files;
      var totalImagesTillNow = this.inputs[index]["imageDetails"].length;
      if(totalImagesTillNow >= 0 && index <= 0) {
        this.isCardVidCount++;
      }
      if (!files.length) return;
      for(let i=0;i<files.length;i++){
        this.inputs[index]["imageDetails"].push({
          imageName: "",
          imageURL: "",
        });
      }
      for(let i=0;i<files.length;i++){
        let cornerIndex = index+1;
        this.uuid = v4();
        let currentImageName = this.uuid + "_location_" + cornerIndex + "_video_" + i;
        const uploadFileToBlob =  await this.uploadFileToBlob(files[i], index+1, currentImageName);
        this.createImage(files[i], index, currentImageName, totalImagesTillNow+i);
      }
    },

    cardTooltipSwitch(index) {
        this.inputs[index].isCardTooltipOneVisible = false;
    },

    cardTooltipFunc(cardIndex) {
        this.inputs[cardIndex+1].isCardTooltipOneVisible = true;
    },



    createImage(file, index, currentImageName, indexInput) {
      let reader = new FileReader();
      let vm = this;
      reader.onload = (e) => {
        vm.image = e.target.result;
        this.inputs[index]["imageDetails"][indexInput].imageName = currentImageName;
        this.inputs[index]["imageDetails"][indexInput].imageURL = e.target.result;
      };
      this.isVideoGettingUploaded = false;
      reader.readAsDataURL(file);
    },

    addInput() {
      this.inputs.push({
        id: `location ${++this.counter}`,
        imageDetails: [],
        isOpen: true,
        tooltipDes: ["Click here to capture and upload the photo of the next corner of the roof in a clockwise direction (Left of the previous corner).",`Click here if you want to capture and upload more photos for corner ${this.counter}.`],
        isCardTooltipVisile: false,
        isCardTooltipOneVisible: true,
      });
      this.isFirstFlowComplete = true;
    }
  },

  watch: {
    isCardVidCount(value) {
      this.isCardVidCount = value;
      if(this.isCardVidCount >= 1) {
        this.isContinueBtnDisabled = false;
      } else {
        this.isContinueBtnDisabled = true;
      }
    }
  }

};
</script>
  
<style  scoped>

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

.relativePos {
    position: relative;
    margin: 16px 0px;
  }
.tooltipContainer {
  visibility: visible;
  width: 315px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  bottom: -108px;
  left: 60px;
  margin-left: -60px;
  padding: 10px;
  border-radius: 4px;
}

.tooltipContainerLocation {
  visibility: visible;
  width: 315px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  bottom: -187px;
  left: -15px;
  margin-left: -60px;
  padding: 10px;
  border-radius: 4px;
}


.tooltipContainer {
  visibility: visible;
}

.tooltipContainerLocation {
  visibility: visible;

}


.tooltipContainer::after {
  content: "";
  position: absolute;
  top: -14px;
  left: 6%;
  border-width: 7px;
  border-style: solid;
  border-color: transparent transparent #409eff transparent;
}


.tooltipContainerLocation::after {
  content: "";
  position: absolute;
  top: -14px;
  left: 60%;
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
  bottom: -110px;
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

.tooltipContainerDisBtn {
  visibility: hidden;
  width: auto;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  top: -43px;
  right: 9px;
  padding: 10px;
  border-radius: 4px;
}

.btn:hover .tooltipContainerDisBtn {
  visibility: visible;
}

.tooltipContainerDisBtn::after {
  content: "";
  position: absolute;
  bottom: -14px;
  right: 8%;
  border-width: 7px;
  border-style: solid;
  border-color: #409eff transparent transparent transparent;
}

.tooltipText {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.tooltipTextDis {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  white-space: initial;
  text-align: left;
  line-height: 1.4;
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
  color: #fff;
  font-weight: 600;
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

.parentContainer {
  background-color: #e8edf2;
  min-height: 100vh;
}
.container {
  position: relative;
  padding: 24px 32px 40px 32px;
  background-color: #fff;
  width: 80vw;
  margin: 1px auto;
}

.heading {
  font-size: 16px;
  color: #222;
  margin-bottom: 22px;
}

.click {
  font-weight: bold;
  color: #1c3366;
  cursor: pointer;
}

.cards {
  margin-bottom: 16px;
  position: relative;
}

.accordion {
  background-color: #f0f3f8;
  color: #222;
  cursor: pointer;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  outline: none;
  transition: 0.4s;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
  height: 40px;
}

.panel {
  padding: 0px 22px;
  background-color: #fff;
  /* overflow: hidden; */
  transition: max-height 0.2s ease-out;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 4px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  row-gap: 0px;
}

.imgContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0px;
}

.upldImgCntnr {
  width: 168px;
  height: 159px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
  cursor: pointer;
  padding-top: 24px;
  margin: 0px;
}

.labelBtn {
  margin: 16px 0px;
}

.upldImgCntnr>input {
  display: none;
}

.crossIcon {
  position: absolute;
  top: -8px;
  right: -8px;
  cursor: pointer;
}

.imgs {
  width: 168px;
  height: 159px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
}

.upldImgTxt {
  color: #777;
  font-size: 19px;
}

.accordion.active .whiteArrFAQ {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrFAQ {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
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
  display: flex;
  justify-content: space-between;
  width: 77vw;
  background: #fff;
  margin-left: -16px;
  padding-right: 24px;
  position: relative;
  padding: 4px 24px 4px 4px;
}

.circleFillIcon {
  cursor: pointer;
}

.btn {
  font-size: 18px;
  font-weight: 600;
  padding: 24px 16px;
  width: 120px;
}

.btnMD {
  display: none;
}

.parentContainer :deep() .el-dialog {
  width: 328px;
  border-radius: 8px;
  margin-top: 35vh;
}

.parentContainer :deep() .el-dialog__header {
  display: none;
}

.parentContainer :deep() .el-dialog__body {
  padding: 33px 28px 24px 28px;
}

.parentContainer :deep() .el-dialog__footer {
  padding: 0px 28px 31px 28px;
  text-align: center;
}

.noBtn {
  font-size: 15px;
  font-weight: 600;
  width: 128px;
  height: 41px;
  border: 1px solid #999;
}

.yesContinueBtn {
  font-size: 15px;
  font-weight: 600;
  height: 41px;
  width: 128px;
}

.textPopup {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  text-align: center;
  line-height: 1.38;
}

@media (max-width: 1100px) {
  .container {
    width: 100vw;
    padding: 24px;
    min-height: calc(100vh - 158px);
    margin-bottom: 0px;
    padding-bottom: 50px;
  }

  .tooltipContainer::after {
  content: "";
  position: absolute;
  top: -14px;
  left: 4%;
  border-width: 7px;
  border-style: solid;
  border-color: transparent transparent #409eff transparent;
}

  .cards {
    margin-bottom: 10px;
  }

  .panel {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
    row-gap: 16px;
    padding:8px 16px 16px 16px;
  }

  .imgContainer {
    margin: 0px;
    gap: 8px;
    margin-top: 8px;;
  }

  .imgs,
  .upldImgCntnr {
    width: 100%;
  }

  .labelBtn {
    margin: 0px;
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
    z-index: 1;
  }

  .tooltipContainerDisBtn {
    width: 310px;
    right: 50%;
    top: -67px;
    transform: translate(50%, 0%);
  }

  .tooltipContainerDisBtn::after {
    right: 48%;
  }

  .btnsContainer {
    width: 100vw;
    background: #fff;
    margin-left: -16px;
    padding-right: 24px;
    position: relative;
    padding: 4px 24px 4px 4px;
  }

  .relativePos {
    margin: 0px;
  }

  .tooltipContainer {
    bottom: -108px;
    width: 315px;
  }


  .tooltipContainerLocation {
    bottom: -155px;
    width: 40%;
    left: 62vw;
  }

  .tooltipContainerTwo {
    width: 216px;
    bottom: -125px
  }

  .tooltipContainerAddCorner {
    right: 16px;
    left: auto;
  }

  .tooltipContainerAddCorner::after {
    left: 58%;
  }

  .containerMD {
    display: inherit;
    position: fixed;
    bottom: 0px;
    width: 100%;
    padding: 16px;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    background-color: #fff;
  }

  .rus {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    margin-top: 24px;
    margin-bottom: 32px;
  }

  .flexCont {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .noBtnMD {
    font-size: 18px;
    font-weight: 600;
    padding: 13px 17px;
    height: 48px;
    width: 160px;
    border: 1px solid #707070;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  }

  .yesCnfrmBtnMD {
    font-size: 18px;
    font-weight: 600;
    padding: 13px 17px;
    height: 48px;
    width: 160px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  }

  .parentContainer :deep() .el-loading-mask {
    z-index: 0;
  }
}

@media (max-width: 500px) {
  .container {
    width: 100vw;
    padding: 16px;
    min-height: calc(100vh - 98px);
    padding-bottom: 50px;
  }

  .heading,
  .accordion,
  .addCard {
    font-size: 14px;
  }

  .whiteArrFAQ,
  .circleFillIcon {
    width: 18px;
  }

  .panel {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    row-gap: 8px;
    padding:8px 8px 12px 8px;
  }

  .upldImgCntnr {
    height: 150px;
  }

  .imgs {
    height: 150px;
  }

  .crossIcon {
    width: 16px;
    top: -6px;
    right: -6px;
  }
  .tooltipContainer {
    bottom: -116px;
    width: 287px;
  }

  .tooltipContainerLocation {
    bottom: -146px;
    left: 47vw;
    width: 63%;
  }

  .tooltipContainerTwo {
    visibility: visible;
    width: 270px;
    background-color: #409eff;
    color: #fff;
    position: absolute;
    z-index: 100;
    bottom: -94px;
    left: -76px;
    margin-left: -60px;
    padding: 10px;
    border-radius: 4px;
}

.tooltipContainerTwo {
    width: 160px;
    bottom: -138px;
    left: inherit;
    right: 0px;
  }

.tooltipContainerTwo::after {
    content: "";
    position: absolute;
    top: -14px;
    left: 80%;
    border-width: 7px;
    border-style: solid;
    border-color: transparent transparent #409eff transparent;
}



}
</style>
  
