<template>
    <div class="toolbarContainer">
        <div class="btnsContainer" v-if="siteSurveyStore.showToolbarButtons">
            <div class="commonCard" id="draw-boundary-guidance" @click="handleDrawBoundrayClick()">
                <img src="../assets/boundary.svg" class="houseIcon" />
                <p class="commonBlueTxt">Draw Boundary </p>
            </div>
            <div class="commonCard" @click="addressChange">
                <img src="../assets/editAddress.svg" class="unionIcon" />
                <p class="commonBlueTxt">Change Address</p>
            </div>
        </div>

        <!-- ---------------------------------------------toolbar-------------------------------- -->
        <div class="flexContainer" v-if="siteSurveyStore.showToolbar">
            <div class="toolbarBtnCont" >
                <img src="../assets/boundaryBlack.svg" class="blackHouseIcon" />
                <p class="commonBlackTxt">Draw Boundary</p>
            </div>
            <div class="toolbarsideCont">
                <div class="undoRedoDelCont">
                    <img @click="undo" :src="isUndoEnabled ? undoEnabled : undoDisabled" class="undoIcon" :class="{'notAllowed':!isUndoEnabled }" />
                    <img @click="redo" :src="isRedoEnabled ? redoEnabled : redoDisabled" class="redoIcon" :class="{'notAllowed':!isRedoEnabled }" />
                    <div v-if="deleteSelectionEnabled">
                        <p class="delSel" @click="deleteAllCoordinates()" :class="{'notAllowed':!isDeleteAllMarkersEnabled }">Delete Boundary</p>
                    </div>
                    <div >
                        <p class="delSel" @click="showToolbarFunc()" :class="{'notAllowed':!isEditMarkersEnabled }">Add More Points</p>
                    </div>
                </div>
                <el-button class="commonClassBtn completeBtnBtn guidance-draw-complete" id="SalesModeOnCompleteBTN" :class="{'notAllowed':!isBoundariesCompletionEnabled }"
                    @click="handleCompleteClick()">Complete</el-button>
            </div>
        </div>

        <div class="commonCard secBtn" @click="addressChange" v-if="siteSurveyStore.showToolbar">
            <img src="../assets/editAddress.svg" class="unionIcon" />
            <p class="commonBlueTxt">Change Address</p>
        </div>

        <!-- ---------------------------------------------toolbarMD-------------------------------- -->
        <div class="flexContainerMD" v-if="siteSurveyStore.showToolbar">
            <img @click="undo" :src="isUndoEnabled ? undoEnabled : undoDisabled" class="undoIcon" />
            <img @click="redo" :src="isRedoEnabled ? redoEnabled : redoDisabled" class="redoIcon" />
            <img @click="deleteAllCoordinates()"  :src="deleteAllMarkersImageURL" class="delIcon" />
            <img :src="editMarkersImageURL"  @click="showToolbarFunc()" alt="" />
            <img  :src="completeBoundaryImageURL"   @click="completeBoundariesMethod()" alt="" />
        </div>

        <InfoCard :markerDetail="currentMarker" :maxFiles="question.additional_info?.max_files" @updateMarker="updateMarkerInArray" @deleteFile="deleteFileFromCorner"/>

        <!-- ----------------------------------------------------dropdown----------------------------- -->
        <div class="leftSideContainerTwo classObt" :class="toggleObt ? 'classObtActive' : ''"
            v-if="siteSurveyStore.showDropdown == true">
            <img src="../assets/dropdown-arrow-down.png" alt="" :class="['toggle', toggle ? '' : 'toggleInvert']"  @click="toggleFunc()"  />
            <div class="flexObt">
                <p class=" darkBlueTxt boldTxt">Boundaries</p>
                <img src="../assets/dropdownArrow.svg" :class="['dropdownIcon', toggleObt ? 'dropDownArrowObt' : '']" style="cursor: pointer;"
                    @click="toggleObt = !toggleObt" />
            </div>
            <el-scrollbar class="bodyContainer" always id="guidance-roof-faces">
                <div class="sbFlex"  v-for="(markerIndex) in Object.keys(markerList)" :key="Number(markerIndex)">
                    <p class="editTxt">{{ markerList[markerIndex].title }}</p>
                    <div class="iconsflex">
                        <img src="../assets/Pencil.svg" class="editIcon" @click="handleEditClick(); setCurrentMarker(markerIndex,true);" />
                        <img src="../assets/Trash.svg" class="delIcon" @click="deleteMarkerInList(markerIndex); guideNextStep()"  />
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <InfoPopup
        v-if="isInfoPopupVisible"
        :isInfoPopupVisible="isInfoPopupVisible"
        @close="isInfoPopupVisible=false"
        :showInput="isAddressBarShown"
        :markerDetail="currentMarker" 
        :maxFiles="question.additional_info?.max_files"
        @updateMarker="updateMarkerInArray"
        />

    </div>
