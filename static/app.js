const API = '/api/tasks';

let allTasks = [];
let currentFilter = 'all';
let currentPriority = 'all';

// ── Fetch all tasks ──────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch(API);
    allTasks = await res.json();
    renderTasks();
    updateStats();
  } catch (err) {
    showToast('Failed to load tasks');
  }
}

// ── Render filtered task list ────────────────────────
function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');

  let tasks = [...allTasks];

  if (currentFilter === 'pending')   tasks = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') tasks = tasks.filter(t => t.completed);
  if (currentPriority !== 'all')     tasks = tasks.filter(t => t.priority === currentPriority);

  // Remove existing cards
  list.querySelectorAll('.task-card').forEach(el => el.remove());

  if (tasks.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  tasks.forEach(task => {
    const card = buildCard(task);
    list.appendChild(card);
  });
}

function buildCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card' + (task.completed ? ' completed' : '');
  card.dataset.id = task.id;

  const badgeClass = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[task.priority] || 'badge-medium';

  card.innerHTML = `
    <div class="task-check ${task.completed ? 'checked' : ''}" title="Toggle complete"></div>
    <div class="task-body">
      <div class="task-title">${escapeHTML(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="priority-badge ${badgeClass}">${task.priority}</span>
        <span class="task-date">${task.created_at}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn edit-btn" title="Edit">✎</button>
      <button class="icon-btn del" title="Delete">✕</button>
    </div>
  `;

  card.querySelector('.task-check').addEventListener('click', () => toggleComplete(task));
  card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task));
  card.querySelector('.del').addEventListener('click', () => deleteTask(task.id));

  return card;
}

// ── Stats ────────────────────────────────────────────
function updateStats() {
  document.getElementById('total-count').textContent = allTasks.length;
  document.getElementById('done-count').textContent = allTasks.filter(t => t.completed).length;
  document.getElementById('pending-count').textContent = allTasks.filter(t => !t.completed).length;
}

// ── Create task ──────────────────────────────────────
async function createTask(title, description, priority) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority })
    });
    if (!res.ok) throw new Error();
    await loadTasks();
    showToast('Task created!');
  } catch {
    showToast('Failed to create task');
  }
}

// ── Update task ──────────────────────────────────────
async function updateTask(id, data) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    await loadTasks();
  } catch {
    showToast('Failed to update task');
  }
}

// ── Toggle complete ──────────────────────────────────
async function toggleComplete(task) {
  await updateTask(task.id, { completed: !task.completed });
  showToast(task.completed ? 'Marked as pending' : 'Task completed!');
}

// ── Delete task ──────────────────────────────────────
async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await loadTasks();
    showToast('Task deleted');
  } catch {
    showToast('Failed to delete task');
  }
}

// ── Modal ────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-title').textContent = 'New Task';
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('edit-task-id').value = '';
  document.querySelector('input[name=priority][value=medium]').checked = true;
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('task-title').focus();
}

function openEditModal(task) {
  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description;
  document.getElementById('edit-task-id').value = task.id;
  const radio = document.querySelector(`input[name=priority][value=${task.priority}]`);
  if (radio) radio.checked = true;
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('task-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

async function saveTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) { document.getElementById('task-title').focus(); return; }

  const description = document.getElementById('task-desc').value.trim();
  const priority = document.querySelector('input[name=priority]:checked').value;
  const editId = document.getElementById('edit-task-id').value;

  closeModal();

  if (editId) {
    await updateTask(Number(editId), { title, description, priority });
    showToast('Task updated!');
  } else {
    await createTask(title, description, priority);
  }
}

// ── Filters ──────────────────────────────────────────
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

document.querySelectorAll('.filter-btn[data-priority]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-priority]').forEach(b => b.classList.remove('active-p'));
    btn.classList.add('active-p');
    currentPriority = btn.dataset.priority;
    renderTasks();
  });
});

// ── Toast ────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Utility ──────────────────────────────────────────
function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Event listeners ──────────────────────────────────
document.getElementById('open-modal').addEventListener('click', openModal);
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-modal').addEventListener('click', closeModal);
document.getElementById('save-task').addEventListener('click', saveTask);

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.getElementById('modal-overlay').classList.contains('open')) {
    if (e.target.tagName !== 'TEXTAREA') saveTask();
  }
});

// ── Init ─────────────────────────────────────────────
loadTasks();
