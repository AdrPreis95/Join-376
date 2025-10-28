// /** ================== JOIN BOARD – CARD-EDGE AUTOSCROLL + SAFE DRAG-LOCK ================== */
// let moving = null;
// let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
// let timer = null;

// const mainContent = document.querySelector('.main-content');
// const boardLists  = document.getElementById('board-lists');

// /* -------- Edge-Autoscroll Config -------- */
// const EDGE_PX = 58;
// const SPEED_MIN = 12;
// const SPEED_MAX = 35;
// let edgeRAF = 0;
// let edgeVY  = 0;

// /* -------- Drag-State -------- */
// let dragActive   = false;  // wird true, sobald echter Drag läuft
// let armedForDrag = false;  // nach pickup aktiv, bis erste Bewegung/Abbruch

// /* >>> Desktop-Schwelle (Anti-Zittern) <<< */
// const DRAG_START_PX = 6;
// let downX = 0, downY = 0;
// let pressedCard = null;
// let dragStarted = false;

// /* -------- Drag-Lock (blockiert native Scrolls während Drag) -------- */
// let dragShieldEl = null;
// let dragLocked   = false;

// function globalTouchBlocker(e){ if (moving) e.preventDefault(); }
// function lockDrag() {
//   if (dragLocked) return;
//   dragLocked = true;
//   document.documentElement.style.overflow = 'hidden';
//   document.body.style.overflow = 'hidden';
//   if (mainContent) mainContent.style.touchAction = 'none';

//   dragShieldEl = document.createElement('div');
//   Object.assign(dragShieldEl.style, { position:'fixed', inset:'0', zIndex:'9998', background:'transparent', pointerEvents:'none' });
//   document.body.appendChild(dragShieldEl);

//   window.addEventListener('touchstart',  globalTouchBlocker, { capture:true, passive:false });
//   window.addEventListener('touchmove',   globalTouchBlocker, { capture:true, passive:false });
//   window.addEventListener('touchend',    globalTouchBlocker, { capture:true, passive:false });
//   window.addEventListener('touchcancel', globalTouchBlocker, { capture:true, passive:false });
// }
// function unlockDrag() {
//   if (!dragLocked) return;
//   dragLocked = false;
//   document.documentElement.style.overflow = '';
//   document.body.style.overflow = '';
//   if (mainContent) mainContent.style.touchAction = '';
//   if (dragShieldEl) { dragShieldEl.remove(); dragShieldEl = null; }
//   window.removeEventListener('touchstart',  globalTouchBlocker, { capture:true });
//   window.removeEventListener('touchmove',   globalTouchBlocker, { capture:true });
//   window.removeEventListener('touchend',    globalTouchBlocker, { capture:true });
//   window.removeEventListener('touchcancel', globalTouchBlocker, { capture:true });
// }

// /* =================== UX-Fixes =================== */
// document.addEventListener('contextmenu', (e) => { if (e.target.closest?.('.task-card')) e.preventDefault(); }, { passive:false });
// document.addEventListener('dragstart',   (e) => { if (e.target.closest?.('.task-card')) e.preventDefault(); });

// /* =================== Helpers =================== */
// function clampDragToMainContent(x, y) {
//   const rect = mainContent.getBoundingClientRect();
//   const w = moving.offsetWidth, h = moving.offsetHeight;
//   const clampedX = Math.max(rect.left, Math.min(rect.right  - w, x));
//   const clampedY = Math.max(rect.top,  Math.min(rect.bottom - h, y));
//   moving.style.left = clampedX + 'px';
//   moving.style.top  = clampedY + 'px';
// }

// function getElementsFromPoint(event) {
//   if (event.clientX) return document.elementsFromPoint(event.clientX, event.clientY);
//   const t = event.changedTouches[0];
//   return document.elementsFromPoint(t.clientX, t.clientY);
// }

// /* ===== Autoscroll (by card edge) ===== */
// function updateEdgeAutoScrollByCard() {
//   if (!moving || !mainContent) { stopEdgeAutoScroll(); return; }
//   const cRect = mainContent.getBoundingClientRect();
//   const mRect = moving.getBoundingClientRect();
//   let dir = 0, depth = 0;

