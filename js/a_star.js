/*
	web RTS (Astar Pathfind)
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
usage:

	it needs a map Array that looks like:
	map = [
		[0,0,0,0],
		[1,0,0,1],
		[1,1,0,0]
	]
	you can use any numbers to discribe how fast/cheap this node is passable .. (smaller is faster)
	the higest number shuld be the wall ... this wall number must be set as var Wall in Astar search function.
	to start it just give it the start coordinates, the goal coordinates and the map array.
	
	var Path = Astar.search(startX, startY, goalX, goalY, map_array);
	
	it returns an array with waypoint coordinates 
	
	Path.tostring = [[x,y],[x,y],[x,y], ...]
	
	for example .. to get the first path coordinates 
	x1 = path[0][0];
	y1 = path[0][1];
	x2 = path[1][0];
	y2 = path[1][1];	
	x3 = path[2][0];
	y3 = path[2][1];
	....
*/

"use strict";
var Astar = {	
	search: function(fx,fy,tx,ty,mapArr){
		
		// set your wall node value here
		var Wall = 20;
		
		// stores the heuristic distance of on node to a nother .. so it needs a little less math
		var dv = [Astar.distance(1,1,2,2),Astar.distance(1,1,1,2)];
		
		// set some variables .. ;)
		var cn, d, nb, anb, nn, tn, sn, bn, nw, ndv, id=2, goal=false, mX=mapArr.length, mY=mapArr[0].length, openList=[], graph=[],path=[];
		
		// creates an array for each row so it dosent need to create nodes for parts that it dont explores
		for(x=0;x<mX;x++){
			graph[x] = [];
		}
		// min distance. stores the heuristic of the node with the lowest h value. needed to find the best path if the goal is unreachable
		var md = mX+mY;
		
		// creates a new "binary heap" like object
		var bh = new binary_heap();
		
		// create the goal node..
		graph[tx][ty] = new Astar.node(tx,ty,0,0);
		
		// call it tn
		tn = graph[tx][ty];
		
		//create the start node
		graph[fx][fy] = new Astar.node(fx,fy,1,0);
		
		//call it sn
		sn = graph[fx][fy];
		
		// set the heuristic of the start node
		sn.h=Astar.distance(sn.x,sn.y,tn.x,tn.y)*sn.bv;
		sn.f= 1*sn.bv;
		
		// best node that it knows ATM. this node will be the goal if the real one is unreachable
		bn = sn;
		
		// add the start node to heap
		bh.add(0,sn);
		
		// start the while loop till there no more open nodes.. wich means the whole map is explored
		while(bh.size){
			
			// get the node with the lowest f value from heap
			cn = bh.get();
			
			// set its id to false so we know it was checket
			openList[cn.id] = 0;
			
			// if the current node is the goal break the loop
			if(cn == tn){
				goal = true;
				break;
			}
			
			// checks if the current nodes h value is best. update the min distance and the best node
			if(cn!=sn && cn.h<md){
				md = cn.h
				bn = cn;
			}
			
			// positions of the neighbor nodes 
			anb = [[cn.x-1,cn.y-1],[cn.x,cn.y-1],[cn.x+1,cn.y-1],[cn.x+1,cn.y],[cn.x+1,cn.y+1],[cn.x,cn.y+1],[cn.x-1,cn.y+1],[cn.x-1,cn.y]];
			
			// check each neighbor  
			for(d=0;d<8;d++){
				
				// the actual neighbor
				nb = anb[d];
				
				// checks if actual neighbor is inside of the map
				if(graph[nb[0]] && nb[1]>=0 && nb[1]<mY){
					
					// if its coordinates dont have a node object and its not a wall make a new node
					if(!graph[nb[0]][nb[1]] && mapArr[nb[0]][nb[1]]!=Wall){
						graph[nb[0]][nb[1]] = new Astar.node(nb[0],nb[1],id,mapArr[nb[0]][nb[1]]);
						id++;
					}
					
					// neighbor node
					nn = graph[nb[0]][nb[1]];
					
					// if its a valid node
					if(nn){
						
						// get its g value seen from the current node ... add the tie breaker
						
						ndv = dv[d%2];
						nw = cn.g+(ndv*nn.bv)+Astar.tie_break(nn,sn,tn);
						
						// if the f value is -1 the node is fresh and needs its heuristic 
						// or if its g value is bigger then it is when the current node is the parent
						if(nn.f==-1 || nw<nn.g){
							
							//if its alredy in open list .. delete it from the heap because it will be added with a new better f value
							if(openList[nn.id]){
								bh.remove(nn.f,nn);
							}
							
							// if its fresh get its heuristic
							if(nn.f==-1){
								nn.h = Astar.distance(nn.x,nn.y,tn.x,tn.y)*nn.bv;
							}
							
							// set node values
							nn.pn = cn;
							nn.g = nw;
							
							// i round f because the heap function is much faster with rounded numbers
							nn.f = Math.round(nn.h+nn.g);
							
							// set it as true in open list
							openList[nn.id] = 1;
							
							// add it to the heap
							bh.add(nn.f,nn);							
						}
					}
				}
			}
		}
		
		// if the goal is unreachable make the path from the best node
		if(!goal){
			cn=bn;
		}
		
		// reconstruct the path from the goal
		while(cn.pn) {
			path.push([cn.x,cn.y]);
			cn = cn.pn;
		}
		
		// reverse it 
		path = path.reverse();
		
		// return it
		return path;
	},
	
	// creates a new node
	node: function(x,y,id,bv){
		this.x = x;
		this.y = y;
		this.id = id;
		this.bv = bv+1;
		this.pn = 0;
		this.g = 0;
		this.h = 0;
		this.f = -1;
	},
	
	// Euclidean heuristic
	distance: function(fx,fy,tx,ty){
		return Math.sqrt((tx-fx)*(tx-fx)+(ty-fy)*(ty-fy));
	},
	
	// tie breaker
	tie_break: function(nn,sn,tn){
		return Math.abs(((nn.x-tn.x)*(sn.y-tn.y))-((sn.x-tn.x)*(nn.y-tn.y)))*.000001;
	}
};


// my binary heap like function .. it dont really sortes but it returns always the object with the lowest given value
function binary_heap(){
	// main variables 
	
	// the objects goes to content
	this.content = [];
	
	// the values to values
	this.values = [];
	
	// the count of objects inside it
	this.size = 0;
	
	// adds a new object 
	this.add = function(value,object){
		
		
		if(!this.content[value]){
			
			// if its value is unique create a new value and content entry for it
			this.content[value] = [object];
			this.values.push(value);
		}else{
			
			// if its value is equal to one that is already in push it to this value 
			this.content[value].push(object);
		}
		
		// there is now one more strored 
		this.size++;
	};
	
	// removes an object
	this.remove = function(value,object){
		
		// length of node with an equal value
		var cl=this.content[value].length;
		
		// if it is 1 we can delete the array and splice the value
		if(cl==1){
			delete this.content[value];
			this.values.splice(this.values.indexOf(value),1);					
		}else{
			
			// else .. get its index and splice it
			this.content[value].splice(this.content[value].indexOf(object),1);
		}
		this.size--;
	};
	
	// returns the object with the lowest value 
	this.get = function(){
		
		// get the lowest value out of values array
		var min = Math.min.apply(Math,this.values);
		
		// get the first object of nodes with this value
		var obj = this.content[min][0];
		
		// remove the taken object from heap
		this.remove(min,obj);
		
		// return it
		return obj;
	};
}
