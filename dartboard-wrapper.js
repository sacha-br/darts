// Порядок секторов в классическом дартсе
const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const sectorsGroup = document.getElementById('sectors-group');
const numbersGroup = document.getElementById('numbers-group');

const svgNS = 'http://www.w3.org/2000/svg';

// Функция создания дуги сектора (SVG Path)
function createArc(startAngle, endAngle, innerRadius, outerRadius, fill, score, multiplier) {
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;
  
  const x1 = outerRadius * Math.cos(startRad);
  const y1 = outerRadius * Math.sin(startRad);
  const x2 = outerRadius * Math.cos(endRad);
  const y2 = outerRadius * Math.sin(endRad);
  
  const x3 = innerRadius * Math.cos(endRad);
  const y3 = innerRadius * Math.sin(endRad);
  const x4 = innerRadius * Math.cos(startRad);
  const y4 = innerRadius * Math.sin(startRad);
  
  const pathData = [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', fill);
  path.setAttribute('class', 'db-sector');
  path.setAttribute('onclick', `setMult(${multiplier}); addScore(${score});`);
  
  return path;
}
// Генерация всей доски
sectors.forEach((num, i) => {
  const anglePerSector = 18;
  const startAngle = i * anglePerSector - 9;
  const endAngle = startAngle + anglePerSector;
  
  // Цвета чередуются
  const isEven = i % 2 === 0;
  const colorMain = isEven ? 'var(--c-black)' : 'var(--c-white)';
  const colorMod = isEven ? 'var(--c-red)' : 'var(--c-green)';
  // 1. Внешнее кольцо Double (Удвоение)
  sectorsGroup.appendChild(createArc(startAngle, endAngle, 160, 170, colorMod, num, 2));
  
  // 2. Внешняя "одинарная" зона
  sectorsGroup.appendChild(createArc(startAngle, endAngle, 100, 160, colorMain, num, 1));
  
  // 3. Кольцо Triple (Утроение)
  sectorsGroup.appendChild(createArc(startAngle, endAngle, 90, 100, colorMod, num, 3));
  
  // 4. Внутренняя "одинарная" зона
  sectorsGroup.appendChild(createArc(startAngle, endAngle, 24, 90, colorMain, num, 1));
  // 5. Рендеринг чисел по кругу
  const textRad = (startAngle + 9) * Math.PI / 180 - Math.PI / 2;
  const textX = 185 * Math.cos(textRad);
  const textY = 185 * Math.sin(textRad);
  
  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', textX);
  text.setAttribute('y', textY);
  text.setAttribute('class', 'db-text');
  text.textContent = num;
  numbersGroup.appendChild(text);
});