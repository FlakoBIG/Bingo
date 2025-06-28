document.addEventListener('DOMContentLoaded', () => {
const cardsContainer = document.getElementById('cardsContainer');
const addCardBtn = document.getElementById('addCardBtn');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const callNumberBtn = document.getElementById('callNumberBtn');
const calledNumberInput = document.getElementById('calledNumber');
const modalDelete = document.getElementById('modalDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const modalReset = document.getElementById('modalReset');
const confirmResetBtn = document.getElementById('confirmReset');
const cancelResetBtn = document.getElementById('cancelReset');
const modalWin = document.getElementById('modalWin');
const closeWinBtn = document.getElementById('closeWin');

let history = [], future = [], cardToDelete = null;
let pattern = Array.from({ length: 5 }, () => Array(5).fill(false));

function pushHistory(action) { history.push(action); future = []; updateUndoRedo(); }
function updateUndoRedo() { undoBtn.disabled = !history.length; redoBtn.disabled = !future.length; }

function generateCardNumbers() {
const ranges = [{ start:1,end:15},{start:16,end:30},{start:31,end:45},{start:46,end:60},{start:61,end:75 }];
return ranges.map(r => {
const nums = [];
while(nums.length<5){const n=Math.floor(Math.random()*(r.end-r.start+1))+r.start; if(!nums.includes(n)) nums.push(n);} return nums;
});
}

function createCard() {
const matrix = generateCardNumbers();
const cardDiv = document.createElement('div'); cardDiv.className='card';
const table = document.createElement('table');
const header = document.createElement('tr'); ['B','I','N','G','O'].forEach(l=>{const th=document.createElement('th'); th.textContent=l; header.appendChild(th);}); table.appendChild(header);
for(let r=0;r<5;r++){ const tr=document.createElement('tr'); for(let c=0;c<5;c++){ const td=document.createElement('td'); if(r===2&&c===2){td.textContent='FREE'; td.classList.add('marked');} else {td.textContent=matrix[c][r]; td.contentEditable=true;} tr.appendChild(td);} table.appendChild(tr);} cardDiv.appendChild(table);
const removeBtn=document.createElement('button'); removeBtn.textContent='Eliminar'; removeBtn.className='remove-btn'; removeBtn.onclick=()=>{ cardToDelete=cardDiv; modalDelete.style.display='flex'; };
cardDiv.appendChild(removeBtn); cardsContainer.appendChild(cardDiv);
pushHistory({ undo:()=>cardDiv.remove(), redo:()=>cardsContainer.appendChild(cardDiv) });
}

function renderPattern() { patternGrid.innerHTML=''; for(let r=0;r<5;r++){ for(let c=0;c<5;c++){ const cell=document.createElement('div'); cell.className='pattern-cell'+(pattern[r][c]?' selected':''); cell.onclick=()=>(pattern[r][c]=!pattern[r][c],renderPattern()); patternGrid.appendChild(cell);} } }

clearPatternBtn.onclick=()=>{ pattern=pattern.map(row=>row.map(()=>false)); renderPattern(); };

function checkWin(cardDiv){ const cells=cardDiv.querySelectorAll('td'); for(let r=0;r<5;r++){ for(let c=0;c<5;c++){ if(pattern[r][c]){ const idx=r*5+c; if(!cells[idx].classList.contains('marked')) return false; } } } return true; }
function showWinModal(){ modalWin.style.display='flex'; }
closeWinBtn.onclick=()=>{ modalWin.style.display='none'; };

function callNumber() {
  const num = parseInt(calledNumberInput.value, 10);
  if (isNaN(num)) return;

  // Marcamos las casillas correspondientes
  const marked = [];
  document.querySelectorAll('.card td').forEach(td => {
    if (td.textContent == num && !td.classList.contains('marked')) {
      td.classList.add('marked');
      marked.push(td);
    }
  });
  if (marked.length) {
    pushHistory({
      undo: () => marked.forEach(td => td.classList.remove('marked')),
      redo: () => marked.forEach(td => td.classList.add('marked'))
    });
  }
  calledNumberInput.value = '';

  // **Nuevo chequeo**: ¿hay al menos una casilla de patrón activa?
  const hasAnyPattern = pattern.some(row => row.some(cell => cell));
  if (!hasAnyPattern) {
    // Si no hay ningún cuadrado seleccionado en el patrón, NO comprobamos victoria
    return;
  }

  // Ahora sí, comprobamos victoria en cada cartón
  document.querySelectorAll('.card').forEach(card => {
    if (checkWin(card)) {
      showWinModal();
    }
  });
}

resetBtn.onclick=()=>{ modalReset.style.display='flex'; };
confirmResetBtn.onclick=()=>{
const marked=Array.from(document.querySelectorAll('.card td.marked')).filter(td=>td.textContent!=='FREE');
marked.forEach(td=>td.classList.remove('marked'));
pushHistory({ undo:()=>marked.forEach(td=>td.classList.add('marked')), redo:()=>marked.forEach(td=>td.classList.remove('marked')) });
modalReset.style.display='none';
};
cancelResetBtn.onclick=()=>{ modalReset.style.display='none'; };

confirmDeleteBtn.onclick=()=>{
const parent=cardToDelete.parentNode; const idx=Array.prototype.indexOf.call(parent.children,cardToDelete);
cardToDelete.remove(); pushHistory({ undo:()=>parent.insertBefore(cardToDelete,parent.children[idx]||null), redo:()=>cardToDelete.remove() });
modalDelete.style.display='none'; cardToDelete=null;
};
cancelDeleteBtn.onclick=()=>{ modalDelete.style.display='none'; cardToDelete=null; };

undoBtn.onclick=()=>{ const action=history.pop(); if(!action) return; action.undo(); future.push(action); updateUndoRedo(); };
redoBtn.onclick=()=>{ const action=future.pop(); if(!action) return; action.redo(); history.push(action); updateUndoRedo(); };

addCardBtn.addEventListener('click',createCard);
callNumberBtn.addEventListener('click',callNumber);
renderPattern(); updateUndoRedo();
});