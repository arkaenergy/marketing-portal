<template>
  <div class="parentClass" v-loading="isLoading">
  <div :class="[isLocationSearchTooltip == true ? 'overlay' : '',showBorderTooltip == true ? 'overlayBorderLine' : '']" ></div>
    <GMapMap
      :center="center"
      :zoom="zoom"
      :mapTypeId="mapType"
      :tilt="0"
      :class="['mapImageStyler', !referenceID ? 'mapHeightForStudio' : '']"
      :options="{
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false,
        gestureHandling : gestureHandling,
        minZoom: 4,
        maxZoom: 21,
      }"
      disabledDefaultUI="true"
      @center_changed="updateCenter"
      @zoom_changed="updateZoom"
      @dragend="dragend_method"
    >
      <div class="topBorderLine" v-if="showBorderTooltip">
        <div class="relativeBorderContainer">
          <div class="tooltipBorderContainer">
            <p class="tooltipText">
              Zoom-in and align your roof in the box.
            </p>
          </div>
          <div class="topLeft"></div>
          <div class="topRight"></div>
        </div>
      </div>
      <div class="leftBorderLine" v-if="showBorderTooltip">
      </div>
      <div class="rightBorderLine" v-if="showBorderTooltip">
      </div>
      <div class="bottomBorderLine" v-if="showBorderTooltip">
        <div class="bottomLeft"></div>
        <div class="bottomRight"></div>
      </div>
      <div class="inputContainer">
        <div :class="['inputCont',isLocationSearchTooltip == true ? 'zIndexInput' : '']">
          <GMapAutocomplete
            placeholder="Your Current Location"
            @place_changed="setPlace"
            @keydown="inputEntered"
            ref="autocomplete"
            class= "inputTag"
          >
          </GMapAutocomplete>
          <div :class="['tooltipContainer', tooltipCondition ? 'tooltipConditionStudio' : '']" v-if="isLocationSearchTooltip">
            <p class="tooltipText">
              {{ tooltipText }}
            </p>
            <div class="tooltipBtnCont" v-if="!tooltipCondition">
              <p class="nextBtn" @click="openRooftopTooltip">Next</p>
            </div>
          </div>
          <img
            v-bind:src="allIcon.get('Group2133')"
            class="locationLogo"
            @click="getLocation()"
            v-if="!isInputEntered"
          />
          <img v-bind:src="allIcon.get('Group2188')" @click="inputCleared()" class="crossIcon" v-else />
        </div>
        <el-button
          type="primary"
          class="cnfrmBtnDS"
          @click="dialogVisible = true"
          >Confirm Location
        </el-button>
        <div class="desPopup">
          <el-dialog
            v-model="dialogVisible"
            title="Tips"
          >
            <p class="textPopup">
              Are you sure that the marked location is correct?
            </p>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false" class="noBtn"
                  >No</el-button
                >
                <el-button
                  :loading="isButtonLoading"
                  type="primary"
                  @click="$route.name =='mapForDesignTool' ? afterConfirmLocationForDesignTool() : afterConfirmLocation()"
                  class="yesContinueBtn"
                >
                  Yes, Continue
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>

        <div class="locationEnablePopup">
          <el-dialog
            v-model="isLocPopupVisible"
            title="Tips"
          >
            <img v-bind:src="allIcon.get('Group2188')" class="crossIcon" @click="isLocPopupVisible = false"/>
            <img src="../../public/assets/Group2827.svg" class="locPathImg"/>
            <p class="headingPopup">
              Location access denied
            </p>
            <p class="contentLocPopup">You have blocked this site from tracking your location. To use this, you need to change your location setting in your browser.</p>
          </el-dialog>
        </div>
      </div>
      <el-button
        type="primary"
        class="cnfrmBtnMD"
        v-if="isContinueBtnMDShow"
        @click="isContinueBtnMDShow = false"
        >Confirm Location</el-button
      >
      <div class="containerMD" v-else>
        <p class="rus">Are you sure that the marked location is correct?</p>
        <div class="flexCont">
          <el-button class="noBtnMD" @click="isContinueBtnMDShow = true"
            >No</el-button
          >
          <el-button type="primary" :loading="isButtonLoading" class="yesCnfrmBtnMD" @click="$route.name =='mapForDesignTool' ? afterConfirmLocationForDesignTool() : afterConfirmLocation()"
            >Yes, Continue</el-button
          >
        </div>
      </div>
      <!-- <el-tooltip class="box-item"
        effect="dark"
        v-model:visible="visible"
        content="Put red dot on the center of your rooftop"
        placement="bottom">
        <img v-bind:src="allIcon.get('locationPin')" class="setMarkerPosition" alt="Marker"> -->
        <!-- <i class="fas fa-map-marker-alt setMarkerPosition"></i> -->
      <!-- </el-tooltip> -->
      <div class="setMarkerPositionCont">
        <img v-bind:src="allIcon.get('locationPin')" class="setMarkerPosition" alt="Marker">
          <div class="tooltipContainer2" v-if="isRooftopTooltip">
          <p class="tooltipText">
            Put red dot on the center of your rooftop
          </p>
        </div>
      </div>
    </GMapMap>
    <ImgInstructionsPopup
      v-if="isImgInstructionsPopupVisible"
      :isImgInstructionsPopupVisible="isImgInstructionsPopupVisible"
      @close="isImgInstructionsPopupVisible=false"
      :hideVideoPart="false"
    />
  </div>
