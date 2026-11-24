// 开始页面的人物立绘使用和游戏一致的像素风格。
function drawPortrait(canvas, character) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const block = (color, x, y, width, height) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  // 鞋子、裤腿和身体。
  block('#243744', 19, 60, 10, 17);
  block('#344b58', 35, 60, 10, 17);
  block('#182b38', 16, 75, 15, 5);
  block('#182b38', 34, 75, 15, 5);
  block('#f2ebd8', 17, 78, 13, 2);
  block('#f2ebd8', 35, 78, 13, 2);

  const shirt = character === 'minister' ? '#e99540' : character === 'manager' ? '#f1f1e9' : '#cbd1cf';
  block('#34424a', 19, 32, 26, 30);
  block(shirt, 21, 34, 22, 23);
  block('#46525a', 21, 55, 22, 5);
  block('#edc198', 26, 27, 12, 9);

  if (character === 'manager') {
    for (let y = 34; y < 54; y += 6) {
      for (let x = 21; x < 43; x += 6) {
        if (((x - 21) / 6 + (y - 34) / 6) % 2 === 0) {
          block('#252c31', x, y, Math.min(6, 43 - x), Math.min(6, 55 - y));
        }
      }
    }
  } else if (character === 'ma') {
    block('#e5e8e4', 24, 36, 4, 17);
    block('#a4afae', 39, 36, 3, 18);
  } else {
    block('#ffd18c', 24, 36, 3, 16);
    block('#bd6834', 39, 36, 3, 18);
  }

  // 面部和头发。大老师佩戴蓝色棒球帽。
  block('#4b3730', 19, 10, 26, 16);
  block('#edbd94', 21, 15, 22, 16);
  block('#e2a57d', 19, 20, 3, 6);
  block('#e2a57d', 42, 20, 3, 6);
  block('#27363b', 25, 20, 3, 3);
  block('#27363b', 36, 20, 3, 3);
  block('#ae705b', 29, 27, 7, 2);
  if (character === 'minister') {
    block('#195da5', 18, 8, 27, 7);
    block('#3189d6', 21, 6, 21, 7);
    block('#175195', 36, 13, 14, 3);
    block('#8ed0f5', 25, 8, 10, 2);
  } else {
    block('#3b3331', 19, 10, 26, 6);
    block('#3b3331', 19, 15, 5, 4);
    block('#3b3331', 40, 15, 5, 4);
  }

  // 手臂和各自的标志物。
  if (character === 'manager') {
    block('#f1f1e9', 14, 36, 7, 12);
    block('#edbd94', 12, 46, 8, 6);
    block('#b85c3e', 7, 49, 19, 9);
    block('#663a2c', 9, 57, 15, 3);
    block('#f8c778', 9, 48, 15, 3);
    block('#78a65e', 11, 49, 4, 2);
    block('#f4e5c5', 18, 49, 3, 2);
    block('#f1f1e9', 43, 34, 7, 10);
    block('#edbd94', 40, 37, 8, 6);
    block('#795437', 35, 27, 2, 15);
    block('#a7774d', 38, 27, 2, 15);
  } else if (character === 'ma') {
    block('#cbd1cf', 14, 35, 7, 17);
    block('#edbd94', 12, 49, 8, 6);
    block('#cbd1cf', 43, 35, 7, 14);
    block('#edbd94', 44, 45, 8, 6);
    block('#d99b2d', 49, 39, 10, 15);
    block('#fff3ce', 49, 37, 10, 4);
    block('#9a681d', 59, 42, 2, 8);
    block('#f5d078', 51, 43, 2, 8);
  } else {
    block('#e99540', 14, 35, 7, 17);
    block('#edbd94', 12, 49, 8, 6);
    block('#e99540', 43, 35, 7, 17);
    block('#edbd94', 44, 49, 8, 6);
  }
}

export function drawCharacterPortraits(container) {
  for (const canvas of container.querySelectorAll('[data-portrait]')) {
    drawPortrait(canvas, canvas.dataset.portrait);
  }
}
