<template>
  <div class="toolbarContainer">
        <div class="btnsContainer" v-if="!siteSurveyStore.showPathToolbar">
            <div class="commonCard" id="guidance-poi-btn"  @click="handlepin">
               <span><img src="../assets/pinView.svg" class="houseIcon" /></span>{{ 'POI' }}
                
               
              
            </div>
            <div class="commonCard" id="guidance-path-btn" @click="showPathFunc()">
            <span><img src="../assets/editAddress.svg" class="unionIcon" /></span> {{ 'Path' }}
                
            </div>
           
            

        </div>

       <!-- ---------------------------------------------toolbar-------------------------------- -->
       <div class="flexContainer" v-if="siteSurveyStore.showPathToolbar">

            <div class="toolbarBtnCont" >
                <img src="../assets/boundaryBlack.svg" class="blackHouseIcon" />
                <p class="commonBlackTxt">Draw Path</p>
            </div>
            <div class="toolbarsideCont">
                <div class="undoRedoDelCont">
               
                    <img @click="undo" :src="undoPathLength>0 ? undoEnabled : undoDisabled" class="undoIcon" :class="{'notAllowed':undoPathLength<0 }"  />
                    <img @click="redo" :src="redoPathLength>0 ? redoEnabled : redoDisabled" class="redoIcon"  :class="{'notAllowed':redoPathLength<1 }" />
                   
                    <div>
                        <p :disable="deletePathEnable()" class="delSel" @click="deleteAllCoordinates()" :class="{'notAllowed':deletePathEnable() }">Delete Path</p>
                    </div>
                  
                </div>
                <el-button :disabled="enableComplete()" class="commonClassBtn completeBtnBtn" id="SalesModeOnCompleteBTN"  :class="{'notAllowed':enableComplete()}"
                    @click="completePathMethod()">Complete</el-button>
            </div>
        </div>
             <!-- ---------------------------------------------toolbar-MV-------------------------------- -->

        <div class="flexContainerMD" v-if="siteSurveyStore.showPathToolbar">
            <img @click="undo" :src="undoPathLength>1  ? undoEnabled : undoDisabled" class="undoIcon"  />
            <img @click="redo" :src="redoPathLength>0 ? redoEnabled : redoDisabled" class="redoIcon" />
            <img :src="deleteAllMarkersImageURL()" @click="deleteAllCoordinates()"   class="delIcon" />
            <img  :src="completeBoundaryImageURL()"   @click="completePathMethod()" alt="" />
        </div>

    </div>
</template>

