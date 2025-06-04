<template>
    <div class="navbar">
        <button class="prevCont" @click="backBtnFunc()" v-if="currentSection > 0">
            <img src="../assets/previous.svg" class="prevIcon" />
            <p class="previous">Back</p>
        </button>
        <div class="stepsCont" v-else>
            <!-- Used an empty placeholder to maintain the layout -->
        </div>
        <p class="steps">{{ sectionCount }}</p>
        <div class="lastBtnContainer">
            <button class="nextCont" @click="nextBtnFunc()" v-if="!isFinalPage">
                <p class="next">Next</p>
                <img class="nextIcon" src="../assets/next.svg"/>
            </button>
            <el-button class="submit-button" type="primary" :disabled="isSiteSurveyPreviewMode" :loading="isLoading" @click="submitForm()" v-else>Submit</el-button>
        </div>
    </div>
</template>


<script>
import API from '@/services/api';
import { useEditableSiteSurveyStore } from "../../store/editableSiteSurveyStore";
import { mapState, mapActions } from 'pinia';


export default {
    // name: "toolbarForBoundary",
    props: {
        allSectionsLength: {
            type: Number
        },
        currentSection: {
            type: Number
        },
        allSections: {
            type: Object
        },
        isSiteSurveyPreviewMode :{
            type: Boolean,
            required: false,
            default: false,
        },
    },
    components: {

    },
    created() {

    },
    data() {
        return {
            isLoading: false,
            referenceID: this.$route.params.referenceID,
            overallMappingOfQidToAnsJson: {},

            // siteSurveyStore: useEditableSiteSurveyStore(),
        }
    },
    mounted() {

    },
    computed: {
        isFinalPage() {
            return this.currentSection === this.allSectionsLength - 1;
        },
        ...mapState(useEditableSiteSurveyStore, {
            isFileUploadInProgress: "IS_FILE_UPLOAD_IN_PROGRESS"
        }),
        sectionCount() {
            const currentSectionIndex = this.currentSection + 1;
            return `${currentSectionIndex}/${this.allSectionsLength}`;
        },
    },
    methods: {
        async submitForm() {
            await this.fetchAnswers();
            const finalAnswers = JSON.parse(localStorage.getItem("overallMappingOfQidToAnsJson")) || {};
            console.log('finalAnswers: ', finalAnswers);
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
            // this.isAnswersFetched = true;
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
        validateAnswers(finalAnswers) {
            // Get the current section based on the currentSectionIndex
            const currentSection = this.allSections[this.currentSection];
            for (const question of currentSection.fields) {
                if (question.is_required && !this.isAnswerFilled(finalAnswers, question) && question.question_type!='boundary') {
                return false; // Return false if a required field is not filled
                }
                if(question.question_type === 'phone_number' || question.question_type === 'email'){
                    // console.log("answers", finalAnswers);
                    let phoneOrEmailAnswer = {...finalAnswers[question.id]};
                    let isVerified = phoneOrEmailAnswer.answer.additional_info.is_verified;
                    // if((isVerified  == false )){
                    //     console.log("hello");
                    // }
                    // console.log("phoneOrEmailAnswer", phoneOrEmailAnswer, phoneOrEmailAnswer.answer.additional_info.is_verified);
                    // console.log( !('is_verified' in phoneOrEmailAnswer.answer.additional_info) || !phoneOrEmailAnswer.additional_info?.is_verified);
                    // console.log("!('is_verified' in phoneOrEmailAnswer.answer.additional_info)", !('is_verified' in phoneOrEmailAnswer.answer.additional_info));
                    // console.log("phoneOrEmailAnswer.additional_info?.is_verified === false",phoneOrEmailAnswer.additional_info?.is_verified);
                    if(!('is_verified' in phoneOrEmailAnswer.answer.additional_info) || (isVerified  == false)){
                    // if(!isVerified){
                        if(question.question_type === 'phone_number' && phoneOrEmailAnswer.answer.phone_number ){
                            this.$message({
                                        showClose: true,
                                        message: "Please verify Mobile number before proceeding",
                                        type: "error",
                                        center: true
                                    });
                            return false;
                        }
                        
                        else if(question.question_type === 'email' && phoneOrEmailAnswer.answer.email){
                            this.$message({
                                        showClose: true,
                                        message: "Please verify Email ID before proceeding",
                                        type: "error",
                                        center: true
                                    });
                            return false;
                        }
                    }
                }
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
                    //&& answer.answer.additional_info?.is_verified;
                case 'email':
                    return answer.answer.email; 
                    //&& answer.answer.additional_info?.is_verified;
                default:
                return true; // Default to true if question type is unknown
            }
        },
        nextBtnFunc() {
            // if (this.currentSection === this.allSectionsLength - 1) {
            //     const referenceID = this.$route.params.referenceID;
            //     this.$router.push({ name: 'formSubmission', params: { id: referenceID } });
            // } else {
            console.log(this.allSections[this.currentSection], this.finalAnswers);
            if(this.isFileUploadInProgress){
                ElMessage({
                    message: 'Please wait while the file is being uploaded!',
                    type: 'warning',
                })
                return;
            }
            if (this.currentSection === this.allSectionsLength - 1) {
                const referenceID = this.$route.params.referenceID;
                this.$router.push({ name: 'formSubmission', params: { id: referenceID } });
            } else {
                console.log("next clicked inside navbar");
                this.$emit('next-clicked');
            }
        },
        backBtnFunc() {
            if(this.isFileUploadInProgress){
                ElMessage({
                    message: 'Please wait while the file is being uploaded!',
                    type: 'warning',
                })
                return;
            }
            this.$emit('back-clicked');
        },
    },


}
</script>



<style scoped>
.navbar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    padding: 8px 24px;
    height: 56px;
    border: 1px solid #ccc;
}

