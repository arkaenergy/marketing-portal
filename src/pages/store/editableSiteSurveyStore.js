import {defineStore} from 'pinia'

export const useEditableSiteSurveyStore = defineStore('editableSiteSurveyStore', {
    state : () => ({
        googleMapSectionNo: 1,
        showSearchLocationInput: true,
        showToolbarButtons: false,
        showToolbar: false,
        showPathToolbar:false,
        showInfoCard: false,
        showDropdown: false,
        isBoundaryCompleted:false,
        isAllowedToDrawBoundary:false,
        isAllowedToDrawPath: false,
        undoCounter:0,
        undoArrayLength:0,
        redoCounter:0,
        redoArrayLength:0,
        redoPathCounter:0,
        redoPathArrayLength:0,
        undoPathCounter:0,
        undoPathArrayLength:0,
        markersChangedCounter:0,
        deleteCoordinatesCounter:0,
        poiUpdatedCounter:0,
        boundaryCompletedCounter:0,
        totalMarkers:0,
        isFileUploadInProgress: false,
        pathDistance:0,
        pathActiveIndex:null,
        deleteActivePath:false,
        deletePathCounter:0,
        pathEditMode:false,
        deletedPathCounter:0,
        undoArrayTemp: null,
        redoArrayTemp: null,
        currentGoogleMapId: null,
        currentGoogleMapGuideStep: 0,
        sectionCheckpointIndex: null,
        currentSectionIndex: 0,
        isPoiGuideDisabled: false,
        isGuideEnabled: true,
        fileFormats: [
            {label:'.jpg', type: 'image'}, {label:'.jpeg', type: 'image'}, {label:'.png', type: 'image'}, {label:'.gif', type: 'image'},
            {label:'.mp4', type: 'video'}, {label:'.mov', type: 'video'},
            {label:'.doc', type: 'document'}, {label:'.pdf', type: 'document'}, {label:'.dwg', type: 'document'}, {label:'.xlsx', type: 'document'},
        ]
    }),
    getters: {
        GET_COMPLETE_STATE: state => state,
        IS_BOUNDARY_COMPLETED: state=> state.isBoundaryCompleted,
        UNDO_COUNTER: state=> state.undoCounter,
        REDO_COUNTER: state=>state.redoCounter,
        UNDO_PATH_COUNTER: state=> state.undoPathCounter,
        REDO_PATH_COUNTER: state=>state.redoPathCounter,
        MARKERS_CHANGED_COUNTER: state => state.markersChangedCounter,
        DELETE_COORDINATES_COUNTER: state => state.deleteCoordinatesCounter,
        POI_UPDATED_COUNTER: state=> state.poiUpdatedCounter,
        BOUNDARY_COMPLETED_COUNTER: state=> state.boundaryCompletedCounter,
        GET_TOTAL_MARKERS: state => state.totalMarkers,
        GET_UNDO_LENGTH: state=> state.undoArrayLength,
        GET_REDO_LENGTH: state=> state.redoArrayLength,
        GET_UNDO_PATH_LENGTH: state=> state.undoPathArrayLength,
        GET_REDO_PATH_LENGTH: state=> state.redoPathArrayLength,
        IS_FILE_UPLOAD_IN_PROGRESS: state=> state.isFileUploadInProgress,
        PATH_DISTANCE: state=> state.pathDistance,
        PATH_INDEX:state=>state.pathActiveIndex,
        PATH_DELETE:state=>state.deleteActivePath,
        DELETE_PATH_COUNTER:state=>state.deletePathCounter,
        ALLOW_PATH_DRAW:state=>state.isAllowedToDrawPath,
        PATH_EDITABLE:state=>state.pathEditMode,
        SHOW_PATH_TOOLBAR:state=>state.showPathToolbar,
        DELETED_PATH_COUNTER:state=>state.deletedPathCounter,
        GET_FILE_FORMATS: state => state.fileFormats,
    },
    actions: {
        ENABLE_GUIDE(bool){
            this.isGuideEnabled = bool
        },
        CHANGE_SECTION_INDEX(num){
            this.currentSectionIndex = num
        },
        CHANGE_UNDO_TEMP(arr){
            this.undoArrayTemp = arr
        },
        CHANGE_REDO_TEMP(arr){
            this.redoArrayTemp = arr
        },
        SHOW_SEARCH_BAR(){
            this.showToolbarButtons = false;
            this.googleMapSectionNo = 1;
            this.showSearchLocationInput = true;
            this.showToolbar = false;
            this.showInfoCard = false;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= false;
        },
        SHOW_TOOLBAR_BUTTONS(){
            this.showToolbarButtons = true;
            this.googleMapSectionNo = 2;
            this.showSearchLocationInput = false;
            this.showToolbar = false;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= false;
        },
        SHOW_TOOLBAR(){
            this.showToolbar = true;
            this.showToolbarButtons = false;
            this.googleMapSectionNo = 3;
            this.showSearchLocationInput = false;
            this.isAllowedToDrawBoundary = true;
            this.isAllowedToDrawPath= false;
            this.showDropdown = false;
            // Now I am allowed to draw boundary, it means boundary should not be completed at this moment
            this.isBoundaryCompleted = false;
        },
        SHOW_PATH(){
           
            this.showPathToolbar = true;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= true;
            
        
        },
        SET_PATH_STATE(){
            this.showPathToolbar = false;
            this.isAllowedToDrawPath= false;
            this.isAllowedToDrawBoundary = false;
            this.pathActiveIndex=null;
            this.pathEditMode=false;
        
        },
        PATH_EDIT_MODE(){
            this.pathEditMode=false;
        },
        PATH_EDIT_MODE_TRUE(){
            this.pathEditMode=true;
        },
        CHANGE_GOOGLE_MAP_GUIDE_ID(id){
            this.currentGoogleMapId = id
        },
        CHANGE_GOOGLE_MAP_GUIDE_STEP(num){
            this.currentGoogleMapGuideStep = num
        },
        CHANGE_GUIDE_CHECKPOINT(num){
            this.sectionCheckpointIndex = num
        },
        CHANGE_POI_GUIDE_STATUS(bool){
            this.isPoiGuideDisabled = bool
        },

        COMPLETE_BOUNDARIES(isUndoOrRedoMode){
            if(this.isBoundaryCompleted && !isUndoOrRedoMode)  // It is because, in case of undo and redo, I need this to be executed, but not when just anytime complete icon is being clicked
                return;

            this.showInfoCard = true;
            this.isBoundaryCompleted = true;
            this.boundaryCompletedCounter++;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= false;
            this.showSearchLocationInput = false;
            this.showToolbarButtons = false;
            this.showToolbar = true;
            this.showDropdown = false;
            // once completed the boundary, then no more undo and redo allowed unless changed anything
        },
        COMPLETE_PATH(isUndoOrRedoMode){
            // if(this.isBoundaryCompleted && !isUndoOrRedoMode)  // It is because, in case of undo and redo, I need this to be executed, but not when just anytime complete icon is being clicked
            //     return;

            this.showInfoCard = true;
            this.isBoundaryCompleted = true;
            // this.boundaryCompletedCounter++;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= false;
            this.showSearchLocationInput = false;
            this.showToolbarButtons = false;
            this.showPathToolbar =  true;
            this.showDropdown = false;
            // once completed the boundary, then no more undo and redo allowed unless changed anything
        },

        SHOW_ALL_CORNERS_LIST(){
            this.showDropdown = true;
            this.showInfoCard = false;
            this.isBoundaryCompleted = true;
            this.boundaryCompletedCounter++;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= false;
            this.showSearchLocationInput = false;
            this.showToolbarButtons = false;
            this.showToolbar = true;
        },
        ALLOW_TO_DRAW_BOUNDARIES(){
            this.showInfoCard = false;
            this.isBoundaryCompleted = false;
            this.boundaryCompletedCounter++;
            this.isAllowedToDrawBoundary = true;
            this.isAllowedToDrawPath= false;
        },
        SHOW_INPUT_CARD(){
            this.showInfoCard = true;
            this.isBoundaryCompleted = true;
            this.boundaryCompletedCounter++;
        },
        UPDATE_UNDO_AND_REDO_LENGTH(undoLength,redoLength){
            this.undoArrayLength = undoLength;
            this.redoArrayLength = redoLength;
        },
        UPDATE_UNDO_AND_REDO_PATH_LENGTH(undoLength,redoLength){
            this.undoPathArrayLength = undoLength;
            this.redoPathArrayLength = redoLength;
        },
        UNDO(){
            if(this.undoArrayLength<=0)
                return;
            this.undoCounter++;
        },
        REDO(){
            if(this.redoArrayLength<=0)
                return;
                this.redoCounter++;
        },
        UNDOPATH(){
            if(this.undoPathArrayLength<=0)
            return;
       
            this.undoPathCounter++;
        },
        REDOPATH(){
            if(this.redoPathArrayLength<=0)
            return;
            this.redoPathCounter++;
        },
    
        CHANGE_MARKERS_COUNTER(){
            this.markersChangedCounter++;
        },
    
        DELETE_ALL_COORDINATES(){
                this.deleteCoordinatesCounter++;
                this.ALLOW_TO_DRAW_BOUNDARIES()
                this.showDropdown= false;
        },
        DELETE_ALL_PATH_COORDINATES(){
            this.showInfoCard = false;
            this.isBoundaryCompleted = false;
            // this.deletePathCounter++;
            this.isAllowedToDrawBoundary = false;
            this.isAllowedToDrawPath= true;
            this.showPathToolbar=true;
            this.deleteActivePath=true
        },
        PATH_COUNTER_TRIGGER(){
            this.deletePathCounter++;
        },
        DELETE_POI_COUNT(){
            this.deletedPathCounter++;
        },
        UPDATE_POI_COUNTER(){
            this.poiUpdatedCounter++;
        },
        UPDATE_MARKERS_COUNT(){
           this.totalMarkers =  JSON.parse(localStorage.getItem('markersAndCornersArray')).length;
        },
        FILE_UPLOAD_STARTED(){
            this.isFileUploadInProgress = true;
        },
        FILE_UPLOAD_COMPLETED(){
            this.isFileUploadInProgress = false;
        },
        CAPTURE_PATH_DISTANCE(distance){
            this.pathDistance=distance;
        },
        PATH_ACTIVE_INDEX(activeIndex){
            
            this.pathActiveIndex=activeIndex;
            this.pathEditMode=activeIndex?true:false;
            this.isAllowedToDrawPath= false;
            this.showPathToolbar=false;
        },
        NOT_PATH_DELETE(){
            this.deleteActivePath=false
        },
        ALLOW_DRAW_PATH(){
            this.isAllowedToDrawPath=true
        }
    }
})