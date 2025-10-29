// let moving = null;
// let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
// let timer = null;

// const mainContent = document.querySelector('.main-content');
// const boardLists  = document.getElementById('board-lists');

// const EDGE_PX = 90;
// const SPEED_MIN = 35;
// const SPEED_MAX = 50;
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

// /** Prevents native touch gestures while a drag is active. */
// function globalTouchBlocker(e) { if (moving) e.preventDefault(); }

// /** Adds capture-phase touch blockers to the window. */
// function addTouchBlockers() {
//   const opts = { capture: true, passive: false };
//   window.addEventListener('touchstart',  globalTouchBlocker, opts);
//   window.addEventListener('touchmove',   globalTouchBlocker, opts);
//   window.addEventListener('touchend',    globalTouchBlocker, opts);
//   window.addEventListener('touchcancel', globalTouchBlocker, opts);
// }

// /** Removes capture-phase touch blockers from the window. */
// function removeTouchBlockers() {
//   const opts = { capture: true };
//   window.removeEventListener('touchstart',  globalTouchBlocker, opts);
//   window.removeEventListener('touchmove',   globalTouchBlocker, opts);
//   window.removeEventListener('touchend',    globalTouchBlocker, opts);
//   window.removeEventListener('touchcancel', globalTouchBlocker, opts);
// }

// /** Locks page scrolling and input during drag operations. */
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

// /** Unlocks page scrolling and restores input after drag. */
// function unlockDrag() {
//   if (!dragLocked) return;
//   dragLocked = false;
//   document.documentElement.style.overflow = '';
//   document.body.style.overflow = '';
//   if (mainContent) mainContent.style.touchAction = '';
//   if (dragShieldEl) { dragShieldEl.remove(); dragShieldEl = null; }
//   removeTouchBlockers();
// }

// /** Clamps the dragged card within the visible main-content area. */
// function clampDragToMainContent(x, y) {
//   const r = mainContent.getBoundingClientRect();
//   const w = moving.offsetWidth, h = moving.offsetHeight;
//   const cx = Math.max(r.left, Math.min(r.right  - w, x));
//   const cy = Math.max(r.top,  Math.min(r.bottom - h, y));
//   moving.style.left = cx + 'px';
//   moving.style.top  = cy + 'px';
// }

// /** Collects all elements under the current pointer/touch. */
// function getElementsFromPoint(event) {
//   if (event.clientX) return document.elementsFromPoint(event.clientX, event.clientY);
//   const t = event.changedTouches[0];
//   return document.elementsFromPoint(t.clientX, t.clientY);
// }

// /** Computes and applies vertical autoscroll based on card edges. */
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

// /** Advances one animation frame for autoscroll. */
// function edgeScrollStep() {
//   edgeRAF = 0;
//   if (!moving || !mainContent) return;
//   if (edgeVY) { mainContent.scrollTop += edgeVY; edgeRAF = requestAnimationFrame(edgeScrollStep); }
// }

// /** Immediately stops autoscroll and resets state. */
// function stopEdgeAutoScroll() { if (edgeRAF) cancelAnimationFrame(edgeRAF); edgeRAF = 0; edgeVY = 0; }

// /** Marks drag as active and lets pointer events pass through the card. */
// function activateDrag() {
//   if (!moving || dragActive) return;
//   dragActive = true;
//   moving.style.pointerEvents = 'none';
// }

// /** Clears the long-press timer if present. */
// function cancel() { clearTimeout(timer); timer = null; }

// /** Starts long-press detection for touch input. */
// function onTouch(event, id) { timer = setTimeout(() => longPressed(event, id), 500); }

// /** Begins a mobile drag after long-press is detected. */
// function longPressed(event, id) { pickup(event); activateDrag(); startDragging(id); removeDragging(id); }

// /** Initializes drag styles/state for the picked card element. */
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

// /** Positions the picked card at the current pointer location. */
// function setPickUpPosition(e, el) {
//   const t = e.touches ? e.touches[0] : null;
//   if (t) clampDragToMainContent(t.clientX, t.clientY);
//   else   clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
// }

