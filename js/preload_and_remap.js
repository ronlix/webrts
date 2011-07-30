/*
	web RTS (preload & remap)
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

/*
here the images of all terrains and arts becomes loaded and will be stored in iniArr[terrain or art object]['loadedImages'] (Array)
the remapped images will be in iniArr[terrain or art object]['sitename'] (Array)
the shadow images (only for aircraft) will be in iniArr[terrain or art object]['shadows'] (Array)
*/



"use strict";


/*
init loading screen
*/
var loadbg = false;
var loadInfo = false;
var loadstst = false;
var loadImagecount = 0;
var toLoad = 0;
var remapedcount = 8;
var toremap = 8;
var useTerrain = 0;


/*
sites and terrain types
*/
var allsitesArr = false;
var terraintype = false;


/*
init on Dom ready
*/
var isInit = false;
window.onDomReady = function(fn){
	if(window.addEventListener){
		window.addEventListener("DOMContentLoaded", fn, false);
	}else if(window.addEvent){
		window.addEvent('domready',fn);
	}else{
		document.onreadystatechange = function(){
			if(document.readyState == "interactive"  || document.readyState == "loaded" || document.readyState == "complete"){
				!isInit ? fn():0;
				isInit = true;				
			}
		}
        }
}
window.onDomReady(Load);

function Load(){
	
	/*
	loading screen elements (with style)
	*/
	loadbg = document.createElement('div');
	loadbg.style.position = 'absolute';
	loadbg.style.zIndex = '99';
	loadbg.style.left = '0px';
	loadbg.style.top = '0px';
	loadbg.style.backgroundColor= '#000';
	loadbg.style.height = '80%';
	loadbg.style.width = '100%';
	loadbg.style.color = '#FFF';
	loadbg.style.textAlign = 'center';
	loadbg.style.paddingTop= '150px';
	document.body.appendChild(loadbg);
	
	var loadststb = document.createElement('div');
	loadststb.style.width = '200px';
	loadststb.style.height = '7px';
	loadststb.style.marginLeft = 'auto';
	loadststb.style.marginRight = 'auto';
	loadststb.style.border='1px solid #ccc';
	
	loadInfo = document.createElement('span');
	loadInfo.style.fontSize = '10px'
	loadInfo.id = 'LoadingMsg';
	loadInfo.innerHTML = 'loading';
	loadbg.appendChild(loadInfo);
	
	
	loadstst = document.createElement('div');
	loadstst.style.width = '0px';
	loadstst.style.height = '7px';
	loadstst.style.backgroundColor = '#888800';
	loadststb.appendChild(loadstst);
	loadbg.appendChild(loadststb);
	
	
	
	
	/*
	get the sides and its colors
	*/
	allsitesArr = iniArr['rules']['Sides']['sides'].split(',');
	/*
	old way to get the multyplayer colors
	if(isMultyplayer){
		for(var i in PlayerArr){
			allsitesArr[allsitesArr.length] = 'mpp_'+i;
			iniArr['rules']['mpp_'+i] = new Object();
			iniArr['rules']['mpp_'+i]['color'] = PlayerArr[i]['color'];
		}
	}
	*/
	
	
	/*
	get the terrain type (multiple are not finished yet)
	*/
	if(!terraintype){
		terraintype = "0";
	}	
	useTerrain = iniArr["art"]["terrains"][terraintype];
	
	
	/*
	preload terrain tiles
	*/
	for(var T in iniArr[useTerrain]){
		if(iniArr[useTerrain][T]['dir'] && iniArr[useTerrain][T]['count']){
			//create the loadedImage Array
			iniArr[useTerrain][T]['loadedImages'] = Array();
			//load each image
			for(var i = 1;i <= iniArr[useTerrain][T]['count'];i++){
				toLoad++;
				var this_image = new Image();
				// refresh the loading screen if its loaded
				this_image.onload = function(){
					loadImagecount++;
					setNewLoadStatImages();
				};
				//set the src
				this_image.src = 'game_content/terrain/'+useTerrain+'/'+iniArr[useTerrain][T]['dir']+'/'+i+'.'+iniArr[useTerrain][T]["type"];
				//store it to the loadedImages Array
				iniArr[useTerrain][T]['loadedImages'][i-1] = this_image;
			}
		}
	}
	/*
	preload art
	*/
	for(var A in iniArr['art']){
		if(iniArr['art'][A]['dir'] && iniArr['art'][A]['count']){
			//create the loadedImage Array
			iniArr['art'][A]['loadedImages'] = Array();
			// stores the count of images that will be added to the toLoad int 
			var toAddIm = 0;
			//check if it is remappable and 
			if(iniArr['art'][A]['remappable']){
				toAddIm = allsitesArr.length;
			}
			//check if it its movement zone is air (if it is we need shadows)
			if(iniArr["rules"][A] && iniArr["rules"][A]['movmentZone'] && iniArr["rules"][A]['movmentZone'] == 'air'){
				toAddIm++;
			}
			for(var f = 1;f <= iniArr['art'][A]['count'];f++){
				toLoad++;
				toremap = toremap+toAddIm;
				// refresh the loading screen if its loaded
				var this_image = new Image();
				this_image.onload = function(){
					loadImagecount++;
					setNewLoadStatImages();
				};
				//set the src
				this_image.src = 'game_content/'+iniArr['art'][A]['class']+'/'+iniArr['art'][A]['dir']+'/'+f+'.'+iniArr['art'][A]["type"];
				//store it to the loadedImages Array
				iniArr['art'][A]['loadedImages'][f-1] = this_image;
			}
		}
	}		
}

