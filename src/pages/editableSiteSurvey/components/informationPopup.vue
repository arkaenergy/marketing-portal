<template>
    <div class="card-cont">
        <div class="info-section">
            <!-- <img src="../assets/dropdown-arrow-down.png" alt="" :class="['toggle', toggle ? '' : 'toggleInvert']"  @click="toggleFunc()"  /> -->
            <img src="../assets/dropdown-arrow-down.png" class="toggle" @click="toggleFunc()" :class="['toggle', toggle ? '' : 'toggleInvert']" />
            <p style="font-weight: 600;">{{currentSection.title}}</p>
            <p class="description">{{ currentSection.description }}</p>
        </div>
    </div>
</template>

<script>

export default ({
    name: "informationPopup",
    components: {
    
    },
    props: {
        currentSection: {
            type: Object
        },
    },
    data() {
        return {
            toggle: true,
        }

    },
    mounted() {
        
    },
    methods: {
        toggleFunc() {
            this.toggle = !this.toggle;
            this.$emit('toggleClicked')
        },
    }
})
</script>

<style scoped>
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
.info-section{
    padding: 8px 0px 30px 19px;
    display: flex;
    /* width: 50%; */
    gap: 10px;
    white-space: break-spaces;
    flex-direction: column;
}

.card-cont{
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
    z-index: 1212;
    max-height: 330px;
    overflow-y: scroll;
    transition: all 2s ease;
}
</style>