//   if (mRect.top < cRect.top + EDGE_PX)      { dir = -1; depth = (cRect.top + EDGE_PX) - mRect.top; }
//   else if (mRect.bottom > cRect.bottom - EDGE_PX) { dir =  1; depth = mRect.bottom - (cRect.bottom - EDGE_PX); }
//   else { edgeVY = 0; stopEdgeAutoScroll(); return; }

//   const factor = Math.pow(Math.min(1, Math.max(0, depth / EDGE_PX)), 1.9);
//   let speed = Math.round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * factor);
//   if (EDGE_PX - depth <= 10) speed = Math.max(speed, SPEED_MAX);
//   edgeVY = dir * speed;
//   if (!edgeRAF) edgeRAF = requestAnimationFrame(edgeScrollStep);
// }
// function edgeScrollStep() {
//   edgeRAF = 0;
//   if (!moving || !mainContent) return;
//   if (edgeVY) {
//     mainContent.scrollTop += edgeVY;
//     edgeRAF = requestAnimationFrame(edgeScrollStep);
//   }
// }
// function stopEdgeAutoScroll(){ if (edgeRAF) cancelAnimationFrame(edgeRAF); edgeRAF = 0; edgeVY = 0; }

// /* ===== Drag-Aktivierung (erste Bewegung/Long-Press) ===== */
// function activateDrag() {
//   if (!moving || dragActive) return;
//   dragActive = true;
//   // erst wenn wirklich Drag: Drop-Ziele „treffbar“ machen
//   moving.style.pointerEvents = 'none';
// }

// /* =================== MOVE HANDLER =================== */
// document.addEventListener('mousemove', function (e) {
//   // Desktop: Schwelle prüfen bevor wir Drag aktivieren
//   if (moving && armedForDrag && !dragActive) {
//     const dx = Math.abs(e.clientX - downX);
//     const dy = Math.abs(e.clientY - downY);
//     if (dx > DRAG_START_PX || dy > DRAG_START_PX) activateDrag();
//   }
//   if (moving) {
//     clampDragToMainContent(e.clientX, e.clientY);
//     updateEdgeAutoScrollByCard();
//   }
// }, { capture:true });

// document.addEventListener('touchmove', function (e) {
//   if (!moving) return;
//   e.preventDefault();
//   const t = e.touches[0];
//   if (armedForDrag && !dragActive) activateDrag(); // Long-Press -> sofort Drag
//   clampDragToMainContent(t.clientX, t.clientY);
//   updateEdgeAutoScrollByCard();
// }, { capture:true, passive:false });

// /* =================== Long-Press (Mobile) =================== */
// function cancel(){ clearTimeout(timer); timer = null; }
// function onTouch(event, id){ timer = setTimeout(() => longPressed(event, id), 500); }
// function longPressed(event, id){
//   pickup(event);
//   activateDrag();
//   startDragging(id);
//   removeDragging(id);
// }

// /* =================== Drag Lifecycle =================== */
// function pickup(event) {
//   if (!event.target.classList.contains('task-card')) {
//     for (moving = event.target.parentElement; !moving.classList.contains('task-card'); moving = moving.parentElement);
//   } else {
//     moving = event.target;
//   }
//   moving.dataset.originalHeight = moving.clientHeight + "px";
//   moving.dataset.originalWidth  = moving.clientWidth  + "px";
//   moving.style.height   = moving.clientHeight + "px";
//   moving.style.width    = moving.clientWidth  + "px";
//   moving.style.position = 'fixed';
//   moving.style.zIndex   = '10000';
//   // WICHTIG: KEIN pointerEvents hier!
//   moving.classList.add('dragging');

//   lockDrag();
//   armedForDrag = true;