/*
refreshs the load state and starts the remap if all images are loaded
*/
function setNewLoadStatImages(){
	if(loadImagecount == toLoad){
		RemapIt();
	}
	Show_Loadstate();
}


/*
refreshs the load state and goon with game init
*/
function setNewLoadStatremap(){
	if(remapedcount == toremap){
		//-> init the game (init_game_area.js)
		preInit();
	}else{
		Show_Loadstate();
	}
}

/*
shows the actual load state
*/
function Show_Loadstate(){
	var ploo = ((toremap/8)+toLoad)/100;
	var actp = ((remapedcount/8)+loadImagecount);
	loadstst.style.width = ((actp/ploo)*2)+'px';
}


/*
remap & shadows
*/
var remapcounter = Array();
var remapcounter2 = Array();
var shadowcounter = Array();
var shadowcounter2 = Array();
var RepColorArray = false;
var playercolorArr = Array();
var playerBuildingcolor = Array();


/*
starts the remap process
*/
function RemapIt(){
	//get the remap colors of the rules ini
	RepColorArray = iniArr['rules']['remapcolors']['remapcolor'].split(',');
	
	//get the replacement colors for each site
	for(var iu in allsitesArr){
		var Usecolor = iniArr['rules'][allsitesArr[iu]]['color'];
		playercolorArr[iu] = iniArr['rules']['remapcolors'][Usecolor+'Unit'].split(',');
		playerBuildingcolor[iu] = iniArr['rules']['remapcolors'][Usecolor+'Building'].split(',');
	}			
	
	for(var it in iniArr["art"]){
		if(iniArr["art"][it]['remappable'] && iniArr["art"][it]['dir']){
			//creates an array in the item object for each site
			for(var zt in allsitesArr){
				iniArr['art'][it][allsitesArr[zt]] = Array();
			}
			//set the counters
			remapcounter2[it] = Array();
			for(var yt in iniArr["art"][it]['loadedImages']){
				remapcounter2[it][remapcounter2[it].length] = yt;
			}
			remapcounter[remapcounter.length] = it;
		}
	}
	remapEach(0,0);
}


/*
remaps each image in all needed colors
*/
function remapEach(count,count2){
	//check the count of images
	if(remapcounter[count]){
		var it = remapcounter[count];
		//if there are still images to remap
		if(remapcounter2[it][count2]){
			var yt = remapcounter2[it][count2];
			// do it for all active sides 
			for(var dt in allsitesArr){
				//create a temporar canvas
				var remapCanvas = document.createElement('canvas');
				// set it to the images size
				remapCanvas.width = iniArr['art'][it]['loadedImages'][yt].width;
				remapCanvas.height = iniArr['art'][it]['loadedImages'][yt].height;
				// get its 2D content
				var remapContext = remapCanvas.getContext('2d');	
				// fill it with the image
				remapContext.drawImage(iniArr['art'][it]['loadedImages'][yt], 0, 0);
				// it is possible to use different colors for units and buildings
				if(iniArr['art'][it]['class'] == 'buildings' || (iniArr['art'][it]['useBuildingsColor'] && iniArr['art'][it]['useBuildingsColor'] != 'false')){
					iniArr['art'][it][allsitesArr[dt]][yt] = new Image();
					iniArr['art'][it][allsitesArr[dt]][yt].src = replaceColors(RepColorArray,playerBuildingcolor[dt],remapCanvas);
				}else{
					iniArr['art'][it][allsitesArr[dt]][yt] = new Image();
					iniArr['art'][it][allsitesArr[dt]][yt].src = replaceColors(RepColorArray,playercolorArr[dt],remapCanvas);
				}
				remapedcount++;
			}
			setNewLoadStatremap();
			//get the next image (a small timeout because slow browsers (or pcs) may sotp it we do all in the same time)
			setTimeout('remapEach('+count+','+(count2+1)+')',3);
			return;
		}
		//get the next object (a small timeout because slow browsers (or pcs) may sotp it we do all in the same time)
		setTimeout('remapEach('+(count+1)+',0)',10);
	}else{
		// if we are done here we can go to the aircraft shadows
		getShadows();
	}
}