// /** Handles pointer movement while dragging (mouse/touch). */
// function move(event) {
//   if (!moving) return;
//   const p = event.changedTouches ? event.changedTouches[0] : event;
//   event.stopImmediatePropagation?.();
//   if (armedForDrag && !dragActive) activateDrag();
//   clampDragToMainContent((p.clientX ?? p.pageX), (p.clientY ?? p.pageY));
//   updateEdgeAutoScrollByCard();
// }
// window.move = move;

// /** Finalizes drag, determines drop target, and resets visuals. */
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

// /** Resolves the list element under the pointer for dropping. */
// function setTargetList(hit) {
//   for (const el of hit) {
//     const listEl = el.closest?.('.list');
//     if (listEl && listEl.id && listNames.includes(listEl.id)) return listEl;
//     if (el.id && listNames.includes(el.id)) return el;
//   }
//   return null;
// }

// /** Applies a list change when a valid target was hit. */
// function checkTargetList(targetList, movingEl) {
//   if (!targetList || targetList.contains(movingEl)) return;
//   const listId = targetList.id;
//   if (listNames.includes(listId)) changeList(listId);
// }

// /** Removes inline drag styles and returns null to clear state. */
// function resetElement(el) {
//   if (el && el.style) {
//     el.style.left=''; el.style.top=''; el.style.height=''; el.style.width='';
//     el.style.position=''; el.style.zIndex=''; el.style.pointerEvents=''; el.style.transform='';
//   }
//   return null;
// }

// /** Clears drag visuals/flags when click occurred without dragging. */
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

// /** Arms a potential desktop drag on mousedown without starting it. */
// function onMouseDown(e) {
//   const card = e.target.closest?.('.task-card');
//   if (!card) return;
//   pressedCard = card;
//   downX = e.clientX; downY = e.clientY;
//   dragStarted = false;
// }

// /** Starts a desktop drag once movement exceeds threshold. */
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

// /** Drops on mouseup if dragged; otherwise opens card details. */
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

// /** Prevents the context menu from opening on task cards. */
// function onContextMenu(e) { if (e.target.closest?.('.task-card')) e.preventDefault(); }

// /** Prevents native HTML5 dragstart behavior on task cards. */
// function onNativeDragStart(e) { if (e.target.closest?.('.task-card')) e.preventDefault(); }

// /** Main mouse move handler: activates drag and autoscrolls. */
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

// /** Main touch move handler: activates drag and autoscrolls. */
// function onTouchMoveMain(e) {
//   if (!moving) return;
//   e.preventDefault();
//   const t = e.touches[0];
//   if (armedForDrag && !dragActive) activateDrag();
//   clampDragToMainContent(t.clientX, t.clientY);
//   updateEdgeAutoScrollByCard();
// }

// /** Binds all required event listeners for drag and interactions. */
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



/* ===== JOIN BOARD – FAST TIME-BASED AUTOSCROLL + PLACEHOLDER + EMPTY-LIST DROP ===== */

let moving = null;
let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
let timer = null;

const mainContent = document.querySelector('.main-content');
const boardLists  = document.getElementById('board-lists');

