const autoRepeatMode = true; // разрешит автозапуск роботов 
let isRepeatStart = false;
const FPS = 100; // количество кадров в секунду
let cageCountX, cageCountY;
const cageCount = 12; // ширина поля в клетках
let roboStep = 8;
let mSize; // размер карты по ширине в пикселях
let cageSize; // размер клетки в пикселях
let map = []; // массив карты
const canvas = document.querySelector(".canvas");
const wallColor = '#557555';
const backColor = '#222';
let win = {w:0, h:0}; // размеры окна
let fpsInterval, now, then, elapsed; // для FPS
let ctx = canvas.getContext("2d");

let isMove = false; // разрешение на движние роботов

// ЗАГРУЗКА РЕСУРСОВ
// красный робот
let roboR = {img: new Image(), x:0, y:0, originX:0, originY:0, dir: "u", size: 100, path: [], startPosition: {x: null, y: null}, finishPosition: {x: null, y: null}, obj : {img: new Image(), x:50, y:50, size: 50}, isFinish: false};
roboR.img.src = "./resourses/robo_red.png"; // путь к изображению
// зелёный робот
let roboG = {img: new Image(), x:0, y:0, originX:0, originY:0, dir: "u", size: 100, path: [], startPosition: {x: null, y: null}, finishPosition: {x: null, y: null}, obj : {img: new Image(), x:50, y:50, size: 50}, isFinish: false};
roboG.img.src = "./resourses/robo_green.png"; // путь к изображению
// синий робот
let roboB = {img: new Image(), x:0, y:0, originX:0, originY:0, dir: "u", size: 100, path: [], startPosition: {x: null, y: null}, finishPosition: {x: null, y: null}, obj : {img: new Image(), x:50, y:50, size: 50}, isFinish: false};
roboB.img.src = "./resourses/robo_blue.png"; // путь к изображению
// красный груз

roboR.obj.img.src = "./resourses/obj_red.svg";
roboG.obj.img.src = "./resourses/obj_green.svg";
roboB.obj.img.src = "./resourses/obj_blue.svg";


SetDefault();


function setPositions(robo) { // получаем начальные и конечные позиции
	while(1) {
		robo.originX = randomInt(0, cageCountX-1);
		robo.originY = randomInt(0, cageCountY-1);
		if (map[robo.originY][robo.originX] === "space") {
			robo.x = robo.originX * cageSize + cageSize/2;
			robo.y = robo.originY * cageSize + cageSize/2;
			robo.startPosition = {
				x: robo.originX,
				y: robo.originY
			}
			break;
		}
	}
	while(1) {
		robo.obj.x = randomInt(0, cageCountX-1);
		robo.obj.y = randomInt(0, cageCountY-1);
		if (map[robo.obj.y][robo.obj.x] === "space") {
			robo.finishPosition = {
				x: robo.obj.x,
				y: robo.obj.y
			}
			robo.obj.x = robo.obj.x * cageSize + robo.obj.size/2,
			robo.obj.y = robo.obj.y * cageSize + robo.obj.size/2
			break;
		}
	}

	robo.path = getWay(map, robo.startPosition, robo.finishPosition);
}

start(FPS); // запуск главного цикла с определенной частотой кадров

function drawPath(path) {
	for (let i = 0; i < path.length-1; i ++) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff00007f';
        ctx.lineWidth = 1; // толщина линии
        ctx.moveTo(path[i][0] * cageSize + cageSize/2, path[i][1] * cageSize + cageSize/2); 
        ctx.lineTo(path[i+1][0] * cageSize + cageSize/2, path[i+1][1] * cageSize + cageSize/2); 
        ctx.stroke();
    }
}


