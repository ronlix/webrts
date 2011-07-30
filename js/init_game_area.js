/*
	web RTS (initialisation)
	Copyright © 2011 Felix Niessen ( felix.niessen@googlemail.com )

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";


var maincontainer = 0;
var BGcanvas = 0;
var BGCcontext = 0;
var GroundCanvas = 0;
var Gcontext = 0;
var lightCanvas = 0;
var Lcontext = 0;


// if all is loaded we can continue (started from setNewLoadStatremap() in preload_and_remap.js) sets the basic elements
function preInit(){
	maincontainer = document.getElementById('g_container');
	maincontainer.style.width = mapsize[0]+'px';
	maincontainer.style.height = mapsize[1]+'px';
	BGcanvas = document.createElement('canvas');
	BGcanvas.id = 'BGcanvas';
	BGcanvas.width = mapsize[0];
	BGcanvas.height = mapsize[1];
	BGCcontext = BGcanvas.getContext('2d');
	GroundCanvas = document.createElement('canvas');
	GroundCanvas.id= 'GroundCanvas';
	GroundCanvas.width = mapsize[0];
	GroundCanvas.height = mapsize[1];
	Gcontext = GroundCanvas.getContext('2d');
	lightCanvas = document.createElement('canvas');
	lightCanvas.id = 'lightCanvas';
	lightCanvas.width = mapsize[0];
	lightCanvas.height = mapsize[1];
	Lcontext = lightCanvas.getContext('2d');
	
	//add it to main div
	maincontainer.appendChild(BGcanvas);
	maincontainer.appendChild(GroundCanvas);
	maincontainer.appendChild(lightCanvas);
	
	
	//load the map content
	loadMap();
	
	
	
	
	
	//remove the loadscreen
	loadbg.style.opacity = .75;
	setTimeout('loadbg.style.opacity = .5;',20);
	setTimeout('loadbg.style.opacity = .25;',40);
	setTimeout('loadbg.style.display = "none";',60);
}




var mapWidth = 0;
var mapHeight = 0;

function loadMap(){
	//store the count of tiles in x and y
	mapWidth = Math.ceil(mapsize[0]/iniArr['rules']['General']['MapTileSize']);
	mapHeight = Math.ceil(mapsize[1]/iniArr['rules']['General']['MapTileSize']);
	
	//gen the beckground of basic tile set
	genBackground();
	
	/*
		here will be the import of other map contents
		but for now we have just a green background 
	*/
	
}


/*
gets the baseTileset of 'useTerrain' of iniArr and fills the bgc canvas with random tiles of it
*/
function genBackground(){
	for(var x = 0;x<mapWidth;x++){
		for(var y = 0;y<mapHeight;y++){
			BGCcontext.drawImage(iniArr[useTerrain]['baseTileset']['loadedImages'][Rand(0,iniArr[useTerrain]['baseTileset']['loadedImages'].length-1)],x*iniArr['rules']['General']['MapTileSize'],y*iniArr['rules']['General']['MapTileSize']);
		}
	}
}







/*
in_ array ... returns the index or -1
*/
function in_array(item,arr) {
	for(var p=0, p_tmp=arr.length;p<p_tmp;p++){
		if(item == arr[p]){
			return p;
		}
	}
	return -1;
}

/*
random number
*/
function Rand(l,u){
	return Math.floor((Math.random()*(u-l+1))+l);
}