/* -------- Scroll-Container erkennen -------- */
let scrollerEl = null;
function isScrollable(el) {
  if (!el) return false;
  const st = getComputedStyle(el);
  return /(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight;
}
function findScrollContainer() {
  if (isScrollable(mainContent)) return mainContent;
  let el = boardLists || mainContent || document.body;
  while (el && el !== document.body && !isScrollable(el)) el = el.parentElement;
  return isScrollable(el) ? el : document.scrollingElement || document.documentElement;
}
scrollerEl = findScrollContainer();

/* -------- ZEITBASIERTES Edge-Autoscroll (sehr zügig) -------- */
const EDGE_PX   = 220;     // große Aktiv-Zone
const SPEED_MIN = 1600;    // px/s
const SPEED_MAX = 9000;    // px/s (sehr schnell am Rand)
let edgeRAF = 0, edgeVY = 0, lastPointerX = 0, lastPointerY = 0, lastTS = 0;
function rememberPointer(x, y){ lastPointerX = x; lastPointerY = y; }
function updateEdgeAutoScrollByPointer() {
  if (!scrollerEl) scrollerEl = findScrollContainer();
  const c = scrollerEl.getBoundingClientRect();
  let dir = 0, depth = 0;

  if (lastPointerY < c.top + EDGE_PX)      { dir = -1; depth = (c.top + EDGE_PX) - lastPointerY; }
  else if (lastPointerY > c.bottom-EDGE_PX){ dir =  1; depth = lastPointerY - (c.bottom - EDGE_PX); }
  else { edgeVY = 0; stopEdgeAutoScroll(); return; }

  const norm = Math.min(1, Math.max(0, depth / EDGE_PX));
  const ramp = Math.pow(norm, 2.35);
  let speed = Math.round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * ramp);
  if (depth >= EDGE_PX - 14) speed = SPEED_MAX; // Snap in äußersten 14 px

  edgeVY = dir * speed; // px/s
  if (!edgeRAF) { lastTS = performance.now(); edgeRAF = requestAnimationFrame(edgeScrollStep); }
}
function edgeScrollStep(ts){
  edgeRAF = 0;
  if (!scrollerEl || !edgeVY) return;
  const dt = Math.max(0, ts - lastTS) / 1000;
  lastTS = ts;
  scrollerEl.scrollTop += edgeVY * dt;
  if (edgeVY) edgeRAF = requestAnimationFrame(edgeScrollStep);
}
function stopEdgeAutoScroll(){ if (edgeRAF) cancelAnimationFrame(edgeRAF); edgeRAF = 0; edgeVY = 0; }

/* -------- Drag-State -------- */
let dragActive=false, armedForDrag=false;
const DRAG_START_PX = 6;
let downX=0, downY=0, pressedCard=null, dragStarted=false;

/* -------- Scroll/Input Lock & Touch-Block -------- */
let dragShieldEl=null, dragLocked=false;
function globalTouchBlocker(e){ if(moving) e.preventDefault(); }
function addTouchBlockers(){
  const o = {capture:true, passive:false};
  window.addEventListener('touchstart',globalTouchBlocker,o);
  window.addEventListener('touchmove',globalTouchBlocker,o);
  window.addEventListener('touchend',globalTouchBlocker,o);
  window.addEventListener('touchcancel',globalTouchBlocker,o);
}
function removeTouchBlockers(){
  const o = {capture:true};
  window.removeEventListener('touchstart',globalTouchBlocker,o);
  window.removeEventListener('touchmove',globalTouchBlocker,o);
  window.removeEventListener('touchend',globalTouchBlocker,o);
  window.removeEventListener('touchcancel',globalTouchBlocker,o);
}
function lockDrag(){
  if (dragLocked) return;
  dragLocked = true;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  if (mainContent) mainContent.style.touchAction = 'none';
  dragShieldEl = document.createElement('div');
  Object.assign(dragShieldEl.style,{position:'fixed',inset:'0',zIndex:'9998',background:'transparent',pointerEvents:'none'});
  document.body.appendChild(dragShieldEl);
  addTouchBlockers();
}
function unlockDrag(){
  if (!dragLocked) return;
  dragLocked = false;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  if (mainContent) mainContent.style.touchAction = '';
  if (dragShieldEl){ dragShieldEl.remove(); dragShieldEl=null; }
  removeTouchBlockers();
}

