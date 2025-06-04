<template>
    <div class="mapContainer" id="guidance-map-container" v-loading="loadMap" @click="handleContainerClick">
        <div v-show="pathDistanceDisplay" class="total-distance-text" :style="pathDistanceStyle || getTextPosition()">Total: {{ pathDistanceDisplay }}m</div>
        <!-- <img src="../assets/map.svg" alt="" class="mapImg" /> -->
        <GMapMap :center="center" :zoom="zoom" :mapTypeId="mapType" :tilt="0" 
        :options="{
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false,
        gestureHandling: gestureHandling,
        minZoom: 4,
        maxZoom: 21,
        mapId: '420d254e3af914b9'
        }" 
        disabledDefaultUI="true" @center_changed="updateCenter" @zoom_changed="updateZoom" @dragend="dragend_method"
        @click="addMarker" ref="GMapRef"
        >

            <GMapPolyline
            v-for="(poly,index) in pathPolylineData"
        :path="poly"
        :key="mapKey"
        :options="{
          strokeColor:pathCount===index? '#409EFF':'white',
          strokeWeight: 4,        
        }"
          ref="polylineRef"
      />
      <div class="iconContainer" :class="poiMode? 'positionIconP':'positionIconB'">
                <el-tooltip class="item" effect="light" content="Recenter" placement="top">
                    <img src="../assets/location-pin-blue.svg" alt="" class="icons" @click="recenterMap"/>
                </el-tooltip>
            </div>
        </GMapMap>
        <img v-if="siteSurveyStore.showSearchLocationInput && showInput" v-bind:src="allIcon.get('locationPin')"
            class="setMarkerPosition" alt="Marker">
        <GMapAutocomplete v-show="false" placeholder="Search address" @place_changed="setPlace" ref="autocomplete"
            class="input">
        </GMapAutocomplete>
        <div class="inputContainer" id="address-search-guidance" v-if="siteSurveyStore.showSearchLocationInput && showInput">
            <GMapAutocomplete placeholder="Search address" @click="setGoogleMapGuideId(null)" @place_changed="setPlace"
						@keydown="onPressEnter" ref="autocomplete" class="input">
            </GMapAutocomplete>
            <div class="location" @click="getLocation()">
                <img src="../assets/location.svg" alt="" class="locationIcon" />
            </div>
            <el-button type="primary" class="confirmBtn" @click="confirmButtonClicked">Confirm Location</el-button>
            <img src="../assets/search.svg" alt="" class="searchIcon" />
        </div>
    </div>
</template>


<script>
import API from '@/services/api';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import { uploadFileToBlob } from "@/utils.js";
import { v4 } from 'uuid';
import { GOOGLE_API_KEY } from "@/services/api/index.js";
import utils from '@/pages/siteSurvey/utils';