// ГЛАВНЫЙ ЦИКЛ
function mainloop() { 

	if (autoRepeatMode) {		
		if (!isMove && !isRepeatStart) {
			isRepeatStart = true;
			setTimeout(() => {
				isRepeatStart = false;
				isMove = true;
			}, 1000);
		}
		
		if (roboR.isFinish && roboG.isFinish && roboB.isFinish) {
			SetDefault();
			isMove = false;
		}
	}

    requestAnimationFrame(mainloop);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
		drawWalls();
		//drawPath(roboR.path);		
        originSpace();
		if (isMove) {
			objectMovementController(roboR);
			objectMovementController(roboG);
			objectMovementController(roboB);
		}

        drawRotated(ctx, roboR);
        ctx.drawImage(roboR.obj.img, roboR.obj.x, roboR.obj.y, roboR.obj.size, roboR.obj.size);

        drawRotated(ctx, roboG);
        ctx.drawImage(roboG.obj.img, roboG.obj.x, roboG.obj.y, roboG.obj.size, roboG.obj.size);

        drawRotated(ctx, roboB);
        ctx.drawImage(roboB.obj.img, roboB.obj.x, roboB.obj.y, roboB.obj.size, roboB.obj.size);
        
    }
}

function objectMovementController(robo) { // контроллер движения роботов
	let delta = roboStep;
	if (robo.n == -1) robo.rev = true, robo.n = 1;

	if (robo.n < robo.path.length && robo.rev) {
		let targetX = robo.path[robo.n][0] * cageSize + cageSize/2;
		let targetY = robo.path[robo.n][1] * cageSize + cageSize/2;

		if (robo.y > targetY - delta && robo.y < targetY + delta) {
			if (robo.x < targetX) robo.x += roboStep, robo.dir = "r";
			else if (robo.x > targetX) robo.x -= roboStep, robo.dir = "l";
		}
		if (robo.x > targetX - delta && robo.x < targetX + delta) {
			if (robo.y < targetY) {robo.y += roboStep; if (robo.y < targetY - delta) robo.dir = "d";}
			else if (robo.y > targetY) {robo.y -= roboStep; if (robo.y > targetY + delta) robo.dir = "u";}
		}

		if (
			robo.x > targetX - delta && robo.x < targetX + delta &&
			robo.y > targetY - delta && robo.y < targetY + delta
			) robo.n++;

		// прикрепление груза к роботу
		robo.obj.x = robo.x - robo.obj.size / 2;
		robo.obj.y = robo.y - robo.obj.size / 2;
	}
	if (robo.n >= robo.path.length && robo.rev) robo.isFinish = true;

	if (robo.n >= 0 && !robo.rev) {
		let targetX = robo.path[robo.n][0] * cageSize + cageSize/2;
		let targetY = robo.path[robo.n][1] * cageSize + cageSize/2;

		if (robo.y > targetY - delta && robo.y < targetY + delta) {
			if (robo.x < targetX) robo.x += roboStep, robo.dir = "r";
			else if (robo.x > targetX) robo.x -= roboStep, robo.dir = "l";
		}
		if (robo.x > targetX - delta && robo.x < targetX + delta) {
			if (robo.y < targetY) {robo.y += roboStep; if (robo.y < targetY - delta) robo.dir = "d";}
			else if (robo.y > targetY) {robo.y -= roboStep; if (robo.y > targetY + delta) robo.dir = "u";}
		}

		if (
			robo.x > targetX - delta && robo.x < targetX + delta &&
			robo.y > targetY - delta && robo.y < targetY + delta
			) robo.n--;
	}

}

canvas.onclick = () => {
	console.log(roboR.isFinish, roboG.isFinish, roboB.isFinish);
	if (roboR.isFinish && roboG.isFinish && roboB.isFinish) {
		SetDefault();
	}
	isMove = !isMove;
}


function drawRotated(ctx, image) { // отрисовка объекта 
	if (image.dir == "u") ctx.drawImage(image.img, 0, 0, 200, 200, image.x - image.size/2, image.y - image.size/2, image.size, image.size,);
	if (image.dir == "l") ctx.drawImage(image.img, 200, 0, 200, 200, image.x - image.size/2, image.y - image.size/2, image.size, image.size,);
	if (image.dir == "r") ctx.drawImage(image.img, 400, 0, 200, 200, image.x - image.size/2, image.y - image.size/2, image.size, image.size,);
	if (image.dir == "d") ctx.drawImage(image.img, 600, 0, 200, 200, image.x - image.size/2, image.y - image.size/2, image.size, image.size,);
}

