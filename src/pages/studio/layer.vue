<template>
  <div class="layerParentContainer">
    <div :class="this.overlayEnabled ? 'overlay' : ''"></div>
    <!-- ---------------------------------back button--------------------------------->
    <div class="backBtnContainer"  id="backButton" v-if="this.backEnabled" @click="backFunction">
      <img :src="allIcon.get('Back-btn')" class="backBtn" />
    </div>

    <!-- ---------------------------------undo redo button---------------------------->
    <div class="undoRedoContainer" v-if="this.undoRedoVisible">
      <el-button id="studio-app-undo-button" :disabled="!undoEnabled" :class="['navBarIcon', !undoEnabled ? 'iconNavBar-undo-disabled' : 'iconNavBar-undo']" circle
        @click="undoFunction" />
      <img :src="allIcon.get('reset')"  class="resetIcon" @click="deleteFunction" />
    </div>

    <!-- ---------------------------------2D 3D button-------------------------------->
    <div class="Container2d3d" v-if="this.viewChangeEnabled">
      <div id="2dButton" :class="['Cont2d', btn2d == true ? 'cont2d3dActive' : '']" @click="switch2d">
        <p class="text2d">2D</p>
      </div>
      <div class="positionR">
        <div id="3dButton" :class="['Cont3d', btn3d == true ? 'cont2d3dActive' : '']" @click="switch3d">
          <p class="text3d">3D</p>
        </div>
        <div class="tooltipContainer3DBtn" v-if="isTooltipShow">
          <p class="tooltipText3d">
            Do you want to check the 3D view of your rooftop?
          </p>
          <div class="tooltipBtnCont">
            <p class="skipBtn" @click="switch2d">No</p>
            <p class="nextBtn" @click="switch3d">
              Yes
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ---------------------------------sidebar------------------------------------->
    <Sidebar v-if="this.sidebarEnabled" />

    <!-- ---------------------------------zoom slider--------------------------------->
    <div class="sliderContainer" v-if="this.zoomSliderEnabled">
      <div class="slider-demo-block" >
        <el-slider id="obstrSlider" v-model="this.studioStore.zoomValue" :min="1" :max="10" :show-tooltip="true" vertical height="240px" placement="right" @input="sliderChanged"/>
        <div class="sliderTooltipTwo" v-if="isNextSliderTooltipShow">
          <p class="tooltipText3d">
            Please use this slider to increase or decrease the size of the object.
          </p>
          <div class="tooltipBtnCont">
            <p class="nextBtn" @click="isNextSliderTooltipShow = false">
              Done
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ---------------------------------rotation-bar slider------------------------->
    <div class="rotSliderContainer" v-if="this.rotationSliderEnabled">
      <div class="main">
        <input type="range" v-model="this.studioStore.rotationValue" min="0" max="180" step="15" id="slider" @input="sliderRotated"/>
        <div id="selector">
            <div class="sliderTooltip" v-if="isFirstSliderTooltipShow">
              <p class="tooltipText3d">
                Please use this slider to rotate and align the rectangle to the object present on your rooftop.
              </p>
              <div class="tooltipBtnCont">
                <p class="nextBtn" @click="nextSliderTooltipShow()">
                  Next
                </p>
              </div>
            </div>
            <div id="selectValue"></div>
          </div>
        <div id="progressBar"></div>
      </div>
    </div>

    <!-- ---------------------------------No of building input button----------------->
    <div class="containerMD" v-if="this.floorInputEnabled">
      <p class="inputLabel">Enter number of floors of your building.</p>
      <input type="number" class="inputTag" v-model="floorValue" placeholder="Enter Value (1-50)"/>
      <p class="billError" v-if="Number.isInteger(floorValue) && (floorValue<=0 || floorValue > 50)">
        {{'Value should be between 1 to 50'}}
      </p>
      <el-button 
        type="primary" 
        class="drwBtnBtnMD" 
        :disabled="!floorValueEntered" 
        @click="floorsEntered">
      Draw Roof</el-button>
    </div>

    <!-- ---------------------------------Calculate savings--------------------------->
    <CalculateSavings v-if="savingsEnabled" />

    <!-- ---------------------------------gif button---------------------------------->
    <div :class="['gifContainer', this.actionButtonEnabled ? 'topGifContainer' : '']" v-if="this.gifEnabled">
      <div class="positionR">
        <div class="bulbCont">
          <img :src="
            gifBtnToggle == true ? allIcon.get('cross') : allIcon.get('bulb')
          " class="bulbIcon" @click="gifBtnToggle = !gifBtnToggle" />
        </div>
        <div class="tooltipContainer" v-if="gifBtnToggle == true">
          <h4 class="tooltipHeading">{{ gifContent.heading }}</h4>
          <p class="tooltipText">
            {{ gifContent.text }}
          </p>
          <img :src="allIcon.get('Draw-roof')" class="gifImg" />
        </div>
      </div>
    </div>

    <!-- ---------------------------------common button------------------------------->
    <div class="bottomBtnContainer" v-if="this.actionButtonEnabled">
      <el-button 
        type="primary"
        class="commonBtn" 
        id="mainButton"
        :disabled="!isCommonBtnVisible"
        @click="mainActionDependingOnState"
        >{{this.actionButtonText}}</el-button
      >
    </div>

  </div>
