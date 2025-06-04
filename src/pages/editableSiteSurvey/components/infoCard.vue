<template>
  <div :class="['cardContainer', isInsidePopup ? 'cardContainerPopup' : '', isPOIMode? 'cardContainerPOIMaxHeight' :'cardContainerMaxHeight' ]" 
      v-if="isInsidePopup || siteSurveyStore.showInfoCard">
      <img src="../assets/dropdown-arrow-down.png" alt="" :class="['toggle', toggle ? '' : 'toggleInvert']"  @click="toggleFunc()"  />
      <div class="positionR" id="guidance-point-info">
      <el-scrollbar :class="['flexColCont', toggle ? '' : 'flexColContOff',isInsidePopup ? 'flexColContHeight' : '' ]">
          <div class="inputCont">
              <p class="label">Name <span class="astrisk">*</span></p>
              <el-input v-model="marker.title" placeholder="Please input" />
          </div>
          <div class="inputCont">
              <p class="label">Description</p>
              <el-input v-model="marker.description" placeholder="Please input"/>
          </div>
      
              <div class="inputCont"  v-if="infoType==='path'">
                  <p class="label">Distance (m) </p>
                  <el-input v-model="marker.length" placeholder="Please input" />
          </div>
          <div class="flexCont" v-else>
              <div class="inputCont">
                  <p class="label">Latitude</p>
                  <el-input v-model="marker.lat" placeholder="Please input" />
              </div>
              <div class="inputCont">
                  <p class="label">Longitude</p>
                  <el-input v-model="marker.lng" placeholder="Please input" />
              </div>
          </div>
          <div>
              <p class="label">Upload Corner Photos / Videos</p>
              <div class="flexImgsCont">
                  <!-- <img src="../assets/map.svg" alt="" class="imgs" /> -->
                  <div class="imgContainer" v-for="(file,index) in marker.files" :key="index">
                      <!-- For photo -->
                      <div v-show="file.file_type ==='image'" v-loading="!(file.file_url || file.url)">
                          <img  v-bind:src="file.url || file.file_url" class="imgs" @click="viewImage($event)"/>
                      </div>
                      <!-- For video -->
                      <div v-show="file.file_type ==='video'" v-loading="!(file.file_url || file.url)">
                          <video  controls class="videos" :src="file.url || file.file_url">
                              Your browser does not support HTML5 video.
                          </video>
                      </div>
                      <img v-bind:src="allIcon.get('Group2170')" class="crossIcon" @click="deleteFileFromCorner(file.file_name)"/>
                      <!-- @click="deleteFileFromCorner(file.file_name)" -->
                  </div>
                  <div class="PDcard" @click="openFileInput">
                      <img src="../assets/Upload.svg" />
                      <p title="file.display_name" class="contentOne">
                          Upload File
                      </p>
                  </div>
              </div>
              <input
              type="file"
              ref="fileInput"  
              style="display: none;"
              @change="handleFileChange"
              multiple
              />
          </div>
          <!-- <div :class="['footerBtn', isInsidePopup ? 'footerBtnPopup' : '']"> -->
      </el-scrollbar>
      <div :class="['footerBtn', toggle ? '' : 'footerBtnOff']">
          <!-- <el-button type="primary" class="nexttBtn">Next</el-button> -->
          <el-button v-if="!(isPOIMode || (marker?.isItFirstMarker && !marker?.isIndividual))"  class="nexttBtn backBtn" @click="backBtnFunc" :loading="isFileLoading">Back</el-button>
          <el-button v-if="(infoType==='path')"  class="nexttBtn backBtn" @click="cancleBtnFun(marker?.id)" >{{marker?.id?"Edit Path" :"Cancle"}}</el-button>

          <el-button type="primary" class="nexttBtn" @click="doneBtnFunc" :loading="isFileLoading">{{ (marker?.isLastMarker || isPOIMode) ? 'Done' : 'Next' }}</el-button>
      </div>
  </div>
  </div>
</template>