/* -------- Global Scroll-Spacer (macht immer genug Strecke) -------- */
let scrollSpacerEl = null;
function ensureScrollSpacer(){
  if (!scrollerEl) scrollerEl = findScrollContainer();
  if (scrollSpacerEl) return;
  scrollSpacerEl = document.createElement('div');
  scrollSpacerEl.className = 'drag-scroll-spacer';
  scrollSpacerEl.style.height = '100vh';
  scrollSpacerEl.style.width  = '1px';
  scrollSpacerEl.style.pointerEvents = 'none';
  scrollerEl.appendChild(scrollSpacerEl);
}
function removeScrollSpacer(){
  if (scrollSpacerEl?.parentElement) scrollSpacerEl.parentElement.removeChild(scrollSpacerEl);
  scrollSpacerEl = null;
}

/* -------- Clamp -------- */
function clampDragToMainContent(x,y){
  const ref = scrollerEl?.getBoundingClientRect?.() || mainContent?.getBoundingClientRect?.();
  if (!ref || !moving) return;
  const w=moving.offsetWidth, h=moving.offsetHeight;
  const cx = Math.max(ref.left, Math.min(ref.right  - w, x));
  const cy = Math.max(ref.top,  Math.min(ref.bottom - h, y));
  moving.style.left = cx + 'px';
  moving.style.top  = cy + 'px';
}

/* -------- Utils -------- */
function getElementsFromPoint(event){
  if (event.clientX != null) return document.elementsFromPoint(event.clientX, event.clientY);
  const t = event.changedTouches?.[0];
  return document.elementsFromPoint(t.clientX, t.clientY);
}

/* -------- Aktivieren/Cancel -------- */
function activateDrag(){ if(!moving||dragActive) return; dragActive=true; moving.style.pointerEvents='none'; }
function cancel(){ clearTimeout(timer); timer=null; }
window.cancel = cancel;  // falls HTML noch ontouchend="cancel()" ruft

/* -------- Touch Long-Press + Global Shim für altes HTML -------- */
function onTouchStartDelegated(ev){
  const card = ev.target.closest?.('.task-card'); if (!card) return;
  timer = setTimeout(()=>longPressed(ev), 400);
}
function onTouchEndOrCancelDelegated(){ cancel(); }
function longPressed(ev){
  pickup(ev); activateDrag();
  try{ if(moving?.id) startDragging(moving.id); }catch(_){}
}
window.onTouch = function(ev, id){
  cancel();
  timer = setTimeout(()=>{
    pickup(ev); activateDrag();
    try{ if(id!=null) startDragging(String(id)); }catch(_){}
  }, 400);
};

/* -------- Placeholder (Ursprungsposition stabil) -------- */
let placeholderEl=null, originParent=null, originNextSibling=null;
function createPlaceholder(heightPx){
  const el = document.createElement('div');
  el.className = 'drag-placeholder';
  el.style.height = heightPx;
  el.style.width  = '100%';
  el.style.border = '2px dashed var(--placeholder-border, rgba(0,0,0,0.2))';
  el.style.borderRadius = '12px';
  el.style.boxSizing = 'border-box';
  el.style.background = 'var(--placeholder-bg, transparent)';
  return el;
}
function placeOriginPlaceholder(){
  if (!moving) return;
  originParent = moving.parentElement;
  originNextSibling = moving.nextElementSibling;
  if (!placeholderEl) placeholderEl = createPlaceholder(moving.dataset.originalHeight || (moving.clientHeight + 'px'));
  if (originParent) originParent.insertBefore(placeholderEl, originNextSibling);
}
function removePlaceholder(){
  if (placeholderEl?.parentElement) placeholderEl.parentElement.removeChild(placeholderEl);
  placeholderEl=null; originParent=null; originNextSibling=null;
}

/* -------- Ziel-Liste: Expand + Drop-Pad -------- */
let currentHoverList = null;
let listDropPad = null;