function originSpace() { // отрисовка меток, куда нужно привезти груз
    ctx.beginPath();
    ctx.strokeStyle = '#ff000055';
    ctx.lineWidth = 5; // толщина линии
    ctx.strokeRect(roboR.originX * cageSize,roboR.originY * cageSize,cageSize,cageSize);
    ctx.stroke();
	ctx.beginPath();
    ctx.strokeStyle = '#00ff0055';
    ctx.lineWidth = 5; // толщина линии
    ctx.strokeRect(roboG.originX * cageSize,roboG.originY * cageSize,cageSize,cageSize);
    ctx.stroke();
	ctx.beginPath();
    ctx.strokeStyle = '#0000ff55';
    ctx.lineWidth = 5; // толщина линии
    ctx.strokeRect(roboB.originX * cageSize,roboB.originY * cageSize,cageSize,cageSize);
    ctx.stroke();
}


function drawWalls() {
	ctx.fillStyle = "#00000000";
	// создать новую элементарную геометрическую фигуру
	ctx.beginPath();
	// прямоугольник (верхний левый угол, ширина и высота прямоугольника)
	ctx.rect(0, 0, canvas.width, canvas.height);
	// залить фигуру выбранным для заливки цветом
	ctx.fill();

	// здесь создается белое поле внутри рамки
	ctx.fillStyle = wallColor;
	ctx.beginPath();
	ctx.rect(0, 0, cageCountX * cageSize, cageCountY * cageSize);
	ctx.fill();
	let padding = cageSize / 4;
    for (let x = 0; x < cageCountX; x++) {
		for (let y = 0; y < cageCountY; y++) {
			if (getField(x, y) === 'space') {
				ctx.fillStyle = backColor
				ctx.beginPath()
				ctx.rect(x * cageSize - padding, y * cageSize - padding, cageSize + padding*2, cageSize + padding*2)
				ctx.fill()
			}
		}
	}
}

function SetDefault() { // установка начальных значений
    canvas.width = win.w = window.innerWidth;
    canvas.height = win.h = window.innerHeight;
    mSize = (win.w > win.h) ? win.h : win.w;
	roboR.isFinish = roboG.isFinish = roboB.isFinish = false;
	roboR.path = [];
	roboG.path = [];
	roboB.path = [];
    // размеры объектов на холсте
    cageSize = mSize / cageCount;
	cageCountX = parseInt(win.w / cageSize);
	cageCountY = parseInt(win.h / cageSize);
    //размеры объектов
    roboR.size = roboG.size = roboB.size = cageSize;
    roboR.obj.size = roboG.obj.size = roboB.obj.size = cageSize / 2;
	map = generatMaze(cageCountX, cageCountY, 1);
	setPositions(roboR);
	setPositions(roboG);
	setPositions(roboB);
	roboR.n = roboR.path.length-1;
	roboR.rev = false;
	roboG.n = roboG.path.length-1;
	roboG.rev = false;
	roboB.n = roboB.path.length-1;
	roboB.rev = false;
}


