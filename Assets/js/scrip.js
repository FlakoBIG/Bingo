document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer    = document.getElementById('cardsContainer');
  const addCardBtn        = document.getElementById('addCardBtn');
  const resetBtn          = document.getElementById('resetBtn');
  const undoBtn           = document.getElementById('undoBtn');
  const redoBtn           = document.getElementById('redoBtn');
  const callNumberBtn     = document.getElementById('callNumberBtn');
  const calledNumberInput = document.getElementById('calledNumber');

  const modalDelete       = document.getElementById('modalDelete');
  const confirmDeleteBtn  = document.getElementById('confirmDelete');
  const cancelDeleteBtn   = document.getElementById('cancelDelete');

  const modalReset        = document.getElementById('modalReset');
  const confirmResetBtn   = document.getElementById('confirmReset');
  const cancelResetBtn    = document.getElementById('cancelReset');

  const modalWin          = document.getElementById('modalWin');
  const closeWinBtn       = document.getElementById('closeWin');

  const patternGrid       = document.getElementById('patternGrid');
  const clearPatternBtn   = document.getElementById('clearPatternBtn');

  // Paleta de colores para headers
  const headerColors = [
    '#e57373','#81c784','#64b5f6','#ffb74d','#ba68c8',
    '#4db6ac','#ffd54f','#aed581','#4fc3f7','#7986cb'
  ];
  let availableColors = [...headerColors];

  let history = [], future = [], cardToDelete = null;
  let pattern = Array.from({ length: 5 }, () => Array(5).fill(false));

  function pushHistory(action) {
    history.push(action);
    future = [];
    updateUndoRedo();
  }
  function updateUndoRedo() {
    undoBtn.disabled = history.length === 0;
    redoBtn.disabled = future.length === 0;
  }

  // Animaciones modales
  function openModal(modalEl) {
    modalEl.style.display = 'flex';
    modalEl.classList.remove('hide');
    modalEl.classList.add('show');
  }
  function closeModal(modalEl) {
    modalEl.classList.remove('show');
    modalEl.classList.add('hide');
    modalEl.addEventListener('animationend', function handler() {
      modalEl.style.display = 'none';
      modalEl.classList.remove('hide');
      modalEl.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function createCard() {
    if (availableColors.length === 0) availableColors = [...headerColors];
    const idx     = Math.floor(Math.random() * availableColors.length);
    const bgColor = availableColors.splice(idx, 1)[0];

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card pop-in';

    const table = document.createElement('table');
    const header = document.createElement('tr');
    ['B','I','N','G','O'].forEach(letter => {
      const th = document.createElement('th');
      th.textContent      = letter;
      th.style.background = bgColor;
      th.style.color      = '#fff';
      header.appendChild(th);
    });
    table.appendChild(header);

    for (let r = 0; r < 5; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < 5; c++) {
        const td = document.createElement('td');
        if (r === 2 && c === 2) {
          td.textContent = 'FREE';
          td.classList.add('marked');
        } else {
          const inp = document.createElement('input');
          inp.type       = 'number';
          inp.min        = '1';
          inp.max        = '100';
          inp.style.width     = '100%';
          inp.style.height    = '100%';
          inp.style.border    = 'none';
          inp.style.textAlign = 'center';
          inp.style.fontSize  = '1.1rem';
          inp.addEventListener('input', () => {
            if (inp.value.length > 2) inp.value = inp.value.slice(0,2);
          });
          td.appendChild(inp);
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    cardDiv.appendChild(table);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Eliminar';
    removeBtn.className   = 'remove-btn';
    removeBtn.onclick     = () => {
      cardToDelete = cardDiv;       // ← guardamos la referencia correcta
      openModal(modalDelete);
    };
    cardDiv.appendChild(removeBtn);

    cardsContainer.appendChild(cardDiv);

    cardDiv.addEventListener('animationend', () => {
      cardDiv.classList.remove('pop-in');
    }, { once: true });

    pushHistory({
      undo: () => cardDiv.remove(),
      redo: () => cardsContainer.appendChild(cardDiv)
    });
  }

  function renderPattern() {
    patternGrid.innerHTML = '';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'pattern-cell' + (pattern[r][c] ? ' selected' : '');
        cell.onclick   = () => {
          pattern[r][c] = !pattern[r][c];
          renderPattern();
        };
        patternGrid.appendChild(cell);
      }
    }
  }
  clearPatternBtn.onclick = () => {
    pattern = pattern.map(row => row.map(() => false));
    renderPattern();
  };

  function checkWin(cardDiv) {
    const cells = cardDiv.querySelectorAll('td');
    return pattern.every((row, r) =>
      row.every((sel, c) => !sel || cells[r*5+c].classList.contains('marked'))
    );
  }

  function showWinModal() {
    openModal(modalWin);
  }
  closeWinBtn.onclick = () => closeModal(modalWin);

  function callNumber() {
    const num = parseInt(calledNumberInput.value, 10);
    if (isNaN(num)) return;

    const marked = [];
    document.querySelectorAll('.card').forEach(card => {
      card.querySelectorAll('td').forEach(td => {
        if (td.classList.contains('marked')) return;
        const inp = td.querySelector('input');
        if (inp && parseInt(inp.value, 10) === num) {
          td.classList.add('marked');
          marked.push(td);
        }
      });
    });

    if (marked.length) {
      pushHistory({
        undo: () => marked.forEach(td => td.classList.remove('marked')),
        redo: () => marked.forEach(td => td.classList.add('marked'))
      });
    }
    calledNumberInput.value = '';

    if (!pattern.flat().some(v => v)) return;
    document.querySelectorAll('.card').forEach(card => {
      if (checkWin(card)) showWinModal();
    });
  }

  // Reset
  resetBtn.onclick        = () => openModal(modalReset);
  confirmResetBtn.onclick = () => {
    const markedCells = Array.from(document.querySelectorAll('.card td.marked'))
      .filter(td => td.textContent !== 'FREE');
    markedCells.forEach(td => td.classList.remove('marked'));
    pushHistory({
      undo: () => markedCells.forEach(td => td.classList.add('marked')),
      redo: () => markedCells.forEach(td => td.classList.remove('marked'))
    });
    closeModal(modalReset);
  };
  cancelResetBtn.onclick  = () => closeModal(modalReset);

  // Delete
  confirmDeleteBtn.onclick = () => {
    const parent = cardToDelete.parentNode;
    const idx    = Array.prototype.indexOf.call(parent.children, cardToDelete);
    cardToDelete.remove();
    pushHistory({
      undo: () => parent.insertBefore(cardToDelete, parent.children[idx] || null),
      redo: () => cardToDelete.remove()
    });
    closeModal(modalDelete);
    cardToDelete = null;
  };
  cancelDeleteBtn.onclick = () => {
    closeModal(modalDelete);
    cardToDelete = null;
  };

  // Undo / Redo
  undoBtn.onclick = () => {
    const action = history.pop();
    if (!action) return;
    action.undo();
    future.push(action);
    updateUndoRedo();
  };
  redoBtn.onclick = () => {
    const action = future.pop();
    if (!action) return;
    action.redo();
    history.push(action);
    updateUndoRedo();
  };

  // Inicialización
  addCardBtn.addEventListener('click', createCard);
  callNumberBtn.addEventListener('click', callNumber);
  renderPattern();
  updateUndoRedo();
});