<script>
import API from '@/services/api';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import { uploadFileToBlob } from "@/utils.js";
import { v4 } from "uuid";
import utils from '@/pages/siteSurvey/utils';
export default {
  
  components: {
  },

  props: {
    maxFiles:{
      type: String,
      required: false,
    },
    isPOIMode:{
      type: Boolean,
      default: false,
    },
    isInsidePopup: {
      type: Boolean,
      default: false
    },
    markerDetail:{
      type: Object,
      default: {
          title:"1",
          description:"1",
          lat:"1",
          lng:"1",
          files:[],
      },
      // required: true,
    },
    infoType:{
      type:String,
      default:'poi' 
    }
  },
  data() {
      return {
          // siteSurveyStore: useEditableSiteSurveyStore(),
          allIcon: utils.images,
          val: null,
          toggle: true,
          marker : this.markerDetail,
          filesToUpload:[],
          isFileLoading: false,
      }
  },
  mounted() {
    if(this.siteSurveyStore.pathDistance){
        this.marker.length=this.siteSurveyStore.pathDistance
    }
  },
  computed: {
      ...mapState(useEditableSiteSurveyStore, {
          siteSurveyStore: "GET_COMPLETE_STATE",
          currentGoogleMapGuideStep: state => state.currentGoogleMapGuideStep
      }),
  },
  watch: {
      markerDetail: function (newVal, oldVal) {
          this.marker = newVal;
          this.filesToUpload = [];
          this.isFileLoading = false;
      },
     
  },
  methods: {
    ...mapActions(useEditableSiteSurveyStore, {
            showPathFunc:'SHOW_PATH',
            editPathTrue:'PATH_EDIT_MODE_TRUE',
            setGoogleMapGuideId: 'CHANGE_GOOGLE_MAP_GUIDE_ID',
            setGoogleMapGuideStep: 'CHANGE_GOOGLE_MAP_GUIDE_STEP',
        }),
      toggleFunc() {
          this.toggle = !this.toggle;
      },
      uploadFileToBlob,
      openFileInput() {
          // Programmatically click the hidden file input
          const fileInput = this.$refs.fileInput;
          fileInput.click();

          // Create and dispatch a custom event to trigger the @change event
          const event = new Event("change", { bubbles: true, cancelable: true });
          fileInput.dispatchEvent(event);
      },
      async handleFileChange(event) {
          // Handle the selected files here
          const files = event.target.files;
          // Do something with the selected files, such as uploading them to a server
          let countFiles = this.marker.files.length + files.length;
          // console.log("maximum number of files",this.maxFiles, countFiles);
          if(this.maxFiles && countFiles > this.maxFiles){
            ElMessage({
              showClose: true,
              message: `Number of files cannot be more than ${this.maxFiles} for the given question.`,
              type: "error",
              center: true
            });
          } 
          else{
            // Loop through the array and upload each file
            for (const file of files) {
  
                //check file type
                //carry on process only for image and video
                if(!(file.type.startsWith('image/') || file.type.startsWith('video/'))){
                    ElMessage({
                        showClose: true,
                        message: "File should either be an image or a video. Please try again",
                        type: "error",
                        center: true
                    });
                    continue; // Skip this file
                }
                // Call the uploadFileToBlob function for each file
                //use uuid while uploading
                //create uuid
                if (file.size > 100 * 1024 * 1024) {
                    ElMessage({
                        showClose: true,
                        message: "File size should be less than 100MB. Please try again",
                        type: "error",
                        center: true
                    });
                    continue; // Skip this file
                }
                this.isFileLoading= true;
                const uuidImage =  v4();
                let image = {
                        file_info: this.marker.title,
                        file_name:uuidImage,
                        url:undefined,
                        file_type:file.type.startsWith('image/') ? 'image' : 'video'
                    }
                this.marker.files.push(image);
                this.filesToUpload.push(image);
                try {
                    const [_, thumbnailUrl] = await Promise.all([
                        this.uploadFileToBlob(file, uuidImage),
                        this.generateThumbnailUrl(file),
                    ]);
                    image.url = thumbnailUrl;
                    this.marker.files[this.marker.files.length-1] = image;
                    this.marker = JSON.parse(JSON.stringify(this.marker));
                    this.isFileLoading = false;
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
          }
          // Clear the file input field after processing the files
          event.target.value = null; // This will clear the selected files
      },
      generateThumbnailUrl(file) {
          return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.onload = (e) => {
                  resolve(e.target.result); // Resolve with the Data URL
              };
              reader.onerror = (error) => {
                  reject(error); // Reject if there's an error reading the file
              };
              reader.readAsDataURL(file);
          });
      },
      viewImage(event) {
          const element = event.target;
          const src = element.src;

          const modal = document.createElement("div");
          const close = document.createElement("span");

          close.innerText = '+'
          close.style.position = 'fixed'
          close.style.fontSize = '65px';
          close.style.fontWeight = '400';
          close.style.display = 'inline-block';
          close.style.transform = 'rotate(45deg)';
          close.style.top = '0px',
          close.style.right = '30px',
          close.style.cursor = 'pointer'
          close.style.zIndex = '90000',
          close.style.color = '#fff';


          modal.style.background = 'RGBA(0,0,0,0.8) url(' + src + ') no-repeat center',
          modal.style.backgroundSize = 'contain',
          modal.style.width = '100%',
          modal.style.height = '100%',
          modal.style.position = 'fixed',
          modal.style.zIndex = '10000',
          modal.style.top = '0',
          modal.style.left = '0',

          close.addEventListener('click', removeModal);

          document.body.appendChild(modal);
          document.body.appendChild(close);

          function removeModal() {
              modal.remove();
              close.remove();
          }
      },
      cancleBtnFun(id){
        if(id){
          this.editPathTrue()
        }
          this.showPathFunc()
          this.$emit('handleCardClose')
       
        
      },
      doneBtnFunc() {
          //open the dropdown only if this is the last marker
          if(this.marker?.isLastMarker){
              this.siteSurveyStore.showDropdown = true;
              this.siteSurveyStore.showInfoCard = false;

              // next guide step
              if (this.currentGoogleMapGuideStep == 5){
                this.$nextTick(() => {
                  this.setGoogleMapGuideId('#guidance-roof-faces')
                  this.setGoogleMapGuideStep(6)
                })
              }
          } 
          let markerToEmit = {...this.marker, files:[...this.filesToUpload]};
          this.filesToUpload = [];
          this.$emit("updateMarker", [markerToEmit, "next", this.isInsidePopup]);
          // this.isFileLoading = true;
          this.marker?.isLastMarker
      },
      backBtnFunc(){
          let markerToEmit = {...this.marker, files:[...this.filesToUpload]};
          this.filesToUpload = [];
          this.$emit("updateMarker", [markerToEmit, "back", this.isInsidePopup]);
          // this.isFileLoading = true;
      },
      deleteFileFromCorner(file_name){
        const cornerToDelete = {...this.marker};
        delete cornerToDelete.isLastMarker;
        // console.log('cornerToDelete: ', cornerToDelete);
        // console.log('this.marker.files: ', this.marker.files);
        // console.log('this.filesToUpload: ', this.filesToUpload);
        //do some stuff here to determine if the file has been patched on the marker in the above lines and conditionally emit
        // console.log("this.filesToUpload.findIndex(file => file.file_name === file_name)", this.filesToUpload.findIndex(file => file.file_name === file_name))
        if(this.filesToUpload.findIndex(file => file.file_name === file_name) !== -1){
          //remove the file from the UI only because it does not exist on the corner/poi/path in the db
          //it is yet to be uploaded so it exists in filesToUpload
          this.marker.files = this.marker.files.filter(file => file.file_name !== file_name);
          this.filesToUpload = this.filesToUpload.filter(file=> file.file_name !== file_name);
        }
        else{
          //remove the file from the UI and delete from corner also (emission of delete file event to parent component)
          //it does not exist in filesToUpload 
          this.marker.files = this.marker.files.filter(file => file.file_name !== file_name);
          this.filesToUpload = this.filesToUpload.filter(file=> file.file_name !== file_name);
          this.marker.deleted_files = [file_name];
          this.$emit("deleteFile", [cornerToDelete, file_name]);
        }
      },

  },


}
</script>


