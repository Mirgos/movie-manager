'use strict';

const _ = require('lodash');
const stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );
let level;
const bush = { sprite: '`', walkable: true, inventory: [] };
const fillar = { sprite: 'X', walkable: false, inventory: [] };

const coin = { name: 'coin', sprite: 'o' };

const player = { name: 'Przemgej', sprite: 'P', walkable: false, inventory: [] };
const playerPosition = { x: 6, y: 8 };
let putCoin = false;

function pickItem(tx, ty) {

	if(playerPosition.x === tx && playerPosition.y === ty) {
		const tileInventory = level[tx][ty].inventory;
		const loot = tileInventory.splice(0, tileInventory.length);
		console.log(player.inventory);
		player.inventory = player.inventory.concat(loot);
		console.log(player.inventory);
		console.log(loot);
		level[tx][ty] = _.cloneDeep(bush);
	}
}

function putItem(cx, cy, item) {

	level[cx][cy].inventory.push(item);
}
	function createColumn() {

		return new Array(12).fill().map(function() {

			return _.cloneDeep(bush);
		});
	}

function mapInit() {

	level = new Array(12).fill();
	level = level.map(createColumn);
	level[2][2] = fillar;
	level[2][3] = fillar;
	level[3][2] = fillar;
	level[3][3] = fillar;
	putItem(5,5,_.cloneDeep(coin));
	putItem(5,8,_.cloneDeep(coin));
	for(let i = 0; i<12; i++) {
		level[i][0] = fillar;
		level[i][11] = fillar;
		level[0][i] = fillar;
		level[11][i] = fillar;
	}
}

stdin.on( 'data', function( key ){

	if(!level) {
		mapInit();
	}

	if (key === '\u0003') {
    	process.exit();
  	}

  	level[playerPosition.x][playerPosition.y] = bush;

  	if (key === 'w') {
  		if( level[playerPosition.x][playerPosition.y-1].walkable === true) playerPosition.y--;
  	}

  	if (key === 's') {
  		if( level[playerPosition.x][playerPosition.y+1].walkable === true) playerPosition.y++;
  	}

  	if (key === 'a') {
  		if( level[playerPosition.x-1][playerPosition.y].walkable === true) playerPosition.x--;
  	}

  	if (key === 'd') {
  		if( level[playerPosition.x+1][playerPosition.y].walkable === true) playerPosition.x++;
  	}

	function clearScreen() {

		for(let i=1; i<50; i++) {
			console.log();
		}
	}

	function render(plane) {

		clearScreen();
		console.log('X: ' + playerPosition.x);
		console.log('Y: ' + playerPosition.y);		
		for(let y = 0; y<12; y++) {
			for (let x = 0; x<12; x++) {
				if(plane[x][y].inventory.length>0 && plane[x][y] !== player ) {
					process.stdout.write(plane[x][y].inventory[0].sprite + ' ');
				} else {
				process.stdout.write(plane[x][y].sprite + ' ');
				}
			}
				process.stdout.write('\n');
		}
	}

	pickItem(playerPosition.x,playerPosition.y);
	level[playerPosition.x][playerPosition.y] = player;

	render(level);
	console.log('Ekwipunek: ' + player.inventory.map(function(item){

		return item.name;
	}).join(', '));
});



// const champion = { name: 'Przemgej', strength: -4 };
// console.log(champion);
// console.log(champion.name);
// console.log(champion['name']);
// champion.name = 'Andrzgej';
// console.log(champion.name);
// console.log(Object.keys(champion));
// const champion2 = Object.assign({}, champion);
// champion2.name = 'Przemgej';
// champion.lover = champion2;
// console.log(champion);
// console.log();
// console.log();