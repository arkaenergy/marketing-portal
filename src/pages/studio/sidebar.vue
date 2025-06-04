<template>
    <div class="sidebarContainer">
      <!-- <label class="sidebarLabel"> -->
        <!-- <input type="checkbox" class="sidebarInput" /> -->
        <div class="boxes">
          <div class="options">
            <img
              :src="allIcon.get('arrow-left-short')" 
              alt=""
              class="iconSidebar arrowIcon"
              @click="sidebarWidth()"
            />
            <p class="option addObj">Add Objects</p>
          </div>
          <div class="options" @click="drawObstructions(MUMTY_OBSTRUCTION)">
            <img :src="allIcon.get('Rectangle3708')" alt="" class="iconSidebar" 
            />
            <p class="option">Mumty</p>
          </div>
          <div class="options" @click="drawObstructions(ACUNIT_OBSTRUCTION)">
            <img :src="allIcon.get('Rectangle3708')" alt="" class="iconSidebar" 
            />
            <p class="option">AC Units</p>
          </div>
          <div class="options" @click="drawObstructions(CHIMNEY_OBSTRUCTION)">
            <img :src="allIcon.get('Ellipse251')" alt="" class="iconSidebar" 
            />
            <p class="option">Chimney</p>
          </div>
          <div class="options" @click="drawObstructions(WATERTANK_OBSTRUCTION)">
            <img :src="allIcon.get('Ellipse251')" alt="" class="iconSidebar" 
            />
            <p class="option">Water Tank</p>
          </div>
        </div>
      <!-- </label> -->
    </div>
</template>

<script>
import utils from '@/pages/siteSurvey/utils';
import { ACUNIT_OBSTRUCTION, CHIMNEY_OBSTRUCTION, MUMTY_OBSTRUCTION, WATERTANK_OBSTRUCTION } from './constants';

export default {
  data() {
    return {
      MUMTY_OBSTRUCTION: MUMTY_OBSTRUCTION,
      ACUNIT_OBSTRUCTION: ACUNIT_OBSTRUCTION,
      CHIMNEY_OBSTRUCTION: CHIMNEY_OBSTRUCTION,
      WATERTANK_OBSTRUCTION: WATERTANK_OBSTRUCTION,
      allIcon: utils.images,
    };
  },

  methods: {
    sidebarWidth() {
      document.getElementsByClassName("boxes")[0].classList.toggle("widthSidebar");
      document.getElementsByClassName("arrowIcon")[0].classList.toggle("rotateArrow");
    },
    drawObstructions(param) {
      this.$stageInstance.initDrawObstructions(param);
      document.getElementsByClassName("boxes")[0].classList.add("widthSidebar");
      document.getElementsByClassName("arrowIcon")[0].classList.add("rotateArrow");
    }
  }
};
</script>

<style  scoped>
@font-face {
  font-family: "SegoeUI";
  src: url(/fonts/SegoeUI.ttf);
}

@media (max-width: 1100px) {
.sidebarContainer {
    position: absolute;
    top: 72px;
    left: 12px;
  }

  .sidebarLabel {
    display: inline-block;
  }

  .sidebarInput {
    display: none;
  }

  .sidebarInput:checked ~ .boxes {
    width: 168px;
    height: 208px;
  }

  .boxes {
    width: 168px;
    height: 208px;
    border-radius: 8px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    background-color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px 8px;
  }

  .widthSidebar {
    width: 44px;
    height: 208px;
  }

  .arrowIcon {
    margin-left: 8px;
    margin-right: 8px;
  }

  .rotateArrow {
    transform: rotate(180deg);
  }

  .options {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .option {
    white-space: nowrap;
    font-size: 16px;
    color: #222;
    font-family: "SegoeUI";
  }

  .addObj {
    font-size: 16px;
    font-weight: 600;
    color: #777;
  }

}
</style>