<style scoped>

.positionR {
  position: relative;
  padding: 1rem;
  padding-right: 0px;
  height: 100%;
}
.toolbarContainerMD {
  position: absolute;
  top: 0px;
  z-index: 1;
  height: 100%;
}

.cardWidth {
  max-width: 460px;
}

.cardContainer {
  position: absolute;
  height: auto;
  margin-left: 16px;
  max-width: 460px;
  background-color: #fff;
  border-radius: 8px;
  /* max-height: 595px; */
  /* margin-top: 1rem; */
}

.cardContainerMaxHeight{
  margin-top: 1rem;
}
.cardContainerPOIMaxHeight{
  /* max-height: inherit; */
  max-height: calc(100% - 43px);
  margin-top: 43px;
}

.cardContainerPopup {
  position: absolute;
  top: 0px;
  height: 100%;
  border-radius: 0px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  margin-left: 0px;
  min-width: 350px;
}

.flexColCont {
  height: 58vh;
  padding-bottom: 60px;
  transition: all 2s ease;
}

.flexColContHeight {
  height: 100%;
}

.flexColContOff {
  height: 70px;
  transition: all 2s ease;
}

.cardContainer :deep() .el-scrollbar__view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 20px;
}

.label {
  font-size: 12px;
  color: #222;
  font-weight: 600;
  margin-bottom: 8px;
}

