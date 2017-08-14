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

const player = { name: 'Przemgej', sprite: 'P', walkable: false, hp: 10 ,inventory: [] };
const playerPosition = { x: 6, y: 8 };
let numberOfCoins = 0;
let isBlinking = false;
let blinkCD = 0;
let isDragonBreathing = false;
let dragonBreathCD = 0;
let action = true;



let turnDB = 0;

const enemy = { name: 'Andgrzej', sprite: 'A', walkable: false, hp: 5, inventory: [] };
const enemyPosition = { x: 9, y: 4 };

const putItem = (cx, cy, item) => {

  level[cx][cy].inventory.push(item);
};

const pickItem = (tx, ty) => {

  if (playerPosition.x === tx && playerPosition.y === ty) {
    const tileInventory = level[tx][ty].inventory;
    const loot = tileInventory.splice(0, tileInventory.length);
    console.log(loot);
    if(loot.length > 0 && loot[0].name === "coin" ) {
      let coinPlaceX = Math.floor((Math.random() * 10) + 1);
      let coinPlaceY = Math.floor((Math.random() * 10) + 1);
      if (coinPlaceX !== playerPosition.x && coinPlaceY !== playerPosition.y) {
      console.log(coinPlaceX);
      console.log(coinPlaceY);
      console.log(playerPosition.x);
      console.log(playerPosition.y);
      putItem(coinPlaceX,coinPlaceY,_.cloneDeep(coin));
      console.log(tileInventory);
      console.log(level[coinPlaceX][coinPlaceY].inventory);
      }
    }
    player.inventory = player.inventory.concat(loot);
    level[tx][ty] = _.cloneDeep(bush);
  }
};

const createColumn = () => {

  return new Array(12).fill().map(function () {

    return _.cloneDeep(bush);
  });
};

const mapInit = () => {

  level = new Array(12).fill();
  level = level.map(createColumn);
  level[enemyPosition.x][enemyPosition.y] = enemy;
  putItem(Math.floor((Math.random() * 10) + 1),Math.floor((Math.random() * 10) + 1),_.cloneDeep(coin));
  putItem(Math.floor((Math.random() * 10) + 1),Math.floor((Math.random() * 10) + 1),_.cloneDeep(coin));
  putItem(Math.floor((Math.random() * 10) + 1),Math.floor((Math.random() * 10) + 1),_.cloneDeep(coin));
  for (let i = 0; i < 12; ++i) {
    level[i][0] = fillar;
    level[i][11] = fillar;
    level[0][i] = fillar;
    level[11][i] = fillar;
  }
};

const clearScreen = () => {

  for (let i = 0; i < 50; ++i) {
    console.log();
  }
};

const move = (keyPressed, bind, xDirection, yDirection, target) => {

  if (keyPressed === bind) {
    let distance;
    if (isBlinking === true) {
      distance = 3;
      isBlinking = false;
      blinkCD = 5000;
      const blinkUpdate = setInterval(function (){

        blinkCD -= 100;
        if (blinkCD <= 0) {
          blinkCD = 0;
          clearInterval(blinkUpdate);
        }
        action = true;
      }, 100);
    }
    else if (isDragonBreathing === true) {
      if ( level[target.x + xDirection][target.y + yDirection] === enemy ) {
        level[target.x + xDirection][target.y + yDirection].hp -= 2;
      }
      isDragonBreathing = false;
      dragonBreathCD = 1000;
      const dragonBreathUpdate = setInterval(function (){

        dragonBreathCD -= 100;
        if (dragonBreathCD <= 0) {
          dragonBreathCD = 0;
          clearInterval(dragonBreathUpdate);
        }
        action = true;
      }, 100);
    }
    else {
      distance = 1;
    }
    for (let i = 0; i < distance; ++i) {
      if (level[target.x + xDirection][target.y + yDirection].walkable !== false ) {
        level[target.x][target.y] = bush;
        target.x += xDirection;
        target.y += yDirection;
      }
    }
  }
};

mapInit();

const render = (plane) => {

  if (action === true) {
    clearScreen();
    console.log('X: ' + playerPosition.x);
    console.log('Y: ' + playerPosition.y);
    console.log('Blink cd: ' + blinkCD / 1000);
    console.log('Dragon Breath cd: ' + dragonBreathCD / 1000);
    console.log('Hp Andrzgeja: ' + enemy.hp);
    console.log(player.inventory.length);
    console.log(numberOfCoins);
    console.log('Ekwipunek: ' + player.inventory.map(function (item){

      return item.name;
    }).join(', '));
    for ( let y = 0; y < 12; ++y ) {
      for ( let x = 0; x < 12; ++x ) {
        if ( plane[x][y].inventory.length > 0 && plane[x][y] !== player ) {
          process.stdout.write(plane[x][y].inventory[0].sprite + ' ');
        }
        else {
          process.stdout.write(plane[x][y].sprite + ' ');
        }
      }
      process.stdout.write('\n');
    }
    action = false;
  }
};

const fps = 1000 / 60;
setInterval(function () {

  render(level);
}, fps);

stdin.on('data', function (key) {

  if (!level) {
    mapInit();
  }

  if (key === '\u0003') {
    process.exit();
  }

  move(key, 'w', 0, -1, playerPosition);
  move(key, 's', 0, 1, playerPosition);
  move(key, 'a', -1, 0, playerPosition);
  move(key, 'd', 1, 0, playerPosition);

  move(key, '8', 0, -1, enemyPosition);
  move(key, '5', 0, 1, enemyPosition);
  move(key, '4', -1, 0, enemyPosition);
  move(key, '6', 1, 0, enemyPosition);

  if (key === 'r' && blinkCD === 0) {
    isBlinking = true;
  }

  if (key === 'q' && dragonBreathCD === 0 ) {
    isDragonBreathing = true;
  }

  pickItem(playerPosition.x,playerPosition.y);
  level[playerPosition.x][playerPosition.y] = player;
  level[enemyPosition.x][enemyPosition.y] = enemy;

  if ( enemy.hp < 0 ) {
    level[enemyPosition.x][enemyPosition.y] = bush;
  }
  if (turnDB === 1) {
    turnDB = 0;
  }
  else if (turnDB < 6 && turnDB > 0) {
    turnDB--;
  }
  action = true;
});
