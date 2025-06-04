<template>
  <!-- <div class="genericFieldsContainer" always> -->
  <div :class="[questions?.files?.length > 0 ? 'fieldBorder' : '', 'genericFieldsContainer']" always>
    <div class= "imageVideoContainer" v-show="questions.files.length > 0">
      <div class="imageContainer" v-if="this.photoFiles.length>0">
        <el-col v-for="(file,index) in photoFiles" :key="index" :span="7">
            <!-- <div v-for="(file,index) in photoFiles" :key="index"> -->
            <div style="display: flex; flex-direction: column; height:100%;">
                <p class="heading">{{file.file_info}}</p>
                <img :src="file.file_url" @click="viewImage($event)"/>
            </div>
        </el-col>
      </div>
      <div class="videoContainer" v-if="this.videoFiles.length>0">
        <el-col v-for="(file,index) in videoFiles" :key="index" :span="7">
            <div style="display: flex; flex-direction: column; height:100%;">
                <p class="heading">{{file.file_info}}</p>
                <video  controls class="videos" :src="file.file_url">
                    Your browser does not support HTML5 video.
                </video>
            </div>
        </el-col>
      </div>
    </div>
    <div
      class="descCont"
      v-if="
        questions.question_type == 'short_answer' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label}} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-input
        v-if="storedAnswers[questions.id]"
        v-model="valueData"
        @input="updateAnswerJsonAndCallApi(1000)"
      />
    </div>
    <div
      class="descCont"
      v-if="
        questions.question_type == 'number' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-input
        type="number"
        v-if="storedAnswers[questions.id]"
        v-model="valueData"
        @input="updateAnswerJsonAndCallApi(1000)"
      />
    </div>
    <!-- phone number type -->
    <!-- <div
      class="descCont"
      v-if="
        questions.question_type == 'phone_number' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="align-as-row">
        <div class="phone-number">
          <el-input
            v-if="storedAnswers[questions.id]"
            placeholder="Enter Mobile Number"
            v-model="valueData"
            @input="filterNonNumeric();updateAnswerJsonAndCallApi(1000)"
            ref="phoneInput"
          >
           <template v-slot:suffix>
            <svg v-if="(markVerified && (!hideGetOTP)) || markVerified" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#67C23A" class="bi bi-check2" viewBox="0 0 16 16">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </template>
          </el-input>
        </div>
        <p class="verifyText" v-if="!hideGetOTP" @click="sendOTPToUser()" v-loading="isLoading" :disabled="markVerified">Verify OTP</p>
        <p v-if="isWaiting" v-loading="isWaiting">Please wait</p>
        <OTPpopup
            v-if="isOTPSectionVisible"
            :buttonStyles="{ backgroundColor: '#409EFF', color: '#ffffff'}"
            :isOTPPopupVisible="isOTPSectionVisible"
            @close="handleClosePopup()"
            @close-automate = "handleClosePopup()"
            :mobile = "valueData.toString()"
            @create-lead = onVerification()
        />
      </div>
    </div> -->

    <!-- regular phone number type field -->
    <div
      class="descCont"
      v-if="
        questions.question_type == 'phone_number' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label}} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="align-as-row">
        <div class="email">
          <el-input
            type="text"
            v-if="storedAnswers[questions.id]"
            placeholder="+1234567890"
            v-model="valueData"
            @blur="updateAnswerJsonAndCallApi(1000)"
          >
          <!-- placeholder="Enter Mobile Number" -->
          </el-input>
        </div>  
      </div>
    </div>

    <!-- email type field with OTP validation -->
    <!-- <div
      class="descCont"
      v-if="
        questions.question_type == 'email' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label}} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="align-as-row">
        <div class="email">
          <el-input
            v-if="storedAnswers[questions.id]"
            placeholder="Enter E-mail ID"
            v-model="valueData"
            @input="updateAnswerJsonAndCallApi(1000)"
            ref="emailInput"
          >
          <template v-slot:suffix>
            <svg v-if="(markVerified && (!hideGetOTP)) || markVerified" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#67C23A" class="bi bi-check2" viewBox="0 0 16 16">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </template>
          </el-input>
        </div>
        <p class="verifyText" v-if="!hideGetOTP" @click="sendOTPToUser()" v-loading="isLoading" :disabled="markVerified">Verify OTP</p>
        <p v-if="isWaiting" v-loading="isWaiting">Please wait</p>
        <OTPpopup
            v-if="isOTPSectionVisible"
            :buttonStyles="{ backgroundColor: '#409EFF', color: '#ffffff'}"
            :isEmailVerification="true"
            :isOTPPopupVisible="isOTPSectionVisible"
            @close="handleClosePopup()"
            @close-automate = "handleClosePopup()"
            :mobile = "valueData.toString()"
            @create-lead = onVerification()
        />
      </div>
    </div> -->
    <!-- regular email type field -->
    <div
      class="descCont"
      v-if="
        questions.question_type == 'email' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label}} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="align-as-row">
        <div class="email">
          <el-input
            type="email"
            v-if="storedAnswers[questions.id]"
            placeholder="example@example.com"
            v-model="valueData"
            @blur="updateAnswerJsonAndCallApi(1000)"
          >
          <!-- placeholder="Enter E-mail ID" -->
          </el-input>
        </div>  
      </div>
    </div>
    <div
      class="descCont"
      v-if="
        questions.question_type === 'slider'"
        :id="questions.guideId"
    >
    <div class="sliderLabel">
      <p class="label">{{ questions.label}}</p>
      <div class="sliderValue">
        <p>{{valueData || (Number(questions.additional_info.minimum_value) || 1) }}</p>
        <p>{{questions.additional_info.unit_of_measurements}}</p>
      </div>
    </div>
      <!-- <p>{{questions}}</p> -->
      <div class="sliderContainer">
        <el-slider v-model="valueData"  
        @input="updateAnswerJsonAndCallApi(1000)"
        :min="Number(questions.additional_info.minimum_value) || 0" 
        :max="Number(questions.additional_info.maximum_value) || 100"
        :step="Number(questions.additional_info.step) || 1">
        </el-slider>
      </div>
    </div>
    <div
      class="descCont"
      v-if="
        questions.question_type === 'tab_choice'"
        :id="questions.guideId"
    >
      <p class="label radio-label">{{ questions.label}}</p>
      <!-- <p>{{questions}}</p> -->
      <div class="tabChoiceContainer">
        <el-radio-group v-model="valueData" style="margin-bottom: 30px;">
          <!-- <el-radio-button label="top">top</el-radio-button>
          <el-radio-button label="right">right</el-radio-button>
          <el-radio-button label="bottom">bottom</el-radio-button>
          <el-radio-button label="left">left</el-radio-button> -->
          <el-radio-button
          v-for="option in questions.options"
          :key="option.option_text"
          :label="option.option_text"
          @change="updateAnswerJsonAndCallApi(1000)"
          >{{ option.option_text }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div
      class="descCont"
      v-if="
        questions.question_type === 'long_answer' ||
        questions.question_type === 'paragraph'
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label}}</p>
      <el-input
        v-if="storedAnswers[questions.id]"
        v-model="valueData"
        type="textarea"
        @input="updateAnswerJsonAndCallApi(1000)"
      />
    </div>
    <div
      class="dropdownCont"
      v-if="
        questions.question_type == 'dropdown' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-select
        v-model="valueData"
        class="m-2"
        :disabled="isSiteSurveyPreviewMode"
        :placeholder="questions.description"
        @change="updateAnswerJsonAndCallApi(1000)"
      >
        <el-option
          v-for="item in questions.options"
          :key="item.option_text"
          :label="item.option_text"
          :value="item.option_text"
        />
      </el-select>
    </div>
    <div
      class="radioBtnCont"
      v-if="questions.question_type == 'radio' && storedAnswers[questions.id]"
      :id="questions.guideId"
    >
      <p class="label radio-label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-radio-group v-model="valueData">
        <el-radio
          v-for="option in questions.options"
          :key="option.option_text"
          :label="option.option_text"
          @change="updateAnswerJsonAndCallApi(1000)"
          >{{ option.option_text }}</el-radio
        >
      </el-radio-group>
    </div>
    <div
      class="dateCont"
      v-if="questions.question_type == 'date' && storedAnswers[questions.id]"
      :id="questions.guideId"
    >
      <p class="label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-date-picker
        v-model="valueData"
        type="date"
        :placeholder="questions.description"
        :size="size"
        @change="updateAnswerJsonAndCallApi(1000)"
      />
    </div>
    <div class="timeCont" v-if="questions.question_type === 'time'" :id="questions.guideId">
      <p class="label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <el-time-picker
        v-model="valueData"
        :placeholder="questions.description"
        :size="size"
        @change="updateAnswerJsonAndCallApi(1000)"
      />
    </div>
    <div
      class="checkboxCont"
      v-if="
        questions.question_type === 'checkbox' && storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="checkboxLabel">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="chkboxBox">
        <el-checkbox-group
          v-model="valueData"
          @change="updateAnswerJsonAndCallApi(1000)"
        >
          <el-checkbox
            v-for="option in questions.options"
            :key="option.option_text"
            :label="option.option_text"
            size="large"
          />
        </el-checkbox-group>
      </div>
    </div>

    <div
      class="checkboxCont"
      v-if="
        questions.question_type === 'multiple_choice' &&
        storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="checkboxLabel radio-label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="chkboxBox">
        <el-radio-group
          v-model="valueData"
          @change="updateAnswerJsonAndCallApi(1000)"
        >
          <el-radio
            v-for="option in questions.options"
            :key="option.option_text"
            :label="option.option_text"
            size="large"
            >{{ option.option_text }}</el-radio
          >
        </el-radio-group>
      </div>
    </div>

    <div
      class="checkboxCont"
      v-if="
        questions.question_type === 'single_choice' &&
        storedAnswers[questions.id]
      "
      :id="questions.guideId"
    >
      <p class="checkboxLabel radio-label">{{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span></p>
      <div class="chkboxBox">
        <el-radio-group
          v-model="valueData"
          @change="updateAnswerJsonAndCallApi(100)"
        >
        
          <el-radio
            v-for="option in questions.options"
            :key="option.option_text"
            :label="option.option_text"
            size="large"
            >{{ option.option_text }}</el-radio
          >
        </el-radio-group>
      </div>
    </div>


    
    <div class="cards" v-if="questions.question_type == 'file_upload'" :id="questions.guideId">
      <button
        class="accordion"
        :class="[isOpen ? 'active' : '']"
        @click="toggle()"
      >
        {{ questions.label }} <span v-if="questions.is_required" class="asterisks">*</span>
        <img v-bind:src="allIcon.get('Group2172')" class="whiteArrFAQ" />
      </button>
      <div class="panel" v-show="isOpen">
        <div style="gap: 1.5rem; padding-top: 1rem;">
          <p class="description" v-show="questions.description">{{questions.description}}</p>
          <div class="flexFileCont">
            <div
              class="imgContainer"
              v-for="(file, index) in filesToIterate"
              :key="index"
              v-loading="!file.file_url"
            >
              <img
                v-show="file.file_type.includes('image')"
                v-bind:src="file.file_url"
                class="imgs"
                @click="viewImage($event)"
              />
              <img v-bind:src="allIcon.get('Group2170')" class="crossIcon" @click="deleteFile(file.file_name, index)"/>
              <video
                v-show="file.file_type.includes('video')"
                controls
                class="videosUploaded"
                :src="file.file_url"
              >
                Your browser does not support HTML5 video.
              </video>
              <div class="otherFileUpload" v-if="!file.file_type.includes('image') && !file.file_type.includes('video')">
                <img :src="fileUploadAssets[`/src/assets/drop/${findFileTypeIcon(file)}`]" style="height: 45px; width: 40px;"/>
                <a :href="file.file_url" :download="file.file_name" target="_blank">
                  <img src="../assets/download.png" style="height: 25px; width: 25px;"/>
                </a>
              </div>
              <img v-bind:src="allIcon.get('Group2170')" class="crossIcon" @click="deleteFile(file.file_name, index)"/>
            </div>
            <div
              class="relativePos"
              v-if="questions.question_type == 'file_upload'"
              :id="questions.guideId"
            >
              <label class="labelBtn">
                <div class="imgContainer upldImgCntnr">
                  <img src="../assets/Upload.svg" class="cloudImg" />
                  <p class="upldImgTxt">Upload File</p>
                  <div class="fileTypes">
                    <p class="fileTypeText" v-if="questions.additional_info.allowed_types.includes('image')">{{getFilesOfType('image')}}</p>
                    <p class="fileTypeText" v-if="questions.additional_info.allowed_types.includes('video')">{{getFilesOfType('video')}}</p>
                    <p class="fileTypeText" v-if="questions.additional_info.allowed_types.includes('document')">{{getFilesOfType('document')}}</p>
                  </div>
                  <input
                    @change="uploadFiles($event)"
                    type="file"
                    multiple="multiple"
                    style="width: -webkit-fill-available"
                  /><br />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cards" v-if="questions.question_type == 'poi'" :id="questions.guideId">
      <button
        class="accordion"
        :class="[isOpen ? 'active' : '']"
        @click="toggle()"
      >
        {{ questions.label }} <span v-if="questions.is_required" style="color: rgb(244, 48, 48); font-size: 20px;  display: contents;">*</span>
        <img v-bind:src="allIcon.get('Group2172')" class="whiteArrFAQ" />
      </button>
      <div class="panel" v-show="isOpen">
        <div class="poiFileCont">
          <div  v-for="(poi, poiIndex) in poiArray" :key="poiIndex" class="fileInfo">
            <div class="map-section">
              <div  class="mapImage" >
                <!-- {{ poi.map_image?.[0]?.file_url || poi.map_images?.[0]?.file_url }} -->
                <img class="image-1" :src="poi.map_images?.[0]?.file_url ||  poi.map_image?.[0]?.file_url" alt="Map Location" @click="viewImage($event)"/>
              </div>
              <div class="imageInfo">
                <div class="headingCont">
                <p class="heading">{{  poi.name || poi.title }}</p>
                <img src="../assets/editIcon.svg" @click="$emit('triggerPOIEditMode',[questions.id,poi,poi.display_name,poiArray])" class="editIcon">
                  <img src="../assets/deleteIcon.svg" class="deleteIcon" @click="deletePOI(poi,poiIndex)"/>
                </div>
                <div class="description">{{ poi.description }}</div>
                <div class="latitude">
                  <p v-if="poi.length">Distance: {{ poi.length || 0 }} m</p>
                </div>
                <div v-if="!poi.length"  class="latitude">
                  <p>Latitude: {{ poi.lat || poi.latitude }}</p>
                </div>
                <div v-if="!poi.length" class="longitude">
                  <p>Longitude: {{ poi.lng || poi.longitude }}</p>
                </div>
              </div>
            </div>
            <div v-if="poi.files?.length">
              <p>Uploaded Files</p>
                <div class="fileuploadCont" >
                    <!-- TODO : need to fix these double iterations -->
                    <template v-for="(file, fileIndex) in poi.files" :key="file.file_name">
                      <div class="fileCont" v-if="file.file_type ==='image'">
                        <img  @click="viewImage($event)"  :src="file.file_url" :alt="poi.title + ' File'" class="image-2"/>
                        <img v-bind:src="allIcon.get('Group2170')" class="crossIconPOI" @click="deleteCornerFile(poi, file.file_name, fileIndex, poiIndex)"/>
                      </div>
                      <div class="fileCont" v-if="file.file_type ==='video'">
                        <video controls class="videos" :src="file.url || file.file_url" >
                                Your browser does not support HTML5 video.
                        </video>
                        <img v-bind:src="allIcon.get('Group2170')" class="crossIconPOI" @click="deleteCornerFile(poi, file.file_name, fileIndex, poiIndex)"/></div>
                    </template>
                </div>
              </div>
            </div>
        </div>
        <div class="addLocationCont" @click="addLocation()">
          <img src="../assets/PlusCircle.svg" alt="" class="addIcon" style="width: 16px; height: 16px;"/>
          <p class="addTxt" @click="$emit('triggerPOI',questions.id,this.maxDisplayNameOfPOI+1)">Mark on google map</p>
        </div>
      </div>
    </div>
    <!-- For nested fields -->
    <!-- Check if the current question has sub_options and if a selection has been made for the parent question -->
    <div v-if="questions.options && questions?.options?.length > 0 &&  
      doesAnOptionOfThisQuestionHaveSuboptionObject(questions) && nestedQuestionAnswerOptionCheck()"> 
      <!-- Render allGenericFields recursively with sub-questions as props -->
      <div v-for="(nestedQuestion, nestedQIndex) in determineNestedQuestion(questions)" :key="nestedQIndex" :style="{ marginTop: nestedQIndex !== 0 ? '30px' : '0' }">
        <allGenericFields
          :questions="nestedQuestion"
          :key="componentKey"
          :nestedQIndex="nestedQIndex"
          :isNestedMode="true"
          :isSiteSurveyPreviewMode="isSiteSurveyPreviewMode"
        />
      </div>
    </div>
  </div>
</template>


<script>
import API from "@/services/api";
import debounce from "debounce";
import utils from "@/pages/siteSurvey/utils";
import { v4 } from "uuid";
import { uploadFileToBlob, uploadFileToBlobForNested } from "@/utils.js";
import temporaryPhoto1 from "../assets/temporaryImage.svg"
import temporaryPhoto2 from "../assets/temporaryImage.svg"
import temporaryPhoto3 from "../assets/temporaryImage.svg"
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';
import fileType from "../../../fileType";
import OTPpopup from '../../waaree/otpPopup.vue';
const fileUploadAssets = import.meta.glob('/src/assets/drop/*', { eager: true, as: 'url' })

export default {
  name: "allGenericFields",
  components: {
    OTPpopup,
  },
  props: {
    questions: {
      type: Object,
      required: true,
    },
    isNestedMode:{
      type: Boolean,
      required: false,
      default: false,
    },
    isSiteSurveyPreviewMode:{
      type: Boolean,
      required: false,
      default: false,
    },
    nestedQIndex:{
      type:Number,
      required:false,
    }
  },
  data() {
    return {
      photoFiles:[],
      videoFiles:[],
      valueData:'',
      previousValueData: '', //for phone, email
      isOTPSectionVisible: false, // for phone, email
      markVerified: false, //for phone, email
      isLoading: false, // for phone, email
      isWaiting: false, // for phone, email, when the user is waiting for another round to attempt getOTP
      textTypes : ["short_answer","number","long_answer", "paragraph","date","time","slider"],
      optionTypes : ["dropdown", "radio", "checkbox", "multiple_choice", "single_choice", "tab_choice"],
      otherTypes:["email","phone_number"],
      fileUploadType :["file_upload"],
      fileUploadAssets,
      uuid: null,
      storedAnswers: {},
      filesToIterate: [],
      allIcon: utils.images,
      radio: null,
      isOpen: true,
      debouncer: null, // Individual debouncer for this instance,
      location: [
        {
          imageSrc: temporaryPhoto1,
          heading: "POI 1",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
          latitude: "123.4567",
          longitude: "987.6543",
          uploadedFiles: [{
              imageSrc: temporaryPhoto1
            },
            {
              imageSrc: temporaryPhoto2
            },
            {
              imageSrc: temporaryPhoto3
            }
          ]
        }
      ],
      poiAnswerJson:{},
      poiArray:[],
      maxDisplayNameOfPOI:0,
			componentKey:0,
    };
  },
  computed: {
    ...mapState(useEditableSiteSurveyStore, {
        poiUpdatedCounter: "POI_UPDATED_COUNTER",
        deletePathCheck:'DELETED_PATH_COUNTER',
        fileFormats: "GET_FILE_FORMATS",
    }),
		fileTypeAccept(){
      let fileTypesAllowed = ['image', 'video', 'dwg', 'pdf'];
			if(this.$props.questions.question_type =='file_upload'){
        if(this.$props.questions.additional_info.allowed_types.length > 0){
          fileTypesAllowed = [];
          for(let allowedFileType of this.$props.questions.additional_info.allowed_types){
            console.log("allowed type", allowedFileType);
            if(allowedFileType === 'document'){
                fileTypesAllowed.push('dwg');
                fileTypesAllowed.push('pdf');
                fileTypesAllowed.push('doc');
            }
            else
              fileTypesAllowed.push(allowedFileType);
          }
        }
        console.log("allowed file types", fileTypesAllowed);
        return fileTypesAllowed;
      }
      // return this.$props.questions.additional_info.allowed_types;
		},
    // Condition to disable the "Get OTP" button
    hideGetOTP() {
      return !this.valueData || this.valueData === this.previousValueData;
    },
  },
  mounted() {
    //preprocessing for questions.files
    [this.photoFiles, this.videoFiles] = this.separatePhotoVideoFiles(this.questions.files);
  
    this.storedAnswers =
    JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
    this.storedAnswers[this.questions.id].answer.files.forEach((file) => {
      this.filesToIterate.push(file);
    });
    this.initializePOIArray();
    if(!this.isNestedMode){
      if(this.textTypes.includes(this.questions.question_type)){
        this.valueData = this.storedAnswers[this.questions.id].answer?.text;
      }
      if(this.optionTypes.includes(this.questions.question_type)){
        // this.valueData = this.storedAnswers[this.questions.id].answer?.options;
        // for checkbox type where multiple can be selected, so options will have more than one object
        if(this.questions.question_type === 'checkbox' && this.storedAnswers[this.questions.id].answer.options.length>0){
          this.valueData = [];
          for(let option of this.storedAnswers[this.questions.id].answer.options){
            this.valueData.push(option?.value);
          }
        }
        else{
          // multiple choice and other types where only one can be selected
          this.valueData = this.storedAnswers[this.questions.id].answer.options[0]?.value;
        }
      } 
      if(this.otherTypes.includes(this.questions.question_type)){
        this.valueData = this.storedAnswers[this.questions.id].answer?.email || this.storedAnswers[this.questions.id].answer?.phone_number;
        //commented OTP email and phone behaviour
        // this.markVerified = this.storedAnswers[this.questions.id].answer?.additional_info?.is_verified;
        // this.previousValueData = this.markVerified === true ? this.valueData : '';
      }
    }
    else{
      //if value does not exist, add
      //else initialise from LS
      // this.valueData = this.storedAnswers[this.questions.id].answer?.sub_options.value;
      // this.storedAnswers[this.questions.id].answer.sub_options.question_type = this.questions.question_type; 
      this.valueData = this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.value;
      console.log("answer object in nested mounted", this.storedAnswers[this.questions.id].answer);

      //commented OTP email and phone behaviour
      // if(this.otherTypes.includes(this.questions.question_type)){
      //   this.markVerified = this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.additional_info?.is_verified;
      //   this.previousValueData = this.markVerified === true ? this.valueData : '';
      // }
      if(this.fileUploadType.includes(this.questions.question_type)){
        this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files.forEach((file) => {
          this.filesToIterate.push(file);
        });
      }
    }
  },
  methods: {
    ...mapActions(useEditableSiteSurveyStore, {
       fileUploadStarted:  "FILE_UPLOAD_STARTED",
       fileUploadCompleted:  "FILE_UPLOAD_COMPLETED",
       pathActiveIndex:'PATH_ACTIVE_INDEX'
    }),
    isFieldTooLong(charLength) {
      if (this.valueData.length > charLength) {
        this.$message({
          showClose: true,
          message: "Field is too long",
          type: "error",
          center: true,
        });
        return true;
      }
      return false;
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(this.isNestedMode){
        if(email !== '')
          return emailRegex.test(email);
        else
          return true;
      }
      else{
        if(this.questions.is_required && email === '')
          return emailRegex.test(email);
        else{
          if(email !== '')
            return emailRegex.test(email);
          else
            return true
        }
      }
    },
    validatePhoneNumber(phone) {
      const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/; // +91 1234567890
      if(this.isNestedMode){
        if(phone !== '')
          return phoneRegex.test(phone);
        else
          return true;
      }
      else{
        if(this.questions.is_required && phone === '')
          return phoneRegex.test(phone);
        else{
          if(phone === '')
            return true;
          else
            return phoneRegex.test(phone);
        }
      }

    },
    getFilesOfType(mainType){
      let fileTypesToReturn = '';
      for(let fileFormat of this.fileFormats){
        if(fileFormat.type === mainType){
          fileTypesToReturn = fileTypesToReturn + fileFormat.label + ", ";
        }
      }
      //remove the last comma
      fileTypesToReturn = fileTypesToReturn.slice(0, -2);
      return `[ ${fileTypesToReturn} ]`;
    },
    separatePhotoVideoFiles(filesArray){
      // Separate photos and videos
      const photos = [];
      const videos = [];

      if(filesArray.length > 0){
          filesArray.forEach(file => {
              if (file.file_type.startsWith('image')) {
                  photos.push(file);
              } else if (file.file_type.startsWith('video')) {
                  videos.push(file);
              }
          });
      }
      return [photos, videos];
    },
    filterNonNumeric() {
      // Remove non-numeric characters using a regular expression
      this.valueData = this.valueData.replace(/\D/g, '');
    },
    handleClosePopup(){
      // this.isOTPSectionVisible = false;
      // this.markVerified = false;
      if(this.markVerified != true){
        this.isWaiting = true;
        setTimeout(() => {
          this.isWaiting = false;
          this.markVerified = false;
          this.previousValueData = '';
          this.isOTPSectionVisible = false;
        }, 15000); 
      }
    },
    onVerification(){
      this.markVerified=true; 
      this.isOTPSectionVisible=false;
      this.storedAnswers[this.questions.id].answer.additional_info.is_verified = this.markVerified;
      this.updateAnswerJsonAndCallApi();
    },
    async sendOTPToUser(){
      const requestBody = this.questions.question_type === 'phone_number'? {
          phone : `+91${this.valueData}`
      } : {
        email: [this.valueData],
      };
      try{
          this.isLoading = true;
          let response = await API.WAREE.SEND_OTP(requestBody);
               this.isLoading = false;
          if(response.status === 201){
              this.$message({
                  showClose: true,
                  message: response.data,
                  type: "success",
                  center: true
              });
          }
          this.isOTPSectionVisible = true;
          // this.isMobileVerified = false;
          // Update the previousPhone after successfully sending OTP
          this.previousValueData = this.valueData;
      }catch(error){
          this.isLoading = false;
          let errorMsg;
          if( error.response.status === 400
              && error.response.data === 'Invalid Number'){
              errorMsg = 'Invalid mobile number, try again.';
              this.valueData = null;
              if(this.questions.question_type === 'phone_number')
                this.$refs.phoneInput.focus();
              if(this.questions.question_type === 'email')
                this.$refs.emailInput.focus();
          }else{
              errorMsg = error.message;
          }
          this.$message({
              showClose: true,
              message: errorMsg,
              type: "error",
              center: true
          })
      }

    },
    doesAnOptionOfThisQuestionHaveSuboptionObject(questions){
      let hasNested = false;
      const option = this.storedAnswers[questions.id]?.answer?.options[0]?.value;
      for(const op of questions.options){
        if(op.option_text === option && op?.sub_options?.length > 0){
          hasNested = true;
          return hasNested;
        }
      }
      return hasNested;
    },
    nestedQuestionAnswerOptionCheck(){
      if (Array.isArray(this.storedAnswers[this.questions.id]?.answer.options) &&
      this.storedAnswers[this.questions.id]?.answer.options.length > 0) {
        return true;
      } else {
          // It doesn't match the expected types (neither string nor non-empty array)
          // Handle the invalid case here
          return false;
      }
    },
    determineNestedQuestion(questions){
      let nestedQuestions = [];
      if(Object.keys(this.storedAnswers).length > 0){
        //for option fields only
        for(let option of questions.options){
          if(this.storedAnswers[questions.id]?.answer.options[0].value === option.option_text){
            for(let subOption of option.sub_options){
              //create question
              let question = {
                id: questions.id,
                files:[],
                ...subOption,
              }
              nestedQuestions.push(question);
            }
            // return option.option_text;
            return nestedQuestions;
          }
        }
        //do for text fields
        return "Hello";
      }
    },
    uploadFileToBlob,
    uploadFileToBlobForNested,
    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
      if (fileType[file.file_type]) {
        iconName = fileType[file.file_type];
      }
      else {
				if(file.file_type.includes('dwg')|| file.file_type.includes('dxf')){
					iconName = fileType["image/x-dxf"];
				}
      }
      return iconName;
    },
    deleteCornerFile(poi, fileName, fileIndex , poiIndex) {
      this.poiArray[poiIndex].files.splice(fileIndex, 1);
      poi.deleted_files = [fileName];
      poi = JSON.parse(JSON.stringify(poi));
      poi.files=[]
      poi.map_image = [];
      const afterFileDeletionPOI = this.callDeleteCornerFileAPI(poi);
    },
    async callDeleteCornerFileAPI(poi) {
      const response = poi?.length? await API.EDITABLE_SITE_SURVEY_API.PATCH_PATH(poi.id, poi):await API.EDITABLE_SITE_SURVEY_API.PATCH_CORNER(poi.id, poi);
      return response.data;
    },
    async deleteFile(fileName, fileIndex) {
      if(!this.isNestedMode){
        this.storedAnswers[this.questions.id].answer.files = [];
        this.storedAnswers[this.questions.id].answer.deleted_files = [fileName];
        this.filesToIterate.splice(fileIndex, 1);
      }
      if(this.isNestedMode){
        //this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files = [];
        //this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files.deleted_files = [fileName];
        // console.log('fileIndex', fileIndex)
        // console.log("files",this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files);
        let fileObj = {
          "file": this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files[fileIndex]?.file_name,
        }
        // console.log("fileObj",fileObj);
        try{
          const deleteNestedFileResponse = await API.EDITABLE_SITE_SURVEY_API.DELETE_NESTED_FILE(fileObj);
          this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files.splice(fileIndex, 1);
          this.filesToIterate.splice(fileIndex, 1);
        }
        catch(e){
          console.error(e);
          ElMessage({
            message: 'Failed to Delete File',
            type: 'error',
          });
        }
      }
      try{
        this.updateAnswerJsonAndCallApi(0) 
      }
      catch{
        console.error(e);
        ElMessage({
          message: 'Failed to Delete File',
          type: 'error',
        });
      }
    },
    addLocation() {
      this.location.push({
        imageSrc: temporaryPhoto1,
        heading: "POI 2",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        latitude: "456.7890",
        longitude: "321.9876",
        uploadedFiles: [{
            imageSrc: temporaryPhoto1
          },
          {
            imageSrc: temporaryPhoto2
          },
          {
            imageSrc: temporaryPhoto3
          }
        ]
      });
    },
    initializePOIArray(){
        if(this.questions.question_type=='poi'){
            this.maxDisplayNameOfPOI=0; // it is because suppose If i delete POI 3 for ex, so this function should be called so that maxDisplayName can be modified to less than 3
            this.poiArray = [];
            this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            this.poiAnswerJson = this.storedAnswers[this.questions.id];
            let coordinates= JSON.parse(JSON.stringify(this.poiAnswerJson.answer.corners.coordinates))
            let coordinatesArray =  Object.keys(coordinates); 
            coordinatesArray.forEach(key=>{
                this.poiArray.push(coordinates[key])
                this.maxDisplayNameOfPOI = Math.max(this.maxDisplayNameOfPOI,coordinates[key]['display_name']); // used to send fresh new key name for the new poi ccordinate
            })
        }
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
    updateAnswerJsonAndCallApi(debounceTime) {
      //using debouncer in this way because this component is being iterated in a for loop
      // and because of some unknown reasons its sharing a common debouncer although component is being iterated
      // so for changing 3 to 4 inputs within 2 sec, its updating only the latest one
      // Clear the previous debouncer
      if(this.isNestedMode){
        if(!this.fileUploadType.includes(this.questions.question_type))
          this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
        // this.storedAnswers[this.questions.id].answer.sub_options.value = this.valueData;
        // this.storedAnswers[this.questions.id].answer.sub_options.question_type = this.questions.question_type; 

        if(!this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex]){
          let sub_optionObj = {
            value:"",
            question_type:"",
            sub_options:[],
            files:[],
            deleted_files:[],
          };
          this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex] = sub_optionObj;
        }
        // if(!this.fileUploadType.includes(this.question.question_type)){
        //   }
        this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex].value = this.valueData;
        this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex].question_type = this.questions.question_type; 

        //commented OTP email and phone behaviour
        // if(this.otherTypes.includes(this.questions.question_type)){
        //   if(this.previousValueData !== this.valueData){
        //       this.markVerified = false;
        //   }
        //   else if(this.previousValueData === this.valueData && this.valueData != ''){
        //     this.markVerified = true;
        //   } 
        //   this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex].additional_info = { is_verified: this.markVerified};
        // }

        if(this.otherTypes.includes(this.questions.question_type)){
          if(this.questions.question_type === 'phone_number'){
            //validate phone number
            if(this.isFieldTooLong(20) || !this.validatePhoneNumber(this.valueData)){
              this.$message({
                showClose: true,
                message: "Invalid Phone Number",
                type: "error",
                center: true,
              });
              this.valueData = '';
            }
            this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex].value = this.valueData;
          }
          if(this.questions.question_type === 'email'){
            //validate email
            //if valid assign to storedAnswers
            //else show error message
            if(this.isFieldTooLong(50) || !this.validateEmail(this.valueData)){
              this.$message({
                showClose: true,
                message: "Invalid Email",
                type: "error",
                center: true,
              });
              this.valueData = '';
            }
            this.storedAnswers[this.questions.id].answer.options[0].sub_options[this.nestedQIndex].value = this.valueData;
          }
        }
      }
      else{
        //not nested
        //need to populate this.storedAnswers[this.questions.id].answer.options 
        //or this.storedAnswers[this.questions.id].answer.text based on which type of question 
        if(this.textTypes.includes(this.questions.question_type)){
          this.storedAnswers[this.questions.id].answer.text = this.valueData;
        }
        if(this.optionTypes.includes(this.questions.question_type)){
          //this.storedAnswers[this.questions.id].answer.options = this.valueData;
          //split between checkbox and other types
          this.storedAnswers[this.questions.id].answer.options = [];
          if(this.questions.question_type === 'checkbox'){
            for(let option of this.valueData){
              let optionObj = {
                value: option,
                question_type: this.questions.question_type,
                sub_options: [],
              }
              this.storedAnswers[this.questions.id].answer.options.push(optionObj);
            }
          }
          else{
            let optionObj = {
              value: this.valueData,
              question_type: this.questions.question_type,
              sub_options: [],
            }
            this.storedAnswers[this.questions.id].answer.options.push(optionObj);
          }
          
        } 
        //commented OTP email and phone behaviour
        // if(this.otherTypes.includes(this.questions.question_type)){
        //   if(this.questions.question_type === 'phone_number')
        //     this.storedAnswers[this.questions.id].answer.phone_number = this.valueData;
        //   if(this.questions.question_type === 'email'){
        //     this.storedAnswers[this.questions.id].answer.email = this.valueData;
        //   }
        //   if(this.previousValueData !== this.valueData){
        //       this.markVerified = false;
        //   }
        //   else if(this.previousValueData === this.valueData && this.valueData != ''){
        //     this.markVerified = true;
        //   } 
        //   this.storedAnswers[this.questions.id].answer.additional_info.is_verified = this.markVerified;
        // }

        if(this.otherTypes.includes(this.questions.question_type)){
          if(this.questions.question_type === 'phone_number'){
            //validate phone number
            if(!this.isFieldTooLong(20) && this.validatePhoneNumber(this.valueData))
              this.storedAnswers[this.questions.id].answer.phone_number = this.valueData;
            else{
              this.$message({
                showClose: true,
                message: "Invalid Phone Number",
                type: "error",
                center: true,
              });
              this.valueData = '';
              this.storedAnswers[this.questions.id].answer.phone_number = this.valueData;
            }
          }
          if(this.questions.question_type === 'email'){
            //validate email
            //if valid assign to storedAnswers
            //else show error message
            if(!this.isFieldTooLong(50) && this.validateEmail(this.valueData))
              this.storedAnswers[this.questions.id].answer.email = this.valueData;
            else{
              this.$message({
                showClose: true,
                message: "Invalid Email",
                type: "error",
                center: true,
              });
              this.valueData = '';
              this.storedAnswers[this.questions.id].answer.email = this.valueData;
            }
          }
         
        }
        //also set value to an empty string so that on option change, the field "is refreshed"
        //this.storedAnswers[this.questions.id].answer.sub_options.value = '';
      }
      if (this.debouncer) {
        clearTimeout(this.debouncer);
      }
      this.updateAnswer();
			this.componentKey++;
      // Create a new debouncer for this instance
      this.debouncer = setTimeout(() => {
        // Trigger the API call here with this.inputValue
        this.callAPI(this.storedAnswers[this.questions.id]);
      }, debounceTime);
    },
    updateAnswer() {
      this.storedAnswers[this.questions.id].answer.files = JSON.parse(JSON.stringify(this.storedAnswers[this.questions.id].answer.files))
      // when we make changes in multiple fields and change component using next/back, the changes are updated only in last field.
      // so we are storing the current changes in the duplicate JSON.
      let duplicateAnswerJson =  this.storedAnswers[this.questions.id];
      this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
      this.storedAnswers[this.questions.id] = JSON.parse(JSON.stringify(duplicateAnswerJson));
      // since the size of file_url is too large to store it in localstorage
      // so we are removing the file_url and then storing in localstorage.
      for(const file of this.storedAnswers[this.questions.id].answer.files) {
        if(file.file_url) {
          delete file.file_url;
        }
      }
      localStorage.setItem(
        "overallMappingOfQidToAnsJson",
        JSON.stringify(this.storedAnswers)
      );
    },
    async callAPI(payLoad) {
      let patchData = JSON.parse(JSON.stringify(payLoad));
      // since the size of file_url is too large
      // so we are removing the file_url and then calling API.
      for (const file of patchData.answer.files) {
        if (file.file_url) {
          delete file.file_url;
        }
      }

      const response = await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(patchData);
      let answerJson = response.data;
      this.storedAnswers[this.questions.id] = response.data;  // imp as not just coordinates but files as well needs to be updated
      this.storedAnswers[this.questions.id].answer.corners.coordinates= this.convertCoordinateArrayToJson(answerJson.answer.corners.coordinates);
      localStorage.setItem("overallMappingOfQidToAnsJson",JSON.stringify(this.storedAnswers));
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
    viewImage(event) {
      const element = event.target;
      const src = element.src;

      const modal = document.createElement("div");
      const close = document.createElement("span");

      close.innerText = "+";
      close.style.position = "fixed";
      close.style.fontSize = "65px";
      close.style.fontWeight = "400";
      close.style.display = "inline-block";
      close.style.transform = "rotate(45deg)";
      (close.style.top = "0px"),
        (close.style.right = "30px"),
        (close.style.cursor = "pointer");
      (close.style.zIndex = "90000"), (close.style.color = "#fff");

      (modal.style.background =
        "RGBA(0,0,0,0.8) url(" + src + ") no-repeat center"),
        (modal.style.backgroundSize = "contain"),
        (modal.style.width = "100%"),
        (modal.style.height = "100%"),
        (modal.style.position = "fixed"),
        (modal.style.zIndex = "10000"),
        (modal.style.top = "0"),
        (modal.style.left = "0"),
        close.addEventListener("click", removeModal);

      document.body.appendChild(modal);
      document.body.appendChild(close);

      function removeModal() {
        modal.remove();
        close.remove();
      }
    },
    createImage(file, index1, index2) {
      let reader = new FileReader();
      reader.onload = (e) => {
        // this.storedAnswers[this.questions.id].answer.files[index1]["file_url"] = e.target.result;
        this.filesToIterate[index2]["file_url"] = e.target.result;
      };
      reader.readAsDataURL(file);
    },
		isFileTypeAllowedToUpload(fileType){
			let isAllowed = false;
      // console.log("fileType", fileType)
			this.fileTypeAccept.forEach((eachFileType)=>{
				// if(fileType.includes('image')){
				// 	fileType='photo';  
        //   // it is because, from the backend we are getting photo instead of image, so need to change here for now.
				// 	// TODO: need to get it changed from backend from photo to image.
        // }
				if(fileType.includes(eachFileType)){
					isAllowed = true;
					return;
				}
			})
			return isAllowed;
		},
    async uploadFiles(e) {
      this.fileUploadStarted(); // so that store can know that file upload is in progress and next section can be blocked
      let files = e.target.files || e.dataTransfer.files;
      if(!this.isNestedMode){
        this.storedAnswers[this.questions.id].answer.files = [];
        this.storedAnswers[this.questions.id].answer.deleted_files = [];
      }
      else{
        // this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files = [];
        // this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.deleted_files = [];
      }
      let fileType = "";
			let isAlreadyRestricted = false;
      // check count of files
      let countFiles = this.filesToIterate.length + files.length;
      if(countFiles > this.questions.additional_info?.max_files){
        ElMessage({
          showClose: true,
          message: `Number of files cannot be more than ${this.questions.additional_info.max_files} for the given question.`,
          type: "error",
          center: true
        });
      } 
      else{
        for (const file of files) {
          if (file.size > 100 * 1024 * 1024) {
            ElMessage({
                          showClose: true,
                          message: "File size should be less than 100MB. Please try again",
                          type: "error",
                          center: true
                      });
            continue; // Skip this file
          }
          const uuidImage = v4();
            fileType = file.type;
            if(!fileType){
              if((file.name.split('.').pop() === 'dxf' || file.name.split('.').pop() === 'dwg')) {
                fileType = 'dwg'
              }
              else
                fileType = 'other';
            }
          if(!isAlreadyRestricted && !this.isFileTypeAllowedToUpload(fileType) ) {
            isAlreadyRestricted = true;
            ElMessage({
              showClose: true,
              message: "Some file type is not supported for the selected field.",
              type: "error",
              center: true
            });
            continue; 
          }
          if(!this.isFileTypeAllowedToUpload(fileType)){
            continue; 
          }
          try {
            const image = {
              file_info: "corner 1",
              file_name: uuidImage + fileType.split('/')[1],
              file_type: fileType
            };
            this.filesToIterate.push(image);
            let index1;
            if(!this.isNestedMode){
              this.storedAnswers[this.questions.id].answer.files.push(image);
              index1 = this.storedAnswers[this.questions.id].answer.files.length - 1;
              let index2 = this.filesToIterate.length - 1;
              const [_, thumbnailUrl] = await Promise.all([
                this.uploadFileToBlob(file, uuidImage + fileType.split('/')[1]),
                this.generateThumbnailUrl(file),
              ]);
              this.filesToIterate[index2]["file_url"] = thumbnailUrl;
            }
            else{
              this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files.push(image);
              index1 = this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.files.length - 1;
              let index2 = this.filesToIterate.length - 1;
              const response = await Promise.all([
                  this.uploadFileToBlobForNested(file, uuidImage),
              ]);
              this.filesToIterate[index2]["file_url"] = response[0];
              console.log("files to iterate for nested", this.filesToIterate)
            }
            
          } catch (error) {
            console.error("file Uploading error", error);
          }
        }
        if(this.filesToIterate.length>0){
          this.updateAnswerJsonAndCallApi(1000); // So that it hits API only atleast 1 valid file is there to be uploaded
        }
      }
      this.fileUploadCompleted();
    },
    async generateThumbnailUrl(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    },
    async deletePOI(poi,poiIndex){
      let cornerId = poi.id;
      
      try{
        if(poi['coordinates']){
          await API.EDITABLE_SITE_SURVEY_API.DELETE_PATH(cornerId);
        }else{
          await API.EDITABLE_SITE_SURVEY_API.DELETE_CORNER(cornerId);

        }
        this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
        // delete this.storedAnswers[this.questions.id].answer.corners.coordinates[poi.display_name];
        this.storedAnswers[this.questions.id].answer.corners.coordinates=this.poiArray;
        this.poiArray.splice(poiIndex,1);
        localStorage.setItem("overallMappingOfQidToAnsJson",JSON.stringify(this.storedAnswers));
        this.initializePOIArray(); // imp because of deleteing POI 2 for ex, maxDisplayName should be updated to 1 and so on
      }
      catch(e){
        console.error(e);
        ElMessage({
          message: 'Failed to delete!',
          type: 'error',
        });
      }
    }
  },
  watch:{
    poiUpdatedCounter:{
        handler(val,oldVal){
            if(val!=oldVal){
                this.initializePOIArray();
            }
        }
    },
    questions:{
      handler(val, oldVal){
        //prepare v-model
        if(this.isNestedMode){
          this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
          // console.log("answerssss object", this.storedAnswers);
          this.valueData = this.storedAnswers[this.questions.id].answer?.options[0]?.sub_options[this.nestedQIndex]?.value;
          
          // this.valueData = this.storedAnswers[this.questions.id].answer.sub_options.value;
          // this.storedAnswers[this.questions.id].answer.sub_options.question_type = this.questions.question_type; 
        }
      }
    },
    deletePathCheck:{
      handler(val,oldVal){
        if(val>0&&val!==oldVal){   
          this.storedAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
          this.poiAnswerJson = this.storedAnswers[this.questions.id];
          let coordinates= JSON.parse(JSON.stringify(this.poiAnswerJson.answer.corners.coordinates))
          let coordinatesArray =  Object.values(coordinates); 
          let pathArray=coordinatesArray.filter(d=>d.length||d.coordinates)
          this.pathActiveIndex(null)
          this.initializePOIArray();
        }
      }
    }
  }
};
</script>