.stepsCont {
    width: 98px;
    background-color: #E8EDF2;
    border-radius: 50px;
}

.steps {
    font-size: 24px;
    color: #222;
    display: grid;
    place-items: center;
    height: 36px;
}

.prevCont,
.nextCont,
.lastBtnContainer {
    display: flex;
    align-items: center;
    gap: 8px;
}

.prevCont,
.nextCont {
    width: 120px;
    height: 40px;
    border-radius: 20px;
    border: 1px solid #222;
    display: flex;
    justify-content: center;
    background-color: #fff;
}

.prevCont .previous,
.nextCont .next {
    font-size: 16px;
    color: #222;
}


.prevCont:disabled .previous,
.nextCont:disabled .next {
    font-size: 16px;
    color: #777;
}

.nextCont {
    padding: 0px 32px;
}

.nextCont:disabled,
.prevCont:disabled {
    cursor: not-allowed;
    border: 1px solid #777;
}


.backArrowIcon,
.back,
.prevCont,
.nextCont {
    cursor: pointer;
}

.submit-button {
    height: 40px;
    width: 100px;
    font-size: 16px;
    font-weight: 600;
}

@media screen and (max-width: 1500px) {

    .navbar {
        gap: 24px;
    }

    .backBtnCont {
        min-width: 108px;
        margin-right: 0%;
    }

    .prevCont {
        margin-right: 0%;
    }

}

@media screen and (max-width: 1100px) {
    .navbar {
        padding: 16px;
        gap: 16px;
    }

    .addobt {
        left: 53%;
    }

    .submitBtn {
        padding: 0px 16px;
        font-size: 14px;
    }

    .nextCont {
        padding: 0px 24px;
        font-size: 14px;
    }

    .prevCont {
        padding-left: 16px;
    }

    .previous,
    .next,
    .drawroof,
    .addobt,
    .addPanels {
        font-size: 14px;
    }

    .previous,
    .next {
        display: none;
    }

    #navBarSaleStudio>>>.el-step__icon {
        width: 24px;
        height: 24px;
        font-size: 14px;
    }

    .nextCont,
    .prevCont {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 4px;
        padding: 0px;
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
    }
}

@media screen and (max-width: 900px) {
    .submit-button {
        display: none;
    }
}
</style>