</template>


<script>
import API from '@/services/api';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import UndoEnabled from '../assets/ArrowCounterclockwise.svg';
import UndoDisabled from '../assets/undoDisabled.svg';
import RedoDisabled from '../assets/ArrowClockwise.svg';
import RedoEnabled from '../assets/redoEnabled.svg';
import InfoPopup from '../components/infoPopup.vue';
import InfoCard from '../components/infoCard.vue';
import { ElMessage } from 'element-plus';

export default {
    name: "toolbarForBoundary",
    props: {
        question: {
            type:Object,
            required: true,
        },
    },
    components: {
        InfoPopup,
        InfoCard
    },
    created() {
    },
    data() {
        return {
            // siteSurveyStore: useEditableSiteSurveyStore(),
            undoDisabled: UndoDisabled,
            undoEnabled: UndoEnabled,
            redoEnabled: RedoEnabled,
            redoDisabled: RedoDisabled,
            undoAvailable: false,
            redoAvailable: false,
            cancelEnabled: true,
            deleteSelectionEnabled: true,
            val: null,
            toggleObt: true,
            isInfoPopupVisible: false,
            isAddressBarShown:false,
            toggle: true,
            canUndo:true,
            canRedo:true,
            storedAnswers: null,
            questionObject: null,
            questionId: null,
            markerList:{
                    "1":{
                        
                        "title":"corner1",
                        "description":"corner description 1",
                        "files":[],
                        "lat":"75875",
                        "lng":"86754",
                        "zoom":"2"  
                    },
                    "2":{
                        "title":"corner2",
                        "description":"corner description 2",
                        "files":[],
                        "lat":"75875",
                        "lng":"86754",
                        "zoom":"2"
                    }
                },
            currentMarker: { // initializing some value so that we will not get property of undefined value
                "description":"",
                "files":[],
                "lat":'',
                "lng":'',
                "title":'',
            },

        }
    },
    mounted() {
        this.initialiseMarkersFromLS();
    },
    computed: {
        ...mapState(useEditableSiteSurveyStore, {
            siteSurveyStore: "GET_COMPLETE_STATE",
            isBoundaryCompleted:"IS_BOUNDARY_COMPLETED",
            markersChangedCounter:"MARKERS_CHANGED_COUNTER",
            getTotalMarkers:"GET_TOTAL_MARKERS",
            getUndoLength:"GET_UNDO_LENGTH",
            getRedoLength:"GET_REDO_LENGTH",
            showToolbarButtons: state => state.showToolbarButtons,
            currentGoogleMapGuideStep: state => state.currentGoogleMapGuideStep,
            showToolbar: state => state.showToolbar,
        }),
        isBoundariesCompletionEnabled(){
           return  this.getTotalMarkers >2 && !this.isBoundaryCompleted;
        },
        isEditMarkersEnabled(){
            return this.isBoundaryCompleted;
        },
        completeBoundaryImageURL(){
            let EnabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/checkDark.svg",import.meta.url).href;
            let disabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/check.svg",import.meta.url).href;
            return this.isBoundariesCompletionEnabled ? EnabledLogo : disabledLogo
        },
        editMarkersImageURL(){
            let EnabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Pencil-Blue.svg",import.meta.url).href;
            let disabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Pencil.svg",import.meta.url).href;
            return this.isEditMarkersEnabled ? EnabledLogo : disabledLogo
        },
        deleteAllMarkersImageURL(){
            let EnabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Trash-Red.svg",import.meta.url).href;
            let disabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Trash.svg",import.meta.url).href;
            return this.isDeleteAllMarkersEnabled ? EnabledLogo : disabledLogo
        },
        isUndoEnabled(){
            return this.getUndoLength>1;
        },
        isRedoEnabled(){
            return this.getRedoLength>0;
        },
        isDeleteAllMarkersEnabled(){
            return this.getTotalMarkers>0;
        }
    },
    methods: {
        addressChange() {
            this.changeAddressFunc()
            this.$emit('show-full-description')
        },
        ...mapActions(useEditableSiteSurveyStore, {
            showToolbarFunc: "SHOW_TOOLBAR",
            changeAddressFunc: "SHOW_SEARCH_BAR",
            completeBoundaries :"COMPLETE_BOUNDARIES",
            allowToDrawBoundaries :"ALLOW_TO_DRAW_BOUNDARIES",
            undo :"UNDO",
            redo :"REDO",
            triggerDeleteCoordinates:"DELETE_ALL_COORDINATES",
            setGoogleMapGuideId: 'CHANGE_GOOGLE_MAP_GUIDE_ID',
            setGoogleMapGuideStep: 'CHANGE_GOOGLE_MAP_GUIDE_STEP',
        }),
        handleEditClick(){
            this.showInputCardFunc();
            this.guideNextStep()
        },
        guideNextStep(){
            if (this.currentGoogleMapGuideStep != 6) return
            this.setGoogleMapGuideId(null);
            this.setGoogleMapGuideStep(7);
        },
        handleCompleteClick(){
            this.completeBoundariesMethod()
            this.$nextTick(() => {
                if (this.currentGoogleMapGuideStep != 4) return
                this.setGoogleMapGuideId('#guidance-point-info')
                this.setGoogleMapGuideStep(5)
            })
        },
        handleDrawBoundrayClick(){
            this.showToolbarFunc(); 
            if (this.currentGoogleMapGuideStep != 2) return
            this.setGoogleMapGuideId('#guidance-map-container')
            this.setGoogleMapGuideStep(3)
        },
        completeBoundariesMethod(){
            if(!this.isBoundariesCompletionEnabled)
                return;
            this.completeBoundaries();
        },
        showInputCardFunc() {
            console.log('show info')
            this.siteSurveyStore.showInfoCard = true;
            // this.siteSurveyStore.showToolbar = false;
        },
        showInfoPopup() {
            this.isInfoPopupVisible = true;
            // this.siteSurveyStore.showInfoCard = true;
        },
        toggleFunc() {
            this.toggle = !this.toggle;
            if(this.toggle == false) {
                document.getElementsByClassName('classObt')[0].style.height = '60px';
            } else {
                document.getElementsByClassName('classObt')[0].style.height = "50vh";

            }
        },
        setCurrentMarker(index, isIndividual = false){
            const keys = Object.keys(this.markerList);
            let arrayIndex = keys.indexOf(String(index))
            let isItFirstMarker =  arrayIndex==0; // If the arrayInex is 0, it means it the first marker irrespective of the display name, so for that there should not be a back button.
            const lastIndex = keys.length - 1;
            this.currentMarker = {...this.markerList[index]};
            this.currentMarker.index = index;
            this.currentMarker.isItFirstMarker = isItFirstMarker;
            if(isIndividual){
                this.currentMarker.isLastMarker = true;
                this.currentMarker.isIndividual = true; // so that isIndividual and isLastMarker can be used for different purpose
                this.siteSurveyStore.showDropdown = false;
            } 
            else this.currentMarker.isLastMarker = index == keys[lastIndex];
        },
        async updateMarkerInArray([markerChanged, action, isFromInfoPopup]){
            let modifiedMarker = this.markerList[markerChanged.index];
            let markerChangedTemp = {...markerChanged};
            if( modifiedMarker && markerChangedTemp){

                delete markerChangedTemp.index;
                delete markerChangedTemp.isLastMarker;
                delete markerChangedTemp.isIndividual;
                delete markerChangedTemp.isItFirstMarker;
                // console.log("modifiedMarker and markerChangedTemp", modifiedMarker, markerChangedTemp);
                const hasChanges = JSON.stringify({ ...modifiedMarker, files: null }) !== JSON.stringify({ ...markerChangedTemp, files: null});
                const hasFilesChanged = markerChangedTemp.files.length !== 0 ;
                modifiedMarker = {...markerChanged};
                const keys = Object.keys(this.markerList);
    
                //set the newIndex
                let newIndex;
                const currentIndex = keys.indexOf(markerChanged.index.toString());
                if (currentIndex !== -1) {
                    if (action === "next") {
                        newIndex = keys[currentIndex + 1];
                    } else if (action === "back") {
                        newIndex = keys[currentIndex - 1];
                    }
                }
                let isLastMarker = modifiedMarker.isLastMarker;
                let isIndividual = modifiedMarker.isIndividual;
                if(isIndividual && action=='back'){
                    this.siteSurveyStore.showDropdown = true;
                }
                //remove unwanted properties
                delete modifiedMarker.index;
                delete modifiedMarker.isLastMarker;
                delete modifiedMarker.isIndividual;
                if(hasChanges || hasFilesChanged){
                    // console.log("hasChanges", hasChanges, hasFilesChanged);
                    // console.log("modified marker after answer and before corner patch", modifiedMarker);
                    modifiedMarker = await this.patchCornerAPICall(modifiedMarker);
                    // console.log("modified marker after corner patch", modifiedMarker);
                    //put patched marker in markerList and update parent objects
                    this.markerList[markerChanged.index] = modifiedMarker;
                    this.questionObject.answer.corners.coordinates = this.markerList;
                    this.storedAnswers[this.questionId] = this.questionObject;
                    //update the LS with the total list of files
                    this.updateMarkersInLS();
                } 
                if(isLastMarker && action === "next" && !isIndividual){
                    this.siteSurveyStore.showDropdown = true;
                    // Now make an API call to let the backend know that from now lets show all the list of corners after reload and not individual corners.
                    await this.apiCallToShowAllListOfCorners();
                }
                //set the currentMarker to the new index only if it exists
                if(keys.includes(newIndex)){
                    this.setCurrentMarker(newIndex);
                    if(isFromInfoPopup) this.showInfoPopup();
                    else{
                        this.showInputCardFunc();
                    } 
                }
                if(newIndex === undefined || isIndividual){
                    //Trying to go before the first corner will simply hide the infocard
                    //Also whenever the card is the isIndividual or its opened using edit button(which can be used as a isIndividual) then make showInfoCard as false
                    this.siteSurveyStore.showInfoCard = false;
                }
            }
        },
        apiCallToShowAllListOfCorners(){
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            let currentAnswerJson = this.storedAnswers[this.question.id];
            if( currentAnswerJson.answer.additional_info){
                currentAnswerJson.answer.additional_info.isAllCornersPassed = true;
                currentAnswerJson.answer.additional_info.is_boundary_completed = true;
            }
            this.storedAnswers[this.question.id] = currentAnswerJson;
            this.updateMarkersInLS();
            this.updateMarkersByAnswerAPICall();
        },
        async deleteMarkerInList(markerIndexToDelete){
            let cornerId = this.markerList[markerIndexToDelete].id;
            try{
                await API.EDITABLE_SITE_SURVEY_API.DELETE_CORNER(cornerId);
                delete this.markerList[markerIndexToDelete];
                this.questionObject.answer.corners.coordinates = this.markerList;
                this.storedAnswers[this.questionId] = this.questionObject;
                this.updateMarkersInLS();
                this.$emit('deleteCorner');
                if(Object.keys(this.markerList).length === 0){
                    this.questionObject.answer.corners.coordinates = {};
                    this.questionObject.answer.additional_info.is_boundary_completed = false;
                    this.questionObject.answer.additional_info.isAllCornersPassed = false;
                    this.storedAnswers[this.questionId] = JSON.parse(JSON.stringify(this.questionObject));
                    this.updateMarkersInLS();
                    this.updateMarkersByAnswerAPICall();
                    // this.triggerDeleteCoordinates();
                    this.siteSurveyStore.showDropdown= false;

                }
            }
            catch(e){
                console.error(e);
                ElMessage({
                    message: 'Failed to delete the marker!',
                    type: 'error',
                })
            }
        },
        convertCoordinateArrayToJson(coordinatesInfo) {
            if (Array.isArray(coordinatesInfo)) {
                let Obj = {};
                coordinatesInfo.forEach((coordinateObj) => {
                let displayName = coordinateObj.display_name;
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
                });
                return Obj;
            }
            return coordinatesInfo;
        },
        initialiseMarkersFromLS(){
            this.questionId = this.question.id
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.questionObject = this.storedAnswers[this.questionId];
            this.markerList = {...this.questionObject.answer.corners.coordinates};
            const keys = Object.keys(this.markerList);
            this.setCurrentMarker(keys[0]);
        },
        async updateMarkersByAnswerAPICall(){
            this.removeThumbnailURL();
            const duplicateStoredAnswer = JSON.parse(JSON.stringify(this.storedAnswers[this.questionId]))
            const newAnswer =this.removeFilesThatExistAnswerLevel(duplicateStoredAnswer);
            const response = await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(newAnswer);
            return response.data;
        },
        async deleteAllMarkersByAnswerAPICall(cornerId,answerId){
            this.removeThumbnailURL();
            const duplicateStoredAnswer = JSON.parse(JSON.stringify(this.storedAnswers[this.questionId]))
            const newAnswer =this.removeFilesThatExistAnswerLevel(duplicateStoredAnswer);
            const response = await API.EDITABLE_SITE_SURVEY_API.DELETE_ALL_CORNERS(cornerId,answerId);
            // return response.data;
        },
        removeFilesThatExistAnswerLevel(storedAnswer){
            for (let coordinate in storedAnswer.answer.corners.coordinates) {
                const files = storedAnswer.answer.corners.coordinates[coordinate].files;
                storedAnswer.answer.corners.coordinates[coordinate].files = files.filter(file => !file.file_url);
            }
            return storedAnswer;
        },
        async patchCornerAPICall(corner){
            this.removeThumbnailURLForGivenCorner(corner);
            const response = await API.EDITABLE_SITE_SURVEY_API.PATCH_CORNER(corner.id,corner);
            //now get the response and return it  
            return response.data;
        },
        updateMarkersInLS(){
            localStorage.setItem('overallMappingOfQidToAnsJson',JSON.stringify(this.storedAnswers));
            // also update finalCoordinatesStructure with this.markerList
            const finalCoordinatesStructure = JSON.parse(localStorage.getItem("finalCoordinatesStructure")) || {};
            // for each element in this.markerList, update the finalCoordinatesStructure
            for(let marker in this.markerList){
                finalCoordinatesStructure[marker] = this.markerList[marker];
            }              
            localStorage.setItem('finalCoordinatesStructure', JSON.stringify(finalCoordinatesStructure));
        },
        async deleteAllCoordinates(){
            if(!(this.getTotalMarkers>0))
                return;
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            const finalCoordinatesStructure=JSON.parse(localStorage.getItem("finalCoordinatesStructure")) || {};
            this.questionObject = this.storedAnswers[this.questionId];
            const answerId=this.storedAnswers[this.questionId]?.answer.answerId;
            const cornerId=finalCoordinatesStructure[1].id
            this.questionObject.answer.corners.coordinates = {};
            this.questionObject.answer.additional_info.is_boundary_completed = false;
            this.questionObject.answer.additional_info.isAllCornersPassed = false;
            this.storedAnswers[this.questionId] = JSON.parse(JSON.stringify(this.questionObject));
            await this.deleteAllMarkersByAnswerAPICall(cornerId,answerId);
            this.storedAnswers[this.questionId].answer['corners']['coordinates']={}; // TODO: overriding to {} as getting wrong value from backend
            this.updateMarkersInLS();
            this.updateMarkersByAnswerAPICall();
            this.triggerDeleteCoordinates();
        },
        removeThumbnailURL(){
            for(let marker in this.markerList){
                if(this.markerList[marker].files.length > 0){
                    for(let file of this.markerList[marker].files){
                        delete file.url;
                    }
                }
            }
        },
        removeThumbnailURLForGivenCorner(corner){
            if(corner.files.length > 0){
                for(let file of corner.files){
                        delete file.url;
                }
            }
        },
        async deleteFileFromCorner([corner,corner_file_name]){
            const cornerObject = {...corner};
            delete cornerObject.index;
            cornerObject.deleted_files = [corner_file_name];
            const modifiedMarker = await this.patchCornerAPICall(cornerObject);
            //put patched marker in markerList and update parent objects
            this.markerList[corner.index] = modifiedMarker;
            this.questionObject.answer.corners.coordinates = this.markerList;
            this.storedAnswers[this.questionId] = this.questionObject;
            //update the LS with the total list of files
            this.updateMarkersInLS();
            //update the current currentMarker
            this.setCurrentMarker(this.currentMarker.index, this.currentMarker.isIndividual);
        }
    },
    watch:{
        markersChangedCounter:{
            handler(val){
                this.initialiseMarkersFromLS();
            }
        },
        showToolbarButtons:{
            handler(val){
                if (!val) return
                this.$nextTick(() => {
                    if (this.currentGoogleMapGuideStep != 1) return
                    this.setGoogleMapGuideId('#draw-boundary-guidance')
                    this.setGoogleMapGuideStep(2)
                })
            }
        },
        showToolbar: {
            handler(val){
                // to prevent guide to show the initial step if showtoolbar is true
                if (!val || this.currentGoogleMapGuideStep > 1) return
                this.setGoogleMapGuideId(null)
            }
        }
        
    }


}
</script>