function makeListDroppable(listEl){
  if (!listEl) return;
  listEl.classList.add('list-drop-target');
  const st = listEl.style;
  // temporäre Mindesthöhe, damit man wirklich reinziehen kann
  if (!st.minHeight) st.minHeight = '280px';

  if (!listDropPad) {
    listDropPad = document.createElement('div');
    listDropPad.className = 'list-drop-pad';
    listDropPad.style.height = '24px';
    listDropPad.style.margin = '8px 0';
    listDropPad.style.borderRadius = '8px';
    listDropPad.style.border = '2px dashed var(--placeholder-border, rgba(0,0,0,0.18))';
    listDropPad.style.pointerEvents = 'none';
  }
  if (!listDropPad.parentElement) listEl.appendChild(listDropPad);
}

function clearDroppableState(){
  if (currentHoverList){
    currentHoverList.classList.remove('list-drop-target');
    currentHoverList.style.minHeight = '';
  }
  if (listDropPad?.parentElement) listDropPad.parentElement.removeChild(listDropPad);
  currentHoverList = null;
}

function setTargetList(hit){
  for (const el of hit) {
    const listEl = el.closest?.('.list');
    if (listEl && listEl.id && listNames.includes(listEl.id)) return listEl;
    if (el.id && listNames.includes(el.id)) return el;
  }
  return null;
}

function checkTargetList(targetList, movingEl){
  if (!targetList || targetList.contains(movingEl)) return;
  const listId = targetList.id;
  if (listNames.includes(listId)) { try{ changeList(listId); }catch(_){} }
}

/* -------- Pickup / Positionierung -------- */
function pickup(event){
  // Karte finden
  if (!event.target.classList.contains('task-card')){
    for (moving = event.target.parentElement; moving && !moving.classList.contains('task-card'); moving = moving.parentElement);
  } else { moving = event.target; }
  if (!moving) return;

  const h = moving.clientHeight + "px";
  const w = moving.clientWidth  + "px";
  moving.dataset.originalHeight = h;
  moving.dataset.originalWidth  = w;

  placeOriginPlaceholder();
  ensureScrollSpacer(); // immer genug Scrollhöhe während Drag

  moving.style.height   = h;
  moving.style.width    = w;
  moving.style.position = 'fixed';
  moving.style.zIndex   = '10000';
  moving.classList.add('dragging');
  moving.style.pointerEvents = 'none';

  lockDrag();
  armedForDrag = true;
  setPickUpPosition(event, moving);

  const t = event.touches?.[0];
  rememberPointer(t ? t.clientX : (event.clientX ?? event.pageX),
                  t ? t.clientY : (event.clientY ?? event.pageY));
}

function setPickUpPosition(e, el){
  const t = e.touches ? e.touches[0] : null;
  if (t) clampDragToMainContent(t.clientX, t.clientY);
  else   clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
}

/* -------- Move / Drop -------- */
function move(event){
  if (!moving) return;
  const p = event.changedTouches ? event.changedTouches[0] : event;
  event.stopImmediatePropagation?.();
  if (armedForDrag && !dragActive) activateDrag();

  const cx = (p.clientX ?? p.pageX);
  const cy = (p.clientY ?? p.pageY);
  clampDragToMainContent(cx, cy);
  rememberPointer(cx, cy);
  updateEdgeAutoScrollByPointer();

  // Ziel-Liste ermitteln & droppbar machen
  const targetList = setTargetList(getElementsFromPoint(event));
  if (targetList !== currentHoverList){
    clearDroppableState();
    currentHoverList = targetList;
    if (currentHoverList) makeListDroppable(currentHoverList);
  }
}
window.move = move;

function drop(event){
  if (!moving) return;
  stopEdgeAutoScroll();
  unlockDrag();

  const target = getElementsFromPoint(event);
  const list   = setTargetList(target);
  checkTargetList(list, moving);

  try{ if (moving?.id) removeDragging(moving.id); }catch(_){}
  moving.classList.remove('dragging');
  if (moving?.style) moving.style.transform = '';

  clearDroppableState();
  removePlaceholder();
  removeScrollSpacer();
  moving = resetElement(moving);
  dragActive=false; armedForDrag=false;
}

