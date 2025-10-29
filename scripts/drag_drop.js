let moving = null;
let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
let timer = null;

const mainContent = document.querySelector('.main-content');
const boardLists  = document.getElementById('board-lists');

const EDGE_PX = 58;
const SPEED_MIN = 12;
const SPEED_MAX = 35;
let edgeRAF = 0;
let edgeVY  = 0;

let dragActive   = false;
let armedForDrag = false;

const DRAG_START_PX = 6;
let downX = 0, downY = 0;
let pressedCard = null;
let dragStarted = false;

let dragShieldEl = null;
let dragLocked   = false;

/** Prevents native touch gestures while a drag is active. */
function globalTouchBlocker(e) { if (moving) e.preventDefault(); }

/** Adds capture-phase touch blockers to the window. */
function addTouchBlockers() {
  const opts = { capture: true, passive: false };
  window.addEventListener('touchstart',  globalTouchBlocker, opts);
  window.addEventListener('touchmove',   globalTouchBlocker, opts);
  window.addEventListener('touchend',    globalTouchBlocker, opts);
  window.addEventListener('touchcancel', globalTouchBlocker, opts);
}

/** Removes capture-phase touch blockers from the window. */
function removeTouchBlockers() {
  const opts = { capture: true };
  window.removeEventListener('touchstart',  globalTouchBlocker, opts);
  window.removeEventListener('touchmove',   globalTouchBlocker, opts);
  window.removeEventListener('touchend',    globalTouchBlocker, opts);
  window.removeEventListener('touchcancel', globalTouchBlocker, opts);
}

/** Locks page scrolling and input during drag operations. */
function lockDrag() {
  if (dragLocked) return;
  dragLocked = true;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  if (mainContent) mainContent.style.touchAction = 'none';
  dragShieldEl = document.createElement('div');
  Object.assign(dragShieldEl.style, { position:'fixed', inset:'0', zIndex:'9998', background:'transparent', pointerEvents:'none' });
  document.body.appendChild(dragShieldEl);
  addTouchBlockers();
}

/** Unlocks page scrolling and restores input after drag. */
function unlockDrag() {
  if (!dragLocked) return;
  dragLocked = false;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  if (mainContent) mainContent.style.touchAction = '';
  if (dragShieldEl) { dragShieldEl.remove(); dragShieldEl = null; }
  removeTouchBlockers();
}

/** Clamps the dragged card within the visible main-content area. */
function clampDragToMainContent(x, y) {
  const r = mainContent.getBoundingClientRect();
  const w = moving.offsetWidth, h = moving.offsetHeight;
  const cx = Math.max(r.left, Math.min(r.right  - w, x));
  const cy = Math.max(r.top,  Math.min(r.bottom - h, y));
  moving.style.left = cx + 'px';
  moving.style.top  = cy + 'px';
}

/** Collects all elements under the current pointer/touch. */
function getElementsFromPoint(event) {
  if (event.clientX) return document.elementsFromPoint(event.clientX, event.clientY);
  const t = event.changedTouches[0];
  return document.elementsFromPoint(t.clientX, t.clientY);
}

/** Computes and applies vertical autoscroll based on card edges. */
function updateEdgeAutoScrollByCard() {
  if (!moving || !mainContent) { stopEdgeAutoScroll(); return; }
  const c = mainContent.getBoundingClientRect();
  const m = moving.getBoundingClientRect();
  let dir = 0, depth = 0;
  if (m.top < c.top + EDGE_PX) { dir = -1; depth = (c.top + EDGE_PX) - m.top; }
  else if (m.bottom > c.bottom - EDGE_PX) { dir = 1; depth = m.bottom - (c.bottom - EDGE_PX); }
  else { edgeVY = 0; stopEdgeAutoScroll(); return; }
  const f = Math.pow(Math.min(1, Math.max(0, depth / EDGE_PX)), 1.9);
  let speed = Math.round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * f);
  if (EDGE_PX - depth <= 10) speed = Math.max(speed, SPEED_MAX);
  edgeVY = dir * speed;
  if (!edgeRAF) edgeRAF = requestAnimationFrame(edgeScrollStep);
}

/** Advances one animation frame for autoscroll. */
function edgeScrollStep() {
  edgeRAF = 0;
  if (!moving || !mainContent) return;
  if (edgeVY) { mainContent.scrollTop += edgeVY; edgeRAF = requestAnimationFrame(edgeScrollStep); }
}

/** Immediately stops autoscroll and resets state. */
function stopEdgeAutoScroll() { if (edgeRAF) cancelAnimationFrame(edgeRAF); edgeRAF = 0; edgeVY = 0; }

/** Marks drag as active and lets pointer events pass through the card. */
function activateDrag() {
  if (!moving || dragActive) return;
  dragActive = true;
  moving.style.pointerEvents = 'none';
}

/** Clears the long-press timer if present. */
function cancel() { clearTimeout(timer); timer = null; }

/** Starts long-press detection for touch input. */
function onTouch(event, id) { timer = setTimeout(() => longPressed(event, id), 500); }

/** Begins a mobile drag after long-press is detected. */
function longPressed(event, id) { pickup(event); activateDrag(); startDragging(id); removeDragging(id); }

/** Initializes drag styles/state for the picked card element. */
function pickup(event) {
  if (!event.target.classList.contains('task-card')) {
    for (moving = event.target.parentElement; !moving.classList.contains('task-card'); moving = moving.parentElement);
  } else { moving = event.target; }
  moving.dataset.originalHeight = moving.clientHeight + "px";
  moving.dataset.originalWidth  = moving.clientWidth  + "px";
  moving.style.height   = moving.clientHeight + "px";
  moving.style.width    = moving.clientWidth  + "px";
  moving.style.position = 'fixed';
  moving.style.zIndex   = '10000';
  moving.classList.add('dragging');
  lockDrag();
  armedForDrag = true;
  setPickUpPosition(event, moving);
}