//   setPickUpPosition(event, moving);
// }
// function setPickUpPosition(e, movingEl) {
//   const t = e.touches ? e.touches[0] : null;
//   if (t) clampDragToMainContent(t.clientX, t.clientY);
//   else   clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
// }
// function move(event) {
//   if (!moving) return;
//   const p = event.changedTouches ? event.changedTouches[0] : event;
//   event.stopImmediatePropagation?.();
//   if (armedForDrag && !dragActive) activateDrag();
//   clampDragToMainContent((p.clientX ?? p.pageX), (p.clientY ?? p.pageY));
//   updateEdgeAutoScrollByCard();
// }
// window.move = move;

// /* =================== Drop =================== */
// function drop(event) {
//   if (!moving) return;

//   stopEdgeAutoScroll();
//   unlockDrag();

//   const target = getElementsFromPoint(event);
//   const targetList = setTargetList(target);
//   checkTargetList(targetList, moving);

//   removeDragging(moving.id);
//   moving.classList.remove('dragging');
//   if (moving && moving.style) moving.style.transform = '';
//   moving = resetElement(moving);

//   dragActive = false;
//   armedForDrag = false;
// }

// /* =================== Ziel-Liste bestimmen / wechseln =================== */
// function setTargetList(hit) {
//   for (const el of hit) {
//     const listEl = el.closest?.('.list');
//     if (listEl && listEl.id && listNames.includes(listEl.id)) return listEl;
//     if (el.id && listNames.includes(el.id)) return el;
//   }
//   return null;
// }
// function checkTargetList(targetList, movingEl) {
//   if (!targetList || targetList.contains(movingEl)) return;
//   const listId = targetList.id;
//   if (listNames.includes(listId)) changeList(listId);
// }

// /* =================== Reset =================== */
// function resetElement(movingEl) {
//   if (movingEl && movingEl.style) {
//     movingEl.style.left = '';
//     movingEl.style.top = '';
//     movingEl.style.height = '';
//     movingEl.style.width = '';
//     movingEl.style.position = '';
//     movingEl.style.zIndex = '';
//     movingEl.style.pointerEvents = '';
//     movingEl.style.transform = '';
//   }
//   return null;
// }

// /* =================== Desktop: Click vs. Drag mit 6px-Schwelle =================== */
// function resetDragVisuals() {
//   stopEdgeAutoScroll();
//   unlockDrag();
//   if (moving) {
//     moving.classList.remove('dragging');
//     if (moving.style) moving.style.transform = '';
//     moving = resetElement(moving);
//   }
//   dragActive = false;
//   armedForDrag = false;
//   dragStarted = false;
// }

// // Desktop: mousedown – NICHT pickup aufrufen
// document.addEventListener('mousedown', function onMouseDown(e){
//   const card = e.target.closest?.('.task-card');
//   if (!card) return;
//   pressedCard = card;
//   downX = e.clientX;
//   downY = e.clientY;
//   dragStarted = false; // erst bei Bewegung starten
// }, { capture:true });

// // Desktop: mousemove – ab Schwelle echtes Drag starten
// document.addEventListener('mousemove', function onMouseMoveDesk(e){
//   if (moving) return;           // aktives Drag wird vom globalen mousemove oben bewegt
//   if (!pressedCard) return;

//   const dx = Math.abs(e.clientX - downX);
//   const dy = Math.abs(e.clientY - downY);
//   if (dx > DRAG_START_PX || dy > DRAG_START_PX) {
//     pickup(e);                          // setzt moving, .dragging, lockDrag()
//     activateDrag();                     // ab jetzt echter Drag
//     startDragging(pressedCard.id);      // Index aus id="2" etc.
//     dragStarted = true;
//   }
// }, { capture:true });

// // Desktop: mouseup – droppen nur bei echtem Drag, sonst Details öffnen
// document.addEventListener('mouseup', function onMouseUp(e){
//   if (moving && dragStarted) {
//     drop(e);                             // echter Drag -> normal droppen
//     pressedCard = null;
//     dragStarted = false;
//     return;
//   }

//   // Kein Drag: alles visuell zurücksetzen und Details öffnen
//   resetDragVisuals();
//   if (pressedCard) {
//     const idx = Number(pressedCard.id);
//     if (Number.isFinite(idx)) { try { showOverlayDetailsTask(idx); } catch (_) {} }
//   }
//   pressedCard = null;
// }, { capture:true });