</template>
  
<script >
import { v4 as uuidv4 } from 'uuid';
import { GOOGLE_API_KEY } from "@/services/api/index.js";
import ImgInstructionsPopup from "../pages/siteSurvey/imgInstructionsPopup.vue";
import API from '@/services/api';
import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';
import {containerName} from '@/services/api/index.js';
import {sasToken} from '@/services/api/index.js';
import {storageAccountName} from '@/services/api/index.js';
import utils from '@/pages/siteSurvey/utils';
import {assignOrgInfoToLocalStorage} from '@/pages/siteSurvey/utils.js';
import { isRil } from '../constants';

export default {
  components: {
    ImgInstructionsPopup,
  },
  async created() {
    // this.getLocation();
    if(!(this.$route.name == 'mapForDesignTool')){
      this.fetchAllInformation();
    }
    else{
      // The delay is because the new google is not recognised by the vue instance.
      this.delay(100).then(()=>{
      if(localStorage.getItem('google-map-info')){
        let mapInfo = JSON.parse(localStorage.getItem('google-map-info'))
        this.assignMapInfoForDesign(mapInfo);
      }
      // else
      // this.getLocation();
    })
    }  
    this.fnBrowserDetect();
  },
  data() {
    return {
      center: {
        lat: 28.5421285,
        lng: 77.3348087,
      },
      updatedCenter: {
        lat: 28.5421285,
        lng: 77.3348087,
      },
      mapType: "hybrid",
      zoom: 20,
      map: null,
      inputIcon: true,
      isContinueBtnMDShow: true,
      isImgInstructionsPopupVisible: false,
      dialogVisible: false,
      isLocPopupVisible: false,
      isInputEntered:false,
      visible:true,
      // isItNewRoof: true,
      isLoading: false,
      currentMapImageName:'',
      referenceID: this.$route.params.referenceID,
      roofNo: this.$route.params.roofNo,
      isButtonLoading:false,
      roofId:'',
      incomingMapImageName:'',
      gestureHandling:"greedy",
      alreadyExistingRoofsCount:0,
      latLongListForMarkers:[],
      gestureHandling:"greedy",
      isRooftopTooltip: false,
      isLocationSearchTooltip: true,
      allIcon: utils.images,
      tooltipText: null,
      showBorderTooltip: false,
      browserName: '',
      isRil
    };
  },
  computed:{
    uuid(){
        return  uuidv4();
      },
      isItNewRoof(){
        return (this.alreadyExistingRoofsCount < this.roofNo)
      },
      currentRoofForMap(){
        if(this.alreadyExistingRoofsCount < this.roofNo)
        return 0;
        else
        return this.roofNo -1;
    },

    tooltipCondition() {
      if(!this.referenceID) {
        this.tooltipText = "Search your location here.";
        return true;
      } else {
        this.tooltipText = "Search your location here to start a site survey";
        return false;
      }
    }
  },
  created(){
    if(this.isRil){
      this.center =  {
          lat: 37.5664491,
          lng: -122.0717669,
      }
      this.updatedCenter =  {
          lat: 37.5664491,
          lng: -122.0717669,
      }
    }
  },
  methods: {
    fnBrowserDetect(){   
      let userAgent = navigator.userAgent;
      if(userAgent.match(/chrome|chromium|crios/i)){
          this.browserName = "chrome";
        }else if(userAgent.match(/firefox|fxios/i)){
          this.browserName = "firefox";
        }  else if(userAgent.match(/safari/i)){
          this.browserName = "safari";
        }else if(userAgent.match(/opr\//i)){
          this.browserName = "opera";
        } else if(userAgent.match(/edg/i)){
          this.browserName = "edge";
        } else {
          this.browserName = "No browser detection";
        }  
        console.log('browserName', this.browserName);   
    },

    delay(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    },
    openRooftopTooltip() {
      if(!this.referenceID) {
        this.isLocationSearchTooltip = false;
        this.showBorderTooltip = true;
      } else {
        this.isLocationSearchTooltip = false;
        this.isRooftopTooltip = true;
      }
      
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
      if(!response.data.site_survey_details || !response.data.site_survey_details.length){
        this.alreadyExistingRoofsCount = 0;
        this.getLocation();
      }
      else{
        this.alreadyExistingRoofsCount = response.data.site_survey_details.length;
        this.center = {
          lat: parseFloat(response.data.site_survey_details[this.currentRoofForMap]['latitude']),
          lng: parseFloat(response.data.site_survey_details[this.currentRoofForMap]['longitude']),
        };
        this.updatedCenter = {
          lat: parseFloat(response.data.site_survey_details[this.currentRoofForMap]['latitude']),
          lng: parseFloat(response.data.site_survey_details[this.currentRoofForMap]['longitude']),
        };
        this.zoom =  response.data.site_survey_details[this.currentRoofForMap]['zoom'];
        this.incomingMapImageName = response.data.map_image_url[0]['file_name'];
        this.$refs.autocomplete.$el.value = response.data.address;
        if(response.data.site_survey_details.length >= this.roofNo)  // from here the roof ID will be used for patch if all roofs are already existing.
        this.roofId = response.data.site_survey_details[this.roofNo -1]['id'];
        for(let i=0;i<this.alreadyExistingRoofsCount;i++){
          let obj1 = {
            lat:  response.data.site_survey_details[i]['latitude'],
            lng : response.data.site_survey_details[i]['longitude'],
          }
          this.latLongListForMarkers.push(obj1);
        }
      }
    },
    async addNewRoofInfo(){
      const postData = {
        "latitude": (this.updatedCenter.lat).toFixed(16),
        "longitude": (this.updatedCenter.lng).toFixed(16),
        "address": this.$refs.autocomplete.$el.value,
        "zoom": this.zoom,
        "roof_details": `roof${this.roofNo}`,
        "token": this.referenceID,
      }
      try{
        const response = await API.IMAGES_AND_VIDEOS.ADD_NEW_ROOF(postData);
        this.roofId = response.data.id;
        ElMessage({
          message: 'Location Added',
          type: 'success',
        })
        return 1;
      }
      catch(e){
        console.error(e);
        ElMessage({
          message: 'Failed to add New Roof Information!',
          type: 'error',
        })
        return 0;
      }
    },
    async patchExistingRoofInfo(){
      const patchData = {
        "token": this.referenceID,
        "address": this.$refs.autocomplete.$el.value,
        "map_image":{
          "file_name":this.currentMapImageName,
          "file_info":'map_image',
          "file_type":"image",
        },
        "updated_details": [
          { 
            "id": this.roofId,
            "latitude": (this.updatedCenter.lat).toFixed(16),
            "longitude": (this.updatedCenter.lng).toFixed(16),
            "zoom": this.zoom,
            "uploaded_files":[]
          }
        ],
      }
      try{
        const response = await API.IMAGES_AND_VIDEOS.PATCH_CURRENT_ROOF(this.referenceID,patchData);
        ElMessage({
          message: 'Location Updated',
          type: 'success',
        })
        return 1;
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
    async afterConfirmLocation(){ 
      this.isButtonLoading = true;
      let response;
      // this.dialogVisible = false;
      this.currentMapImageName = this.uuid;
     await this.convertMapImageToBlob(); 
      try{
        if(this.alreadyExistingRoofsCount < this.roofNo){   //When It is a New Roof
          response =  await this.addNewRoofInfo();
          response =  await this.patchExistingRoofInfo();
        }
        else{
         response =  await this.patchExistingRoofInfo();
        }

        if(!response){
          this.isButtonLoading = false;
          return;
        }
      }
      catch(e){
        console.log(e);
        ElMessage({
          message: 'Something went wrong!',
          type: 'error',
        })
        return;
      }
      this.isButtonLoading = false;
      this.dialogVisible = false;
      this.$router.push({ name: 'uploadPhotosWithRoofNo', params: {referenceID: this.referenceID, roofNo: this.roofNo} })
    },
    async afterConfirmLocationForDesignTool(){
      let mapImageURL =  `https://maps.googleapis.com/maps/api/staticmap?center=${this.updatedCenter.lat},${this.updatedCenter.lng}&scale=2&zoom=${this.zoom}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}`;
      let mapInfo = {
        "url" : mapImageURL,
        "lat" : this.updatedCenter.lat,
        'lng' : this.updatedCenter.lng,
        "zoom": this.zoom
      }
      localStorage.setItem("google-map-info",JSON.stringify(mapInfo))
      this.$router.push({name : 'studio'})
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition, this.locationFetchFail);
      } else { 
        alert("Geolocation is not supported by this browser.");
      }
    },
    locationFetchFail(e) {
      this.isLocPopupVisible = true;
    },
    showPosition(position) {
      this.center = {
        "lat": position.coords.latitude,
        "lng": position.coords.longitude
      }
      this.updatedCenter = {
        "lat": position.coords.latitude,
        "lng": position.coords.longitude
      }
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var vm = this;
      if (geocoder) {
        geocoder.geocode({ 'latLng': latLng}, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log("current location",results[0].formatted_address); 
            vm.$refs.autocomplete.$el.value = results[0].formatted_address;
            vm.openRooftopTooltip();
          }
          else {
            console.log("Geocoding failed: " + status);
          }
        }); //geocoder.geocode()
      }      
      
    },
    updateCenter(latLng) {
       this.updatedCenter = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
      // this center is set on purpose so that when we will be dragging the centre it will be changed and then on clicking getLocation it will show change//
      //otherwise no change will be visible
      this.center = {
        lat: '',
        lng:'',
      };
      //-----------------------------------------------------------------------------------------------------------------------------------------//
    },
    updateZoom(zoom) {
      const prevZoom = this.zoom;
      this.zoom = zoom;
      if(prevZoom !== zoom){
          this.setAddressForGivenCoordinates();
      }
      console.log("updated zoom", this.zoom);
    },
    setPlace(place) {
      console.log("when place changed", place);
      this.center = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      this.updatedCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      this.openRooftopTooltip();
    },
    dragend_method(latLng){
      this.visible = false;
      this.setAddressForGivenCoordinates();
    },
    setAddressForGivenCoordinates(){
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(this.updatedCenter.lat, this.updatedCenter.lng);
      var vm = this;
      if (geocoder) {
        geocoder.geocode({ 'latLng': latLng}, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log("current location",results[0].formatted_address); 
            vm.$refs.autocomplete.$el.value = results[0].formatted_address;
          }
          else {
            console.log("Geocoding failed: " + status);
          }
        }); //geocoder.geocode()
      }      
    },
    inputEntered(){
      this.isInputEntered = true;
    },
    inputCleared(){
      this.$refs.autocomplete.$el.value = null;
      this.isInputEntered = false;
    },
    dialogClose() {
      this.dialogVisible = false;
      this.isImgInstructionsPopupVisible = true;
    },
    generateGoogleStaticMapImageLink(lat,lng,zoom){
      let mapImageURL =  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&scale=2&zoom=${19}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}&markers=color:red|label:1|${lat},${lng}`;
      for(let i=1; i< this.latLongListForMarkers.length; i++){
        mapImageURL += `&markers=color:red|label:${i+1}|${this.latLongListForMarkers[i]['lat']},${this.latLongListForMarkers[i]['lng']}`
      }
      return mapImageURL;
    },
   async convertMapImageToBlob(){
      let vm = this;
      let obj1 = {
        lat: this.updatedCenter.lat,
        lng : this.updatedCenter.lng
      }
      if(this.isItNewRoof){
        this.latLongListForMarkers.push(obj1);
      }
      else{
        this.latLongListForMarkers[this.roofNo -1] = {...obj1}
      }
      fetch(this.generateGoogleStaticMapImageLink(this.latLongListForMarkers[0].lat,this.latLongListForMarkers[0].lng,this.zoom))  //TODO change zoom from here as well (Maybe)
      .then(function (response) {
         return response.blob();
      })
      .then(function (blob) {
        vm.uploadFileToBlob(blob);
      });
    },
    async uploadFileToBlob(file){
      if (!file) return [];
      // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
      const blobService = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
      );
      // get Container - full public read access
      const containerClient = blobService.getContainerClient(containerName);
      // upload file
      await this.createBlobInContainer(containerClient, file);
      // get list of blobs in container
      return this.getBlobsInContainer(containerClient);
    },

    async createBlobInContainer(containerClient, file){
      // create blobClient for container
      // generate a unique name of File for Upload
      // this.currentMapImageName = this.uuid;
      let blobClient;
      if(this.incomingMapImageName){
       blobClient = containerClient.getBlockBlobClient(this.incomingMapImageName);
      }
      else{
       blobClient = containerClient.getBlockBlobClient(this.currentMapImageName);
      }
      // set mimetype as determined from browser with file upload control
      const options = { blobHTTPHeaders: { blobContentType: file.type } };
      // upload file
      let response = await blobClient.uploadData(file, options);
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
    assignMapInfoForDesign(mapInfo){
      this.center = {
        lat: mapInfo['lat'],
        lng: mapInfo['lng'],
      }
      this.updatedCenter = {
        lat: mapInfo['lat'],
        lng: mapInfo['lng'],
      }
      this.zoom = mapInfo['zoom']
      this.setAddressForGivenCoordinates();
    }
  },
};
</script>



<style scoped>
/* .parentClass{
    width: 1000px;
}
.mapImageStyler {
  height: 600px;
  width: 100%;
  transform: scale(calc(325 / 512));
  position: relative;
  top: -90px;
  left: -93px;
}
.setMarkerPosition{
    position: relative;
    top: -340px;
} */

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 2;
}

.overlayBorderLine {
  position: fixed;
  width: 100%;
  height: 180px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 101;
  display: none;
}


.mapImageStyler {
  height: calc(100vh - 156px);
  width: 100%;
  position: relative;
}

.topBorderLine,
.leftBorderLine,
.rightBorderLine,
.bottomBorderLine {
  position: absolute;
  right: 5vw;
  left: 5vw;
  border: 1px solid #fff;
  top: 100px;
}

.topBorderLine {
  width: auto;
}

.leftBorderLine {
  width: 0px;
  height: calc(100vh - 228px);
}

.rightBorderLine {
  right: 5vw;
  left: auto;
  width: 0px;
  height: calc(100vh - 228px);
}

.bottomBorderLine {
  width: auto;
  top: calc(100vh - 130px);
}

.relativeBorderContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

.topLeft {
  border-radius: 50%;
  color: #fff;
  border: 7px solid #fff;
  position: absolute;
  top: -7px;
  left: -7px;
}

.topRight {
  border-radius: 50%;
  color: #fff;
  border: 7px solid #fff;
  position: absolute;
  top: -7px;
  right: -7px;
}

.bottomLeft {
  border-radius: 50%;
  color: #fff;
  border: 7px solid #fff;
  position: absolute;
  bottom: -7px;
  left: -7px;
}

.bottomRight {
  border-radius: 50%;
  color: #fff;
  border: 7px solid #fff;
  position: absolute;
  bottom: -7px;
  right: -7px;
}

.mapHeightForStudio {
  height: calc(100vh - 100px);
}

.setMarkerPosition {
  /* pointer-events: none; */
  height: 48px;
  color: red;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
}

.setMarkerPositionCont {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: auto;
}

.inputContainer {
  position: absolute;
  top: 24px;
  display: flex;
  align-items: center;
  width: calc(100vw - 48px);
  margin: 0px 24px;
}

.inputCont {
  width: calc(100% - 168px);
  position: relative;
}

.inputTag {
  height: 56px;
  width: 100%;
  font-size: 16px;
  color: #222;
  padding: 16px;
  box-sizing: border-box;
  outline: none;
  border: 1px solid #ccc;
}

.zIndexInput {
  z-index: 100;
}

.tooltipContainer {
  visibility: visible;
  width: 325px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  bottom: -88px;
  left: 60px;
  margin-left: -60px;
  padding: 16px 10px;
  border-radius: 4px;
}

.tooltipBorderContainer {
  visibility: visible;
  width: 275px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 101;
  top: -34px;
  left: 50%;
  padding: 16px 10px;
  border-radius: 4px;
  transform: translate(-50%, -50%);
}

.tooltipConditionStudio {
  bottom: -56px;
  width: 196px;
}

.tooltipContainer2 {
  visibility: visible;
  width: 275px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 99;
  top: -108px;
  left: -62px;
  margin-left: -60px;
  padding: 16px 10px;
  border-radius: 4px;
}

.inputCont .tooltipContainer::after {
  content: "";
  position: absolute;
  top: -13px;
  left: 4%;
  border-width: 7px;
  border-style: solid;
  border-color: transparent transparent #409eff transparent;
}

.tooltipBorderContainer::after {
  content: "";
  position: absolute;
  bottom: -21px;
  left: 50%;
  transform: translate(-50%, -50%);
  border-width: 7px;
  border-style: solid;
  border-color: #409eff transparent transparent transparent;
}

.tooltipContainer2::after {
  content: "";
  position: absolute;
  bottom: -13px;
  left: 48%;
  border-width: 7px;
  border-style: solid;
  border-color: #409eff transparent transparent  transparent;
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

.inputCont:hover .tooltipContainer {
  visibility: visible;
}

.inputCont:hover .tooltipContainer2 {
  visibility: visible;
}

.locationLogo,
.crossIcon {
  position: absolute;
  right: 16px;
  top: 16px;
  cursor: pointer;
}

.cnfrmBtnDS {
  position: relative;
  width: 168px;
  font-size: 18px;
  font-weight: 600;
  color: #f9f9f9;
  height: 56px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  font-family: "Helvetica Neue";
  background-image: linear-gradient(to bottom, #409eff, #3092f7);
}

.cnfrmBtnMD,
.containerMD {
  display: none;
}

.stepContainer {
  display: none;
}

.desPopup :deep() .el-dialog {
  width: 328px;
  border-radius: 8px;
  margin-top: 35vh;
}

.desPopup :deep() .el-dialog__header {
  display: none;
}

.desPopup :deep() .el-dialog__body {
  padding: 33px 28px 24px 28px;
}

.desPopup :deep() .el-dialog__footer {
  padding: 0px 28px 31px 28px;
  text-align: center;
}

.locationEnablePopup :deep() .el-dialog {
  width: 338px;
  border-radius: 8px;
  margin-top: 30vh;
}

.locationEnablePopup :deep() .el-dialog__header {
  display: none;
}

.locationEnablePopup :deep() .el-dialog__body {
  position: relative;
  padding: 42px 16px 32px 16px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 16px;
}

.headingPopup,
.contentLocPopup {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  line-height: 1.38;
}

.contentLocPopup {
  font-weight: normal;
}

.locPathImg {
  width: 42px;
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

.zIndexBtn {
  z-index: 100;
}

@media (max-width: 1100px) {
  .locationEnablePopup :deep() .el-dialog {
    margin-top: 25vh;
}

  .overlayBorderLine {
    height: 173px;
    display: inherit;
  }

  .cnfrmBtnDS {
    display: none;
  }

  .inputContainer {
    width: calc(100vw - 32px);
    margin: 0px 16px;
  }

  .inputCont {
    width: 100%;
  }

  .inputTag {
    height: 49px;
    border-radius: 4px;
    padding: 16px 40px 16px 16px;
    z-index: 100;
    position: relative;
  }

  .locationLogo,
  .crossIcon {
    top: 12px;
    z-index :100;
  }

  .cnfrmBtnMD {
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
    width: 144px;
    border: 1px solid #707070;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  }

  .yesCnfrmBtnMD {
    font-size: 18px;
    font-weight: 600;
    padding: 13px 17px;
    height: 48px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  }

  .rightBorderLine {
    height: calc(100vh - 278px);
  }

  .leftBorderLine {
    height: calc(100vh - 278px);
  }

  .bottomBorderLine {
    width: auto;
    top: calc(100vh - 180px);
  }

  @media (max-width: 500px) {

    .overlayBorderLine {
      height: 130px;
    }
    .mapImageStyler {
      height: calc(100vh - 96px);
    }

    .mapHeightForStudio {
      height: calc(100dvh - 56px);
    }

    .stepContainer {
      padding: 16px;
      display: inherit;
    }

    .rus {
      font-size: 16px;
      margin-top: 12px;
      margin-bottom: 20px;
    }

    .flexCont {
      margin-bottom: 0px;
    }

    .rightBorderLine {
     height: calc(100dvh - 275px);
    }

    .leftBorderLine {
     height: calc(100dvh - 275px);
    }

    .safariLine {
      height: calc(100vh - 315px);
    }

    .bottomBorderLine {
      width: auto;
      top: calc(100dvh - 177px);
    }

    .safariBottomLine {
      width: auto;
      top: calc(100vh - 218px);
    }
  }
}
</style>