/** Positions the picked card at the current pointer location. */
function setPickUpPosition(e, el) {
  const t = e.touches ? e.touches[0] : null;
  if (t) clampDragToMainContent(t.clientX, t.clientY);
  else   clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
}

/** Handles pointer movement while dragging (mouse/touch). */
function move(event) {
  if (!moving) return;
  const p = event.changedTouches ? event.changedTouches[0] : event;
  event.stopImmediatePropagation?.();
  if (armedForDrag && !dragActive) activateDrag();
  clampDragToMainContent((p.clientX ?? p.pageX), (p.clientY ?? p.pageY));
  updateEdgeAutoScrollByCard();
}
window.move = move;

/** Finalizes drag, determines drop target, and resets visuals. */
function drop(event) {
  if (!moving) return;
  stopEdgeAutoScroll();
  unlockDrag();
  const target = getElementsFromPoint(event);
  const list   = setTargetList(target);
  checkTargetList(list, moving);
  removeDragging(moving.id);
  moving.classList.remove('dragging');
  if (moving && moving.style) moving.style.transform = '';
  moving = resetElement(moving);
  dragActive = false; armedForDrag = false;
}

/** Resolves the list element under the pointer for dropping. */
function setTargetList(hit) {
  for (const el of hit) {
    const listEl = el.closest?.('.list');
    if (listEl && listEl.id && listNames.includes(listEl.id)) return listEl;
    if (el.id && listNames.includes(el.id)) return el;
  }
  return null;
}

/** Applies a list change when a valid target was hit. */
function checkTargetList(targetList, movingEl) {
  if (!targetList || targetList.contains(movingEl)) return;
  const listId = targetList.id;
  if (listNames.includes(listId)) changeList(listId);
}

/** Removes inline drag styles and returns null to clear state. */
function resetElement(el) {
  if (el && el.style) {
    el.style.left=''; el.style.top=''; el.style.height=''; el.style.width='';
    el.style.position=''; el.style.zIndex=''; el.style.pointerEvents=''; el.style.transform='';
  }
  return null;
}

/** Clears drag visuals/flags when click occurred without dragging. */
function resetDragVisuals() {
  stopEdgeAutoScroll();
  unlockDrag();
  if (moving) {
    moving.classList.remove('dragging');
    if (moving.style) moving.style.transform = '';
    moving = resetElement(moving);
  }
  dragActive = false; armedForDrag = false; dragStarted = false;
}

/** Arms a potential desktop drag on mousedown without starting it. */
function onMouseDown(e) {
  const card = e.target.closest?.('.task-card');
  if (!card) return;
  pressedCard = card;
  downX = e.clientX; downY = e.clientY;
  dragStarted = false;
}

/** Starts a desktop drag once movement exceeds threshold. */
function onMouseMoveDesk(e) {
  if (moving) return;
  if (!pressedCard) return;
  const dx = Math.abs(e.clientX - downX);
  const dy = Math.abs(e.clientY - downY);
  if (dx > DRAG_START_PX || dy > DRAG_START_PX) {
    pickup(e);
    activateDrag();
    startDragging(pressedCard.id);
    dragStarted = true;
  }
}

/** Drops on mouseup if dragged; otherwise opens card details. */
function onMouseUp(e) {
  if (moving && dragStarted) {
    drop(e);
    pressedCard = null; dragStarted = false;
    return;
  }
  resetDragVisuals();
  if (pressedCard) {
    const idx = Number(pressedCard.id);
    if (Number.isFinite(idx)) { try { showOverlayDetailsTask(idx); } catch(_) {} }
  }
  pressedCard = null;
}

/** Prevents the context menu from opening on task cards. */
function onContextMenu(e) { if (e.target.closest?.('.task-card')) e.preventDefault(); }

/** Prevents native HTML5 dragstart behavior on task cards. */
function onNativeDragStart(e) { if (e.target.closest?.('.task-card')) e.preventDefault(); }

/** Main mouse move handler: activates drag and autoscrolls. */
function onMouseMoveMain(e) {
  if (moving && armedForDrag && !dragActive) {
    const dx = Math.abs(e.clientX - downX);
    const dy = Math.abs(e.clientY - downY);
    if (dx > DRAG_START_PX || dy > DRAG_START_PX) activateDrag();
  }
  if (moving) {
    clampDragToMainContent(e.clientX, e.clientY);
    updateEdgeAutoScrollByCard();
  }
}

/** Main touch move handler: activates drag and autoscrolls. */
function onTouchMoveMain(e) {
  if (!moving) return;
  e.preventDefault();
  const t = e.touches[0];
  if (armedForDrag && !dragActive) activateDrag();
  clampDragToMainContent(t.clientX, t.clientY);
  updateEdgeAutoScrollByCard();
}

/** Binds all required event listeners for drag and interactions. */
function bindListeners() {
  document.addEventListener('contextmenu', onContextMenu, { passive: false });
  document.addEventListener('dragstart',   onNativeDragStart);
  document.addEventListener('mousemove', onMouseMoveMain, { capture: true });
  document.addEventListener('touchmove', onTouchMoveMain, { capture: true, passive: false });
  document.addEventListener('mousedown', onMouseDown, { capture: true });
  document.addEventListener('mousemove', onMouseMoveDesk, { capture: true });
  document.addEventListener('mouseup',   onMouseUp, { capture: true });
}
bindListeners();
