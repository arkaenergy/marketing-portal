<template>
    <div class="parentCont">
    <div class="container">
      <img v-if="isSuccessfulMode" v-bind:src="allIcon.get('checkCircleFill')" class="successIcon" />
      <img v-else src="../assets/caution.svg" class="cautionIcon" />
      <h3 v-if="isSuccessfulMode" class="heading">Submitted Successfully.</h3>
      <p class="content">
        {{message}}
      </p>
      <!-- <el-button type="primary" class="closeBtn" @click="closeWindow()">Exit</el-button> -->
    </div>
  </div>
  </template>
  
  <script>
  import API from "@/services/api";
  import utils from '@/pages/siteSurvey/utils'
  export default {
    data() {
      return {
        allIcon: utils.images,
        referenceID: this.$route.params.referenceID,
        templateType:'',
      };
    },
    mounted(){
        this.fetchLatestReferenceIDStatus();
    },
    computed:{
      message(){
        if(this.$route.name=='formSubmission'){
          if(this.templateType!='self_service')
            return "We have received your Site Survey form. Please click on 'Save and next' to move towards uploading project documents and making the payment."
          else
            return "We have received your response."

        }
        else if(this.$route.name=='editNotAllowed'){
          return "Contact your administrator to allow form submission!"
        }
      },
      isSuccessfulMode(){
        if(this.$route.name=='formSubmission'){
          return true;
        }
        else
        return false;
      }
      
    },
    methods: {
      async fetchLatestReferenceIDStatus(){
        let response = await API.EDITABLE_SITE_SURVEY_API.FETCH_SITE_SURVEY(this.referenceID);
        let isEditable = response.data.is_editable;
        let isCompleted = response.data.is_completed;
        let token = response.data.token;
        let templateID = response.data.template
        this.templateType = response.data.template_info.type
        if(isEditable && this.$route.name=='editNotAllowed'){
          this.$router.push({ name: 'siteSurvey', params: { referenceID: token, templateID } });
        }
      }
    },
  };
  </script>
  
  <style scoped>

  .parentCont {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e8edf2;
  }
  
  .container {
    height: 312px;
    width: 496px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    background-color: #fff;
  }
  
  .successIcon {
    margin-bottom: 24px;
  }
  .cautionIcon{
    margin-bottom: 24px;
    height: 100px;
  }
  .heading {
    color: #19c114;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .content {
    color: #222;
    font-size: 16px;
    line-height: 1.57;
    margin-bottom: 24px;
    max-width: 356px;
  }
  
  .closeBtn {
    font-size: 15px;
    font-weight: 600;
    width: 120px;
    height: 41px;
  }
  
  @media (max-width: 1100px) {
  
    .container {
      height: 100vh;
      width: 100vw;
      border-radius: 0px;
    }
  
    .heading {
    font-size: 14px;
  }
  
  .content {
    font-size: 14px;
    max-width: 312px;
  }
  
  }
  
  </style>
  