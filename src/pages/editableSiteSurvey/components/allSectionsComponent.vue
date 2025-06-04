<template>
  <!-- <p>{{ showGoogleMapSection }} {{ showIndivudualPageSection }}</p> -->
  <SiteSurveyNavbar
    :allSectionsLength="allSectionsLength"
    :currentSection="currentSectionIndex"
    :allSections="allSections"
    :isSiteSurveyPreviewMode="isSiteSurveyPreviewMode"
    @next-clicked="handleNextClick"
    @back-clicked="handleBackClick"
  />
  <div v-if="!isAnswersFetched" v-loading="!isAnswersFetched" class="loader"></div>
  <div :class="isSiteSurveyPreviewMode ? 'disable-pointer-events' : ''">
    <googleMapSection
      v-if="showGoogleMapSection && isAnswersFetched"
      :key="counter"
      :currentSection="currentSection"
      :question="currentSection?.fields[0]"
    />
  </div>
    <individualPageForSection
      v-if="showIndivudualPageSection && isAnswersFetched"
      :key="counter"
      :currentSection="currentSection"
      :answers="answers"
      :isSiteSurveyPreviewMode="isSiteSurveyPreviewMode"
    />
    <div class="submit-cont" v-if="currentSectionIndex === allSectionsLength - 1 ">
      <el-button class="submit-button" type="primary" :loading="isLoading" @click="submitForm()">Submit</el-button>
    </div>
</template>


<script>
import API from "@/services/api";
import SiteSurveyNavbar from "./siteSurveyNavbar.vue";
import googleMapSection from "./googleMapSection.vue";
import individualPageForSection from "./individualPageForSection.vue";
import { ElMessage } from 'element-plus';
import utils from '@/pages/siteSurvey/utils';
import { v4 as uuidv4 } from "uuid";
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";
import fieldTypes from "./data/fieldTypes"
import { mapState, mapActions } from "pinia";
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore"

