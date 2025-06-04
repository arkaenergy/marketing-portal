import Stage from '../App';

function loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData = {}) {
    const stage = new Stage();
    stage.loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData);
    stage.main();
    return stage;
}

function destroyStudio() {
    store.dispatch('studio/RESET_STATE');
}

export { loadStage, destroyStudio };