</template>

<script>
import utils from '@/pages/siteSurvey/utils';
import Sidebar from "./sidebar.vue";
import CalculateSavings from "./calculateSavings.vue";
import { useStudioStore } from "../store/studioStore";
import {FLOOR_STATE, DRAWING_STATE, OBSTRUCTION_STATE, PANEL_VIEW_STATE, SAVINGS_STATE, REPORT_STATE, defaultComponentsData } from "./constants";
import Obstruction from '../../core/Objects/Obstruction';
export default {
  components: {
    Sidebar,
    CalculateSavings,
  },

  data() {
    return {
      gifBtnToggle: false,
      btn2d: true,
      btn3d: false,
      isTooltipShow: true,
      studioStore: useStudioStore(),
      zoomValue: 3,
      rotationValue: 0,
      floorValue: null,
      actionButtonText: "Done",
      zoomMin: 1,
      zoomMax: 10,
      gifContentForDrawing: {
        heading: "How to Draw a Roof",
        text: "Click on each corner of the roof you want draw.",
        gifSrc: "",
      },
      gifContentForObstruction: {
        heading: "Add Objects",
        text: "Select object from the menu and drag to place.",
        gifSrc: "",
      },
      gifContent: "",
      allIcon: utils.images,
      value1: 0,
      isFirstSliderTooltipShow: true,
      isNextSliderTooltipShow: false
    };
  },

  computed: {
    currentAppState() {
      return this.studioStore.currentAppState;
    },
    //Visibility Functions
    overlayEnabled() {
      if (this.currentAppState === FLOOR_STATE) return false;
      if (this.currentAppState === DRAWING_STATE) {
        if (this.gifBtnToggle === true) return true;
        return false;
      }
      if (this.currentAppState === OBSTRUCTION_STATE){
        if (this.gifBtnToggle === true) return true;
        if (this.isFirstSliderTooltipShow === true) return true;
        if (this.isNextSliderTooltipShow === true) return true;
        return false;
      }
      if (this.currentAppState === PANEL_VIEW_STATE) {
        if (this.isTooltipShow) return true;
        return false;
      }
      if(this.currentAppState === SAVINGS_STATE) return true;
      if(this.currentAppState === REPORT_STATE) return false;
      return false;
    },
    backEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return true;
      if(this.currentAppState === OBSTRUCTION_STATE) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return true;
      if(this.currentAppState === SAVINGS_STATE) return true;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    undoRedoVisible() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return true;
      if(this.currentAppState === OBSTRUCTION_STATE) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    viewChangeEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE) return false;
      if(this.currentAppState === PANEL_VIEW_STATE) return true;
      if(this.currentAppState === SAVINGS_STATE) return true;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    zoomSliderEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE  && this.$stageInstance.currentSelectedObject instanceof Obstruction) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    rotationSliderEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE  && this.$stageInstance.currentSelectedObject instanceof Obstruction) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    sidebarEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    floorInputEnabled() {
      if(this.currentAppState === FLOOR_STATE) return true;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE) return false;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    savingsEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return false;
      if(this.currentAppState === OBSTRUCTION_STATE) return false;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return true;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    gifEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return true;
      if(this.currentAppState === OBSTRUCTION_STATE) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return false;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    actionButtonEnabled() {
      if(this.currentAppState === FLOOR_STATE) return false;
      if(this.currentAppState === DRAWING_STATE) return true;
      if(this.currentAppState === OBSTRUCTION_STATE) return true;
      if(this.currentAppState === PANEL_VIEW_STATE) return true;
      if(this.currentAppState === SAVINGS_STATE) return false;
      if(this.currentAppState === REPORT_STATE) return false;
      return true;
    },
    undoEnabled() {
      return this.studioStore.undoEnabled;
    },
    isCommonBtnVisible() {
      if(this.currentAppState === DRAWING_STATE) {
        if(this.studioStore.basePolygonDrawn){
          this.actionButtonText = "Next";
          return true;
        }
        if(this.studioStore.atleast3PointsDrawn){
          this.actionButtonText = "Complete Roof";
          return true;
        }
        else {
          this.actionButtonText = "Complete Roof";
          return false;
        }
      }
      if(this.currentAppState === OBSTRUCTION_STATE) {
        if(!this.studioStore.obstructionPlacedInScene){
          this.actionButtonText = "Continue Without Object";
        }
        else{
          this.actionButtonText = "Done";
        }
        return true;
      }
      if(this.currentAppState === PANEL_VIEW_STATE) {
        this.actionButtonText = "Done";
        return true;
      }
      return false;
    },
    floorValueEntered() {
      if(this.floorValue && parseInt(this.floorValue) && this.floorValue>=0 && this.floorValue<=50) {
        return true;
      }
      return false;
    },
  },

  mounted() {
    const appState = localStorage.getItem('currentAppState');
    let componentData = localStorage.getItem('componentData');
    if (componentData) {
      componentData = JSON.parse(componentData);
      this.floorValue = componentData.floorValue;
      this.$stageInstance.floorValue = this.floorValue;
    }
    this.studioStore.$patch({
      currentAppState: appState === null ? FLOOR_STATE : appState,
    });
    if(this.currentAppState === DRAWING_STATE){
      this.gifContent = this.gifContentForDrawing;
      if(!(this.$stageInstance.polygonModel)){
        this.$stageInstance.newPolygonModel(this.floorValue);
      }
    }
    if (this.currentAppState === OBSTRUCTION_STATE) {
      this.gifContent = this.gifContentForObstruction;
      this.$stageInstance.dragControls.activate();
      this.isFirstSliderTooltipShow = false;
      setTimeout(() => {
        this.sliderBarRotation();
      }, 50)
      return true;
    }
    if(this.currentAppState===PANEL_VIEW_STATE) {
      this.isTooltipShow = false;
      const vm = this;
      setTimeout(() => {
        vm.addTouchEvents();
      }, 100);
      this.$stageInstance.placePanels();
      this.$stageInstance.deselectOtherSelectedMeshes(this.$stageInstance.ground);
    }
    if(this.currentAppState === SAVINGS_STATE) this.isTooltipShow = false;
  },

  methods: {
    nextSliderTooltipShow(){
      this.isFirstSliderTooltipShow = false;
      this.isNextSliderTooltipShow = true;
    },

    sliderBarRotation() {
      let slider = document.getElementById('slider')
      let selector = document.getElementById('selector')
      let selectValue = document.getElementById('selectValue')
      let progressBar = document.getElementById('progressBar')
      selectValue.innerHTML = slider.value+'&#xb0';
      slider.oninput = function() {
        selectValue.innerHTML = this.value+'&#xb0'
        selector.style.left = (parseInt(this.value)/180)*100 + '%'
        progressBar.style.width = (parseInt(this.value)/180)*100 + '%'
      }
    },
    //Action functions
    floorsEntered() {
      this.studioStore.$patch({
        currentAppState: DRAWING_STATE,
      });
      if (this.currentAppState === DRAWING_STATE) {
        if(!this.studioStore.basePolygonDrawn){
          this.$stageInstance.newPolygonModel(this.floorValue);
        }
        else {
        this.$stageInstance.polygonModel.updateHeightOnFloorChange(this.floorValue);
        this.$stageInstance.floorValue = this.floorValue;
      }
      }
      this.setFloorValueInLocalStorage(this.floorValue);
      this.setAppStateInLocalStorage(DRAWING_STATE);
      this.gifContent = this.gifContentForDrawing;
      this.gifBtnToggle = true;
    },
    backFunction() {
      if (this.currentAppState === DRAWING_STATE) {
        if (this.$stageInstance.drawManager.enabled) {
          this.$stageInstance.drawManager.resetDrawManager();
          this.$stageInstance.drawManager.onCancel();
        } 
        this.studioStore.$patch({
          currentAppState: FLOOR_STATE,
        });
        this.setAppStateInLocalStorage(FLOOR_STATE);
      }
      if (this.currentAppState === OBSTRUCTION_STATE) {
        this.$stageInstance.dragControls.enablePolygon();
        this.studioStore.$patch({
          currentAppState: DRAWING_STATE,
        });
        this.gifContent = this.gifContentForDrawing;
        this.setAppStateInLocalStorage(DRAWING_STATE);
      }
      if (this.currentAppState === PANEL_VIEW_STATE) {
        this.switch2d();
        this.$stageInstance.controlsManager.reset();
        this.$stageInstance.removePanels();
        this.$stageInstance.dragControls.activate();
        this.studioStore.$patch({
          currentAppState: OBSTRUCTION_STATE,
        });
        this.gifContent = this.gifContentForObstruction;
        this.setAppStateInLocalStorage(OBSTRUCTION_STATE);
        setTimeout(() => {
        this.sliderBarRotation();
        }, 50)
      }
      if (this.currentAppState === SAVINGS_STATE) {
        this.studioStore.$patch({
          currentAppState: PANEL_VIEW_STATE,
        });
        this.setAppStateInLocalStorage(PANEL_VIEW_STATE);
      }
    },
    mainActionDependingOnState() {
      if (this.currentAppState === FLOOR_STATE) {
        // this.studioStore.$patch({undoEnabled: false});
        return this.nullFunc;
      }
      if (this.currentAppState === DRAWING_STATE) {
        if (this.studioStore.basePolygonDrawn) {
          this.studioStore.$patch({
            currentAppState: OBSTRUCTION_STATE,
          });
          this.$stageInstance.dragControls.disablePolygon();
          this.setAppStateInLocalStorage(OBSTRUCTION_STATE);
          this.gifContent = this.gifContentForObstruction;
          this.gifBtnToggle = true;
          this.studioStore.$patch({undoEnabled: true});
        }
        else if (this.studioStore.atleast3PointsDrawn){
          if (this.$stageInstance.drawManager.enabled) {
            this.$stageInstance.drawManager.onComplete();
            this.studioStore.$patch({basePolygonDrawn: true});
            this.studioStore.$patch({undoEnabled: false});
          }
        }
        return this.nullFunc;
      }
      if (this.currentAppState === OBSTRUCTION_STATE) {
        this.studioStore.$patch({
          currentAppState: PANEL_VIEW_STATE,
        });
        this.$stageInstance.placePanels();
        this.$stageInstance.deselectOtherSelectedMeshes(this.$stageInstance.ground);
        this.$stageInstance.dragControls.deactivate();
        this.setAppStateInLocalStorage(PANEL_VIEW_STATE);
        const vm = this;
        setTimeout(() => {
          vm.addTouchEvents();
        }, 100);
        if(!this.isTooltipShow){
          this.$stageInstance.initialize2D_3DControls();
        }
        return this.nullFunc;
      }
      if (this.currentAppState === PANEL_VIEW_STATE) {
        this.switch2d();
        // RESET FUNCTION REQUIRES DELAY
        this.$stageInstance.controlsManager.reset();
        this.$stageInstance.controlsManager._2dControls.disable();
        this.$stageInstance.controlsManager._3dControls.disable();
        // TRY CALLING WITH DELAY WOULD WORK BT STETIMEOUT 
        setTimeout(() => {
          this.$stageInstance.saveCanvasImage();
        }, 100);
        this.studioStore.$patch({
          currentAppState: SAVINGS_STATE,
        });
        this.setAppStateInLocalStorage(SAVINGS_STATE);
        return this.nullFunc;
      }
      return null;
    },
    //LOCAL STORAGE MANAGEMENT FUNCIONS
    setAppStateInLocalStorage(appState = FLOOR_STATE) {
      localStorage.setItem('currentAppState', appState);
    },
    setFloorValueInLocalStorage(floorVal = 0) {
      let componentJSON = localStorage.getItem('componentData') ? JSON.parse(localStorage.getItem('componentData')) : defaultComponentsData();
      componentJSON.floorValue = floorVal;
      localStorage.setItem('componentData', JSON.stringify(componentJSON));
      if(localStorage.getItem('stageData')){
          let savedStageData = JSON.parse(localStorage.getItem('stageData'));
          savedStageData.floorValue = floorVal;
          localStorage.setItem('stageData', JSON.stringify(savedStageData));
      }
    },
    //Random funcs
    undoFunction() {
      if (this.currentAppState === DRAWING_STATE) {
        if (this.$stageInstance.drawManager.enabled) {
            this.$stageInstance.drawManager.removePoint();
        }else{
          // position undo here
        }
      }
      if (this.currentAppState === OBSTRUCTION_STATE) {
        // this.$stageInstance.removeFromObjectsArray();
        this.$stageInstance.handleUndo();
      }
      return this.nullFunc();
    },
    deleteFunction() {
      if (this.currentAppState === DRAWING_STATE) {
        if (this.$stageInstance.polygonModel) {
          if (this.$stageInstance.drawManager.enabled) {
            this.$stageInstance.drawManager.resetDrawManager();
          }else{
            this.$stageInstance.polygonModel.removeObject();
            this.$stageInstance.newPolygonModel(this.floorValue);
          }
          this.$stageInstance.studioStore.$patch({basePolygonDrawn:false})
          this.$stageInstance.studioStore.$patch({atleast3PointsDrawn:false})
        }
      }
      else if (this.currentAppState === OBSTRUCTION_STATE) {
          this.$stageInstance.removeSelectedObject();
      }

      return this.nullFunc();
    },
    nullFunc() {
      console.log("null function", this.currentAppState);
    },
    addTouchEvents(){
      let obj = document.getElementById('3dButton');
      obj.addEventListener("touchend", this.switch3d, false);

      obj = document.getElementById('2dButton');
      obj.addEventListener("touchend", this.switch2d, false);

      obj = document.getElementById('backButton');
      obj.addEventListener("touchend", this.removeTouchEvents, false);

      obj = document.getElementById('mainButton');
      obj.addEventListener("touchend", this.removeTouchEvents, false);
    },
    removeTouchEvents(params){
      let obj = document.getElementById('3dButton');
      obj.removeEventListener("touchend", this.switch3d, false);

      obj = document.getElementById('2dButton');
      obj.removeEventListener("touchend", this.switch2d, false);

      obj = document.getElementById('backButton');
      obj.removeEventListener("touchend", this.removeTouchEvents, false);

      obj = document.getElementById('mainButton');
      obj.removeEventListener("touchend", this.removeTouchEvents, false);
      if(params.currentTarget.id === 'backButton'){
        this.backFunction();
      }
      else if(params.currentTarget.id === 'mainButton'){
        this.mainActionDependingOnState();
      }
      if(this.$stageInstance.controlsManager){
        this.$stageInstance.controlsManager._3dControls.dispose();
        this.$stageInstance.controlsManager._2dControls.dispose();
      }
    },
    switch2d(){
      this.isTooltipShow = false;
      this.btn3d = false;
      this.btn2d = true;
      if(!this.$stageInstance.controlsManager){
        this.$stageInstance.initialize2D_3DControls();
      }
      this.$stageInstance.switchTo2d();
    },
    sliderChanged(){
      this.$stageInstance.obstructionScaled(this.studioStore.zoomValue);
    },
    sliderRotated(){
      this.$stageInstance.obstructionRotated(this.studioStore.rotationValue);
      this.sliderBarRotation();
    },
    switch3d(){
      this.isTooltipShow = false;
      this.btn3d = true;
      this.btn2d = false;
      if(!this.$stageInstance.controlsManager){
        this.$stageInstance.initialize2D_3DControls();
      }
      this.$stageInstance.switchTo3d();
    }
  },
};
</script>


