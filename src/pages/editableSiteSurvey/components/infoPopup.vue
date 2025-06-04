<template>
    <div class="infoParentContainer" >
        <el-dialog v-model="visiblePopupp" title="Instructions" :before-close="handleClose"     >
            <div v-loading="isPOILoading">
            <span slot="title">
        <div class="custom-dialog-header">
          <!-- Add your custom header content here -->
          <h3>POI/Path</h3>
          <img src="../assets/crossnobaground.svg" alt=""  @click="handleClose" />
        </div>
      </span>
            <div class="container"  >
                <div class="el-dialog__body">
                    <div class="info-container">
                <GoogleMapForSiteSurvey v-if="visiblePopupp" :showInput="showInput"
                 :key="deletePathCounter" :question="question" :poiMode="true" :questionIdOfPOI="questionIdOfPOI"
                  :poiToBeEdited="poiToBeEdited" @POIAddedORChanged="POIAddedORChanged" @triggerLoader="triggerLoader" :completPath.sync="completPath" :isPoiMode="isPoiMode"/>
                
                <ToolbarPath @click-poimode="handlepoimode"  v-if="!isPoiMode&&!isInfoCardVisible"  :question="question" @click_pathcomplete="clickPathComplete" @triggerLoader="triggerLoader"/>
                <div class="infocardcontainer">
                <InfoCard v-if="isInfoCardVisible&&infoType" :isInsidePopup="true" :markerDetail="markerDetailToSend" :isPOIMode="true"
                @updateMarker="updateMarkerInArray"  @deleteFile="deleteFileFromCorner"  :infoType="infoType" @handleCardClose="handleCardClose" 
                :maxFiles="maxFiles || max_files" />
                <!-- @deleteFile="deleteFileFromCorner" -->
            </div>
                <!-- <img src="../assets/cross.svg" alt="" class="closeIcon" @click="handleClose()" /> -->
</div>
</div>
            </div>
        </div>
        </el-dialog>
    </div>
</template>

<script >
import API from '@/services/api';
import InfoCard from '../components/infoCard.vue';
import GoogleMapForSiteSurvey from '../components/googleMapForSiteSurvey.vue';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import ToolbarPath from './toolbarPath.vue';
import { GOOGLE_API_KEY } from "@/services/api/index.js";
import { uploadFileToBlob } from "@/utils.js";
import { v4 } from 'uuid';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";

