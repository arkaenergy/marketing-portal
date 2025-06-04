<template>
    <div class="parentContainer" :class="{ 'popup-visible': showInfoPopup }">
        <div class="background-overlay" v-if="showInfoPopup" @click="closePopup"></div>
        <div v-if="isDesktop">
            <div class="headingCont">
                <p class="heading">{{currentSection.title}}</p>
                <div class="text-container">
                    <div class="text-wrapper">
                        <p class="paragraph" ref="paragraph">{{ currentSection.description }}</p>
                        <label v-if="showMoreButton" class="show-more-button" @click="showPopup()">See more</label>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="headingCont" v-if="showDescription && siteSurveyStore.showSearchLocationInput">
                <p class="heading">{{currentSection.title}}</p>
                <div class="text-container">
                    <div class="text-wrapper">
                        <p class="paragraph" ref="paragraph">{{ currentSection.description }}</p>
                        <label v-if="showMoreButton" class="show-more-button" @click="showPopup()">See more</label>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="positionR">
            <googleMapForSiteSurvey
                :question="question"
                :key="componentKey"
                @refresh="handleRefresh()"
                @hide-full-description="hideFullDecription()"
                @show-full-description="showFullDescription()"
            />
            <toolbarForBoundary :question="question" @deleteCorner="deleteCorner" @show-full-description="showFullDescription()" @hide-full-description="hideFullDecription()"/>
        </div>
        <allBoundariesList />
        <editBoundaryOrPOI />
        <informationPopup v-if="showInfoPopup" @toggleClicked="showPopup()"  :currentSection="currentSection"/>
    </div>
</template>


<script>
import API from '@/services/api';
import toolbarForBoundary from './toolbarForBoundary.vue';
import allBoundariesList from './allBoundariesList.vue';
import editBoundaryOrPOI from './editBoundaryOrPOI.vue';
import googleMapForSiteSurvey from './googleMapForSiteSurvey.vue';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import informationPopup from '../components/informationPopup.vue'

export default {
    name: "googleMapSection",
    components: {
        informationPopup,
        toolbarForBoundary,
        allBoundariesList,
        editBoundaryOrPOI,
        googleMapForSiteSurvey,
        
    },
    created() {

    },
    props: {
        question: {
            type: Object,
        },
        currentSection: {
            type: Object
        },
    },
    data() {
        return {
            refreshCounter: 0,
            componentKey:0,
            showMoreButton: false,
            showInfoPopup: false,
            showDescription: true,
        }
    },
    mounted() {
        localStorage.setItem('boundaryQuestion',JSON.stringify(this.question));
        window.addEventListener('resize', () => {
            this.isDesktop = window.innerWidth > 600;
        })
        this.isTextTruncated();
        const vm = this;
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
        isDesktop() {
            return window.innerWidth > 600;
        },
        ...mapState(useEditableSiteSurveyStore, {
            deleteCoordinatesCounter: "DELETE_COORDINATES_COUNTER",
            siteSurveyStore: "GET_COMPLETE_STATE",
        }),
        ...mapActions(useEditableSiteSurveyStore, {
            updateUndoAndRedoLength: "UPDATE_UNDO_AND_REDO_LENGTH",
        })
    },
    methods: {
        handleRefresh(undo, redo){
            // if dragged more than the limit
            this.componentKey++;
            this.$nextTick(() => {
                this.updateUndoAndRedoLength(undo, redo);
            })
        },
        hideFullDecription() { 
            this.showDescription = false
        },
        showFullDescription() {
            this.showDescription = true;
        },
        closePopup() {
            this.showInfoPopup = false;
        },
        deleteCorner(){
            this.componentKey++;
        },
        showPopup() {
            this.showInfoPopup = !this.showInfoPopup;
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
    watch:{
        deleteCoordinatesCounter:{
            handler(val,oldVal){
                if(val!=oldVal){
                    this.componentKey++;
                }
            }
        }
    }


}
</script>


<style scoped>
.headingCont {
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
.parentContainer {
    padding: 36px;
    background-color: #E8EDF2;
    height: calc(100vh - 58px);
}

.heading {
    font-size: 20px;
    font-weight: bold;
    color: #222;
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

.positionR {
    position: relative;
}

@media (max-width: 900px) {

.heading,
.paragraph {
}

.parentContainer {
    padding: 0px;
}
}
@media (max-width: 500px){
    .paragraph{
    }
    .show-more-button{
        font-size: 14px;
    }
}

</style>