<style  scoped>
@font-face {
  font-family: "SegoeUI";
  src: url(/fonts/SegoeUI.ttf);
}

@media (max-width: 1100px) {
  .overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 2;
  }

  .backBtnContainer {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 11px 16px 8px 18px;
    border-radius: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    background-color: #fff;
    width: 56px;
    height: 40px;
    cursor: pointer;
  }

  .backBtn {
    width: 18px;
  }

  .billError {
    color: rgb(214, 12, 12);
    font-size: 13px;
    margin-top: -10px;
    margin-bottom: 8px;
  }

  .undoRedoContainer {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: auto;
    max-width: 136px;
    height: 40px;
    padding: 0px 16px 1px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    background-color: #fff;
  }

  .layerParentContainer :deep() .el-button.is-circle {
    padding: 0px;
  }

  .iconNavBar-undo:before {
    content: url("/assets/undoIcon.svg");
  }

  .iconNavBar-undo-disabled::before {
    content: url("/assets/undoIcon.svg");
    filter: invert(0.8);
  }

  .navBarIcon {
    border: none;
    margin-left: 0px;
  }

  .Container2d3d {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    width: 84px;
    height: 40px;
    padding: 0px 3px 1px 3px;
    border-radius: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    background-color: #fff;
  }

  .Cont2d,
  .Cont3d {
    position: relative;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    color: #777;
    font-size: 16px;
    font-weight: 500;
  }

  .text2d,
  .text3d {
    font-family: "SegoeUI";
  }

  .cont2d3dActive {
    border-radius: 20px;
    background-color: #409eff;
    color: #fff;
    font-weight: 600;
  }

  .tooltipContainer3DBtn {
    visibility: visible;
    width: 256px;
    background-color: #409eff;
    color: #fff;
    position: absolute;
    z-index: 100;
    bottom: -94px;
    right: -8px;
    margin-left: -60px;
    padding: 10px 12px 8px 12px;
    border-radius: 4px;
  }

  .tooltipContainer3DBtn {
    visibility: visible;
  }

  .tooltipContainer3DBtn::after {
    content: "";
    position: absolute;
    top: -14px;
    right: 8%;
    border-width: 7px;
    border-style: solid;
    border-color: transparent transparent #409eff transparent;
  }

  .tooltipText3d {
    font-size: 14px;
    color: #fff;
    font-weight: 100;
    line-height: 1.43;
    font-family: "SegoeUI";
  }

  .tooltipBtnCont {
    display: flex;
    justify-content: flex-end;
    gap: 32px;
  }

  .skipBtn,
  .nextBtn {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    font-family: "SegoeUI";
  }

  .nextBtn {
    font-weight: 600;
  }

  .sliderContainer {
    position: absolute;
    top: 76px;
    right: 0px;
  }

  .slider-demo-block {
    position: relative;
  }

  .layerParentContainer :deep() .el-slider__runway {
    width: 8px;
    background: #fff;
  }

  .layerParentContainer :deep() .el-slider__button {
    background-color: #409eff;
    border: 3px solid #fff;
    margin-left: 2px;
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.4);
  }

  .layerParentContainer :deep() .el-slider__bar {
    background-color: transparent;
  }

  .containerMD {
    display: inherit;
    position: fixed;
    bottom: 0px;
    width: 100%;
    padding: 16px;
    padding-bottom: 0px;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    background-color: #fff;
  }

  .inputLabel {
    font-size: 16px;
    font-weight: 500;
    margin-top: 4px;
    margin-bottom: 16px;
    font-family: "SegoeUI";
  }

  .inputTag {
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #222;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 4px;
    background-color: #fff;
    margin-bottom: 14px;
    font-family: "SegoeUI";
  }

  .drwBtnBtnMD {
    font-size: 18px;
    font-weight: 600;
    padding: 13px 17px;
    height: 48px;
    width: 100vw;
    border-radius: 0px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
    margin-left: -16px;
    font-family: "SegoeUI";
  }

  .drwBtnBtnMD:hover {
    background-color: #409eff;
  }

  .drwBtnBtnMD.is-disabled, .drwBtnBtnMD.is-disabled:focus, .drwBtnBtnMD.is-disabled:hover {
    color: #ccc;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    border: none;
    border-top: 1px solid #ccc;
  }

  .layerParentContainer :deep() .el-button > span {
    font-family: "SegoeUI";
  }

  .gifContainer {
    position: fixed;
    bottom: 16px;
    right: 12px;
    z-index: 2;
  }

  .topGifContainer {
    bottom: 58px;
  }

  .bulbCont {
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
    background-color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }

  .tooltipContainer {
    visibility: visible;
    width: 328px;
    background-color: #fff;
    position: absolute;
    z-index: 100;
    bottom: 52px;
    right: 0px;
    padding: 14px 16px 22px 16px;
    border-radius: 8px;
  }

  .tooltipContainer::after {
    content: "";
    position: absolute;
    bottom: -16px;
    right: 3%;
    border-width: 9px;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
  }

  .bulbIcon:hover .tooltipContainer {
    visibility: visible;
  }

  .tooltipHeading {
    font-size: 16px;
    color: #777;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: "SegoeUI";
  }

  .tooltipText {
    font-size: 16px;
    color: #222;
    line-height: 1.5;
    margin-bottom: 10px;
    font-family: "SegoeUI";
  }

  .gifImg {
    width: 296px;
    height: 250px;
    object-fit: cover;
  }

  .positionR {
    position: relative;
  }

  .commonBtn {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 48px;
    font-size: 18px;
    font-weight: 600;
    font-family: "SegoeUI";
    border-radius: 0px;
  }
  
  .commonBtn:hover {
    background-color: #409eff;
  }

  .commonBtn.is-disabled, .commonBtn.is-disabled:focus, .commonBtn.is-disabled:hover {
    color: #ccc;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    border: none;
    border-top: 1px solid #ccc;
  }

  .rotSliderContainer {
    position: absolute;
    bottom: 72px;
    width: 75vw;
    left: 24px;
    max-width: 260px;
  }

  .main {
  position: relative;
  }