/* ================== JOIN BOARD – CARD-EDGE AUTOSCROLL + SAFE DRAG-LOCK ================== */
// let moving = null;
// let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
// let timer = null;

// const mainContent = document.querySelector('.main-content');
// const boardLists  = document.getElementById('board-lists');

// const EDGE_PX = 58;
// const SPEED_MIN = 12;
// const SPEED_MAX = 35;
// let edgeRAF = 0;
// let edgeVY  = 0;

// let dragActive   = false;
// let armedForDrag = false;

// const DRAG_START_PX = 6;
// let downX = 0, downY = 0;
// let pressedCard = null;
// let dragStarted = false;

// let dragShieldEl = null;
// let dragLocked   = false;

// /** Prevent native touch gestures while dragging. */
// function globalTouchBlocker(e) {
//   if (moving) e.preventDefault();
// }

// /** Add capture-phase touch blockers. */
// function addTouchBlockers() {
//   const opts = { capture: true, passive: false };
//   window.addEventListener('touchstart',  globalTouchBlocker, opts);
//   window.addEventListener('touchmove',   globalTouchBlocker, opts);
//   window.addEventListener('touchend',    globalTouchBlocker, opts);
//   window.addEventListener('touchcancel', globalTouchBlocker, opts);
// }

// /** Remove capture-phase touch blockers. */
// function removeTouchBlockers() {
//   const opts = { capture: true };
//   window.removeEventListener('touchstart',  globalTouchBlocker, opts);
//   window.removeEventListener('touchmove',   globalTouchBlocker, opts);
//   window.removeEventListener('touchend',    globalTouchBlocker, opts);
//   window.removeEventListener('touchcancel', globalTouchBlocker, opts);
// }

// /** Lock page scrolling during drag. */
// function lockDrag() {
//   if (dragLocked) return;
//   dragLocked = true;
//   document.documentElement.style.overflow = 'hidden';
//   document.body.style.overflow = 'hidden';
//   if (mainContent) mainContent.style.touchAction = 'none';
//   dragShieldEl = document.createElement('div');
//   Object.assign(dragShieldEl.style, { position:'fixed', inset:'0', zIndex:'9998', background:'transparent', pointerEvents:'none' });
//   document.body.appendChild(dragShieldEl);
//   addTouchBlockers();
// }

// /** Unlock page scrolling after drag. */
// function unlockDrag() {
//   if (!dragLocked) return;
//   dragLocked = false;
//   document.documentElement.style.overflow = '';
//   document.body.style.overflow = '';
//   if (mainContent) mainContent.style.touchAction = '';
//   if (dragShieldEl) { dragShieldEl.remove(); dragShieldEl = null; }
//   removeTouchBlockers();
// }

// /** Clamp dragged card to the visible main-content area. */
// function clampDragToMainContent(x, y) {
//   const r = mainContent.getBoundingClientRect();
//   const w = moving.offsetWidth, h = moving.offsetHeight;
//   const cx = Math.max(r.left, Math.min(r.right  - w, x));
//   const cy = Math.max(r.top,  Math.min(r.bottom - h, y));
//   moving.style.left = cx + 'px';
//   moving.style.top  = cy + 'px';
// }

// /** Collect elements under the current pointer/touch. */
// function getElementsFromPoint(event) {
//   if (event.clientX) return document.elementsFromPoint(event.clientX, event.clientY);
//   const t = event.changedTouches[0];
//   return document.elementsFromPoint(t.clientX, t.clientY);
// }