export default {
    components: {
        InfoCard,
        ToolbarPath,
        GoogleMapForSiteSurvey,
    },

    props: {
        isInfoPopupVisible: {
            type: Boolean,
            default: false,
        },
        showInput: {
            type: Boolean,
            default: true,
        },
        markerDetail:{
            type: Object,
            default: {
                title:"1",
                description:"1",
                lat:"1",
                lng:"1",
                files:[],
            }
            // required: true,
        },
        currentSection:{
            type: Object,
            required: false,
        },
        maxFiles:{
            type: String,
            required: false,
        },
        questionIdOfPOI:{
            type: Number
        },
        poiToBeEdited:{
            type: Object,
            default:{},
        },
        isInfoCardVisibleFromProp:{
            type: Boolean,
            default: true,
        },
        keyToAccessCurrentCoordinate:{
            type: Number,
            default:1,
        },
        isPath:{
            type:Boolean,
            default:false
        }
    },

    data() {
        return {
            driverObj: null,
            counter:0,
            question: JSON.parse(localStorage.getItem('boundaryQuestion')),
            isInfoCardVisible:true,
            coordinatesInfoForPOI:{},
            coordinatesInfoForPath:{},
            markerDetailToSend:{},
            markerList:{},
            isPOILoading:false,
            isPoiMode:false,
            infoType:'poi',
            mapImageUUID:'',
            completPath:false,
            keyToAccessCurrentCoordinateCount:this.$props.keyToAccessCurrentCoordinate,
            max_files: '',
        };
    },

    computed:{
        ...mapState(useEditableSiteSurveyStore, {
            deletePathCounter: "DELETE_PATH_COUNTER",
            siteSurveyStore: "GET_COMPLETE_STATE",
            isPoiGuideDisabled: state => state.isPoiGuideDisabled,
            isGuideEnabled: state => state.isGuideEnabled,
        }),
    },

    mounted() {
        if(this.currentSection){
            // console.log("current section inside popup", this.currentSection);
            let requiredQ = this.currentSection.fields.find(q=> q.id === this.questionIdOfPOI);
            this.max_files = requiredQ.additional_info.max_files;
            // console.log("here 2 max_files", this.max_files)
        }
        if (!this.isPoiGuideDisabled){
            if (!this.isGuideEnabled) return
            this.driverObj = driver({
                // showProgress: true,
                showButtons: ['done', 'next'],
                nextBtnText: 'Skip',
                allowInteractions: false,
                allowClose: false,
                popoverClass: `helper-guide-popover`,
                steps: [
                    { element: '#guidance-poi-btn', popover: { title: 'This button allows you to select a Point of Interest on the map.'}},
                    { element: '#guidance-path-btn', popover: { title: 'This button allows you to create a custom path on the map.'}}
                ]
            })
            setTimeout(() => {
                console.log('infoPopup ran here')
                this.driverObj?.drive()
            }, 1000)
            this.changePoiGuideStatus(true)
        }
        this.isInfoCardVisible = this.isInfoCardVisibleFromProp;
        this.markerDetailToSend = this.markerDetail;
        this.keyToAccessCurrentCoordinateCount=this.$props.keyToAccessCurrentCoordinate
        if(Object.keys(this.poiToBeEdited).length>0){
            this.markerDetailToSend = this.poiToBeEdited; // auto populate the current poi in infocard which needs to be edited
            this.markerDetailToSend.description = this.markerDetailToSend.description|| "Description"
        }
        this.markerDetailToSend.index = Number(this.keyToAccessCurrentCoordinate);
        this.counter++;
        this.initialiseMarkersListFromLS();
        this.pathCounterTrigger()
    },

    methods: {
        ...mapActions(useEditableSiteSurveyStore, {
            updatePOICounter :"UPDATE_POI_COUNTER",
            showPathFunc:'SHOW_PATH',
            pathCounterTrigger:'PATH_COUNTER_TRIGGER',
            changePoiGuideStatus: 'CHANGE_POI_GUIDE_STATUS',
        }),
        closeModal() {
            this.$emit("cancelDelete");
        },
        triggerLoader(){
            this.isPOILoading = true;
          
        },
        POIAddedORChanged(keyToAccessCurrentCoordinate){
            this.$emit('update:keyToAccessCurrentCoordinate',keyToAccessCurrentCoordinate)
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = this.storedAnswers[this.questionIdOfPOI]
            this.coordinatesInfoForPOI = JSON.parse(JSON.stringify(currentPOIJson['answer']['corners']['coordinates'])) || {};
            this.markerDetailToSend = this.coordinatesInfoForPOI[keyToAccessCurrentCoordinate];
            this.markerDetailToSend.description =this.markerDetailToSend.description ||"Description"
            // this.updatePOICounter(); // so that it can change the count in the store and in the generic field it can listen in the watch and can update the value in the card
            this.isInfoCardVisible = true;
            this.isPOILoading = false;
        },
        initialiseMarkersListFromLS(){
            this.questionId = this.questionIdOfPOI
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.questionObject = this.storedAnswers[this.questionId];
            this.markerList = {...this.questionObject.answer.corners.coordinates};
            // this.setCurrentMarker(1);
        },
        async updateMarkerInArray([markerChanged, action, isFromInfoPopup]){
            this.keyToAccessCurrentCoordinateCount=markerChanged.display_name;
            // console.log("updating marker&&&&&&&&&&&&&&&&&&&&&&",markerChanged);
            this.initialiseMarkersListFromLS();
            delete markerChanged.index;
            delete markerChanged.isLastMarker;
            if(markerChanged.id){
                markerChanged = await this.patchCornerAPICall(markerChanged);
                this.markerList[this.keyToAccessCurrentCoordinateCount] =  JSON.parse(JSON.stringify(markerChanged));
                this.questionObject.answer.corners.coordinates = this.markerList;
                this.storedAnswers[this.questionId] = this.questionObject;
            }
            else{

                this.markerList[this.keyToAccessCurrentCoordinateCount] =  JSON.parse(JSON.stringify(markerChanged));
                this.questionObject.answer.corners.coordinates = this.markerList;
                this.storedAnswers[this.questionId] = this.questionObject;
                let answerJson = await this.allCornersAPI()
                this.storedAnswers[this.questionId].answer.corners.coordinates = this.convertCoordinateArrayToJson(answerJson.answer.corners.coordinates); //updating LS as getting response from backend
            }
            this.updateMarkersInLS();
            this.updatePOICounter(); // so that it can change the count in the store and in the generic field it can listen in the watch and can update the value in the card
           this.pathCounterTrigger()
            // this.handleClose(true);
            this.$emit("close");
        },
        convertCoordinateArrayToJson(coordinatesInfo) {
            if (Array.isArray(coordinatesInfo)) {
                let Obj = {};
                coordinatesInfo.forEach((coordinateObj) => {
                let displayName = coordinateObj.display_name;
                if(coordinateObj?.coordinates){
                    Obj[displayName] = {
                    name: coordinateObj.title,
                    title: coordinateObj.title,
                    zoom: coordinateObj.zoom,
                    files: coordinateObj.files || [],
                    map_image:  coordinateObj.map_image,
                    description: coordinateObj.description,
                    display_name: coordinateObj.display_name,
                    id: coordinateObj.id,
                    coordinates: coordinateObj?.coordinates,
                    length:coordinateObj.length
                };
                }
               else{
                Obj[displayName] = {
                    lat: Number(coordinateObj.latitude) || Number(coordinateObj.lat),
                    lng: Number(coordinateObj.longitude) || Number(coordinateObj.lng),
                    name: coordinateObj.title,
                    title: coordinateObj.title,
                    zoom: coordinateObj.zoom,
                    files: coordinateObj.files || [],
                    map_image:  coordinateObj.map_image,
                    description: coordinateObj.description,
                    display_name: coordinateObj.display_name,
                    id: coordinateObj.id,
                };
               }
                });
                return Obj;
            }
            return coordinatesInfo;
        },
        async deleteFileFromCorner([corner,corner_file_name]){
            const cornerObject = {...corner};
            delete cornerObject.index;
            cornerObject.deleted_files = [corner_file_name];
            const modifiedMarker = await this.patchCornerAPICall(cornerObject);
            // console.log("modifiedMarker", modifiedMarker);
            this.markerDetailToSend = JSON.parse(JSON.stringify(modifiedMarker));
            //update the LS with the total list of files
            this.updateMarkersInLS();
        },
        async patchCornerAPICall(corner){
            // let patchData=corner;
            // if(patchData?.center){
            //   if(Array.isArray(patchData?.center)){
            //     patchData.center={
            //         'lat':corner.center[0],
            //         'lng':corner.center[1]
            //     }
             
            //   }
            // }
            this.removeThumbnailURL();
            corner = this.removeThumbnailUrlFromGivenCorner(corner)
            const response =corner?.length? await API.EDITABLE_SITE_SURVEY_API.PATCH_PATH(corner.id,corner) : await API.EDITABLE_SITE_SURVEY_API.PATCH_CORNER(corner.id,corner);
            return response.data;
        },
        async allCornersAPI(){
            this.removeThumbnailURL();
            const response = await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(this.storedAnswers[this.questionId]);
            return response.data;
        },
        removeThumbnailURL(){
            for(let marker in this.markerList){
                if(this.markerList[marker] && this.markerList[marker]?.files.length > 0){
                    for(let file of this.markerList[marker].files){
                        delete file.url;
                    }
                }
            }
        },
        removeThumbnailUrlFromGivenCorner(corner){
            for(let file of corner.files){
                delete file.url
            }
            return corner;
        },
        updateMarkersInLS(){
            localStorage.setItem('overallMappingOfQidToAnsJson',JSON.stringify(this.storedAnswers));
        },
        visiblePopupp() {
            return this.$props.isInfoPopupVisible;
        },

        handleClose() {   
      if(this.$props.poiToBeEdited?.id)    {  
            let answer= JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = answer[this.$props.questionIdOfPOI];
            currentPOIJson['answer']['corners']['coordinates'][this.$props.poiToBeEdited.display_name]=this.$props.poiToBeEdited;         
            answer[this.$props.poiToBeEdited] = JSON.parse(JSON.stringify(currentPOIJson))
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(answer));
        };
            this.$emit("close");
        },
        handleCardClose(){
            this.isInfoCardVisible=false
        },
        handlepoimode(){
            this.isPoiMode=true
        },
      async  clickPathComplete(){
        const allPathsData=JSON.parse(localStorage.getItem("allPathsDataRef")) || [];
            this.infoType='path'
            this.isInfoCardVisible=true;
            this.completPath=true;
            localStorage.setItem('allPathsData', JSON.stringify(allPathsData));
            localStorage.removeItem('allPathsDataRef');


    // this.updateFinalPOIInLS(1)
 
        },

        async updateFinalPOIInLS(keyToAccessCurrentCoordinate) {
            // this.$emit('triggerLoader')
            let currentCoordinateJson = this.coordinatesInfoForPath[keyToAccessCurrentCoordinate];
            if (currentCoordinateJson?.map_image?.length > 0) {
                this.mapImageUUID = currentCoordinateJson.map_image[0]['file_name']; // so that I can use the existing file name and override the previos image in blob storage
            }
            await this.convertMapImageToBlob()
            this.coordinatesInfoForPath[keyToAccessCurrentCoordinate]['map_image'] =
                [{
                    "file_info": `POI ${keyToAccessCurrentCoordinate}`,
                    "file_name": this.mapImageUUID,
                    "file_type": "map_image",
                }]
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = this.storedAnswers[this.questionIdOfPOI]
            currentPOIJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.coordinatesInfoForPath));
            this.storedAnswers[this.questionIdOfPOI] = JSON.parse(JSON.stringify(currentPOIJson))
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            // await this.updateMarkersAPICall(keyToAccessCurrentCoordinate); //TODO: need to remove keyToAccessCurrentCoordinate from backend when getting map_image from response
            // this.$emit("POIAddedORChanged", keyToAccessCurrentCoordinate);
            // this.updateMarkersAPICall(keyToAccessCurrentCoordinate);
        },
        generateGoogleStaticMapPathImageLink(lat, lng, zoom) {
const pathCordinates=JSON.parse(localStorage.getItem('allPathsData'));
let pathLat=pathCordinates[0].lat;
let pathLng=pathCordinates[0].lng;
const latLngString = pathCordinates.map(item => `${item.lat},${item.lng}`).join('|');
            let mapImageURL = `https://maps.googleapis.com/maps/api/staticmap?center=${pathLat},${pathLng}&scale=2&zoom=${16.5}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}&path=color:white|${latLngString}`;
            return mapImageURL;
        },
        async convertMapImageToBlob(lat, lng, zoom) {
            let vm = this;
            const response = await fetch(this.generateGoogleStaticMapPathImageLink(lat, lng, zoom))  //TODO change zoom from here as well (Maybe)
            const blob = await response.blob();
            if (!vm.mapImageUUID)
                vm.mapImageUUID = v4();
            return await uploadFileToBlob(blob, vm.mapImageUUID);
        },
      
        // updateMarkerInArray(data){
        //     this.$emit("updateMarker",data);   
        // }
    },
    watch:{
        isGuideEnabled: {
            handler(val){
                if(!val) this.driverObj?.destroy()
            }
        },
        poiToBeEdited:{
            immediate:true,
            handler(val){
                if(val?.length||val.coordinates){
                    this.infoType='path'
                }else{
                    this.infoType='poi'
                }
            }

        },
    
        // isPath:{
        //     immediate:true,
        //     handler(val){
             
        //     }
        // },
    }
};
</script>


<style scoped>
.infoParentContainer :deep() .el-dialog {
    width: 80vw;
    border-radius: 8px;
    margin-top: 8vh;
    position: relative;
}

.infoParentContainer :deep() .el-dialog__header {
    display: none;
}

.infoParentContainer :deep() .el-dialog__body {
    padding: 0px;
    border-radius: 8px;
    overflow: hidden;
}

.closeIcon {
    position: absolute;
    top: 24px;
    right: 24px;
    background-color: #fff;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
}
.custom-dialog-header {
    background-color: #E8EDF2; 
    color: #000; 
    padding:12px 16px 12px 16px;
    border-radius: 8px; 
    display: flex;
    justify-content: space-between;
  }
  .infocardcontainer{
    height:calc(100% - 32px)
  }

  .infoParentContainer :deep() .el-dialog__body {
    border-radius: 8px;
    overflow: hidden;
}
  .info-container {
    height: 100%;
}

@media (max-width: 900px) {
    .infoParentContainer :deep() .el-dialog {
    width: 100vw;
    margin-top: 0vh;
    position: fixed;
}

}
</style>