export default {
  name: "allSectionsComponent",
  components: {
    SiteSurveyNavbar,
    googleMapSection,
    individualPageForSection,
  },
  props:{
    isSiteSurveyPreviewMode :{
      type: Boolean,
      required: false,
      default: false,
    }
  },
  created() {},
  data() {
    return {
      currentIndex: null,
      previousIndex: null,
      allSectionsGuideData: [],
      driverObj: null,
      allSectionsGuideArr: [],
      allSectionsLength: 0,
      currentSection: {},
      currentSectionIndex: 0,
      showGoogleMapSection: false,
      showIndivudualPageSection: false,
      allSections: [],
      answers: [],
      referenceID: this.$route.params.referenceID,
      defaultAnswerJson: [
        {
          question: 1,
          question_type: "text",
          //   site_survey: 121694748331,
          answer: {
            text: "",
            options: [],
            corners: {
              map_image: [],
              zoom: "",
              center: {},
              coordinates: [],
            },
            files: [],
          },
        },
      ],
      overallMappingOfQidToAnsJson: {},
      isAnswersFetched: false,
      counter: 0,
      isLoading: false,
      templateID: this.$route.params.templateID,
    };
  },
  mounted() {
    // console.log('isSiteSurveyPreviewMode: ', this.isSiteSurveyPreviewMode);
    if(!this.isSiteSurveyPreviewMode)
      this.isSiteSurveyNonEditable();
    this.getQuestions();
    let tempObj = JSON.parse(localStorage.getItem('currentSectionIndex'))
    tempObj ? this.setSectionCheckpoint(tempObj[`${this.$route.params?.referenceID}`] || 0) : this.setSectionCheckpoint(0)
  },
  computed:{
    ...mapState(useEditableSiteSurveyStore, {
      sectionCheckpointIndex: state => state.sectionCheckpointIndex,
      isGuideEnabled: state => state.isGuideEnabled,
    })
  },
  methods:{
    ...mapActions(useEditableSiteSurveyStore, {
      setSectionCheckpoint: 'CHANGE_GUIDE_CHECKPOINT',
      changeCurrentIndex: "CHANGE_SECTION_INDEX",
      changePoiGuideStatus: 'CHANGE_POI_GUIDE_STATUS',
      enableGuide: 'ENABLE_GUIDE',
    }),
    reorderSectionsAndFields(sections) {
      // Reorder sections based on sequence key
      sections.sort((a, b) => a.sequence - b.sequence);

      // Loop through each section and reorder fields
      for (const section of sections) {
        if (section.fields) {
          // Reorder fields based on sequence key
          section.fields.sort((a, b) => a.sequence - b.sequence);
        }
      }
      let modifiedData = this.generateGuideData(sections)
      return modifiedData;
    },
    generateGuideData(data){
      let comparisonArr = [];
      data.forEach((element, index) => {
        let tempArr = [];
        data[index] = {...element, fields: element.fields.map(field => {
          if (!comparisonArr.length || !comparisonArr.find(e => e == field.question_type)){
            let newId = `guide-${uuidv4()}`
            comparisonArr.push(field.question_type)
            tempArr.push({element: `#${newId}`, popover: {title: this.getGuideDescription(field.question_type)}, questionType: field.question_type})
            return {...field, guideId: newId}
          }
          return field
        })}
        this.allSectionsGuideArr.push(tempArr)
      })
      this.allSectionsGuideData = data
      let poiIndex = null;
      this.allSectionsGuideData.forEach((element, index) => {
          if (element.fields.find(e => e.question_type == 'poi')){
              if (!poiIndex) poiIndex = index;
          }
      })
      this.changePoiGuideStatus(!(poiIndex > this.sectionCheckpointIndex))
      return data
    },
    getGuideDescription(str){
      return (fieldTypes?.find(e => e.fieldType == str)).description || ''
    },
    async isSiteSurveyNonEditable(){
      try {
        let response = await API.EDITABLE_SITE_SURVEY_API.FETCH_SITE_SURVEY(this.referenceID);
        utils.isCompletedTrue(response);
        let isGuideRequired = response?.data?.is_completed ? false : response?.data?.user_guide_required
        this.enableGuide(isGuideRequired)
      } catch (err) {
        console.error(err)
      }
    },
    async submitForm() {
      const finalAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
      const isValid = this.validateAnswers(finalAnswers);
      if(isValid) {
        this.isLoading = true;
        try{
        const referenceID = this.$route.params.referenceID;
        let patchData = {
          "is_completed": true,
        }
        let response = await API.EDITABLE_SITE_SURVEY_API.SUBMIT_SITE_SURVEY(this.referenceID, patchData );
        window.parent.postMessage('SubmitButtonClicked','*');
        this.$router.push({ name: 'formSubmission', params: { id: referenceID } });
      }
      catch(e){
        ElMessage({
            message: 'Failed to submit the form!',
            type: 'error',
        })
      }
      this.isLoading = false;
      }
      else {
        ElMessage({
          message: 'Please fill in all the required fields.',
          type: 'error',
        })
      }
    },
    async fetchAnswers() {
        let response;
        try{
            if(!this.isSiteSurveyPreviewMode)
              response = await API.EDITABLE_SITE_SURVEY_API.FETCH_ANSWERS(
                  this.referenceID || 161694763195
              );
        } 
        catch(e){
            console.error(e);
            ElMessage({
                message: 'Failed to fetch Answers!',
                type: 'error',
            })
        }  
      this.answers = this.isSiteSurveyPreviewMode? [] : response.data;
      this.mapQidWithAnswerJson(this.allSections);
      this.updateAnsJsonWithAnswers(this.answers);
      this.isAnswersFetched = true;
    },
    async getQuestions() {
      try {
        const response = await API.EDITABLE_SITE_SURVEY_API.FETCH_QUESTIONS(this.templateID);
        this.allSections = this.reorderSectionsAndFields(response.data.sections);
        // this.allSections = this.reorderSectionsAndFields(sectionsArray);
        // ... rest of the method ...
        // this.allSections = response.data.sections;
        this.allSectionsLength = this.allSections.length;
        const siteToken = this.$route.params.referenceID;
        const currentSectionObject = JSON.parse(localStorage.getItem("currentSectionIndex"));
        let storedIndex;
        if(!currentSectionObject)
          storedIndex = 0;
        else 
          storedIndex = currentSectionObject[siteToken];
        if(storedIndex) {
          this.currentSectionIndex = parseInt(storedIndex);
        }
        if(this.allSections.length > 0) {
          this.currentSection =this.allSections[this.currentSectionIndex];
          // console.log('currentSection: ', this.currentSection, this.currentSectionIndex, storedIndex);
        }
        if(this.currentSection.fields[0]?.question_type == 'boundary') {
          this.showGoogleMapSection = true;
          this.showIndivudualPageSection = false;
        } else {
          this.showIndivudualPageSection = true;
          this.showGoogleMapSection = false;
        }
        this.fetchAnswers();
      }
      catch(e) {
        console.error(e);
        ElMessage({
            message: 'Failed to fetch Questions!',
            type: 'error',
        })
      }
    },
    isSubOptionsEmpty(question, { answer }){
      // Checking if the selected option leads to sub options
      // if True, proceed to check if the value of sub options is empty
      let subOption = question.options.find(e => e.option_text == answer.options[0]?.value)
      if (subOption?.sub_options?.length) return !answer.options[0]?.sub_options[0]?.value
      return false
    },
    validateAnswers(finalAnswers) {
      // Get the current section based on the currentSectionIndex
      const currentSection = this.allSections[this.currentSectionIndex];
      for (const question of currentSection.fields) {
        if (question.is_required && !this.isAnswerFilled(finalAnswers, question) && question.question_type!='boundary') {
          return false; // Return false if a required field is not filled
        }
        if (this.isSubOptionsEmpty(question, finalAnswers[question.id])) return false; // return false if a sub option field is selected and left empty
        
        // commented OTP email and phone behaviour
        // if(question.question_type === 'phone_number' || question.question_type === 'email'){
        //   // console.log("answers", finalAnswers);
        //   let phoneOrEmailAnswer = {...finalAnswers[question.id]};
        //   let isVerified = phoneOrEmailAnswer.answer.additional_info.is_verified;
          
        //   if(!('is_verified' in phoneOrEmailAnswer.answer.additional_info) || (isVerified  == false)){
        //       if(question.question_type === 'phone_number' && phoneOrEmailAnswer.answer.phone_number ){
        //           this.$message({
        //                       showClose: true,
        //                       message: "Please verify Mobile number before proceeding",
        //                       type: "error",
        //                       center: true
        //                   });
        //           return false;
        //       }
              
        //       else if(question.question_type === 'email' && phoneOrEmailAnswer.answer.email){
        //           this.$message({
        //                       showClose: true,
        //                       message: "Please verify Email ID before proceeding",
        //                       type: "error",
        //                       center: true
        //                   });
        //           return false;
        //       }
        //   }
        // }

        
      }
      return true;
    },
    isAnswerFilled(finalAnswers, question) {
      const questionId = question.id;
      const answer =finalAnswers[questionId];

      // Check if the answer is filled based on the question type
      switch (question.question_type) {
        case 'short_answer':
        case 'long_answer':
        case 'date':
        case 'time':
        case 'number':
        case 'paragraph':
          return answer && answer.answer.text.trim() !== '';

        case 'dropdown':
        case 'radio':
        case 'checkbox':
        case 'multiple_choice':
        case 'single_choice':
            return answer && answer.answer.options != '';

        case 'file_upload':
          return answer && answer.answer.files.length > 0;
        case 'poi':
            return answer && Object.keys(answer.answer.corners.coordinates).length;  
        case 'phone_number':
            return answer.answer.phone_number;
            // && answer.answer.additional_info?.is_verified;
        case 'email':
            return answer.answer.email;
            // && answer.answer.additional_info?.is_verified;
        default:
          return true; // Default to true if question type is unknown
    }
  },
    async handleNextClick() {
        await this.fetchAnswers();
        const finalAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
        // const isValid = this.validateAnswers(finalAnswers);
        const isValid = this.isSiteSurveyPreviewMode ? true : this.validateAnswers(finalAnswers);
        if(isValid) {
          if (this.currentSectionIndex < this.allSections.length - 1) {
            this.currentSectionIndex++;
            this.updateCurrentSection();
            this.counter++;
          }
        }
        else {
          ElMessage({
            message: 'Please fill in all the required fields.',
            type: 'error',
          })
        }
    },
    handleBackClick() {
      if (this.currentSectionIndex > 0) {
        this.currentSectionIndex--;
        this.updateCurrentSection();
        this.counter++;
      }
    },
    updateCurrentSection() {
      let siteToken = this.$route.params.referenceID;
      let currentSectionObject = {};
      currentSectionObject[siteToken] = this.currentSectionIndex;
      localStorage.setItem('currentSectionIndex',JSON.stringify(currentSectionObject));
      //localStorage.setItem("currentSectionIndex", this.currentSectionIndex);
      this.currentSection = this.allSections[this.currentSectionIndex];
      if (this.currentSection.fields[0]?.question_type == "boundary") {
        this.showGoogleMapSection = true;
        this.showIndivudualPageSection = false;
      } else {
        this.showIndivudualPageSection = true;
        this.showGoogleMapSection = false;
      }
    },
    mapQidWithAnswerJson(allSections) {
      allSections.forEach((section) => {
        section.fields.forEach((fields) => {
          this.overallMappingOfQidToAnsJson[fields.id] = {
            question: fields.id,
            question_type: fields?.question_type,
            site_survey: this.$route.params.referenceID,
            answer: {
              additional_info:{},
              text: "",
              options: [],
              sub_options:{
                question_type:'',
                value:'',
              },
              corners: {
                address:"",
                map_image: (fields?.question_type === 'poi' || fields?.question_type === 'boundary')? '':[],
                zoom: "",
                center:(fields?.question_type === 'poi' || fields?.question_type === 'boundary')?'': {},
                coordinates: (fields?.question_type === 'poi' || fields?.question_type === 'boundary')? {}:[],
              },
              files: [],
              deleted_files: [],
            },
          };
        });

      });
    },
    updateAnsJsonWithAnswers(answers) {
      answers.forEach((answer) => {
        const questionId = answer.question;
        if (this.overallMappingOfQidToAnsJson.hasOwnProperty(questionId)) {
          this.overallMappingOfQidToAnsJson[questionId].answer = {
            answerId:answer.id,
            text: answer.answer.text,
            options: answer.answer.options,
            sub_options: JSON.parse(JSON.stringify(answer.answer.sub_options || {})),
            corners: JSON.parse(JSON.stringify(answer.answer.corners)),
            files: answer.answer.files,
            additional_info : answer?.answer?.additional_info ? JSON.parse(JSON.stringify(answer?.answer?.additional_info)): {},
            deleted_files: []
          };
          if(answer.answer.email){
            this.overallMappingOfQidToAnsJson[questionId].answer.email = answer.answer.email;
          }
          if(answer.answer.phone_number){
            this.overallMappingOfQidToAnsJson[questionId].answer.phone_number = answer.answer.phone_number;
          }
        }
        // A temporary condition for bpundary type question to get desired structure. needs fix from backend
        if (
          ["boundary","poi"].includes(this.overallMappingOfQidToAnsJson[questionId]?.question_type) 
        ) {
          this.overallMappingOfQidToAnsJson[
            questionId
          ].answer.corners.coordinates = this.convertCoordinateArrayToJson(
            this.overallMappingOfQidToAnsJson[questionId].answer.corners
              .coordinates
          );
        }
      });
      localStorage.setItem(
        "overallMappingOfQidToAnsJson",
        JSON.stringify(this.overallMappingOfQidToAnsJson)
      );
    },
    convertCoordinateArrayToJson(coordinatesInfo) {
      if (Array.isArray(coordinatesInfo)) {
        let Obj = {};
        coordinatesInfo.forEach((coordinateObj) => {
          let displayName = coordinateObj.display_name;
          if(coordinateObj?.coordinates){
            Obj[displayName] = {
            name: coordinateObj.title,
            title: coordinateObj.title,
            zoom: coordinateObj.zoom,
            files: coordinateObj.files || [],
            map_image:  coordinateObj.map_image,
            description: coordinateObj.description,
            display_name: coordinateObj.display_name,
            id: coordinateObj.id,
            coordinates:coordinateObj?.coordinates||[],
            center:coordinateObj?.center||{},
            length:coordinateObj?.length||0
          };
          }else{
            Obj[displayName] = {
            lat: Number(coordinateObj.latitude),
            lng: Number(coordinateObj.longitude),
            name: coordinateObj.title,
            title: coordinateObj.title,
            zoom: coordinateObj.zoom,
            files: coordinateObj.files || [],
            map_image:  coordinateObj.map_image,
            description: coordinateObj.description,
            display_name: coordinateObj.display_name,
            id: coordinateObj.id,
          };
          }
        
        });
        return Obj;
      }
      return coordinatesInfo;
    },
  },
  watch: {
    isGuideEnabled: {
      handler(val){
        if(!val) this.driverObj?.destroy()
      }
    },
    currentSectionIndex: {
      immediate: true,
      handler(val, oldVal){
        console.log(val, oldVal, 'here')
        this.currentIndex = val
        this.previousIndex = oldVal
        if (val == 0 && oldVal == undefined) return
        this.changeCurrentIndex(val)
        if (this.driverObj) this.driverObj?.destroy()
        if (val < oldVal) return
        this.setSectionCheckpoint(val)
        if (!this.isGuideEnabled) return
        if (this.allSectionsGuideArr[val]){
          if (this.allSectionsGuideArr[val][0]?.questionType == 'boundary') return
        }
        console.log('we rannnn how?', val, oldVal)
          this.driverObj = driver({
            // showProgress: true,
            showButtons: ['done', 'next'],
            nextBtnText: 'Skip',
            allowInteractions: false,
            allowClose: false,
            popoverClass: `helper-guide-popover`,
            steps: this.allSectionsGuideArr[val]
          })
            setTimeout(() => {
                this.driverObj?.drive()
            }, 1000)
      }
    },
    allSectionsGuideArr: {
      deep: true,
      handler(val){
        if (!this.isGuideEnabled || val[0][0].questionType == 'boundary') return
        if (this.currentIndex == 0 && this.previousIndex == undefined) {
        console.log('we ran 1', this.currentIndex, this.previousIndex, val[0][0])
          this.driverObj = driver({
              // showProgress: true,
              showButtons: ['done', 'next'],
              nextBtnText: 'Skip',
              allowInteractions: false,
              allowClose: false,
              popoverClass: `helper-guide-popover`,
              steps: this.allSectionsGuideArr[0]
            })
            setTimeout(() => {
              this.driverObj?.drive()
            }, 1000)
        }
        // Guide tour for the first page
          this.driverObj = driver({
            // showProgress: true,
            showButtons: ['done', 'next'],
            nextBtnText: 'Skip',
            allowInteractions: false,
            allowClose: false,
            popoverClass: `helper-guide-popover`,
            steps: val[0]
          })
          if (val[0].questionType){
            setTimeout(() => {
                if (val[0].questionType == 'boundary') return
                console.log('allSec allSectionsGuideArr ran here')
                this.driverObj?.drive()
              }, 1000)
          }
      }
    }
  }
};
</script>


<style scoped>
.submit-cont{
  display: none;
}

.loader{
    height: 70vh;
}

.disable-pointer-events{
  pointer-events: none;
}


@media screen and (max-width: 900px) {

  .submit-cont {
    display: flex;
    position: fixed;
    bottom: 0px;
    width: 100%;
    z-index: 2;
  }

  .submit-button {
    border-radius: 0px;
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    height: 48px;
  }

}
</style>