#slider {
  -webkit-appearance: none; 
  width: 100%;
  height: 8px;
  border-radius: 4px;
}

/* Design slider button */
#slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  position: relative;
  z-index: 3;
}

#selector {
  width: 48px;
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-40%);
  z-index: 2;
}

#selectValue {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  position: absolute;
  bottom: 12px;
  background: #409eff;
  text-align: center;
  line-height: 28px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  border: 3px solid #fff;
}

.sliderTooltip {
  left: 40%;
  transform: translate(-50%, 0%);
  margin: 0px;
  position: absolute;
  bottom: 56px;
  visibility: visible;
  width: 256px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  padding: 10px 12px 8px 12px;
  border-radius: 4px;
}

.sliderTooltip::after {
    content: "";
    position: absolute;
    bottom: -14px;
    left: 50%;
    border-width: 7px;
    border-style: solid;
    transform: translate(-50%, 0%);
    border-color: #409eff transparent  transparent  transparent;
  }

  .sliderTooltipTwo {
  right: 48px;
  position: absolute;
  bottom: 8%;
  visibility: visible;
  width: 260px;
  background-color: #409eff;
  color: #fff;
  position: absolute;
  z-index: 100;
  padding: 10px 12px 8px 12px;
  border-radius: 4px;
}

.sliderTooltipTwo::after {
    content: "";
    position: absolute;
    top: 50%;
    right: -5%;
    border-width: 7px;
    border-style: solid;
    transform: translate(0%, -50%);
    border-color:  transparent  transparent  transparent #409eff;
  }

#progressBar {
  width: 50%;
  height: 7px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  bottom: 4px;
  left: 0;
}
}
</style>