// /** Compute and apply autoscroll based on card edges. */
// function updateEdgeAutoScrollByCard() {
//   if (!moving || !mainContent) { stopEdgeAutoScroll(); return; }
//   const c = mainContent.getBoundingClientRect();
//   const m = moving.getBoundingClientRect();
//   let dir = 0, depth = 0;
//   if (m.top < c.top + EDGE_PX) { dir = -1; depth = (c.top + EDGE_PX) - m.top; }
//   else if (m.bottom > c.bottom - EDGE_PX) { dir = 1; depth = m.bottom - (c.bottom - EDGE_PX); }
//   else { edgeVY = 0; stopEdgeAutoScroll(); return; }
//   const f = Math.pow(Math.min(1, Math.max(0, depth / EDGE_PX)), 1.9);
//   let speed = Math.round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * f);
//   if (EDGE_PX - depth <= 10) speed = Math.max(speed, SPEED_MAX);
//   edgeVY = dir * speed;
//   if (!edgeRAF) edgeRAF = requestAnimationFrame(edgeScrollStep);
// }

// /** One frame of autoscroll. */
// function edgeScrollStep() {
//   edgeRAF = 0;
//   if (!moving || !mainContent) return;
//   if (edgeVY) { mainContent.scrollTop += edgeVY; edgeRAF = requestAnimationFrame(edgeScrollStep); }
// }

// /** Stop autoscroll immediately. */
// function stopEdgeAutoScroll() {
//   if (edgeRAF) cancelAnimationFrame(edgeRAF);
//   edgeRAF = 0; edgeVY = 0;
// }

// /** Mark drag as active and allow drop-hit through the card. */
// function activateDrag() {
//   if (!moving || dragActive) return;
//   dragActive = true;
//   moving.style.pointerEvents = 'none';
// }

// /** Clear long-press timer. */
// function cancel() { clearTimeout(timer); timer = null; }

// /** Start long-press detection on touch. */
// function onTouch(event, id) { timer = setTimeout(() => longPressed(event, id), 500); }

// /** Begin drag after long-press (mobile). */
// function longPressed(event, id) {
//   pickup(event);
//   activateDrag();
//   startDragging(id);
//   removeDragging(id);
// }

// /** Initialize drag for the picked card. */
// function pickup(event) {
//   if (!event.target.classList.contains('task-card')) {
//     for (moving = event.target.parentElement; !moving.classList.contains('task-card'); moving = moving.parentElement);
//   } else { moving = event.target; }
//   moving.dataset.originalHeight = moving.clientHeight + "px";
//   moving.dataset.originalWidth  = moving.clientWidth  + "px";
//   moving.style.height   = moving.clientHeight + "px";
//   moving.style.width    = moving.clientWidth  + "px";
//   moving.style.position = 'fixed';
//   moving.style.zIndex   = '10000';
//   moving.classList.add('dragging');
//   lockDrag();
//   armedForDrag = true;
//   setPickUpPosition(event, moving);
// }

// /** Position the picked card at the initial pointer. */
// function setPickUpPosition(e, el) {
//   const t = e.touches ? e.touches[0] : null;
//   if (t) clampDragToMainContent(t.clientX, t.clientY);
//   else   clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
// }

// /** External move hook (mouse/touch) while dragging. */
// function move(event) {
//   if (!moving) return;
//   const p = event.changedTouches ? event.changedTouches[0] : event;
//   event.stopImmediatePropagation?.();
//   if (armedForDrag && !dragActive) activateDrag();
//   clampDragToMainContent((p.clientX ?? p.pageX), (p.clientY ?? p.pageY));
//   updateEdgeAutoScrollByCard();
// }
// window.move = move;

// /** Finalize drag, drop into list, and reset visuals. */
// function drop(event) {
//   if (!moving) return;
//   stopEdgeAutoScroll();
//   unlockDrag();
//   const target = getElementsFromPoint(event);
//   const list   = setTargetList(target);
//   checkTargetList(list, moving);
//   removeDragging(moving.id);
//   moving.classList.remove('dragging');
//   if (moving && moving.style) moving.style.transform = '';
//   moving = resetElement(moving);
//   dragActive = false; armedForDrag = false;
// }

// /** Resolve the list element under the pointer. */
// function setTargetList(hit) {
//   for (const el of hit) {
//     const listEl = el.closest?.('.list');
//     if (listEl && listEl.id && listNames.includes(listEl.id)) return listEl;
//     if (el.id && listNames.includes(el.id)) return el;
//   }
//   return null;
// }

