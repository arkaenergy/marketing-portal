<template>
    <div class="container" :class="{ 'popup-visible': showInfoPopup, 'disable-text-selection': isDragEnabled}">
        <div class="background-overlay" v-if="showInfoPopup" @click="closePopup"></div>
        <div class="childContainer">
            <div class="heading-cont">
                <p class="heading">{{ currentSection.title }}</p>
                <div class="text-container">
                    <div class="text-wrapper">
                        <p class="paragraph" ref="paragraph">{{ currentSection.description }}</p>
                        <label v-if="showMoreButton" class="show-more-button" @click="showPopup()">See more</label>
                    </div>
                </div>
            </div>
            <el-scrollbar class="fieldsParentContainer" always @scroll="handleScroll" ref="scrollRef">
                <div v-for="(question, index) in currentSection.fields" :key="index" :class="[isSiteSurveyPreviewMode ? 'disable-pointer-events' : '', 'fields-container-scrollbar']">
                    <allGenericFields  
                        :questions = "question"
                        :answers = "answers"
                        @triggerPOI="triggerPOI"
                        @triggerPOIEditMode="triggerPOIEditMode" 
                        :isSiteSurveyPreviewMode="isSiteSurveyPreviewMode"
                        />
                </div>
            </el-scrollbar>
            <div class="custom-scroll" 
                :style="{height: `${scrollThumbHeight}px`, 
                top: `${scrollTopValue}px`}"
                @mouseup="endDrag"
                @mousemove="handleDrag"
                @mouseleave="isDragEnabled = false"
                v-if="showCustomScroll"
            >
                <div @mousedown="startDrag" class="custom-scroll-thumb">
                </div>
            </div>
        </div>
    </div>
    <informationPopup v-if="showInfoPopup" @toggleClicked="showPopup"  :currentSection="currentSection"/>
    <InfoPopup
        v-if="isInfoPopupVisible"
        :isInfoPopupVisible="isInfoPopupVisible"
        @close="isInfoPopupVisible=false"
        :showInput="isAddressBarShown"
        :questionIdOfPOI="Number(questionIdOfPOI)"
        :poiToBeEdited="poiToBeEdited"
        :isPath="poiToBeEdited.coordinates||poiToBeEdited.length?true:false"
        :isInfoCardVisibleFromProp="isInfoCardVisible"
        :keyToAccessCurrentCoordinate="keyToAccessCurrentCoordinate"
        :currentSection="currentSection"
    />
</template>


<script>
import API from '@/services/api';
import allGenericFields from './allGenericFields.vue';
import InfoPopup from '../components/infoPopup.vue';
import informationPopup from '../components/informationPopup.vue';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';

