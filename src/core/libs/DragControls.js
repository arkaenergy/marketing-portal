import {
	EventDispatcher,
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
	Vector3
} from 'three';
import Obstruction from '../Objects/Obstruction';
import PolygonModel from '../Objects/PolygonModel';
import * as utils from '../utilities/utils';
import * as raycastingUtils from '../utilities/rayCastingUtils';
import { HEIGHT_PER_FLOOR } from '../utilities/constants';

var DragControls = function ( stage, _camera, _domElement ) {

	var _plane = new Plane();
	var _raycaster = new Raycaster();
	_raycaster.params.Line.threshold = 0.1;
	var _mouse = new Vector2();
	var _offset = new Vector3();
	var _intersection = new Vector3();
	var _worldPosition = new Vector3();
	var _inverseMatrix = new Matrix4();
	var _prevPosition = new Vector3();
	var _intersections = [];
	var _objects = utils.getAllObjectMeshes(_polygonEnabled);
	var _polygonEnabled = true;
	var dragStart = null;

	var _selected = null, _hovered = null;

	//

	var scope = this;
	var touchDownForSelection = false;
	var objectToBeSelected = null;
	var touchStartPosition = 0;
	var touchEndPosition = 0;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener('click', onClick, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener('click', onClick, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );

		_domElement.style.cursor = '';

	}
	function enablePolygon(){
		_polygonEnabled = true;
	}
	function disablePolygon(){
		_polygonEnabled = false;
	}

	function dispose() {

		deactivate();

	}

	function getObjects() {

		return _objects;

	}

	

	function onClick(event) {
		let objectMeshes = utils.getAllObjectMeshes(_polygonEnabled);
		const selectedObject = raycastingUtils.getTopObjectOnClick(event, stage, objectMeshes);
		if (selectedObject !== undefined && selectedObject !== null) {
			if (!selectedObject.isSelected) {
				stage.deselectOtherSelectedMeshes(selectedObject);
				selectedObject.onSelect();
				stage.currentSelectedObject = selectedObject;
			}
		}
		else {
			stage.ground.onSelect();
			stage.deselectOtherSelectedMeshes(stage.ground);
		}
	}

	function onDocumentMouseDown(event) {

		event.preventDefault();

		_intersections.length = 0;

		_raycaster.setFromCamera( _mouse, _camera );
		_objects = utils.getAllObjectMeshes(_polygonEnabled);
		_raycaster.intersectObjects( _objects, true, _intersections );
		
		if ( _intersections.length > 0 ) {
			
			
			_selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;
			dragStart = _selected.position.clone();
			_prevPosition = _selected.position.clone();
			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
			// if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

			// 	// _inverseMatrix.invert( _selected.parent.matrixWorld );
			// 	// _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			// }
			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );
		}
	}

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				let finalPos = _intersection.sub( _offset ).applyMatrix4( _inverseMatrix );
				let delta = finalPos.sub(dragStart);
				_selected.parent.container.moveObject( delta.x, delta.y );
				dragStart = _selected.position.clone();
				// this.dragStart
			}
			scope.dispatchEvent( { type: 'drag', object: _selected } );
			return;
		}

		_intersections.length = 0;
		_raycaster.setFromCamera( _mouse, _camera );
		_raycaster.intersectObjects( _objects, true, _intersections );
		if ( _intersections.length > 0 ) {
			var object = _intersections[ 0 ].object;
			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );
			if ( _hovered !== object ) {
				scope.dispatchEvent( { type: 'hoveron', object: object } );
				_domElement.style.cursor = 'pointer';
				_hovered = object;
			}
		} else {
			if ( _hovered !== null ) {
				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );
				_domElement.style.cursor = 'auto';
				_hovered = null;

			}
		}
	}

	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {
			let currentObjectSelected = _selected.parent.container;
			if (currentObjectSelected instanceof Obstruction){
				stage.storePositionOfLastChangedObject(currentObjectSelected, _prevPosition);
			}
			currentObjectSelected.placeObject();
			scope.dispatchEvent( { type: 'dragend', object: _selected } );
			// if(currentObjectSelected instanceof Obstruction){
			// 	if(stage.areOverlapping(currentObjectSelected)){
			// 		currentObjectSelected.updateHeight(stage.floorValue * HEIGHT_PER_FLOOR,stage.polygonModel);
			// 	}else{
			// 		currentObjectSelected.updateHeight(0,stage.ground);
			// 	}
			// }

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				let finalPos = _intersection.sub( _offset ).applyMatrix4( _inverseMatrix );
				let delta = finalPos.sub(dragStart);
				_selected.parent.container.moveObject( delta.x, delta.y );
				dragStart = _selected.position;

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

	}

	function toggleSelection (touchStartPosition, touchEndPosition, objectToBeSelected) {
		const isTap = Math.abs(touchStartPosition.clientX.toFixed(4)) === Math.abs(touchEndPosition.clientX.toFixed(4)) && Math.abs(touchStartPosition.clientY.toFixed(4)) === Math.abs(touchEndPosition.clientY.toFixed(4))
		if (isTap) {
			onTouchClick(objectToBeSelected);
		}
	}

	function onTouchClick(objectToBeSelected) {
		if (objectToBeSelected !== null && objectToBeSelected !== undefined) {
			stage.currentSelectedObject = objectToBeSelected;
			stage.deselectOtherSelectedMeshes(objectToBeSelected, _polygonEnabled);
			objectToBeSelected.onSelect();
		}
		else {
			stage.deselectOtherSelectedMeshes(stage.ground, _polygonEnabled);
		}
	}

	function onDocumentTouchStart( event ) {

		objectToBeSelected  = null;

		event.preventDefault();
		touchStartPosition = event.changedTouches[0];
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_intersections.length = 0;

		_raycaster.setFromCamera( _mouse, _camera );
		_objects = utils.getAllObjectMeshes(_polygonEnabled);
		 _raycaster.intersectObjects( _objects, true, _intersections );

		if ( _intersections.length > 0 ) {

			_selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;
			dragStart = _selected.position.clone();
			_prevPosition = _selected.position.clone();
			objectToBeSelected = _selected.parent.container;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
			stage.deselectOtherSelectedMeshes(objectToBeSelected, _polygonEnabled);
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				// _inverseMatrix.invert( _selected.parent.matrixWorld );
				// _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentTouchEnd( event ) {

		objectToBeSelected  = null;

		event.preventDefault();

		touchEndPosition = event.changedTouches[0];
		if ( _selected ) {
			objectToBeSelected = _selected.parent.container;
			if (objectToBeSelected instanceof Obstruction){
				stage.storePositionOfLastChangedObject(objectToBeSelected, _prevPosition);
			}
			objectToBeSelected.placeObject();
			scope.dispatchEvent( { type: 'dragend', object: _selected } );
			// if(objectToBeSelected instanceof Obstruction){
			// 	if(stage.areOverlapping(objectToBeSelected)){
			// 		objectToBeSelected.updateHeight(stage.floorValue * HEIGHT_PER_FLOOR,stage.polygonModel);
			// 	}else{
			// 		objectToBeSelected.updateHeight(0,stage.ground);
			// 	}
			// }

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		toggleSelection(touchStartPosition, touchEndPosition, objectToBeSelected);
		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;
	this.transformGroup = false;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;
	this.getObjects = utils.getAllObjectMeshes;
	this.enablePolygon = enablePolygon;
	this.disablePolygon = disablePolygon;

};

DragControls.prototype = Object.create( EventDispatcher.prototype );
DragControls.prototype.constructor = DragControls;

export { DragControls };
