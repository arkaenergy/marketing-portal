<template>
    <div class="parentContainerSolark">
        <div class="commonNavbar">
            <img src="../assets/img/Sol-Ark-Logo.png" class="navIcon" />
        </div>
        <systemConfig/>
    </div>
</template>

<script>

import systemConfig from "../components/systemConfig.vue";

export default {

    components: {
        systemConfig
    },

    data() {
        return {
           
        }
    },

    methods: {
        
    }
}

</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap');


.parentContainerSolark {}

.commonNavbar {
    height: 96px;
    padding: 16px 32px;
    border: 1px solid #707070;
    background-color: #fff;
}



p,
span,
div,
h1,
h2,
h3,
h4,
button,
a {
    font-family: 'Poppins';
}


</style>