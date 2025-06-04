<template v-loading="isLoading">
    <instructionsPage @accepted="handleAccept" v-if="!showAll"/>
    <allSectionsComponent v-if="!isLoading && showAll" :isSiteSurveyPreviewMode="isSiteSurveyPreviewMode"/> 
</template>


<script>
import API from '@/services/api';
import instructionsPage from './components/instructionsPage.vue';
import allSectionsComponent from './components/allSectionsComponent.vue';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";
import { useEditableSiteSurveyStore } from '../store/editableSiteSurveyStore'
import { mapState, mapActions } from 'pinia';

export default {
    name: "homePage",
    components: {
        instructionsPage,
        allSectionsComponent,
    },
    created(){
        this.checkGuideStatus()
        this.isLoading = true;
        this.clearLocalStorage();
        const currentUrl = window.location.href;

        // Check if the URL contains 'siteSurveyPreview'
        if (currentUrl.includes("siteSurveyPreview")) {
            this.isSiteSurveyPreviewMode = true;
            console.log("The current URL contains 'siteSurveyPreview'");
        } else {
            this.isSiteSurveyPreviewMode = false;
            console.log("The current URL does not contain 'siteSurveyPreview'");
        }
        this.isLoading = false;
    },
    mounted(){
    },
    data(){
        return{
            isLoading:true,
            isSiteSurveyPreviewMode: false,
            driverObj: null,
            guideData: [
                { element: '#address-search-guidance', popover: { title: 'Search your location here to start a site survey'} },
                { element: '#draw-boundary-guidance', popover: { title: 'Click here to draw the boundary around the site', side: 'bottom'}, class: 'guide-draw-boundary' },
                { element: '#guidance-map-container', popover: { title: `Click on the map to draw the ground boundary by placing multiple points. 
                    The boundary will be completed after connecting the last point to the first point`}, class: 'guide-map-container' },
                { element: '.guidance-draw-complete', popover: { title: 'Click here to complete drawing the boundary.', side: 'left'}},
                { element: '#guidance-point-info', popover: { title: 'Please add a description for the marked boundary points.', side: 'right', align: 'center'}},
                { element: '#guidance-roof-faces', popover: { title: 'Here you can edit or delete each individual points.', side: 'right', align: 'center'}},
            ],
            showAll: true, // false: to activate instructions page
        }
    },
    computed:{
        ...mapState(useEditableSiteSurveyStore, {
            currentGoogleMapId: state => state.currentGoogleMapId,
            isGuideEnabled: state => state.isGuideEnabled,
            sectionCheckpointIndex: state => state.sectionCheckpointIndex,
            currentSectionIndex: state => state.currentSectionIndex,
        })
    },
    methods:{
        handleAccept(){
            this.showAll = true
        },
        loadGuideTour(id){
            if (this.driverObj) this.driverObj?.destroy()
            if (!this.isGuideEnabled || this.currentSectionIndex < this.sectionCheckpointIndex) return
            let currentGuide = this.guideData.find(e => e.element == id)
            this.driverObj = driver({
                    popoverClass: `helper-guide-popover ${currentGuide.class ? currentGuide.class : ''}`,
                    // overlayColor: 'transparent',
                    showButtons: ['done', 'next'],
                    doneBtnText: 'Skip',
                    nextBtnText: 'Skip',
                    allowInteractions: true,
                    steps: [currentGuide]
                    // allowClose: false,
                    // overlayClickNext: true,
                })
            console.log('index ran here')
            this.driverObj?.drive();
        },
        checkGuideStatus(){
            if (localStorage.getItem('instructionGuide')){
                this.showAll = true
            }
        },
        clearLocalStorage(){
            // localStorage.removeItem('boundaryQuestion')
            localStorage.removeItem('overallMappingOfQidToAnsJson')
            localStorage.removeItem('markersAndCornersArray')
            localStorage.removeItem('pathCornersArray')
            localStorage.removeItem('finalCoordinatesStructure')
            localStorage.removeItem('coordinatesInfoForPOI')
            localStorage.removeItem('pathCornersArray')
            // not clearing current section number
        }
    },
    watch: {
        isGuideEnabled: {
            handler(val){
                if(!val) this.driverObj?.destroy()
            }
        },
        currentGoogleMapId: {
            handler(val){
                if (this.driverObj && !val){
                    this.driverObj?.destroy()
                    return
                }
                if (!val) return
                this.loadGuideTour(val)
            }
        }
    }


}
</script>
<style> 
/*  -----------------UNSCOPPED------------------- */
.helper-guide-popover{
    background-color: #409EFF !important;
    color: white !important;
    box-shadow: none;
}
.helper-guide-popover .driver-popover-next-btn{
    color: white !important;
    background-color: #409EFF !important;
    border: none !important;
    text-shadow: none !important;
    font-family: Switzer !important;
    font-size: 16px !important;
    font-weight: 600 !important;
}
.driver-popover.helper-guide-popover .driver-popover-arrow-side-left.driver-popover-arrow {
  border-left-color: #409EFF;
}

.driver-popover.helper-guide-popover .driver-popover-arrow-side-right.driver-popover-arrow {
  border-right-color: #409EFF;
}

.driver-popover.helper-guide-popover .driver-popover-arrow-side-top.driver-popover-arrow {
  border-top-color: #409EFF;
}

.driver-popover.helper-guide-popover .driver-popover-arrow-side-bottom.driver-popover-arrow {
  border-bottom-color: #409EFF;
}
.guide-map-container{
    inset: 40vh 0 0 40vw !important;
    height: fit-content;
}
.guide-draw-boundary{
    margin-left: 50px !important
}
</style>
<style scoped>

</style>