export default {
    name: "individualPageForSection",
    components: {
        allGenericFields,
        InfoPopup,
        informationPopup
    },
    props: {
        currentSection: {
            type: Object
        },
        answers: {
            type: Array,
            required: false,
        },
        isSiteSurveyPreviewMode:{
            type: Boolean,
            required: false,
            default: false,
        }
    },
    created() {

    },
    data() {
        return {
            isInfoPopupVisible: false,
            isAddressBarShown:false,
            questionIdOfPOI:'',
            poiToBeEdited:{},
            isInfoCardVisible:true,
            keyToAccessCurrentCoordinate:1,
            showMoreButton: false,
            showInfoPopup: false,
            scrollTopPercentage: 0,
            currentWindowHeight: null,
            isDragEnabled: false,
            showCustomScroll: false,
            headerHeight: 56, // height of the header
        }
    },
    mounted() {
        this.currentWindowHeight = window.innerHeight
        this.isTextTruncated();
        const vm = this;

        window.addEventListener(
            "resize",
            function(e){
                this.handleResize(e)
            }.bind(vm)
        );

        window.addEventListener(
        "click",
        function (e) {
            let informationPopup = document.querySelector(".show-more-button");
            if (!informationPopup) {
            return;
            }

            if (informationPopup?.contains(e.target)) {
            this.showInfoPopup = true;
            } else {
            this.showInfoPopup = false;
            }
        }.bind(vm)
        );
    },
    computed: {
        ...mapState(useEditableSiteSurveyStore, {
            currentSectionIndex : state => state.currentSectionIndex
        }),
        scrollThumbHeight(){
            if(!this.$refs.scrollRef?.wrapRef) return this.currentWindowHeight * 0.20
            let percentageDiff = (this.$refs.scrollRef?.wrapRef?.offsetHeight / this.$refs.scrollRef?.wrapRef?.scrollHeight) * 100
            let thumbHeight = this.currentWindowHeight * (percentageDiff/100) - this.headerHeight
            return thumbHeight < 100 ? 100 : thumbHeight
        },
        scrollTopValue(){
            return ((this.currentWindowHeight - this.headerHeight - this.scrollThumbHeight) * this.scrollTopPercentage/100) + this.headerHeight
        },
    },
    methods: {
        ...mapActions(useEditableSiteSurveyStore, {
            resetPathStates:'SET_PATH_STATE',
            showPathFunc:'SHOW_PATH',
            pathDistance:'CAPTURE_PATH_DISTANCE',
            pathActiveIndex:'PATH_ACTIVE_INDEX',

        }),
        scrollTopMax(){
            return (this.$refs.scrollRef.wrapRef.scrollHeight - this.$refs.scrollRef.wrapRef.offsetHeight)
        },
        handleDrag(e){
            if(!this.isDragEnabled) return
            let incrementValue = this.scrollTopMax() * 0.001 < 2 ? 2 : this.scrollTopMax() * 0.001
            if(e.movementY > 0){
                if(this.$refs.scrollRef.wrapRef.scrollTop < this.scrollTopMax()){
                    for(let i = 0; i<e.movementY; i++) this.$refs.scrollRef.wrapRef.scrollTop += incrementValue
                }else{
                    this.$refs.scrollRef.wrapRef.scrollTop = this.scrollTopMax()
                }
            }else if(e.movementY < 0){
                if(this.$refs.scrollRef.wrapRef.scrollTop > 0){
                    for(let i = 0; i<(-1*e.movementY); i++) this.$refs.scrollRef.wrapRef.scrollTop -= incrementValue
                }else{
                    this.$refs.scrollRef.wrapRef.scrollTop = 0
                }
            }
        },
        startDrag(){
            this.isDragEnabled = true;
        },
        endDrag() {
            this.isDragEnabled = false
        },
        handleResize(){
            this.currentWindowHeight = window.innerHeight;
        },
        handleScroll(){
            this.scrollTopPercentage = 100 * (this.$refs.scrollRef.wrapRef.scrollTop / this.scrollTopMax());
        },
        closePopup() {
            this.showInfoPopup = false;
        },
        showPopup() {
            this.showInfoPopup = !this.showInfoPopup;
        },
        triggerPOI(questionIdOfPOI,keyToAccessCurrentCoordinate){
            this.keyToAccessCurrentCoordinate = keyToAccessCurrentCoordinate;
            this.questionIdOfPOI = questionIdOfPOI;
            this.poiToBeEdited={};
            this.isInfoCardVisible=false; // info card should not be visible whenever adding new POI, should be visible just after that.
            this.isInfoPopupVisible=true;
            this.resetPathStates()
        },
        triggerPOIEditMode([questionIdOfPOI, poiToBeEdited,keyToAccessCurrentCoordinate,poiArray]){
            console.log('poiToBeEdited: ', poiToBeEdited);

            let pathData=poiArray?.filter(d=>d.coordinates)
          
           if(poiToBeEdited?.coordinates||poiToBeEdited?.length){
            pathData.map((pt,index)=>{
                if(pt.id==poiToBeEdited.id){
                    this.pathActiveIndex(index)
                    
                }
            })

            this.pathDistance(poiToBeEdited?.length);
            // this.showPathFunc()
           }

            this.keyToAccessCurrentCoordinate = keyToAccessCurrentCoordinate;
            this.questionIdOfPOI = questionIdOfPOI;
            this.poiToBeEdited  = poiToBeEdited;
            console.log('this.poiToBeEdited: ', this.poiToBeEdited);
            this.isInfoCardVisible=true;
            this.isInfoPopupVisible=true;
        },
        isTextTruncated() {
                const paragraphElement = this.$refs.paragraph;
                if (paragraphElement) {
                    if(paragraphElement.scrollHeight > paragraphElement.clientHeight) {
                        this.showMoreButton = true;
                    }
                }
        },
    },
    watch: {
        currentSectionIndex: {
            immediate: true,
            handler(val){
                this.$nextTick(() => {
                    this.showCustomScroll = this.$refs.scrollRef?.wrapRef?.scrollHeight > this.$refs.scrollRef?.wrapRef?.offsetHeight || false
                })
            }
        }
    }


}
</script>


<style scoped>
.disable-text-selection{
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
}
.fieldsParentContainer >>> .el-scrollbar__thumb {
    opacity: 0;
}
.custom-scroll{
    width: 100px;
    background-color: transparent;
    position: absolute;
    right: 0;
    animation-timing-function: linear;
    display: flex;
    justify-content: end;
    padding-right: 1px;
}
.custom-scroll-thumb{
    width: 6px;
    background-color: #777777;
    height: inherit;
    border-radius: 8px;
    cursor: pointer;
    opacity: 0.5;
}
.heading-cont{
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 8px;
}
.background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(37, 35, 35, 0.6);
    z-index: 999;
    pointer-events: auto;
    transition: opacity 0.3s ease;
    opacity: 0;
}

.popup-visible .background-overlay {
    opacity: 1;
}
.container {
    width: 100%;
    height: calc(100vh - 58px);
    background-color: #E8EDF2;
    padding-top: 36px;
}
.show-more-button{
    background: none;
    border: none;
    cursor: pointer;
    color: #409EFF;
    align-self: center;
    margin-top: 23px;
}
.text-container{
    display: flex;
    align-items: flex-start;
}
.text-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 0px;
}
.childContainer {
    width: 80vw;
    margin: auto;
    /* height: 120%; */
}

.heading {
    font-size: 20px;
    font-weight: bold;
}

.paragraph {
    font-size: 16px;
    line-height: 20px;
    color: #222;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
            line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 80vw;
    margin-right: -5px;
    flex: 1;
}
.fieldsParentContainer {
    display: flex;
    flex-direction: column;
    gap: 30px;
    background-color: #fff;
    border-radius: 8px;
    height: calc(100vh - 250px);
}

.container :deep() .el-scrollbar__view {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 36px;
}

.disable-pointer-events{
  pointer-events: none !important;
}

@media (max-width: 900px) {

    .container {
        padding-top: 0px;
        height: calc(100vh - 58px);
        overflow-y: scroll;
        background-color: #fff;
    }
    .childContainer {
        width: 100%;
    }

    .fieldsParentContainer {
        padding: 24px 16px 64px 16px;
        height: auto;
    }

    .container :deep() .el-scrollbar__view {
        padding: 0px;
    }
    .custom-scroll{
        display: none;
    }
}
@media (max-width: 500px){
    .show-more-button{
        font-size: 14px;
    }
}
</style>