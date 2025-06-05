import { createApp } from 'vue';
import './style.css'
import App from './App.vue'
import router from './router'
import  VueGoogleMaps from '@fawmi/vue-google-maps'
import { ElMessage } from 'element-plus'
import { ElLoading } from 'element-plus'
import { GOOGLE_API_KEY } from "@/services/api/index.js";
import { createPinia } from 'pinia';
import { CAMERA_TYPE_2D } from './core/utilities/constants';
import VueTelInput from 'vue-tel-input';
import './../node_modules/vue-tel-input/dist/vue-tel-input.css';
// import ToastPlugin from 'vue-toast-notification';
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
// import 'vue-toast-notification/dist/theme-bootstrap.css';


export default class Main {
    constructor() {
        this.app = createApp(App);
        this.app.use(router);
        this.app.use(ElLoading);
        this.app.use(ElMessage);
        this.app.use(createPinia());
        this.app.use(VueTelInput);
        // this.app.use(ToastPlugin);
        this.app.use(VueGoogleMaps, {
            load: {
                key: GOOGLE_API_KEY,
                libraries: 'places', 
            },
        }).mount('#app');

    }
    main(){
        console.log('Hey');
    }
}

export const main = new Main();