/*
the same as above but now with black transparent shadow images
*/

function getShadows(){			
	for(var iz in iniArr["art"]){
		if(iniArr["rules"][iz] && iniArr["rules"][iz]['movmentZone'] && iniArr["rules"][iz]['movmentZone'] == 'air'){
			shadowcounter[shadowcounter.length] = iz;
			shadowcounter2[iz] = Array();
			iniArr['art'][iz]['shadows'] = Array();
			for(var yz in iniArr["art"][iz]['loadedImages']){
				shadowcounter2[iz][shadowcounter2[iz].length] = yz;
			}
		}
	}
	genEachShadow(0,0);
}


function genEachShadow(count,count2){
	if(shadowcounter[count]){
		var iz = shadowcounter[count];
		if(shadowcounter2[iz][count2]){
			var yz = shadowcounter2[iz][count2];
			var SadowCanvas = document.createElement('canvas');
			SadowCanvas.width = iniArr['art'][iz]['loadedImages'][yz].width;
			SadowCanvas.width = iniArr['art'][iz]['loadedImages'][yz].height;
			var SadowContext = SadowCanvas.getContext('2d');	
			SadowContext.drawImage(iniArr['art'][iz]['loadedImages'][yz], 0, 0);
			iniArr['art'][iz]['shadows'][yz] = new Image();
			iniArr['art'][iz]['shadows'][yz].src = generateShadow(SadowCanvas);
			remapedcount++;
			setNewLoadStatremap();
			setTimeout('genEachShadow('+count+','+(count2+1)+')',20);
			return;			
		}
		setTimeout('genEachShadow('+(count+1)+',0)',20);
	}
}



// hex to dec
function Hex(dec){
	var HexChars="0123456789ABCDEF";
	return HexChars.charAt((dec>>4)&0xf)+HexChars.charAt(dec&0xf);
}
// dec to hex
function Dec(hex){
	return parseInt(hex.toUpperCase(),16);
}
//hex to grb
function HextoRGB(HexColor){
	HexColor = HexColor.replace(/#/,'');
	var RGB = Array();
	RGB['R'] = Dec(HexColor[0]+HexColor[1]);
	RGB['B'] = Dec(HexColor[2]+HexColor[3]);
	RGB['G'] = Dec(HexColor[4]+HexColor[5]);
	return RGB;
}

// replace a color array with a nother
function replaceColors(findColorArr,repColorArr,canvasElementx){
	//get its content
	var Ccontext = canvasElementx.getContext('2d');
	// get its image data
	var imageData = Ccontext.getImageData(0, 0, canvasElementx.width, canvasElementx.height);
	//het its size
	var canvasHeight = canvasElementx.height;
	var canvasWidth = canvasElementx.width;
	// go for each pix and check its color
	for(var y=0;y<canvasHeight;y++){
		for(var x=0;x<canvasWidth;x++){
			var index = (y*imageData.width + x) * 4;
			// if it is transparent we dont need to check it
			if(imageData.data[index + 3] ==255){
				var red = imageData.data[index];
				var green = imageData.data[index + 1];
				var blue = imageData.data[index + 2];
				var hexColor = '#'+Hex(red)+Hex(green)+Hex(blue);
				var insearchArr = in_array(hexColor,findColorArr);
				if(insearchArr != -1){
					//if a color was found .. replace it
					var repcolor = HextoRGB(repColorArr[insearchArr]);
					imageData.data[index] = repcolor['R'];
					imageData.data[index+1] = repcolor['B'];
					imageData.data[index+2] = repcolor['G'];
				}
			}
		}
	}
	// return the base64 image data 
	Ccontext.putImageData(imageData, 0, 0);
	return canvasElementx.toDataURL("image/png");
}


/*
generates the shadow images
*/
function generateShadow(canvasElementz){
	var Ccontextz = canvasElementz.getContext('2d');
	var imageDataz = Ccontextz.getImageData(0, 0, canvasElementz.width, canvasElementz.height);
	var canvasHeight = canvasElementz.height;
	var canvasWidth = canvasElementz.width;
	
	for(var y=0;y<canvasHeight;y++){
		for(var x=0;x<canvasWidth;x++){
			var index = (y*imageDataz.width + x) * 4;
			var red = imageDataz.data[index];
			var green = imageDataz.data[index + 1];
			var blue = imageDataz.data[index + 2];
			var alfa = imageDataz.data[index + 3];
			// if it isent transparent make it black and set its opacity to ~ 50%
			if(alfa>0){
				imageDataz.data[index] = 0;
				imageDataz.data[index+1] = 0;
				imageDataz.data[index+2] = 0;
				imageDataz.data[index+3] = 130;
				
			}
		}
	}
	// return the base64 image data 
	Ccontextz.putImageData(imageDataz, 0, 0);
	return canvasElementz.toDataURL("image/png");
}