/* -------- Reset / Abbruch -------- */
function resetElement(el){
  if (el?.style){
    el.style.left=''; el.style.top=''; el.style.height=''; el.style.width='';
    el.style.position=''; el.style.zIndex=''; el.style.pointerEvents=''; el.style.transform='';
  }
  return null;
}
function resetDragVisuals(){
  stopEdgeAutoScroll();
  unlockDrag();
  if (moving){
    moving.classList.remove('dragging');
    if (moving.style) moving.style.transform = '';
    moving = resetElement(moving);
  }
  clearDroppableState();
  removePlaceholder();
  removeScrollSpacer();
  dragActive=false; armedForDrag=false; dragStarted=false;
  cancel();
}

/* -------- Desktop Drag-Arming -------- */
function onMouseDown(e){
  const card = e.target.closest?.('.task-card');
  if (!card) return;
  pressedCard = card; downX = e.clientX; downY = e.clientY; dragStarted=false;
}
function onMouseMoveDesk(e){
  if (moving || !pressedCard) return;
  const dx = Math.abs(e.clientX - downX), dy = Math.abs(e.clientY - downY);
  if (dx > DRAG_START_PX || dy > DRAG_START_PX){
    pickup(e); activateDrag();
    try{ if (pressedCard?.id) startDragging(pressedCard.id); }catch(_){}
    dragStarted = true;
  }
}
function onMouseUp(e){
  if (moving && dragStarted){ drop(e); pressedCard=null; dragStarted=false; return; }
  resetDragVisuals();
  if (pressedCard){
    const idx = Number(pressedCard.id);
    if (Number.isFinite(idx)) { try{ showOverlayDetailsTask(idx); }catch(_){} }
  }
  pressedCard=null;
}

/* -------- Störungen verhindern -------- */
function onContextMenu(e){ if (e.target.closest?.('.task-card')) e.preventDefault(); }
function onNativeDragStart(e){ if (e.target.closest?.('.task-card')) e.preventDefault(); }

/* -------- Main-Move (für Autoscroll) -------- */
function onMouseMoveMain(e){
  if (moving && armedForDrag && !dragActive){
    const dx = Math.abs(e.clientX - downX), dy = Math.abs(e.clientY - downY);
    if (dx > DRAG_START_PX || dy > DRAG_START_PX) activateDrag();
  }
  if (moving){
    clampDragToMainContent(e.clientX, e.clientY);
    rememberPointer(e.clientX, e.clientY);
    updateEdgeAutoScrollByPointer();
  }
}
function onTouchMoveMain(e){
  if (!moving) return;
  e.preventDefault();
  const t = e.touches[0];
  if (armedForDrag && !dragActive) activateDrag();
  clampDragToMainContent(t.clientX, t.clientY);
  rememberPointer(t.clientX, t.clientY);
  updateEdgeAutoScrollByPointer();
}

/* -------- Listener -------- */
function bindListeners(){
  document.addEventListener('contextmenu', onContextMenu, { passive:false });
  document.addEventListener('dragstart',   onNativeDragStart);

  document.addEventListener('mousemove', onMouseMoveMain, { capture:true });
  document.addEventListener('touchmove', onTouchMoveMain, { capture:true, passive:false });

  document.addEventListener('mousedown', onMouseDown, { capture:true });
  document.addEventListener('mousemove', onMouseMoveDesk, { capture:true });
  document.addEventListener('mouseup',   onMouseUp, { capture:true });

  document.addEventListener('touchstart', onTouchStartDelegated, { capture:true, passive:true });
  document.addEventListener('touchend',   onTouchEndOrCancelDelegated, { capture:true });
  document.addEventListener('touchcancel',onTouchEndOrCancelDelegated, { capture:true });
}
bindListeners();

/* ===== CSS-Hinweise (optional)
.drag-placeholder { transition: height 120ms ease; }
.task-card.dragging { transform: translateZ(0); }
.list-drop-target { outline: 2px dashed rgba(0,0,0,0.15); outline-offset: 4px; }
.list-drop-pad { transition: height 120ms ease; }
===== */