<script>
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import UndoEnabled from '../assets/ArrowCounterclockwise.svg';
import UndoDisabled from '../assets/undoDisabled.svg';
import RedoDisabled from '../assets/ArrowClockwise.svg';
import RedoEnabled from '../assets/redoEnabled.svg';
import InfoPopup from '../components/infoPopup.vue';
import InfoCard from '../components/infoCard.vue';
import { ElMessage } from 'element-plus';
import { mapState, mapActions } from 'pinia';
import API from '@/services/api';

    export default {


        props: {
        question: {
            type:Object,
            required: true,
        },
      
    },
computed:{
    ...mapState(useEditableSiteSurveyStore, {
            siteSurveyStore: "GET_COMPLETE_STATE",
            isBoundaryCompleted:"IS_BOUNDARY_COMPLETED",
            markersChangedCounter:"MARKERS_CHANGED_COUNTER",
            getTotalMarkers:"GET_TOTAL_MARKERS",
            getUndoLength:"GET_UNDO_LENGTH",
            getRedoLength:"GET_REDO_LENGTH",
            undoPathLength: "GET_UNDO_PATH_LENGTH",
            redoPathLength: "GET_REDO_PATH_LENGTH",
            isPathEditable:'PATH_EDITABLE',
        }),
},
mounted() {
        this.initialiseMarkersFromLS();
    },
data() {
        return {
            storedAnswers:null,
            questionId: null,
            questionObject:null,
            markerList:null,
            currentMarker:null,
            undoDisabled: UndoDisabled,
            undoEnabled: UndoEnabled,
            redoEnabled: RedoEnabled,
            redoDisabled: RedoDisabled,
            distance:null,
            isDeleteAllPathPointersEnabled:true
        }},
        methods:{
            ...mapActions(useEditableSiteSurveyStore, {
            showToolbarFunc: "SHOW_TOOLBAR",
            showPathFunc:'SHOW_PATH',
            initialPathFunc:'SET_PATH_STATE',
            changeAddressFunc: "SHOW_SEARCH_BAR",
            completeBoundaries :"COMPLETE_BOUNDARIES",
            completePath :"COMPLETE_PATH",
            allowToDrawBoundaries :"ALLOW_TO_DRAW_BOUNDARIES",
            undo :"UNDOPATH",
            redo :"REDOPATH",
            triggerDeletePath:"DELETE_ALL_PATH_COORDINATES",
        }),
        initialiseMarkersFromLS(){
            this.questionId = this.question.id
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.questionObject = this.storedAnswers[this.questionId];
            this.markerList = {...this.questionObject.answer.corners.coordinates};
            const keys = Object.keys(this.markerList);
            this.setCurrentMarker(keys[0]);
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
            handlepin(){
                this.$emit('click-poimode')
            },
            async updateMarkersByAnswerAPICall(){
            // this.removeThumbnailURL();
            const duplicateStoredAnswer = JSON.parse(JSON.stringify(this.storedAnswers[this.questionId]))
            const newAnswer =this.removeFilesThatExistAnswerLevel(duplicateStoredAnswer);
            const response = await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(newAnswer);
            return response.data;
        },
        removeFilesThatExistAnswerLevel(storedAnswer){
            for (let coordinate in storedAnswer.answer.corners.coordinates) {
                const files = storedAnswer.answer.corners.coordinates[coordinate].files;
                storedAnswer.answer.corners.coordinates[coordinate].files = files.filter(file => !file.file_url);
            }
            return storedAnswer;
        },
            updateMarkersInLS(){
            localStorage.removeItem('finalPathCordinates');
            // localStorage.removeItem('pathCornersArray');
        },
        async deleteAllCoordinates(){
            // if(!(this.getTotalMarkers>0))
            //     return;
            // this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            // this.questionObject = this.storedAnswers[this.questionId];
            // this.questionObject.answer.corners.coordinates = {};
            // this.questionObject.answer.additional_info.is_boundary_completed = false;
            // this.questionObject.answer.additional_info.isAllCornersPassed = false;
            // this.storedAnswers[this.questionId] = JSON.parse(JSON.stringify(this.questionObject));
            // this.storedAnswers[this.questionId] = await this.updateMarkersByAnswerAPICall();
            // this.storedAnswers[this.questionId].answer.corners.coordinates={}; // TODO: overriding to {} as getting wrong value from backend
            if(this.deletePathEnable()){
                return
            }else{
                this.updateMarkersInLS();
                this.triggerDeletePath();
            }       
        },
        completePathMethod(){
            if(this.enableComplete){
                this.$emit('click_pathcomplete')
            }
            else{
                return
            } 
            this.completePath();
        },
        deleteAllMarkersImageURL(){
            let EnabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Trash-Red.svg",import.meta.url).href;
            let disabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/Trash.svg",import.meta.url).href;
            return !this.deletePathEnable() ? EnabledLogo : disabledLogo
        },
        completeBoundaryImageURL(){
            let EnabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/checkDark.svg",import.meta.url).href;
            let disabledLogo =    new URL("/src/pages/editableSiteSurvey/assets/check.svg",import.meta.url).href;
            return !this.enableComplete() ? EnabledLogo : disabledLogo
        },
        deletePathEnable(){
            if(this.isPathEditable){
            return false;

           }else{
            return this.undoPathLength>1?false:true;

           }
        },
        enableComplete(){
           if(this.isPathEditable){
            return this.undoPathLength>0?false:true;

           }else{
            return this.undoPathLength>1?false:true;

           }
        },

        },
       
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
    margin-top: 32px;
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
    height: 52px;
    border-radius: 8px;
    cursor: pointer;
    padding: 16px;
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



.toolbarBtnCont {
    position: absolute;
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
    padding: 0px 40px 0px 200px;
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
.flexContainerMD {
display: none;
}
.unionIcon{
}
@media (max-width: 900px) {


    .flexObt {
        padding: 0px 16px 8px 16px;
    }

    .commonCard {
      
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
        background-color: #fff !important;
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