<style scoped>
.asterisks{
  color: rgb(244, 48, 48);
  font-size: 18px;
  display: contents;
}
.radio-label{
  color: #777 !important;
}
.otherFileUpload{
  width: 120px;
  height: 120px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
.abbrTag{
  text-decoration: none;
}
.fileCont{
  position: relative;
}
.editIcon{
    cursor: pointer;
}
.deleteIcon{
    cursor: pointer;
}
.crossIcon {
  position: absolute;
  top: -8px;
  right: -8px;
  cursor: pointer;
  /* width: 11px; */
  top: -4px;
  right: -4px;
}
.crossIconPOI {
  position: absolute;
  cursor: pointer;
  height: 17px;
  right: -5%;
  top: -6%;
}
.map-section{
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.poiFileCont {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}
.addLocationCont{
  display: flex;
  flex-direction: row;
  height: 40px;
  width: 100%;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.heading{
  color: rgba(34, 34, 34, 1);
}
.headingCont{
  display: flex;
  flex-direction: row;
  gap: 5px;
}
.fileInfo{
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 2px solid #cbcbcb;
}
.imageInfo{
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  gap: 9px;
}
.fileuploadCont{
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 5px;
}
.image-1{
  height: 120px;
  width: 120px;
}
.image-2{
  height: 80px;
  width: 80px;
}
.videos{
    width: 150px;
    height: 90px;
    border-radius: 4px;
}
.mapImage{
  height: 120px;
  width: 120px;
  margin-bottom: 10px;
  margin-top: 10px;
}
.genericFieldsContainer {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.genericFieldsContainer :deep() .el-scrollbar__view {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.label {
  font-size: 14px;
  color: #777;
  font-weight: 600;
  margin-bottom: 4px;
}

.description {
  font-size: 16px;
  font-weight: 400;
  line-height: 21.12px;
  text-align: left;
  color: #222;
}

.checkboxLabel {
  font-size: 16px;
  color: #222;
  margin-bottom: 6px;
}

.astrisk {
  color: red;
}

.genericFieldsContainer :deep() .el-select {
  width: 300px;
}

.genericFieldsContainer :deep() .el-input__inner {
  height: 45px !important;
  border-radius: 4px;
  font-size: 16px;
  color: #222;
  box-shadow: none;
}

.genericFieldsContainer :deep() .el-input__wrapper,
.genericFieldsContainer :deep() .el-textarea__inner {
  border: none;
  outline: none;
  background-color: #e8edf2;
  max-width: 420px;
}

.genericFieldsContainer :deep() .el-textarea__inner {
  max-height: 84px;
  max-width: 650px;
}

.genericFieldsContainer :deep() .el-radio-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 10px;
}

.genericFieldsContainer :deep() .el-radio__label {
  font-size: 16px;
  color: #222;
}

.genericFieldsContainer :deep() .el-radio__inner {
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
}

.genericFieldsContainer :deep() .el-select .el-input .el-select__caret {
  font-size: 20px;
  font-weight: bold;
  color: #777;
}

.genericFieldsContainer :deep() .el-date-editor.el-input {
  width: 300px;
  height: 45px;
}

.chkboxBox {
  display: flex;
  flex-direction: column;
  width: fit-content;
}

.genericFieldsContainer
  :deep()
  .el-checkbox.el-checkbox--large
  .el-checkbox__inner {
  width: 16px;
  height: 16px;
  border: 1px solid #777;
}

.genericFieldsContainer
  :deep()
  .el-checkbox.el-checkbox--large
  .el-checkbox__label {
  color: #777;
  padding-left: 12px;
}

.genericFieldsContainer :deep() .el-checkbox__inner::after {
  width: 4px;
}

.cards {
  margin-bottom: 16px;
  position: relative;
}

#preview img {
  max-width: 100%;
  max-height: 150px;
  margin-top: 10px;
}

.accordion {
  background-color: #f0f3f8;
  color: #222;
  cursor: pointer;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  outline: none;
  transition: 0.4s;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e8edf2;
  min-height: 40px;
}

.panel {
  padding: 0px 16px;
  background-color: #fff;
  /* height: 0; */
  transition: max-height 0.2s ease-out;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 4px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.flexFileCont {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  row-gap: 0px;
}

.imgContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0px;
}

.upldImgCntnr {
  width: 130px;
  height: 130px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px dashed var(--999, #999);
  cursor: pointer;
  padding-top: 24px;
  margin: 0px;
  background-color: #e8edf2;
}

.relativePos {
  position: relative;
  margin: 16px 0px;
}

.upldImgCntnr > input {
  display: none;
}

.imgs {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
}
.videosUploaded {
  width: 212px;
  height: 122px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
}

.upldImgTxt {
  color: #222;
  font-size: 15px;
}

.accordion.active .whiteArrFAQ {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrFAQ {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
}

.addContainer {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #ccc;
  background-color: #222;
}

.addTxt,
.addIcon {
  color: #409eff;
  cursor: pointer;
}

.genericFieldsContainer  >>> .el-checkbox-group {
  display: flex;
  flex-direction: column;
}

.cards {
  margin: 0px;
}

.align-as-row{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.verifyText{
  cursor: pointer;
  color: var(--Secondary, #1C3366);
  font-size: 1rem;
  font-weight: 600;
  text-wrap: nowrap;
}

.verifiedText{
  color: green;
  font-weight: 700;
}

.email, .phone-number{
  width: 100%;
  max-width: 420px;
}

.sliderLabel{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sliderValue{
  color: var(--Primary, #409EFF);
  /*font-family: 'Poppins';*/
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  gap:0.3rem;
}

.sliderContainer{
  padding-left: 13px; 
  padding-right: 13px;
}

.sliderContainer >>> .el-input-number__increase {
  border-radius: 25px;
  background-color: #0d0d0d;
  color: white;
  width: 20px;
  height: 20px;
  font-size: 10px;
  font-weight: 700;
  margin-top: 5px;
}

.sliderContainer >>> .el-input__inner {
  border: 1px solid var(--999, #999);
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  width: 60px;
  background: white;
  border-radius: 5px;
  margin-left: 1.5px;
}

.sliderContainer >>> .el-input__wrapper {
  box-shadow: none;
  background: #edf1f5;
}

.sliderContainer >>> .el-slider__button {
  border: 3px solid var(--White, #fff);
  background: var(--Primary, #409eff);
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  height: 15px;
  width: 15px;
}

.tabChoiceContainer .el-radio-group{
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
  padding: 4px;
  justify-content: space-evenly;
  align-items: flex-start;
  border-radius: 4px;
  border: 1px solid var(--Grey-Grey-75, #BFBFBF);
  background: var(--White, #FFF);
  gap:0;
  height: 2.5rem;
  margin:0;
}

.tabChoiceContainer, .el-radio-button{
  display: flex;
  flex-grow: 1;
}

.tabChoiceContainer .el-radio-group .el-radio-button >>> .el-radio-button__inner{
  border: none;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1 1 0;
  color: var(--Grey-Grey-54, #808080);
  text-align: center;
  font-family: Arial;
  font-size: 1rem;
}

.tabChoiceContainer .el-radio-group .el-radio-button.is-active >>> .el-radio-button__inner{
  background: var(--Primary, #409EFF);
  color: var(--Grey-Grey-100, var(--White, #FFF));
}

.fieldBorder{
  border-bottom: #ccc 1px solid;
  padding-bottom:1rem;
}

.imageVideoContainer{
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.imageContainer, .videoContainer {
    display: flex;
    gap: 1rem;
}

.imageVideoContainer .heading{
    margin-bottom: 0.625rem;
}

.imageContainer img, .videoContainer video {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
}

.imageContainer img{
  cursor: pointer;
}

.fileTypes{
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
}

.fileTypeText{
  font-size:12px;
  opacity: 0.5
}

@media (min-width :470px){
  .tabChoiceContainer .el-radio-group{
    min-width: 420px;
  }
}

@media (max-width: 900px) {
  .genericFieldsContainer :deep() .el-input__wrapper,
  .genericFieldsContainer :deep() .el-textarea__inner,
  .genericFieldsContainer :deep() .el-select,
  .genericFieldsContainer :deep() .el-date-editor .el-input__wrapper,
  .genericFieldsContainer :deep() .el-date-editor.el-input {
    max-width: initial;
    width: 100%;
  }

  .email, .phone-number{
    width: 100%;
    max-width: 100%;
  }

  .genericFieldsContainer {
    gap: 16px;
  }
  /* .videos {
    width: 20px;
    height: 10px;
    border-radius: 4px;
  } */
}
@media(max-width: 700px) {
  .fileInfo{
    flex-direction: column;
    gap: 0px;
    align-items: flex-start;
  }
  .imageInfo{
    margin-bottom:8px;
  }

  .align-as-row{
    flex-direction: column;
  }
}
</style>