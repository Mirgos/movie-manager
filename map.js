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

const pickItem = (target, targetPosition) => {

  const tileInventory = level[targetPosition.x][targetPosition.y].inventory;
  console.log({tileInventory})
  const loot = tileInventory.splice(0, tileInventory.length);
  console.log({loot})
  if(loot.length > 0 && loot[0].name === "coin" ) {
    // TODO: check for columns
    let coinPlaceX = targetPosition.x;
    while (coinPlaceX === playerPosition.x || coinPlaceX === enemyPosition.x) {
      coinPlaceX = Math.floor((Math.random() * 10) + 1);
    }
    let coinPlaceY = targetPosition.y;
    while (coinPlaceY === playerPosition.y || coinPlaceY === enemyPosition.y) {
      coinPlaceY = Math.floor((Math.random() * 10) + 1);
    }
    putItem(coinPlaceX,coinPlaceY,_.cloneDeep(coin));
  }
  target.inventory = target.inventory.concat(loot);
};

const createColumn = () => {

  return new Array(12).fill().map(function () {

    return _.cloneDeep(bush);
  });
};

const mapInit = () => {

  level = new Array(12).fill();
  level = level.map(createColumn);
  level[playerPosition.x][playerPosition.y] = player;
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

const move = (keyPressed, bind, xDirection, yDirection, target, targetPosition) => {

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
      if ( level[targetPosition.x + xDirection][targetPosition.y + yDirection] === enemy ) {
        level[targetPosition.x + xDirection][targetPosition.y + yDirection].hp -= 2;
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
      if (level[targetPosition.x + xDirection][targetPosition.y + yDirection].walkable !== false ) {
        level[targetPosition.x][targetPosition.y] = _.cloneDeep(bush);
        targetPosition.x += xDirection;
        targetPosition.y += yDirection;
        pickItem(target, targetPosition);
        level[targetPosition.x][targetPosition.y] = target;
      }
    }
  }
};

const render = (plane) => {

  if (action === true) {
    clearScreen();
    console.log('X: ' + playerPosition.x);
    console.log('Y: ' + playerPosition.y);
    console.log('Blink cd: ' + blinkCD / 1000);
    console.log('Dragon Breath cd: ' + dragonBreathCD / 1000);
    console.log('Hp Andrzgeja: ' + enemy.hp);
    console.log('Ekwipunek Andrzgeja: ' + enemy.inventory.map(function (item) {

      return item.name;
    }).join(', '));
    console.log(player.inventory.length);
    console.log(numberOfCoins);
    console.log('Ekwipunek: ' + player.inventory.map(function (item){

      return item.name;
    }).join(', '));
    for (let y = 0; y < 12; ++y) {
      for (let x = 0; x < 12; ++x) {
        if (plane[x][y].inventory.length > 0 && plane[x][y] !== player && plane[x][y] !== enemy) {
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

const main = (key) => {

  if (!level) {
    mapInit();
  }

  if (key === '\u0003') {
    process.exit();
  }

  move(key, 'w', 0, -1, player, playerPosition);
  move(key, 's', 0, 1, player, playerPosition);
  move(key, 'a', -1, 0, player, playerPosition);
  move(key, 'd', 1, 0, player, playerPosition);

  move(key, '8', 0, -1, enemy, enemyPosition);
  move(key, '5', 0, 1, enemy, enemyPosition);
  move(key, '4', -1, 0, enemy, enemyPosition);
  move(key, '6', 1, 0, enemy, enemyPosition);

  if (key === 'r' && blinkCD === 0) {
    isBlinking = true;
  }

  if (key === 'q' && dragonBreathCD === 0 ) {
    isDragonBreathing = true;
  }
  if ( enemy.hp < 0 ) {
    console.log('DIE')
    level[enemyPosition.x][enemyPosition.y] = _.cloneDeep(bush);
  }
  if (turnDB === 1) {
    turnDB = 0;
  }
  else if (turnDB < 6 && turnDB > 0) {
    turnDB--;
  }
  action = true;
}

const fps = 1000 / 60;
setInterval(function () {

  if (!level) {
    main();
  }
  render(level);
}, fps);

stdin.on('data', main);
