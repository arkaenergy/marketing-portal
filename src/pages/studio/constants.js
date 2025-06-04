export const FLOOR_STATE = "floorState";
export const DRAWING_STATE = 'drawingState';
export const OBSTRUCTION_STATE = 'obstructionState';
export const PANEL_VIEW_STATE = 'panelViewState';
export const SAVINGS_STATE = 'savingsState';
export const REPORT_STATE = 'reportState';

export const MUMTY_OBSTRUCTION = "mumty";
export const ACUNIT_OBSTRUCTION = "acunit";
export const CHIMNEY_OBSTRUCTION = "chimney";
export const WATERTANK_OBSTRUCTION = "watertank";

export function defaultComponentsData(){
  return {floorValue: 0, savingsData: {billAmount:null, name: null, mobileNum: null, emailId: null, leadId: null, leadAlreadyExistsInDB: null}};
}