export default {
    name: "googleMapForSiteSurvey",
    components: {

    },
    props: {
        showInput: {
            type: Boolean,
            default: true,
        },
        question: {
            type: Object,
        },
        poiMode: {
            type: Boolean,
            default: false,
        },
        questionIdOfPOI: {
            type: Number
        },
        poiToBeEdited: {
            type: Object,
            default: {},
        },
        completPath:{
            type:Boolean,
            default:false,
        },
        isPoiMode:{
            type:Boolean,
            default:false,
        }
    },
    data() {
        return {
            pathDistanceDisplay: 0,
            pathDistanceStyle: null,
            distanceWarningInstance: null,
            loadMap: false,
            isRecenter: false,
            lastVertexLatLng: {},
            polylineData:[
        //     [
        //   { lat: 12.957354637693559, lng: 77.64040746929318 },
        //   { lat: 12.956408250153872, lng:77.63983853444995},
        //   { lat: 12.956312655252892, lng:77.64069193671476},
        //   // Add more coordinates as needed
        // ],[
        //   { lat: 12.956736821560735, lng: 77.6411280311945 },
        //   { lat: 12.956469156098715, lng:77.64116770404561},
        //   { lat: 12.956439415474051, lng:77.64136301654351},
        //   // Add more coordinates as needed
        // ]
            ],
            // siteSurveyStore: useEditableSiteSurveyStore(),
            center: {
                lat: 37.78454178741125,
                lng: -122.4037594380287,
            },
            updatedCenter: {
                lat: 37.78454178741125,
                lng: -122.4037594380287,
            },
            address: '',
            state: 'California',
            mapType: "hybrid",
            zoom: 19,
            zoomToBeSend: 19,
            gestureHandling: "greedy",
            markers: [], // Array to store markers
            poiCoordinates: [],// array to store POI coordinates
            currentPOICounter: 0,
            currentMaxPOIDisplayName: 0,
            counter: 1,
            pathCounter: 1,
            markerAndNumberMapping: [],
            pathMapping: [],
            markersObjectArray: [],
            mapObj: {},
            pathmapObj: {},
            markersAndCornersArray: [],
            pathCornersArray: [],
            undoArray: [],
            redoArray: [],
            finalCoordinatesStructure: {},
            currentAnswerJson: {},
            poly: null,
            mapImageUUID: "",
            isFirstTime: true,
            allIcon: utils.images,
            pathCordinates: [],
            polyPath: null,
            finalPathCordinates: {},
            pathCoordinates:[],
            polylineObjectArray:[],
            pathCount:0,
            pathRefData:[],
            undoRedoPathArray:[],
            undoPathArray:[],
            redoPathArray:[],
            mapKey:0,
            activePathData:[],
            pathArrayData:[]
           
        }
    },

    created(){
        if(this.isPathToobarVisible){
            this.triggerDrawPath()

        }
    },
    async mounted() {
        if(this.undoArrayTemp) this.undoArray = this.undoArrayTemp
        if(this.redoArrayTemp) this.redoArray = this.redoArrayTemp
        if (this.currentGoogleMapGuideStep == 0){
            if (this.siteSurveyStore.showSearchLocationInput && this.showInput && !this.siteSurveyStore.showDropdown && !this.siteSurveyStore.showToolbarButtons){
                this.setGoogleMapGuideId('#address-search-guidance');
            }
            this.setGoogleMapGuideStep(1)
        }
    //     localStorage.removeItem('allPathsData');
    // localStorage.removeItem('finalPathCordinates')
        await this.$refs.GMapRef.$mapPromise;  // wait for google Map object to get loaded and then start using it
        this.poly = await new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#ffffff',
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        this.polyPath = await new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#ffffff',
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
       localStorage.removeItem("overallMappingOfQidToAnsJsonCopy")

        this.currentAnswerJson = this.storedAnswers[this.question.id]
        this.fetchMapDetails(this.currentAnswerJson);
        this.finalCoordinatesStructure = this.currentAnswerJson['answer']['corners']['coordinates'] || {};
        localStorage.setItem('finalCoordinatesStructure', JSON.stringify(this.finalCoordinatesStructure));
     

        const pathCordinatesArray = JSON.parse(localStorage.getItem("pathCornersArray")) || {};
        this.finalPathCordinates = JSON.parse(localStorage.getItem("finalPathCordinates")) || {};
        localStorage.setItem('finalPathCordinates', JSON.stringify(this.finalPathCordinates));
        this.initializeMarkersAndCornersArray();
        // await  this.delay(500);
        if (this.poiMode) {
            await this.fetchAndInitializePOIDetails();
        }
        this.fetchCoordinatesAndLabels().then(() => {
            if (this.currentAnswerJson['answer']?.additional_info?.is_boundary_completed) {
                if (this.currentAnswerJson['answer']?.additional_info?.isAllCornersPassed)
                    this.showAllBoundariesList(); // this will increase count in store which will trigger isBoundaryCompleted in computed and then watch will call this.complete()
                else
                    this.completeBoundaries();
            }
            else {
                this.isFirstTime = false; // otherwise in If condition inside complete() it will be set to false; this Else is Imp ow its already false before Complete() executed.
            }
        });
        this.updateMarkersCount();
        if(this.isPathToobarVisible){
            this.triggerDrawPath()

        }
    },
    computed: {
        ...mapState(useEditableSiteSurveyStore, {
            siteSurveyStore: "GET_COMPLETE_STATE",
            isBoundaryCompleted: "IS_BOUNDARY_COMPLETED",
            undoCounter: "UNDO_COUNTER",
            redoCounter: "REDO_COUNTER",
            undoPathCounter: "UNDO_PATH_COUNTER",
            redoPathCounter: "REDO_PATH_COUNTER",
            boundaryCompletedCounter: "BOUNDARY_COMPLETED_COUNTER",
            pathDistanceValue:"PATH_DISTANCE",
            pathIndex:'PATH_INDEX',
            isPathDelete:'PATH_DELETE',
            isDrawPath:'ALLOW_PATH_DRAW',
            isPathEditable:'PATH_EDITABLE',
            isPathToobarVisible:'SHOW_PATH_TOOLBAR',
            totalMarkers: state => state.totalMarkers,
            undoArrayTemp: state => state.undoArrayTemp,
            redoArrayTemp: state => state.redoArrayTemp,
            currentGoogleMapId: state => state.currentGoogleMapId,
            currentGoogleMapGuideStep: state => state.currentGoogleMapGuideStep,
            showDropdown: state => state.showDropdown,
        }),
        pathPolylineData(){   
            return [...this.polylineData]
        },
        
     
    },
    methods: {
        ...mapActions(useEditableSiteSurveyStore, {
            showToolbarButtons: "SHOW_TOOLBAR_BUTTONS",
            changeMarkersCount: "CHANGE_MARKERS_COUNTER", // TODO: need to remove this and use updateMarkersCount
            completeBoundaries: "COMPLETE_BOUNDARIES",
            showAllBoundariesList: "SHOW_ALL_CORNERS_LIST",
            updateMarkersCount: "UPDATE_MARKERS_COUNT",
            updateUndoAndRedoLength: "UPDATE_UNDO_AND_REDO_LENGTH",
            updateUndoAndRedoPathLength:'UPDATE_UNDO_AND_REDO_PATH_LENGTH',
            showToolbarFunc: "SHOW_TOOLBAR",
            pathDistance: "CAPTURE_PATH_DISTANCE",
            showPathFunc: 'SHOW_PATH',
            noPathDelete:'NOT_PATH_DELETE',
            pathCounterTrigger:'PATH_COUNTER_TRIGGER',
            triggerDrawPath:'ALLOW_DRAW_PATH',
            deletePoiCounter:'DELETE_POI_COUNT',
            setBoundaryRestriction: 'SET_BOUNDARY_RESTRICTION',
            pathNotEditable:'PATH_EDIT_MODE',
            changeUndoTemp: 'CHANGE_UNDO_TEMP',
            changeRedoTemp: 'CHANGE_REDO_TEMP',      
            setGoogleMapGuideId: 'CHANGE_GOOGLE_MAP_GUIDE_ID',
            setGoogleMapGuideStep: 'CHANGE_GOOGLE_MAP_GUIDE_STEP',      
        }),
        handleContainerClick(){
            if (this.currentGoogleMapId == '#guidance-map-container') this.setGoogleMapGuideId(null)
        },
        recenterMap() {
            this.isRecenter = true;
            // Check if a valid center has been set
            let currentQuestionId = this.poiMode ? this.questionIdOfPOI : this.question.id
            let currentAnswerJson = this.storedAnswers[currentQuestionId];
            let center_info = currentAnswerJson.answer.corners.center;
            let lat = center_info.lat || 0;
            let lng = center_info.lng || 0;
            this.center = { 
                
                lat :this.center?.lat || 37.78454178741125,
                lng : this.center?.lng || -122.4037594380287,
             };
            this.$refs.GMapRef.$mapPromise.then((map) => {
                    var latLng = new google.maps.LatLng(this.center.lat, this.center.lng);
                    map.setCenter(latLng);
                    map.setZoom(this.zoom);
                });
            this.isRecenter = false;
        },
        getTextPosition(){
            const path = this.pathPolylineData[this.pathPolylineData.length-1];
            if (!path || path.length === 0) return;
            
            // display text at the end of the polyline
            const endIndex = Math.floor(path.length - 1);
            const endPoint = path[endIndex];
            
            // Convert latlng to pixel position
            const overlay = new google.maps.OverlayView();
            overlay.setMap(this.$refs.GMapRef.$mapObject);
            const projection = overlay.getProjection();
            if (!projection) return;
            
            const point = projection.fromLatLngToContainerPixel(endPoint);
            // Convert pixel position to CSS position
            return {
                left: `${point.x}px !important`,
                top: `${point.y}px !important`
            };
        },
        confirmButtonClicked() {
            this.showToolbarButtons();
            this.$emit('hide-full-description');
        },
        async fetchAndInitializePOIDetails() {
            this.updateUndoAndRedoPathLength(this.undoPathArray.length,this.redoPathArray.length)
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = this.storedAnswers[this.questionIdOfPOI];
            let poiAnswerJson=Object.values(this.storedAnswers[this.questionIdOfPOI]['answer']['corners']['coordinates'])
           
          let pathArray=[] ;
          let pathArrayDetails=[]
          this.pathArrayData=[]
           poiAnswerJson.map(d=>{if(d?.coordinates||d?.length){
            pathArrayDetails.push(d)
            pathArray.push(d.coordinates)
           }});
           this.pathArrayData=[...pathArrayDetails]
          localStorage.setItem("allPathsData",JSON.stringify(pathArray));
          localStorage.setItem("pathCornersArray",JSON.stringify(pathArray))
            this.polylineData= JSON.parse(localStorage.getItem("allPathsData")) || [];
            this.pathCount=this.pathIndex||this.pathIndex==0?this.pathIndex: this.polylineData?.length
            this.activePathData=this.pathArrayData[this.pathCount]||{}
            this.coordinatesInfoForPOI = JSON.parse(JSON.stringify(currentPOIJson['answer']['corners']['coordinates'])) || {};
            localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(this.coordinatesInfoForPOI));
            let poiKeyArray = Object.keys(this.coordinatesInfoForPOI)
            let editMode = false;
            // this.currentPOICounter = poiKeyArray.length;
            poiKeyArray.forEach(key => {
                this.currentMaxPOIDisplayName = Math.max(this.coordinatesInfoForPOI[key].display_name, this.currentPOICounter);
            })
            this.currentPOICounter = this.currentMaxPOIDisplayName;

            for (let i = 0; i < poiKeyArray.length; i++) {
                let eachPOIJson = this.coordinatesInfoForPOI[poiKeyArray[i]]
                let coordinates = {
                    latLng: {
                        lat: Number(eachPOIJson?.latitude) || Number(eachPOIJson?.lat)||0,
                        lng: Number(eachPOIJson?.longitude) || Number(eachPOIJson?.lng)||0
                    }
                }
                let latOfPOIToBeEdited = parseFloat(this.poiToBeEdited.lat || this.poiToBeEdited.latitude)
                let lngOfPOIToBeEdited = parseFloat(this.poiToBeEdited.lng || this.poiToBeEdited.longitude)
                // In case of edit mode of POI, check whether its the same POI which needs to be edited by comparing its lat, lng
console.log( latOfPOIToBeEdited ,this.areNumbersEqualWithTolerance(latOfPOIToBeEdited, parseFloat(coordinates.latLng.lat)),this.areNumbersEqualWithTolerance(lngOfPOIToBeEdited, parseFloat(coordinates.latLng.lng)));
                
                if (latOfPOIToBeEdited && this.areNumbersEqualWithTolerance(latOfPOIToBeEdited, parseFloat(coordinates.latLng.lat))
                    && this.areNumbersEqualWithTolerance(lngOfPOIToBeEdited, parseFloat(coordinates.latLng.lng))) {
                    editMode = true;
                }
                else{
                    editMode = false;}
                await this.addPOI(coordinates, true, editMode, poiKeyArray[i]);
            }
        },
        areNumbersEqualWithTolerance(num1, num2, decimalPlaces = 24) {
            console.log('num2: ', num2);
            console.log('num1: ', num1);
            const roundedNum1 = Number(num1.toFixed(decimalPlaces));
            const roundedNum2 = Number(num2.toFixed(decimalPlaces));
            return roundedNum1 === roundedNum2;
        },
        async updateFinalPOIInLS(keyToAccessCurrentCoordinate) {
            this.$emit('triggerLoader')
            let currentCoordinateJson = this.coordinatesInfoForPOI[keyToAccessCurrentCoordinate];
            if (currentCoordinateJson?.map_image?.length > 0) {
                this.mapImageUUID = currentCoordinateJson.map_image[0]['file_name']; // so that I can use the existing file name and override the previos image in blob storage
            }
            await this.convertMapImageToBlob(currentCoordinateJson.lat, currentCoordinateJson.lng, this.zoom)
            this.coordinatesInfoForPOI[keyToAccessCurrentCoordinate]['map_image'] =
                [{
                    "file_info": `POI ${keyToAccessCurrentCoordinate}`,
                    "file_name": this.mapImageUUID,
                    "file_type": "map_image",
                }]
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = this.storedAnswers[this.questionIdOfPOI]
            currentPOIJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.coordinatesInfoForPOI));
            this.storedAnswers[this.questionIdOfPOI] = JSON.parse(JSON.stringify(currentPOIJson))
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            // await this.updateMarkersAPICall(keyToAccessCurrentCoordinate); //TODO: need to remove keyToAccessCurrentCoordinate from backend when getting map_image from response
            this.$emit("POIAddedORChanged", keyToAccessCurrentCoordinate);
            this.updateMarkersAPICall(keyToAccessCurrentCoordinate);
        },

        async updateFinalPathInLS(keyToAccessCurrentCoordinate) {
            this.$emit('triggerLoader')
            let currentCoordinateJson = this.coordinatesInfoForPOI[keyToAccessCurrentCoordinate];
            if (currentCoordinateJson?.map_image?.length > 0) {
                this.mapImageUUID = currentCoordinateJson.map_image[0]['file_name']; // so that I can use the existing file name and override the previos image in blob storage
            }
            await this.convertMapImageToBlobForPath(currentCoordinateJson.lat, currentCoordinateJson.lng, this.zoom)
            this.coordinatesInfoForPOI[keyToAccessCurrentCoordinate]['map_image'] =
                [{
                    "file_info": `Path ${keyToAccessCurrentCoordinate}`,
                    "file_name": this.mapImageUUID,
                    "file_type": "map_image",
                }]
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson = this.storedAnswers[this.questionIdOfPOI]
            currentPOIJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.coordinatesInfoForPOI));
            this.storedAnswers[this.questionIdOfPOI] = JSON.parse(JSON.stringify(currentPOIJson))
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            // await this.updateMarkersAPICall(keyToAccessCurrentCoordinate); //TODO: need to remove keyToAccessCurrentCoordinate from backend when getting map_image from response
            this.$emit("POIAddedORChanged", keyToAccessCurrentCoordinate);
            this.updateMarkersAPICall(keyToAccessCurrentCoordinate);
        },
        async updateFinalAnswerInLS() {
            // the currentAnswerJson may not have updated map address,center,zoom or additional info, so need to fetch the latest
            let latestInfo = this.latestInfo();
            this.currentAnswerJson['answer']['additional_info'] = JSON.parse(JSON.stringify(latestInfo.additional_info)); // so that additional_info is not lost while updating LS;
            this.currentAnswerJson['answer']['corners']['center'] = latestInfo.corners.center;
            this.currentAnswerJson['answer']['corners']['zoom'] = latestInfo.corners.zoom;
            this.currentAnswerJson['answer']['corners']['address'] = latestInfo.corners.address;
            //------------------------------------------------------------------------------------------------------------------------//
            this.currentAnswerJson['answer']['corners']['coordinates'] = this.finalCoordinatesStructure;
            this.storedAnswers[this.question.id] = this.currentAnswerJson;
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            await this.updateMarkersAPICall(); // using await and callig API first so that in the local storage so that id is present for each cordinate.
            this.changeMarkersCount();
            this.updateMarkersCount();
        },
    
        latestInfo() {
            let storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentQuestionId = this.poiMode ? this.questionIdOfPOI : this.question.id
            let currentAnswerJson = storedAnswers[currentQuestionId];
            return currentAnswerJson['answer'];
        },
        async updateMarkersAPICall(keyToAccessCurrentCoordinate) {
            let payload;
            if (!this.poiMode&&!this.$props.completPath){
                payload = this.storedAnswers[this.question.id];
                this.center = payload.answer.corners.center;
            }
            else{
                payload = this.storedAnswers[this.questionIdOfPOI];
            }
            // await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(payload);
            //TODO
            let response;
            if (!this.poiMode) {  // here not calling API for POI and we will be calling API from popup and not from here.
                try {
                    response = await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(payload);
                }
                catch (e) {
                    console.error(e);
                    ElMessage({
                        message: 'Failed to update!',
                        type: 'error',
                    })
                }
            }
            
            let updatedCoordinates = response?.data?.answer?.corners?.coordinates;
            this.updateCoordinateIdInLS(updatedCoordinates)
        },
        updateCoordinateIdInLS(updatedCoordinates) {
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let questionId = this.poiMode ? this.questionIdOfPOI : this.question.id;
            if (!this.poiMode) {
                this.currentAnswerJson = this.storedAnswers[questionId];
                this.finalCoordinatesStructure = this.currentAnswerJson['answer']['corners']['coordinates'] || {};
                updatedCoordinates.forEach(coordinateObj => {
                    this.finalCoordinatesStructure[coordinateObj['display_name']].id = coordinateObj.id  // just after adding the marker i need to update the coordinate's
                })                
                 localStorage.setItem('finalCoordinatesStructure', JSON.stringify(this.finalCoordinatesStructure));
                // id in my local storage which can be used for files upload for   
                this.currentAnswerJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.finalCoordinatesStructure)) // that coordinate  
                this.storedAnswers[this.question.id] = JSON.parse(JSON.stringify(this.currentAnswerJson))
            }
            else {
                // let currentPOIJson= this.storedAnswers[questionId];
                // this.coordinatesInfoForPOI = JSON.parse(JSON.stringify(currentPOIJson['answer']['corners']['coordinates'])) || {};
                // updatedCoordinates.forEach(coordinateObj=>{
                //     this.coordinatesInfoForPOI[coordinateObj['display_name']].id =  coordinateObj.id
                //      // just after adding the marker i need to update the coordinate's
                // })   // id in my local storage which can be used for files upload for that coordinate
                // currentPOIJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.coordinatesInfoForPOI));
                // this.storedAnswers[questionId] = JSON.parse(JSON.stringify(currentPOIJson))  
            }
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
        },
        delay(time) {
            return new Promise(resolve => setTimeout(resolve, time));
        },
        async addPOI(event, isFetchMode, isEditMode, keyOfCoordinatesInfoForPOI) {
            if (isEditMode) {
                isFetchMode = false; // its because when a partucular poi is in edit mode, I want it to behave it like a when its just added by user and not by fetching
                // but except when in this case I dont want it to be pushed in local storage once again 
            }
            if (!isFetchMode) {
                this.currentPOICounter++;
                if (this.currentPOICounter > this.currentMaxPOIDisplayName + 1) // It is because at a time only 1 POI needs to be entered. 
                    return;                                                                 // and total incoming POI is Object.keys(this.coordinatesInfoForPOI)
                // so just Object.keys(this.coordinatesInfoForPOI)+1 is allowed   
            }
            const newPosition = event.latLng;
            this.poiCoordinates.push(newPosition)
            let gmapRef = this.$refs.GMapRef
            let map = gmapRef.$mapObject
            this.mapObj = gmapRef.$mapObject;
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
            let pinBackground, marker;
            if (isFetchMode) {
                pinBackground = new PinElement({
                    background: "#FFFFFF",
                    borderColor: "#ffffff",
                    glyphColor: "brown",
                    scale: 0.7
                });
            }
            marker = new AdvancedMarkerElement({
                map,
                position: newPosition,
                gmpDraggable: !isFetchMode ? true : false,
                content: isFetchMode ? pinBackground.element : null
            });
            marker.addListener('click', function (event) {
            });
            let vm = this;
            marker.addListener('dragend', function (event) {
                let newPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                }
                let keyToAccessCurrentCoordinate
                if (isEditMode) {
                    keyToAccessCurrentCoordinate = keyOfCoordinatesInfoForPOI;
                }
                else if (!isFetchMode) {
                    keyToAccessCurrentCoordinate = vm.currentPOICounter;
                }
                vm.coordinatesInfoForPOI[keyToAccessCurrentCoordinate].lat = event.latLng.lat();
                vm.coordinatesInfoForPOI[keyToAccessCurrentCoordinate].lng = event.latLng.lng();
                localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(vm.coordinatesInfoForPOI));
                vm.updateFinalPOIInLS(keyToAccessCurrentCoordinate)
            });
            marker.addListener('drag', function (event) {
            });

            if (!isFetchMode && !isEditMode) {
                this.coordinatesInfoForPOI = JSON.parse(localStorage.getItem('coordinatesInfoForPOI')) || {};
                this.coordinatesInfoForPOI[this.currentPOICounter] =
                {
                    "title": `Marker ${this.currentPOICounter}`,
                    "description": "",
                    "files": [],
                    "lat": newPosition.lat(),
                    "lng": newPosition.lng(),
                    "zoom": 18,
                    "display_name": this.currentPOICounter
                },
                    localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(this.coordinatesInfoForPOI));
                this.updateFinalPOIInLS(this.currentPOICounter)
            }
        },
 removeObjectByKey (obj, keyToRemove) {
    const { [keyToRemove]: removedObject, ...rest } = obj;
    return rest;
},
        async deletePathAnswer(){
            // this.activePathData=this.pathArrayData[this.pathCount]
            if(this.isPathEditable){
            let activePoiIndex=0;
            const answerData=JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentPOIJson =answerData[this.questionIdOfPOI]
            let activePoi=Object.values(answerData[this.questionIdOfPOI]['answer']['corners']['coordinates'])
            let pathDetails=activePoi.filter(d=>d.coordinates||d.length)
          this.activePathData=pathDetails[this.pathCount]
          let poiIndex=null
            activePoi.find((d,index)=>{
                if(d.id==this.activePathData.id){
                    poiIndex=index
                    activePoiIndex=d.display_name; 
                }
            })
            const newObj = this.removeObjectByKey( activePoi, poiIndex);
            let payload=this.activePathData;
            payload.coordinates=this.pathCornersArray;
            payload.length='0';
            payload.center=[];
            payload.map_image=[];
            payload.display_name=this.activePathData.display_name;
            this.coordinatesInfoForPOI= newObj;  
            localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(newObj));
            currentPOIJson['answer']['corners']['coordinates'] = JSON.parse(JSON.stringify(this.coordinatesInfoForPOI));
            answerData[this.questionIdOfPOI] = JSON.parse(JSON.stringify(currentPOIJson))
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(answerData));
if(this.activePathData?.id){   
       const resp=       await API.EDITABLE_SITE_SURVEY_API.DELETE_PATH(this.activePathData.id);
           if(resp)   {  
            this.pathCounterTrigger(); 
            this.deletePoiCounter()
         }}else{
            this.pathCounterTrigger();
         }
        }else{
            this.pathCounterTrigger();
            this.deletePoiCounter();
            this.pathNotEditable();

        }
        },
        async addPathAnswer(){

        if(this.isPathEditable&&this.activePathData?.id){
            let activePoiIndex=0;
            let activePoi=Object.values(this.storedAnswers[this.questionIdOfPOI]['answer']['corners']['coordinates'])
            activePoi.find((d,index)=>{
                if(d.id==this.activePathData.id){
                    activePoiIndex=d.display_name; 
                }
            })
            let payload=this.activePathData;
            payload.coordinates=this.pathCornersArray;
            payload.name=payload.name?payload.name:`Path ${this.currentPOICounter}`;
            payload.title=payload.title?payload.title:`Path ${this.currentPOICounter}`;
            payload.length=this.pathDistanceValue;
            payload.center=[this.pathCornersArray?.[0]?.lat,this.pathCornersArray?.[0]?.lng,];
            payload.display_name=this.activePathData.display_name;
            payload.zoom=18;
            this.coordinatesInfoForPOI[activePoiIndex]= payload;  
            localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(this.coordinatesInfoForPOI));
                this.updateFinalPathInLS(activePoiIndex)
        }

        else{

        
            
            this.currentPOICounter++;
            // if (!isFetchMode && !isEditMode) {
                this.coordinatesInfoForPOI = JSON.parse(localStorage.getItem('coordinatesInfoForPOI')) || {};
                this.finalPathCordinates=JSON.stringify(localStorage.getItem('finalPathCordinates'))
                this.coordinatesInfoForPOI[this.currentPOICounter] =
                {
                    "title": `Path ${this.currentPOICounter}`,
                    "name": `Path ${this.currentPOICounter}`,
                    "description": "",
                    "files": [],
                    "map_image":[],
                    "type":'path',
                    'coordinates':this.pathCornersArray,
                    "zoom": 18,
                    "display_name":  this.currentPOICounter,
                    "length":this.pathDistanceValue,
                    "center":{
                        "lat": this.pathCornersArray?.[0]?.lat,
                    "lng": this.pathCornersArray?.[0]?.lng,
                    },
                    "additional_path_info":{},

                };
                localStorage.setItem('coordinatesInfoForPOI', JSON.stringify(this.coordinatesInfoForPOI));
                this.updateFinalPathInLS(this.currentPOICounter)
            }
                   
            // }

        },

        generateGoogleStaticMapPathImageLink(lat, lng, zoom) {
 const pathCordinates=JSON.parse(localStorage.getItem('pathCornersArray'));
let pathLat=pathCordinates[0].lat;
let pathLng=pathCordinates[0].lng;
const latLngString = pathCordinates.map(item => `${item.lat},${item.lng}`).join('|');
            let mapImageURL = `https://maps.googleapis.com/maps/api/staticmap?center=${pathLat},${pathLng}&scale=2&zoom=${17}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}&path=color:409EFF80|weight:4|${latLngString}`;
            return mapImageURL; 
        },
        async convertMapImageToBlobForPath(lat, lng, zoom) {
            let vm = this;
            const response = await fetch(this.generateGoogleStaticMapPathImageLink(lat, lng, zoom))  //TODO change zoom from here as well (Maybe)
            const blob = await response.blob();
            if (!vm.mapImageUUID)
                vm.mapImageUUID = v4();
            return await uploadFileToBlob(blob, vm.mapImageUUID);
        },

        async addPath(event, counter, isFetchMode) {
            // this.fetchAndInitializePOIDetails()
            let pathCopy =this.pathCordinates?.length>0? JSON.parse(JSON.stringify(this.pathCordinates)):[];
            const newPosition = event.latLng;
            let pathPosition=''
   
            if(newPosition){
                pathPosition= this.parseJsonFunction(newPosition);
                this.pathCordinates.push(newPosition);

            }
            pathCopy = JSON.parse(JSON.stringify(this.pathCordinates));
            let gmapRef = this.$refs.GMapRef
            let map = gmapRef.$mapObject
            this.pathmapObj = gmapRef.$mapObject;
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            let node = document.createElement('div')
            if (isFetchMode)
                this.pathCounter = counter;

            this.pathCounter++;

            node.style.dispaly = 'none'
            const marker = new AdvancedMarkerElement({
                map,
                position: newPosition,
                content: node,
                gmpDraggable: this.poiMode ? false : true,
            });
            this.pathMapping.push({ marker, name: this.pathCounter - 1 });

            let vm = this;
            if (!this.poiMode) {
                marker.addListener('click', function (event) {
                    const markerInfo = vm.markerAndNumberMapping.find(info => info.marker === marker);
                });
            }
// if(this.siteSurveyStore.showPathToolbar){
//     const newPathPolyline = new google.maps.Polyline({
//             path: pathCopy,
//             geodesic: true,
//             strokeColor: '#ffffff',
//             strokeOpacity: 1.0,
//             strokeWeight: 2,
//         });
//         newPathPolyline.setMap(map);
//         newPathPolyline.setPath(map);
//         this.polylineObjectArray.push(newPathPolyline);
// }

// else{
//     if (pathCopy.length == 1) {
//                 // this.poly = new google.maps.Polyline({
//                 //     path: markersCopy,
//                 //     geodesic: true,
//                 //     strokeColor: '#ffffff',
//                 //     strokeOpacity: 1.0, 
//                 //     strokeWeight: 2,
//                 // });
//                 // this.polylineObjectArray.push(this.poly);
//                 this.polyPath.setMap(map);
//                 this.polyPath.setPath(pathCopy);
//             }
//             else {
//                 // this.polylineObjectArray.forEach((poly)=>{
//                 //     poly.setMap(null);
//                 // })
//                 this.polyPath.setPath(pathCopy);
//                 this.polyPath.setMap(map);
//             }
// }
let lastIndex =this.pathCount;
if(this.isPathEditable){
    if (this.polylineData[lastIndex]) {
     this.polylineData[lastIndex].push(pathPosition);
   }else {
     this.polylineData.push(pathCopy);
   }
}else{
    if (this.polylineData[lastIndex]) {
     
     this.polylineData[lastIndex]=pathCopy;
   } else {
     this.polylineData.push(pathCopy);
   }
}
  
if (this.polylineData[lastIndex]){
    this.pathCornersArray=this.parseJsonFunction(this.polylineData[lastIndex])

}
      this.mapKey++;
    //   localStorage.setItem('allPathsDataRef', JSON.stringify(this.polylineData));
      localStorage.setItem('pathCornersArray',JSON.stringify(pathCopy));
      this.undoPathArray=JSON.parse(JSON.stringify(pathCopy))
      this.pathRefData=pathCopy;
      this.updateUndoAndRedoPathLength(this.undoPathArray.length,this.redoPathArray.length)

            // this.markersObjectArray.push(marker);
            // if (!this.poiMode) {
            //     marker.addListener('dragend', function (event) {
            //         const markerInfo = vm.pathMapping.find(info => info.marker === marker);
            //         vm.poly.setMap(null);
            //         vm.poly.setPath(null);
            //         // vm.polylineObjectArray.forEach((poly)=>{
            //         //     poly.setMap(null);
            //         // })

            //         vm.marker_dragend(event, markerInfo.name, this.polyPath, map, vm.markersObjectArray.length)
            //     });
            //     marker.addListener('drag', (event) => {
            //         let arrayForPolyline = [
            //             ...this.markersObjectArray
            //         ]
            //         if (this.markers.length == arrayForPolyline.length + 1) {
            //             arrayForPolyline.push(arrayForPolyline[0])
            //         }
            //         let latLngList = arrayForPolyline.map(obj => ({ lat: obj.position.lat, lng: obj.position.lng }))
            //         // let poly = this.polylineObjectArray.at(-1)
            //         // poly.setPath(latLngList)
            //         this.polyPath.setPath(latLngList)
            //     })
            // }

            if (!isFetchMode) {
                // this.pathCornersArray = JSON.parse(localStorage.getItem('pathCornersArray')) || [];
                // this.pathCornersArray.push({
                //     counter: this.pathCounter - 1,
                //     coordinates: newPosition
                // })
                localStorage.setItem('pathCornersArray', JSON.stringify(this.pathCornersArray));
                let distanceSum = 0
                for (let i = 0; i < this.pathCornersArray.length - 1; i++) {
                        const distance = this.calculateDistance(
                            this.pathCornersArray[i].lat,
                            this.pathCornersArray[i].lng,
                            this.pathCornersArray[i + 1].lat,
                            this.pathCornersArray[i + 1].lng
                        );
                        distanceSum = distanceSum + distance;
                    }
                this.pathDistanceDisplay = distanceSum.toFixed(2)
                    
                if (this.pathCornersArray.length > 1) {
                    this.pathDistance(distanceSum.toFixed(2))
                }
          
                // this.finalPathCordinates = JSON.parse(localStorage.getItem('finalPathCordinates')) || {};
                // this.finalPathCordinates[this.pathCounter - 1] =
                // {
                //     "title": `path${this.pathCounter - 1}`,
                //     "description": "",
                //     "files": [],
                //     "coordinates":this.pathCornersArray,
                //     'name':`path${this.pathCounter - 1}`
                    
                // };

                // localStorage.setItem('finalPathCordinates', JSON.stringify(this.finalPathCordinates));

                // this.undoArray.push(this.markersAndCornersArray);
                // this.updateUndoAndRedoLength(this.undoArray.length,this.redoArray.length); // to enable and disable undo and redo icons
                // this.updateFinalAnswerInLS();
            }

        },

        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth radius in kilometers
            const dLat = this.deg2rad(lat2 - lat1);
            const dLon = this.deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c * 1000; // Distance in kilometers
            return distance;
        },
        deg2rad(deg) {
            return deg * (Math.PI / 180);
        },

        async addMarker(event, counter, isFetchMode) {
            if (!this.markers[0]) this.markers.shift() // fix for undefined value in markers
            // this.addpath(event, counter, isFetchMode)
            if (this.isDrawPath && !isFetchMode) {
                this.addPath(event, this.pathCounter, isFetchMode)
                return;
            }
            if (this.isPoiMode && !isFetchMode) {
                this.addPOI(event);  // I could have used this.addPOI directly but doing that it wasn't returning an event so using like this
                return;
            }
            let markersCopy = JSON.parse(JSON.stringify(this.markers))
            if (!this.siteSurveyStore.isAllowedToDrawBoundary && !isFetchMode) {
                return;
            }
            // limit distance between 2 vertices to be 1000 meters
            let newLat = event.latLng?.lat instanceof Function ? event.latLng.lat() : event.latLng?.lat||0
            let newLng = event.latLng?.lng instanceof Function ? event.latLng.lng() : event.latLng?.lng||0
            
            if (this.markers.length > 0){
                let tempDistance = this.calculateDistance(this.lastVertexLatLng?.lat || newLat, this.lastVertexLatLng?.lng || newLng, newLat, newLng)
                if (tempDistance > 1000){
                    ElMessage({
                        message: `Distance between two successive corners should be less than 1km. `,
                        type: 'error',
                    })
                    return
                }
            }
            this.lastVertexLatLng = {lat: newLat, lng: newLng}
            
            if (JSON.stringify(this.markers[0]) == JSON.stringify(this.markers[this.markers.length - 1]) && this.markers.length > 1 && !isFetchMode) { // it means it is completed
                this.markers.pop();
                markersCopy.pop();
            }
            const newPosition = event.latLng;
            this.markers.push(newPosition);
            markersCopy = JSON.parse(JSON.stringify(this.markers)).filter(d=>d)
            if (markersCopy.length == 1)
                this.counter = 1; // In a specific situation when u added points like 1->2->3-> and then undo to 1->2 ...1...empty, then still counter is 2, so need to reset

            let gmapRef = this.$refs.GMapRef
            let map = gmapRef.$mapObject
            this.mapObj = gmapRef.$mapObject;
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            let node = document.createElement('div')
            if (isFetchMode)
                this.counter = counter;
            node.textContent = this.counter;
            this.counter++;
            node.style.backgroundColor = "#FFF";
            node.style.borderRadius = "50%"
            node.style.width = "16px"
            node.style.height = "16px"
            node.style.display = "grid"
            node.style.placeItems = "center"
            const marker = new AdvancedMarkerElement({
                map,
                position: newPosition,
                content: node,
                gmpDraggable: this.poiMode ? false : true,
            });
            this.markerAndNumberMapping.push({ marker, name: this.counter - 1 })
            let vm = this;
            if (!this.poiMode) {
                marker.addListener('click', function (event) {
                    const markerInfo = vm.markerAndNumberMapping.find(info => info.marker === marker);
                });
            }
            if (markersCopy.length == 1) {
                // this.poly = new google.maps.Polyline({
                //     path: markersCopy,
                //     geodesic: true,
                //     strokeColor: '#ffffff',
                //     strokeOpacity: 1.0, 
                //     strokeWeight: 2,
                // });
                // this.polylineObjectArray.push(this.poly);
                this.poly.setMap(map);
                this.poly.setPath(markersCopy);
            }
            else {
                // this.polylineObjectArray.forEach((poly)=>{
                //     poly.setMap(null);
                // })
                this.poly.setPath(markersCopy);
                this.poly.setMap(map);
            }
            this.markersObjectArray.push(marker);
            if (!this.poiMode) {
                marker.addListener('dragend', function (event) {
                    const markerInfo = vm.markerAndNumberMapping.find(info => info.marker === marker);
                    vm.poly.setMap(null);
                    vm.poly.setPath(null);
                    // vm.polylineObjectArray.forEach((poly)=>{
                    //     poly.setMap(null);
                    // })

                    vm.marker_dragend(event, markerInfo.name, this.poly, map, vm.markersObjectArray.length)
                });
                marker.addListener('drag', (event) => {
                    const markerInfo = vm.markerAndNumberMapping.find(info => info.marker === marker);
                    vm.marker_drag(event, markerInfo.name)
                    let arrayForPolyline = [
                        ...this.markersObjectArray
                    ]
                    if (this.markers.length == arrayForPolyline.length + 1) {
                        arrayForPolyline.push(arrayForPolyline[0])
                    }
                    let latLngList = arrayForPolyline.map(obj => ({ lat: obj.position.lat, lng: obj.position.lng }))
                    // let poly = this.polylineObjectArray.at(-1)
                    // poly.setPath(latLngList)
                    this.poly.setPath(latLngList)
                })
            }

            if (!isFetchMode) {
                this.markersAndCornersArray = JSON.parse(localStorage.getItem('markersAndCornersArray')) || [];
                this.markersAndCornersArray.push({
                    counter: this.counter - 1,
                    coordinates: newPosition
                })
                localStorage.setItem('markersAndCornersArray', JSON.stringify(this.markersAndCornersArray))
                this.finalCoordinatesStructure = JSON.parse(localStorage.getItem('finalCoordinatesStructure')) || {};
                this.finalCoordinatesStructure[this.counter - 1] =
                {
                    "title": `corner${this.counter - 1}`,
                    "description": "",
                    "files": [],
                    "lat": newPosition.lat(),
                    "lng": newPosition.lng(),
                },
                    localStorage.setItem('finalCoordinatesStructure', JSON.stringify(this.finalCoordinatesStructure));
                this.undoArray.push(this.markersAndCornersArray);
                this.updateUndoAndRedoLength(this.undoArray.length, this.redoArray.length); // to enable and disable undo and redo icons
                this.updateFinalAnswerInLS();
            }
            if (this.markers.length > 3 && this.currentGoogleMapGuideStep == 3){
                this.$nextTick(() => {
                    this.setGoogleMapGuideId('.guidance-draw-complete')
                    this.setGoogleMapGuideStep(4)
                })
            }
        },
        updateFinalCoordinatesStructure(display_name) {
            // here updating finalCoordinatesStructure according to latest markersAndCornersArray because it is something whoch is updated
            // in in undo, redo, dragend and adding marker
            let allPresentCountersArray = [];
            this.finalCoordinatesStructure = JSON.parse(localStorage.getItem('finalCoordinatesStructure')) || {};
            this.markersAndCornersArray = JSON.parse(localStorage.getItem('markersAndCornersArray')) || [];
            for (let i = 0; i < this.markersAndCornersArray.length; i++) {
                let cornerJson = this.markersAndCornersArray[i];
                let coordinates = cornerJson.coordinates;
                let counter = cornerJson.counter;
                allPresentCountersArray.push(Number(counter));
                if (this.finalCoordinatesStructure[counter]) {
                    this.finalCoordinatesStructure[counter].lat = coordinates.lat;
                    this.finalCoordinatesStructure[counter].lng = coordinates.lng;
                }
                // in case if you do redo, that counter may not exist in the finalCoordinatesStructure so we need to initialize remianing keys again
                else {
                    this.finalCoordinatesStructure[counter] =
                    {
                        "title": `corner${counter}`,
                        "description": "",
                        "files": [],
                        "lat": coordinates.lat,
                        "lng": coordinates.lng,
                    };
                }
            }
            // Now also remove those coordinates from  finalCoordinatesStructure, which has been deleted or removed whie redo or undo
            // So get all the useful counters in allPresentCountersArray and check those counters from finalCoordinatesStructure which 
            //is not present in allPresentCountersArray
            let allCountersInFinalCoordinates = Object.keys(this.finalCoordinatesStructure);
            allCountersInFinalCoordinates.forEach(counter => {
                if (!allPresentCountersArray.includes(Number(counter))) {
                    delete this.finalCoordinatesStructure[counter];
                }
            })
            if (display_name)
                delete this.finalCoordinatesStructure[display_name].id;  //backend will update values only for that corner for which id key is not present and if calling Answer API
            localStorage.setItem('finalCoordinatesStructure', JSON.stringify(this.finalCoordinatesStructure));
            this.updateFinalAnswerInLS();
        },
        undoFunction() {
            if (this.undoArray.length <= 1)
                return;
            let lastObj = this.undoArray.pop();
            this.redoArray.push(lastObj);
            let currentObj = this.undoArray.slice(-1)[0]; // to create a new array containing only the last element, 
            localStorage.setItem('markersAndCornersArray', JSON.stringify(currentObj))
            // this.polylineObjectArray.forEach((poly)=>{
            //     poly.setMap(null);
            // })
            this.poly.setMap(null);
            this.poly.setPath(null);
            this.markersObjectArray.forEach(marker => {
                marker.setMap(null);
            })
            this.markersObjectArray = [];
            this.markerAndNumberMapping = [];
            this.markers = [];
            // markerToBeRemoved.setMap(null);
            this.fetchCoordinatesAndLabels("undoMode");
            this.updateFinalCoordinatesStructure();
            this.updateUndoAndRedoLength(this.undoArray.length, this.redoArray.length); // to enable and disable undo and redo icons
        },
        redoFunction() {
            if (this.redoArray.length == 0)
                return;
            let lastObj = this.redoArray.pop();
            this.undoArray.push(lastObj);
            let currentObj = this.undoArray.slice(-1)[0]; // to create a new array containing only the last element, 
            localStorage.setItem('markersAndCornersArray', JSON.stringify(currentObj))
            // this.polylineObjectArray.forEach((poly)=>{
            //     poly.setMap(null);
            // })
            this.poly.setMap(null);
            this.poly.setPath(null);
            this.markersObjectArray.forEach(marker => {
                marker.setMap(null);
            })
            this.markersObjectArray = [];
            this.markerAndNumberMapping = [];
            this.markers = [];
            this.fetchCoordinatesAndLabels('redoMode');
            this.updateFinalCoordinatesStructure();
            this.updateUndoAndRedoLength(this.undoArray.length, this.redoArray.length); // to enable and disable undo and redo icons
        },
        async fetchCoordinatesAndLabels(undoOrRedoMode) {
            this.markersAndCornersArray = JSON.parse(localStorage.getItem('markersAndCornersArray')) || [];
          for (let i = 0; i < this.markersAndCornersArray.length; i++) {
                let cornerJson = this.markersAndCornersArray[i];
                let coordinates = {
                    latLng: cornerJson.coordinates
                }
                let counter = cornerJson.counter;
                await this.addMarker(coordinates, counter, true)
            }
            this.pathCornersArray = JSON.parse(localStorage.getItem('pathCornersArray')) || [];
            this.pathcoordinates=[]
            for (let i = 0; i < this.pathCornersArray.length; i++) {
                let cornerJson = this.pathCornersArray[i];
                let coordinates = {
                    latLng: cornerJson.coordinates
                }
                let counter = cornerJson.counter;
             
                    // await this.addPath(coordinates, 0, true)

              
            }
            if (undoOrRedoMode == 'undoMode' || undoOrRedoMode == 'redoMode') {
                if (this.currentAnswerJson['answer']?.additional_info?.is_boundary_completed) {
                    if (this.currentAnswerJson['answer']?.additional_info?.isAllCornersPassed)
                        this.showAllBoundariesList(); // this will increase count in store which will trigger isBoundaryCompleted in computed and then watch will call this.complete()
                    else
                        this.completeBoundaries("undoOrRedoMode");
                }
            }
        },
        initializeMarkersAndCornersArray() {
            
            // construct markersAndCornersArray from finalCoordinatesStructure which we will be getting from backend and will be empty for the first time
            // We are using markersAndCornersArray even if we have finalCoordinatesStructure because this is something which will be used during undo and redo
            // as we are supoosed to undo and redo just the coordinates lat,lng
            this.finalCoordinatesStructure = JSON.parse(localStorage.getItem('finalCoordinatesStructure')) || {};
            this.finalPathCordinates = JSON.parse(localStorage.getItem('finalPathCordinates')) || {};
            this.markersAndCornersArray = [];
            this.pathCornersArray = [];
            let countersArray = Object.keys(this.finalCoordinatesStructure);
            let pathsArray = Object.keys(this.finalPathCordinates);
            countersArray.forEach((counter) => {
                this.markersAndCornersArray.push({
                    counter: counter,
                    coordinates: {
                        lat: this.finalCoordinatesStructure[counter].lat,
                        lng: this.finalCoordinatesStructure[counter].lng,
                    }
                })
            })
            pathsArray.forEach((counter) => {
                this.pathCornersArray.push({
                    counter: counter,
                    coordinates: {
                        lat: this.finalPathCordinates[counter].lat,
                        lng: this.finalPathCordinates[counter].lng,
                    }
                })
            })
            // if (this.pathCornersArray?.length > 0) {
            //     this.showPathFunc();
            // }
            if (this.markersAndCornersArray.length > 0) {
                this.showToolbarFunc(); // If there exists even 1 corner, it means that the toolbar should be visible now and not the address screen.
            }

            localStorage.setItem('markersAndCornersArray', JSON.stringify(this.markersAndCornersArray));
            localStorage.setItem('pathCornersArray', JSON.stringify(this.pathCornersArray))
            // this.addpath()
            this.undoArray.push(this.markersAndCornersArray);
            this.updateUndoAndRedoLength(this.undoArray.length, this.redoArray.length); // to enable and disable undo and redo icons
        },
        complete() {
            // this.polylineObjectArray.forEach((poly)=>{
            //     poly.setMap(null);
            // })
            this.poly.setMap(null);
            this.poly.setPath(null);
            let firstCoordinate = this.markers[0];
            this.markers.push(firstCoordinate);


            this.poly.setPath(this.markers);
            this.poly.setMap(this.mapObj);


            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.currentAnswerJson = this.storedAnswers[this.question.id];
            if (this.currentAnswerJson['answer']['additional_info']) {
                this.currentAnswerJson['answer']['additional_info']['is_boundary_completed'] = true;
            }
            this.storedAnswers[this.question.id] = this.currentAnswerJson;
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            // this.changeMarkersCount();
            if (!this.isFirstTime) {  // so that it will not be called when its mounted
                this.updateMarkersAPICall();
            }
            this.isFirstTime = false;
            // localStorage.setItem('isBoundaryCompleted',JSON.stringify(true))
        },

        completePath() {
            // this.polylineObjectArray.forEach((poly)=>{
            //     poly.setMap(null);
            // })
            // this.polyPath.setMap(null);
            // this.polyPath.setPath(null);
            // let firstCoordinate = this.pathCordinates[0];
            // this.pathCordinates.push(firstCoordinate);


            // this.polyPath.setPath(this.pathCordinates);
            // this.polyPath.setMap(this.pathmapObj);

            // let flightPath = new google.maps.Polyline({
            //     path: this.markers,
            //     strokeColor: "#FFFFFF",
            //     strokeOpacity: 1.0,
            //     strokeWeight: 2,
            // });
            // this.polylineObjectArray.push(flightPath);
            // flightPath.setMap(this.mapObj);

            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.currentAnswerJson = this.storedAnswers[this.question.id];
            if (this.currentAnswerJson['answer']['additional_info']) {
                this.currentAnswerJson['answer']['additional_info']['is_boundary_completed'] = true;
            }
            this.storedAnswers[this.question.id] = this.currentAnswerJson;
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
            // this.changeMarkersCount();
            if (!this.isFirstTime) {  // so that it will not be called when its mounted
                this.updateMarkersAPICall();
            }
            this.isFirstTime = false;
            // localStorage.setItem('isBoundaryCompleted',JSON.stringify(true))
        },
        validateMarker(a, b){
            if (!b) return true
            if (b.lat instanceof Function){
                b = {
                    lat: b.lat(),
                    lng: b.lng()
                }
            }
            let distance = this.calculateDistance(a.lat, a.lng, b.lat, b.lng)
            return distance < 1001
        },
        marker_drag(event, number){
            let isPreviousValid, isNextValid;
            let newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            }
            let oldPosition = {
                lat: this.markers[number-1].lat,
                lng: this.markers[number-1].lng
            }
            if (this.markers.length > 1){
                let previousMarker = number == 1 ? null : this.markers[number-2]
                let nextMarker = number == this.markers.length ? null : this.markers[number]
                isPreviousValid = this.validateMarker(newPosition, previousMarker)
                isNextValid = this.validateMarker(newPosition, nextMarker)
                if (!isPreviousValid || !isNextValid){
                    if (this.distanceWarningInstance) return
                    this.distanceWarningInstance = this.$message({
                        message: `Distance between two successive corners should be less than 1km. `,
                        type: 'error',
                        duration: 0,
                    })
                    this.markers[number-1] = oldPosition
                    newPosition = oldPosition
                }else{
                    if (!this.distanceWarningInstance) return
                    this.distanceWarningInstance.close()
                    this.distanceWarningInstance = null
                }
            }
        },
        marker_dragend(event, number, poly, map, totalNoOfMarkers) {
            if (this.distanceWarningInstance){
                if(this.undoArray.length) this.undoArray.pop()
                this.changeUndoTemp(this.undoArray);
                this.changeRedoTemp(this.redoArray)
                this.$emit('refresh', this.undoArrayTemp.length, this.redoArrayTemp.length)
                this.distanceWarningInstance.close()
                this.distanceWarningInstance = null
                return
            }
            let oldPosition = {
                lat: this.markers[number-1].lat,
                lng: this.markers[number-1].lng
            }
            let isPreviousValid, isNextValid;
            let newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            }
            if (this.markers.length > 1){
                let previousMarker = number == 1 ? null : this.markers[number-2]
                let nextMarker = number == this.markers.length ? null : this.markers[number]
                isPreviousValid = this.validateMarker(newPosition, previousMarker)
                isNextValid = this.validateMarker(newPosition, nextMarker)
                if (!isPreviousValid || !isNextValid){
                    // ElMessage({
                    //     message: `Distance between two successive corners should be less than 1km. `,
                    //     type: 'error',
                    // })
                    this.markers[number-1] = oldPosition
                    newPosition = oldPosition
                    // return
                }
            }
            this.markers[number - 1] = newPosition;
            this.updateMarkersAndCornersArray(number, newPosition)
            if(isPreviousValid && isNextValid){
                this.undoArray.push(this.markersAndCornersArray) // so that in case of undo, undo array will be updated
                this.updateUndoAndRedoLength(this.undoArray.length, this.redoArray.length); // to enable and disable undo and redo icons
            }
            this.updateFinalCoordinatesStructure(number); // updating the coordinates in the final coordiates structure
            if (number == 1 && (this.markers.length == totalNoOfMarkers + 1)) { // when dragging first marker and if its boundary is already joined (cycle completed)
                this.markers[this.markers.length - 1] = newPosition;
            }
            // let flightPath = new google.maps.Polyline({
            //     path: this.markers,
            //     strokeColor: "#FFFFFF",
            //     strokeOpacity: 1.0,
            //     strokeWeight: 2,
            // });
            // this.polylineObjectArray.push(flightPath);
            // flightPath.setMap(map);
            this.poly.setPath(this.markers);
            this.poly.setMap(map);
            if(!isPreviousValid || !isNextValid) this.undoPathFunction()
        },
        updateMarkersAndCornersArray(markerCounter, newPosition) {
            this.markersAndCornersArray = JSON.parse(localStorage.getItem('markersAndCornersArray')) || [];
            let index = this.markersAndCornersArray.findIndex(item => {
                return item.counter == markerCounter
            })
            this.markersAndCornersArray[index].coordinates = newPosition;
            localStorage.setItem('markersAndCornersArray', JSON.stringify(this.markersAndCornersArray))
        },
        markerClicked(marker) {
            console.log('Marker clicked:', marker.position);
        },
        markerDragged(marker, event) {
            marker.position = event.latLng;
        },
        updateCenter(latLng) {
            this.updatedCenter = {
                lat: latLng.lat(),
                lng: latLng.lng(),
            };
            if(!this.recenterMap){
                // this center is set on purpose so that when we will be dragging the centre it will be changed and then on clicking getLocation it will show change//
                //otherwise no change will be visible
                this.center = {
                    lat: '',
                    lng: '',
                };
                //-----------------------------------------------------------------------------------------------------------------------------------------//
            }
            this.updateAddressInLS();
        },
        updatePathDistancePosition(){
            if (this.pathDistanceDisplay){
                this.$nextTick(() => {
                    this.pathDistanceStyle = this.getTextPosition();
                });
            }
        },
        updateZoom(zoom) {
            this.updatePathDistancePosition()
            const prevZoom = this.zoom;
            // this.zoom = zoom;
            this.zoomToBeSend = zoom
            if (prevZoom !== zoom) {
                this.setAddressForGivenCoordinates();
            }
        },
        dragend_method(latLng) {
            this.updatePathDistancePosition()
            // this.visible = false;
            this.setAddressForGivenCoordinates();
        },
        setPlace(place) {
            this.center = {
                lat: place.geometry?.location.lat(),
                lng: place.geometry?.location.lng(),
            };
            this.updatedCenter = {
                lat: place.geometry?.location.lat(),
                lng: place.geometry?.location.lng(),
            };
            let isSelectingFromAutocomplete = true;
            this.setAddressForGivenCoordinates(isSelectingFromAutocomplete);
        },
				async  checkCoordinatesExist(latitude, longitude) {
					const apiKey = GOOGLE_API_KEY; // Replace with your Google Maps API key
					try {
                        const qParams={
                            lat:latitude,
                            lng :longitude 
                        }
							const response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);
							const data = await response.json();
							if (data.status === 'OK' && data.results.length > 0) {
								return true;
							} else {
								return false;
							}
					} catch (error) {
							// Handle error
							return false;
					}
        },
				onPressEnter(event){
					if(event.key=='Enter'){
						this.checkAndAssignCoordinates()
					}
				},
        checkAndAssignCoordinates(){
          let address = this.$refs.autocomplete.$el.value;
          let coordinatesArray = address.split(/\s*,\s*|\s+/).filter(coordinate => coordinate !== '');
          if(coordinatesArray.length!=2)
            return;
					coordinatesArray = coordinatesArray.map(item => {
						// Use regular expression to replace all non-numeric characters except decimals
						return item.replace(/[^\d.]/g, '');
					});
					if(this.checkCoordinatesExist(coordinatesArray[0],coordinatesArray[1])){
						this.center = {
							lat: parseFloat(coordinatesArray[0]),
							lng: parseFloat(coordinatesArray[1]),
						};
						this.updatedCenter = {
							lat: parseFloat(coordinatesArray[0]),
							lng: parseFloat(coordinatesArray[1]),
						};
						let isSelectingFromAutocomplete = false;
						this.setAddressForGivenCoordinates(isSelectingFromAutocomplete);
					}
        },
        updateAddressInLS() {
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentQuestionId = this.poiMode ? this.questionIdOfPOI : this.question.id
            let currentAnswerJson = this.storedAnswers[currentQuestionId];
            if (currentAnswerJson['answer'].corners) {
                currentAnswerJson['answer'].corners.zoom = this.zoomToBeSend || 19;
                currentAnswerJson['answer'].corners.center = JSON.parse(JSON.stringify(this.updatedCenter));
                currentAnswerJson['answer'].corners.address = JSON.parse(JSON.stringify(this.address));
            }
            this.storedAnswers[currentQuestionId] = currentAnswerJson;
            localStorage.setItem('overallMappingOfQidToAnsJson', JSON.stringify(this.storedAnswers));
        },
        fetchMapDetails(currentAnswerJSon) {
            let defaultCenter = {
                lat: 37.78454178741125,
                lng: -122.4037594380287,
            };
            let additional_info = currentAnswerJSon.answer.additional_info;
            let corners_info = currentAnswerJSon.answer.corners;
            // TODO: Getting strings from backend which needs float values//
            let incomingCenter = corners_info.center;
            incomingCenter = {
                lat: parseFloat(incomingCenter.lat),
                lng: parseFloat(incomingCenter.lng)
            }
            corners_info.center = { ...incomingCenter };
            //----------------------------END---------------------------------//
            this.center = corners_info.center || defaultCenter;
            this.updatedCenter = corners_info.center || defaultCenter;
            this.address = corners_info.address;
            if (!this.poiMode)
                this.$refs.autocomplete.$el.value = this.address
            this.zoom = corners_info.zoom || 19;
            this.zoomToBeSend = corners_info.zoom;
            if (!this.address) {
                this.getLocation(); // If no address, it means it should choose current location
            }
        },
        setAddressForGivenCoordinates(isSelectingFromAutocomplete) {
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(this.updatedCenter.lat, this.updatedCenter.lng);
            var vm = this;
            if (geocoder) {
                geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (!isSelectingFromAutocomplete) // we only want the address to be auto fetched while zooming or dragging and not while selecting address
                            vm.$refs.autocomplete.$el.value = results[0].formatted_address;
                        vm.address = vm.$refs.autocomplete.$el.value;
                        vm.updateAddressInLS();
                        for (let i = 0; i < results.length; i++) {
                            let state = results[i].address_components.filter((elements) => {
                                if (elements.types[0] == 'administrative_area_level_1') {
                                    vm.state = elements.long_name;
                                }
                            })
                            break;
                        }
                    }
                    else {
                        console.log("Geocoding failed: " + status);
                    }
                }); //geocoder.geocode()
            }
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
                geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        vm.$refs.autocomplete.$el.value = results[0].formatted_address;
                        vm.address = results[0].formatted_address;
                        vm.updateAddressInLS();
                        for (let i = 0; i < results.length; i++) {
                            let state = results[i].address_components.filter((elements) => {
                                if (elements.types[0] == 'administrative_area_level_1') {
                                    vm.state = elements.long_name;
                                }
                            })
                            break;
                        }
                    }
                    else {
                        console.log("Geocoding failed: " + status);
                    }
                }); //geocoder.geocode()
            }

        },
        generateGoogleStaticMapImageLink(lat, lng, zoom) {
            let mapImageURL = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&scale=2&zoom=${19}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}&markers=color:red|${lat},${lng}`;
            return mapImageURL;
        },
        async convertMapImageToBlob(lat, lng, zoom) {
            let vm = this;
            const response = await fetch(this.generateGoogleStaticMapImageLink(lat, lng, zoom))  //TODO change zoom from here as well (Maybe)
            const blob = await response.blob();
            if (!vm.mapImageUUID)
                vm.mapImageUUID = v4();
            return await uploadFileToBlob(blob, vm.mapImageUUID);
        },
    parseJsonFunction(data){
       return JSON.parse(JSON.stringify(data))
    },

        undoPathFunction() {
        if (this.undoPathArray.length <= 0)
            return;
            let activePathCordinates=this.pathArrayData[this.pathCount]?.coordinates?this.pathArrayData[this.pathCount]?.coordinates :[]
        let coordinates=this.parseJsonFunction(this.pathCordinates)
        let lastObj = this.undoPathArray.pop();
        let newData=coordinates
        this.pathCordinates= this.parseJsonFunction(this.undoPathArray);
        this.redoPathArray.push(lastObj);
        let currentObj = this.undoPathArray.slice(-1)[0]; // to create a new array containing only the last element, 
        this.polylineData[this.pathCount]=[...activePathCordinates,...this.pathCordinates];
        this.updateUndoAndRedoPathLength(this.undoPathArray.length,this.redoPathArray.length);
        
    },

        redoPathFunction(){
            if (this.redoPathArray.length == 0)
                return;
                let coordinates=this.parseJsonFunction(this.pathCordinates);
                let activePathCordinates=this.pathArrayData[this.pathCount]?.coordinates||[]
            let lastObj = this.redoPathArray.pop();
            coordinates.push(lastObj)
            this.pathCordinates=this.parseJsonFunction(coordinates)
            this.undoPathArray.push(lastObj);
            let currentObj = this.undoPathArray.slice(-1)[0]; // to create a new array containing only the last element, 
            this.polylineData[this.pathCount]=[...activePathCordinates,...(this.parseJsonFunction( this.pathCordinates))]
            this.updateUndoAndRedoPathLength(this.undoPathArray.length,this.redoPathArray.length);
        },
        deletePath(){
            let data=[...this.polylineData];
                    if(data.length===this.pathCount){
                        data=JSON.parse(JSON.stringify(data.filter((d,inx)=>inx!==this.pathCount)));
                    }   
                  this.pathCornersArray=[]
                //    this.polylineData=[]
                    this.polylineData=[...JSON.parse(JSON.stringify(data))]
                    this.noPathDelete();
                    // localStorage.setItem('pathCornersArray',[]);
                    this.pathCordinates=[]
                    // localStorage.setItem('allPathsDataRef', JSON.stringify(this.polylineData));
                    // localStorage.setItem('allPathsData', JSON.stringify(this.polylineData));
                    this.deletePathAnswer();

                  
        }
    //     updatePolyline() {
    //   this.$refs.polylineRef.$forceUpdate(); // Force update the polyline
    // },
    },
    watch: {
        showDropdown: {
            immediate: true,
            handler(val){
                // if roof faces dropdown is open initailly then close the guide flow
                if (val && this.currentGoogleMapGuideStep == 1) this.setGoogleMapGuideId(null)
            }
        },
        isPathDelete:{
            // immediate:true,
            handler(val){
                if(val===true){
              this.deletePath()
                }
            }
        },
        boundaryCompletedCounter: {
            handler(val, oldVal) {
                if (this.isBoundaryCompleted) { // here, using a counter to watch as it keeps changing its values in order to trigger the watch
                    this.complete();          // But using isBoundaryCompleted if its is true, then only hit the complete() func.
                }
            }
        },
        undoCounter: {
            handler(val, oldVal) {
                if (val != oldVal) {         
                        this.undoFunction();
           
                }
            }
        },
        redoCounter: {
            handler(val, oldVal) {
                if (val != oldVal) {
                    
                    this.redoFunction();
                   
                }
            }
        },
        undoPathCounter:{
            handler(val, oldVal) {
                if (val != oldVal) {
           
                     this.undoPathFunction()
                
                }
            }
        },
        redoPathCounter: {
            handler(val, oldVal) {
                if (val != oldVal) {
                   this.redoPathFunction();
                }
            }
        },
        completPath:{
            handler(val){
                this.completePath();
               this.addPathAnswer()
            }
        },
        pathIndex:{
            immediate:true,
            handler(val){
                this.pathCount=val
            }
        }
     
       
      
    }


}
</script>


<style scoped>
.setMarkerPosition {
    /* pointer-events: none; */
    height: 48px;
    color: red;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
}

.mapContainer {
    position: relative;
}

.mapImg {
    width: 100%;
    height: 100%;
}

.inputContainer {
    position: absolute;
    top: 24px;
    left: 24px;
    display: flex;
    align-items: center;
    width: calc(100% - 48px);
}

.input {
    height: 50px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    font-size: 16px;
    border: none;
    outline: none;
    width: 100%;
    padding: 16px 48px 16px 16px;
}

.location {
    cursor: pointer;
    display: grid;
    place-items: center;
    background-color: #fff;
    height: 50px;
    width: 50px;
    border-left: 1px solid #ccc;
}

.confirmBtn {
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 8px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
}

.searchIcon {
    position: absolute;
    top: 14px;
    right: 220px;
}

.vue-map-container {
    height: calc(100vh - 238px);
}
.iconContainer{
    width: 3.5rem; /* Adjust the width and height to set the size of the circular div */
    height: 3.5rem;
    background-color: rgba(255, 255, 255, 0.7); /* Semi-transparent white background */
    border-radius: 50%; /* Make the div circular */
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute; 
    /*bottom: 1.125rem; 
    right: 0.625rem;*/ 
}

.positionIconB{
    bottom: 1.125rem; 
    right: 0.625rem;
}

.positionIconP{
    bottom: 1.125rem; 
    right: 0.625rem;
}

.icons {
    width: 2rem;
    font-size: 1.25rem;
    cursor: pointer;
}

@media (max-width: 900px) {

    .vue-map-container {
        height: calc(100vh - 56px);
    }

    .inputContainer {
        left: 16px;
        width: calc(100vw - 32px);
    }

    .input {
        width: 100%;
    }

    .searchIcon {
        right: 54px;
    }

    .location {
        border-bottom-right-radius: 8px;
        border-top-right-radius: 8px;
    }

    .confirmBtn {
        position: fixed;
        bottom: 0px;
        width: 100%;
        left: 0px;
        border-radius: 0px;
    }

    .positionIconB{
        bottom: 4.375rem; 
        
    }

    .positionIconP{
        bottom: 8.125rem;    
    }
}
.total-distance-text{
    position: relative;
    background-color: white;
    padding: 5px;
    font-size: 12px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
    width: fit-content;
}
</style>