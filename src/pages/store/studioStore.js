import {defineStore} from 'pinia'
import { FLOOR_STATE } from '../studio/constants'

export const useStudioStore = defineStore('studioStore', {
    state : () => ({
        currentAppState: FLOOR_STATE,
        basePolygonDrawn: false,
        atleast3PointsDrawn: false,
        obstructionPlacedInScene: false,
        undoEnabled : false,
        zoomValue : 3,
    }),
})