<style scoped>

.resetCoordinates, .undoIcon, .redoIcon{
    cursor: pointer;
}
.toolbarContainer {
    position: absolute;
    width: 100%;
    top: 0px;
    z-index: 1;
}

.btnsContainer {
    position: absolute;
    margin-top: 24px;
    top: 0px;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0px 16px;
}

.commonCard {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #fff;
    padding: 16px;
    height: 52px;
    border-radius: 8px;
    cursor: pointer;
}

.commonBlueTxt,
.commonBlackTxt {
    font-size: 16px;
    font-weight: 600;
    color: #409EFF;
    white-space: nowrap;
}

.commonBlackTxt {
    color: #222;
}

.flexContainer {
    margin: 24px 16px 0px 16px;
    display: flex;
    align-items: center;
    height: 56px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 0px 8px rgba(0, 0, 0, 0.5);
}

.flexContainerMD {
    display: none;
}

.toolbarBtnCont {
    display: grid;
    grid-template-columns: 24px auto;
    align-items: center;
    gap: 12px;
    background-color: #fff;
    padding: 16px 30px 16px 16px;
    height: 56px;
    border-right: 2px solid #777;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}

.toolbarsideCont {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 24px;
    padding: 0px 40px;
}

.undoRedoDelCont {
    display: flex;
    gap: 24px;
    align-items: center;
}

.cancel {
    font-size: 14px;
    color: #222;
    margin-right: 8px;
}

.cancel_disabled {
    font-size: 14px;
    color: #8b8686;
    margin-right: 8px;
    cursor: not-allowed;
}

.delSel {
    font-size: 14px;
    color: #EF6C00;
    cursor: pointer;
}

.delSel_disabled {
    font-size: 14px;
    color: #8b8686;
}

.completeBtnBtn {
    height: 40px;
    border: 2px solid #409EFF;
    font-size: 16px;
    color: #409EFF;
    padding: 0px 16px;
}

.completeBtnBtn.is-disabled {
    border: 2px solid #ccc;
    font-size: 16px;
    color: #777;
}

.secBtn {
    position: absolute;
    width: 100%;
    top: 80px;
    width: fit-content;
    margin-top: 16px;
    margin-left: 16px;
}

.classObt {
    width: auto;
    min-width: 344px;
    max-height: 52px;
    overflow: hidden;
    transition: all ease-in-out .4s;
}

.leftSideContainerTwo {
    position: absolute;
    box-shadow: 0 0 10px #00000040;
    margin-left: 16px;
    top: 96px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 8px;
    width: 300px;
    background-color: #fff;
    cursor: pointer;
}

.flexObt {
    display: flex;
    justify-content: space-between;
    padding: 16px;
}

 .leftSideContainerTwo :deep() .el-scrollbar__view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 250px;
    max-height: 42vh;
    padding: 0px 16px 16px 16px;
}

