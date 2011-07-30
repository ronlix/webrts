<?php
/*
	ini to js
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

// 1. load the inis
$inicontent = Get_ini_cont();

// 2. rewrite it to js code
$jsiniArr = PHPArrToJSArr($inicontent);

// 3. javascript header
header("Content-type: application/x-javascript");

// 4. write it
echo $jsiniArr;




/* 
write it to javascript arrays 
*/
function PHPArrToJSArr($arr){
	$jsvar = '"use strict";'."\n".'var iniArr = {};'."\n";
	
	foreach($arr as $key => $value){
		$jsvar .= 'iniArr["'.$key.'"] = {};'."\n";
		foreach($value as $key2 => $value2){
			$jsvar .= 'iniArr["'.$key.'"]["'.$key2.'"] = {';
			$emtyString = true;
			foreach($value2 as $key3 => $value3){
				if(!$value3 || strtolower($value3) == 'no' || strtolower($value3) == 'false'){
					$jsvar .= '"'.$key3.'":0,';
				}else if(strtolower($value3) == 'yes' || strtolower($value3) == 'true'){
					$jsvar .= '"'.$key3.'":1,';
				}else if(is_numeric($value3)){
					$jsvar .= '"'.$key3.'":'.$value3.',';
				}else{
					$jsvar .= '"'.$key3.'":"'.$value3.'",';
				}
				$emtyString = false;
			}
			if(!$emtyString){
				$jsvar=substr($jsvar, 0, -1);
			}
			$jsvar .= '};'."\n";
		}
	}
	return($jsvar);
}


/*
search for ini sets and combine them
*/
function Get_ini_cont(){
	$IniArr = array();
	$main_dir = rDir('../game_content');
	$inisets = array();
	foreach($main_dir as $key => $value){
		if(preg_match('/iniset(.*)/i',$value) && !preg_match('/\./i',$value)){
			array_push($inisets,$value);
		}
	}
	natsort($inisets);
	foreach($inisets as $key => $value){
		$iniFiles = rDir('../game_content/'.$value);
		foreach($iniFiles as $key2 => $value2){ 
			if(preg_match('/\.ini/i',$value2)){
				$entry = strtolower(preg_replace('/\.ini/i','',$value2));
				if(!isset($IniArr[$entry]) || !is_array($IniArr[$entry])){
					$IniArr[$entry] = array();
				}
				$inicont = readINI('../game_content/'.$value.'/'.$value2);
				foreach($inicont as $key3 => $value3){
					$IniArr[$entry][$key3] = $value3;
				}
			}	
		}
	}
	return $IniArr;
}


/* 
reads a directory 
*/
function rDir($pfad){
	$inhalt = array();
	if (is_dir($pfad)) {
		if ($dh = opendir($pfad)) {
			while (($file = readdir($dh)) != false) {
				if($file != "." && $file != ".."){
					array_push($inhalt,$file);
				}
			}
		}
	}
	return $inhalt;
}


/* 
reads an ini file to a php array 
*/
function readINI ($file){
	$content = file_get_contents($file);
	$content = nl2br($content);
	$content = preg_replace('/\040/i','',$content);
	$content = str_replace('<br />','<br/>',$content);
	$content1 = explode ('<br/>',$content);
	$ini_conts = array();
	foreach($content1 as $key1 => $value1){
		$value1 = trim($value1);
		if(substr($value1,0, 1) == "["){
			$value1 = explode(']',$value1);
			$value1 = str_replace('[','',$value1[0]);
			$ini_conts[$value1] = array();
			$this_vals = explode('['.$value1.']',$content);
			$this_vals = explode('[',$this_vals[1]);
			$this_vals = explode('<br/>',$this_vals[0]);
			foreach($this_vals as $key => $value){
				$value = trim($value);
				if(substr($value,0, 1) != ";" && $value != '' && $value != ' '){
					$value = explode(';',$value);
					$value = explode('=',$value[0]);
					$realvalue ='';
					foreach($value as $keyz => $valuez){
						if($keyz !=0 && !empty($valuez)){
							if($keyz == (count($value)-1)){
								$realvalue .= $valuez;
							}else{
								$realvalue .= $valuez.'=';
							}
						}
					}
					$ini_conts[$value1][$value[0]] = $realvalue;
				}
			}
		}
	}
	return $ini_conts;
}
?>