function randomInt(min, max) { // генератор целый псевдослучайных чисел
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function start(_fps) { // функция запуска главного цикла с определённой частотой 
    fpsInterval = 1000 / _fps;
    then = Date.now();
    mainloop();
}




// функция построит лабиринт (процесс построения на экране виден не будет)
function generatMaze (columnsNumber, rowsNumber, tractorsNumber = 1) {
	const map = []
	// Тракторы, которые будут очищать дорожки в лабиринте
	const tractors = []

	for (let y = 0; y < rowsNumber; y++) {
		const row = []

		for (let x = 0; x < columnsNumber; x++) {
			row.push('wall')
		}

		map.push(row)
	}

	const startX = getRandomFrom(Array(columnsNumber).fill(0).map((item, index) => index).filter(x => isEven(x)))
	const startY = getRandomFrom(Array(rowsNumber).fill(0).map((item, index) => index).filter(x => isEven(x)))

	// создаем тракторы
	for (let i = 0; i < tractorsNumber; i++) {
		tractors.push({ x: startX, y: startY })
	}

	// сделаем ячейку, в которой изначально стоит трактор, пустой
	setField(startX, startY, 'space')

	// если лабиринт ещё не готов, рисовать трактор и регистрировать функцию tick() ещё раз
	while (!isMaze()) {
		moveTractors()
	}

	return map

	// получить значение из матрицы
	function getField (x, y) {
		if (x < 0 || x >= columnsNumber || y < 0 || y >= rowsNumber) {
			return null
		}

		return map[y][x]
	}

	// записать значение в матрицу
	function setField (x, y, value) {
		if (x < 0 || x >= columnsNumber || y < 0 || y >= rowsNumber) {
			return null
		}

		map[y][x] = value
	}

	// функция возвращает случайный элемент из переданного ей массива
	function getRandomFrom (array) {
		// получаем случайным образом индекс элемента массива
		// число будет в диапазоне от 0 до количества элементов в массиве - 1
		const index = Math.floor(Math.random() * array.length)
		// возвращаем элемент массива с полученным случайным индексом
		return array[index]
	}

	/*
		функция проверяет четное число или нет
		если возвращает true - четное
	*/
	function isEven (n) {
		return n % 2 === 0
	}

	// функция проверяет, готов лабиринт или ещё нет
	// возвращает true, если лабиринт готов, false если ещё нет
	function isMaze () {
		for (let x = 0; x < columnsNumber; x++) {
			for (let y = 0; y < rowsNumber; y++) {
				if (isEven(x) && isEven(y) && getField(x, y) === 'wall') {
					return false
				}
			}
		}

		return true
	}

	/*
		функция заставляет трактора двигаться
		трактор должен двигаться на 2 клетки
		если вторая клетка со стеной, то нужно очистить первую и вторую
	*/
	function moveTractors () {
		for (const tractor of tractors) {
			// массив с возможными направлениями трактора
			const directs = []

			if (tractor.x > 0) {
				directs.push('left')
			}

			if (tractor.x < columnsNumber - 2) {
				directs.push('right')
			}

			if (tractor.y > 0) {
				directs.push('up')
			}

			if (tractor.y < rowsNumber - 2) {
				directs.push('down')
			}

			// случайным образом выбрать направление, в котором можно пойти
			const direct = getRandomFrom(directs)

			switch (direct) {
				case 'left':
					if (getField(tractor.x - 2, tractor.y) === 'wall') {
						setField(tractor.x - 1, tractor.y, 'space')
						setField(tractor.x - 2, tractor.y, 'space')
					}
					tractor.x -= 2
					break
				case 'right':
					if (getField(tractor.x + 2, tractor.y) === 'wall') {
						setField(tractor.x + 1, tractor.y, 'space')
						setField(tractor.x + 2, tractor.y, 'space')
					}
					tractor.x += 2
					break
				case 'up':
					if (getField(tractor.x, tractor.y - 2) === 'wall') {
						setField(tractor.x, tractor.y - 1, 'space')
						setField(tractor.x, tractor.y - 2, 'space')
					}
					tractor.y -= 2
					break
				case 'down':
					if (getField(tractor.x, tractor.y + 2) === 'wall') {
						setField(tractor.x, tractor.y + 1, 'space')
						setField(tractor.x, tractor.y + 2, 'space')
					}
					tractor.y += 2
					break
			}
		}
	}
}


// получить значение из матрицы
function getField (x, y) {
	if (x < 0 || x >= cageCountX || y < 0 || y >= cageCountY) {
		return null
	}

	return map[y][x]
}

// записать значение в матрицу
function setField (x, y, value) {
	if (x < 0 || x >= cageCountX || y < 0 || y >= cageCountY) {
		return null
	}

	map[y][x] = value
}