.sbFlex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
}

.iconsflex {
    display: flex;
    align-items: center;
    gap: 16px;
}

.dropDownArrowObt {
    transform: rotate(180deg);
    transition: all ease-in-out .2s;
}

.classObtActive {
    max-height: fit-content;
}

.toggle {
    display: none;
}

.editIcon, .delIcon{
    cursor: pointer;
}
.notAllowed{
    cursor: not-allowed;
}
@media (max-width: 900px) {


    .flexObt {
        padding: 0px 16px 8px 16px;
    }

    .commonCard {
        gap: 10px;
        padding: 10px;
    }

    .commonBlueTxt {
        font-size: 15px;
    }

    .flexContainer,
    .secBtn {
        display: none;
    }

    .flexContainerMD {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #fff;
        height: 50px;
        border-radius: 4px;
        margin: 0px 16px;
        padding: 8px 16px;
        margin-top: 16px;
    }

    .leftSideContainerTwo {
        margin-left: 0px;
        height: auto;
        padding: 8px 0px 0px 0px;
        background-color: #fff;
        border-radius: 8px;
        position: fixed;
        bottom: 0px;
        width: 100%;
        left: 0px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        top: auto;
        max-height: 330px !important;
    }

    .toggle {
        display: inherit;
        margin: 0px auto -16px auto;
        cursor: pointer;
        filter: invert(1);
        height: 25px;
    }

    .toggleInvert {
        transform: rotate(180deg);
    }

    .dropdownIcon {
        display: none;
    }

    .classObt {
        max-height: inherit;
    }

}
</style>