.astrisk {
  color: red;
}

.cardContainer :deep() .el-input__inner {
  height: 45px;
  border-radius: 4px;
  font-size: 16px;
  color: #222;

}

.cardContainer :deep() .el-input__wrapper {
  border: none;
  outline: none;
  background-color: #E8EDF2;
}

.flexCont {
  display: flex;
  gap: 16px;
}

.flexImgsCont {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  /* overflow-y: scroll;
  height: 300px; */
}

.imgs {
  /*max-width: 120px;
  max-height: 120px;*/
  border-radius: 4px;
  object-fit: cover;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.videos{
  width: 200px;
  height: 120px;
  border-radius: 4px;
}

.imgContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0px;
}

.crossIcon {
  position: absolute;
  top: -8px;
  right: -8px;
  cursor: pointer;
}

.PDcard {
  padding: 16px 10px;
  border-radius: 4px;
  background-color: #e8edf2;
  text-align: center;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 120px;
  height: 120px;
  border: 1px dashed var(--999, #999);
  gap: 8px;
  cursor: pointer;
  align-self: center;
}

.footerBtn {
  display: flex;
  justify-content: end;
  position: absolute;
  bottom: 0px;
  width: 100%;
  left: 0px;
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #ccc;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.footerBtnPopup {
  width: 100%;
  position: absolute;
  left: 0px;
  padding: 24px 16px;
  bottom: 0px;
}

.nexttBtn {
  font-size: 16px;
  height: 36px;
}

.el-button.el-button--primary:active,
.el-button.el-button--primary:focus {
background-color: #409EFF; 
border-color: #409EFF; 
color: #fff; 
}

.el-button.el-button--primary:hover {
  background-color: #79BBFF; 
  border-color: #79BBFF;  
}

.backBtn {
  border: 1px solid var(--999, #999);
}
/*.backBtn .el-button:active, .backBtn.el-button:focus{
  color: #606266;
  background-color: #fff;
}  
.footerBtn .backBtn .el-button:hover {
  background-color: #ecf5ff;
  color: #409eff;
}*/

.toggle {
  display: none;
}

@media (max-width: 1200px) {

  .cardContainerPopup {
      max-width: 350px;
  }
}


@media (max-width: 900px) {

  .toggle {
      display: inherit;
      margin: auto;
      cursor: pointer;
      filter: invert(1);
      height: 25px;
  }

  .toggleInvert {
      transform: rotate(180deg);
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
  }

  .cardContainer {
      margin-left: 0px;
      height: auto;
      padding: 8px 0px 0px 0px;
      background-color: #fff;
      border-radius: 16px;
      position: fixed;
      bottom: 0px;
      width: 100%;
      left: 0px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      max-width: inherit;
  }

  .cardContainerPopup {
      position: fixed;
      top: auto;
      bottom: 0px;
      height: fit-content;
  }

  .footerBtnPopup {
      width: 100%;
      position: relative;
      left: 0px;
      padding: 0;
  }

  .flexColCont {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 450px;
      transition: all 0.5s ease;
  }

  .flexColContOff {
      height: 70px;
      padding-bottom: 0px;
      transition: all 0.5s ease;
  }

  .footerBtnOff {
      display: none;
  }


}
</style>