// /** Apply a list change if target is valid. */
// function checkTargetList(targetList, movingEl) {
//   if (!targetList || targetList.contains(movingEl)) return;
//   const listId = targetList.id;
//   if (listNames.includes(listId)) changeList(listId);
// }

// /** Remove inline drag styles and clear moving. */
// function resetElement(el) {
//   if (el && el.style) {
//     el.style.left=''; el.style.top=''; el.style.height=''; el.style.width='';
//     el.style.position=''; el.style.zIndex=''; el.style.pointerEvents=''; el.style.transform='';
//   }
//   return null;
// }

// /** Clear drag visuals/flags when click (no drag) happens. */
// function resetDragVisuals() {
//   stopEdgeAutoScroll();
//   unlockDrag();
//   if (moving) {
//     moving.classList.remove('dragging');
//     if (moving.style) moving.style.transform = '';
//     moving = resetElement(moving);
//   }
//   dragActive = false; armedForDrag = false; dragStarted = false;
// }

// /** Desktop mousedown: arm potential drag without starting it. */
// function onMouseDown(e) {
//   const card = e.target.closest?.('.task-card');
//   if (!card) return;
//   pressedCard = card;
//   downX = e.clientX; downY = e.clientY;
//   dragStarted = false;
// }

// /** Desktop mousemove: start drag after the threshold. */
// function onMouseMoveDesk(e) {
//   if (moving) return;
//   if (!pressedCard) return;
//   const dx = Math.abs(e.clientX - downX);
//   const dy = Math.abs(e.clientY - downY);
//   if (dx > DRAG_START_PX || dy > DRAG_START_PX) {
//     pickup(e);
//     activateDrag();
//     startDragging(pressedCard.id);
//     dragStarted = true;
//   }
// }

// /** Desktop mouseup: drop if dragged; else open details. */
// function onMouseUp(e) {
//   if (moving && dragStarted) {
//     drop(e);
//     pressedCard = null; dragStarted = false;
//     return;
//   }
//   resetDragVisuals();
//   if (pressedCard) {
//     const idx = Number(pressedCard.id);
//     if (Number.isFinite(idx)) { try { showOverlayDetailsTask(idx); } catch(_) {} }
//   }
//   pressedCard = null;
// }

// /** Block context menu on task cards. */
// function onContextMenu(e) {
//   if (e.target.closest?.('.task-card')) e.preventDefault();
// }

// /** Block native HTML5 dragstart on task cards. */
// function onNativeDragStart(e) {
//   if (e.target.closest?.('.task-card')) e.preventDefault();
// }

// /** Mouse move (main drag loop): clamp and autoscroll. */
// function onMouseMoveMain(e) {
//   if (moving && armedForDrag && !dragActive) {
//     const dx = Math.abs(e.clientX - downX);
//     const dy = Math.abs(e.clientY - downY);
//     if (dx > DRAG_START_PX || dy > DRAG_START_PX) activateDrag();
//   }
//   if (moving) {
//     clampDragToMainContent(e.clientX, e.clientY);
//     updateEdgeAutoScrollByCard();
//   }
// }

// /** Touch move (main drag loop): clamp and autoscroll. */
// function onTouchMoveMain(e) {
//   if (!moving) return;
//   e.preventDefault();
//   const t = e.touches[0];
//   if (armedForDrag && !dragActive) activateDrag();
//   clampDragToMainContent(t.clientX, t.clientY);
//   updateEdgeAutoScrollByCard();
// }

// /** Bind all event listeners (readable, organized). */
// function bindListeners() {
//   document.addEventListener('contextmenu', onContextMenu, { passive: false });
//   document.addEventListener('dragstart',   onNativeDragStart);

//   document.addEventListener('mousemove', onMouseMoveMain, { capture: true });
//   document.addEventListener('touchmove', onTouchMoveMain, { capture: true, passive: false });

//   document.addEventListener('mousedown', onMouseDown, { capture: true });
//   document.addEventListener('mousemove', onMouseMoveDesk, { capture: true });
//   document.addEventListener('mouseup',   onMouseUp, { capture: true });
// }
// bindListeners();


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
