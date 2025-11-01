/* Drag state */
let moving=null,timer=null,dragActive=false,armedForDrag=false;
let pressedCard=null,dragStarted=false,downX=0,downY=0;
let edgeRAF=0,edgeVY=0,lastY=0,lastTS=0,edgeEnterTS=0,scrollSpacerEl=null;
const listNames=['to-do','in-progress','await-feedback','done'];
const EDGE_PX=320,EDGE_DEADZONE=140,EDGE_DELAY_MS=120;
const SPEED_MIN=1000,SPEED_MAX=12000,DRAG_START_PX=6;
const INITIAL_CAP=1800,INITIAL_CAP_SEC=1.0,RAMP_EXP=3.0;
const LIST_HOVER_DELAY_MS=180;
let pendingHoverList=null,pendingHoverTimer=null;
let dragShieldEl=null,dragLocked=false,prevUA='',prevCallout='',prevScrollBehavior='';
let placeholderEl=null,originParent=null,originNextSibling=null;
let currentHoverList=null,listDropPad=null;

/**Return scroll container.*/
function getScroller(){
  const mc=document.querySelector('.main-content');
  return mc||document.scrollingElement||document.documentElement;
}

/**Return element rect.*/
function rect(el){return el.getBoundingClientRect();}

/**Return high-res time.*/
function now(){return performance.now();}

/**Smooth last pointer Y.*/
function rememberPointer(x,y){lastY=lastY?(lastY*0.7+y*0.3):y;}

/**Keep bottom spacer in sync.*/
function updateScrollSpacer(){
  const s=getScroller();if(!scrollSpacerEl)return;
  const max=Math.max(0,s.scrollHeight-s.clientHeight);
  const remaining=Math.max(0,max-s.scrollTop);
  const target=Math.min(window.innerHeight*0.6,Math.max(0,320-remaining));
  scrollSpacerEl.style.height=(edgeVY>0&&s.scrollTop<max-1)?(target+'px'):'0px';
}

/**Create spacer once.*/
function ensureScrollSpacer(){
  const s=getScroller();if(scrollSpacerEl)return;
  scrollSpacerEl=document.createElement('div');
  Object.assign(scrollSpacerEl.style,{width:'1px',pointerEvents:'none',height:'0px'});
  s.appendChild(scrollSpacerEl);
}

/**Remove spacer if present.*/
function removeScrollSpacer(){
  if(scrollSpacerEl?.parentElement)scrollSpacerEl.parentElement.removeChild(scrollSpacerEl);
  scrollSpacerEl=null;
}

/**Start edge RAF.*/
function startEdgeLoop(){
  if(!edgeRAF){lastTS=now();edgeRAF=requestAnimationFrame(edgeStep);}
}

/**Stop edge RAF.*/
function stopEdgeLoop(){
  if(edgeRAF)cancelAnimationFrame(edgeRAF);
  edgeRAF=0;edgeVY=0;edgeEnterTS=0;
}

/**Return scroll speed for depth.*/
function speedFor(depthInDead,dwellSec){
  const norm=Math.min(1,Math.max(0,depthInDead/EDGE_DEADZONE));
  const ramp=Math.pow(norm,RAMP_EXP);
  let v=SPEED_MIN+(SPEED_MAX-SPEED_MIN)*ramp;
  if(dwellSec<INITIAL_CAP_SEC)v=Math.min(v,INITIAL_CAP);
  return Math.round(v);
}

/**Return edge direction and depth.*/
function getEdgeInfo(){
  const s=getScroller(),r=rect(s);
  if(lastY<r.top+EDGE_PX)return{dir:-1,depth:(r.top+EDGE_PX)-lastY};
  if(lastY>r.bottom-EDGE_PX)return{dir:1,depth:lastY-(r.bottom-EDGE_PX)};
  return{dir:0,depth:0};
}

/**Update auto scroll from pointer.*/
function updateEdgeAutoScrollByPointer(){
  const {dir,depth}=getEdgeInfo();
  if(!dir){stopEdgeLoop();edgeEnterTS=0;return;}
  const depthInDead=depth-(EDGE_PX-EDGE_DEADZONE);
  if(depthInDead<=0){stopEdgeLoop();edgeEnterTS=0;return;}
  const t=now();if(!edgeEnterTS)edgeEnterTS=t;
  const dwellMs=t-edgeEnterTS;
  if(dwellMs<EDGE_DELAY_MS){
    edgeVY=dir*350;updateScrollSpacer();startEdgeLoop();return;
  }
  const dwellSec=(dwellMs-EDGE_DELAY_MS)/1000;
  edgeVY=dir*speedFor(depthInDead,dwellSec);
  updateScrollSpacer();startEdgeLoop();
}

/**RAF step for scrolling.*/
function edgeStep(ts){
  edgeRAF=0;if(!edgeVY)return;
  const s=getScroller(),dt=Math.max(0,ts-lastTS)/1000;lastTS=ts;
  const max=Math.max(0,s.scrollHeight-s.clientHeight),before=s.scrollTop;
  s.scrollBy(0,edgeVY*dt);updateScrollSpacer();
  const after=s.scrollTop;
  const hitBottom=edgeVY>0&&(after>=max||after===before);
  const hitTop=edgeVY<0&&(after<=0||after===before);
  if(hitBottom||hitTop){stopEdgeLoop();return;}
  edgeRAF=requestAnimationFrame(edgeStep);
}

/**Add global touch blockers.*/
function addTouchBlockers(){
  const o={capture:true,passive:false},f=e=>{if(moving)e.preventDefault();};
  window.addEventListener('touchstart',f,o);
  window.addEventListener('touchmove',f,o);
  window.addEventListener('touchend',f,o);
  window.addEventListener('touchcancel',f,o);
  addTouchBlockers._f=f;
}

/**Remove global touch blockers.*/
function removeTouchBlockers(){
  const f=addTouchBlockers._f;if(!f)return;
  const o={capture:true};
  window.removeEventListener('touchstart',f,o);
  window.removeEventListener('touchmove',f,o);
  window.removeEventListener('touchend',f,o);
  window.removeEventListener('touchcancel',f,o);
}

/**Lock page for drag.*/
function lockDrag(){
  if(dragLocked)return;dragLocked=true;
  const s=getScroller();prevScrollBehavior=s.style.scrollBehavior||'';s.style.scrollBehavior='auto';
  const html=document.documentElement.style;prevUA=html.userSelect||'';prevCallout=html.webkitTouchCallout||'';
  html.userSelect='none';html.webkitTouchCallout='none';
  document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
  dragShieldEl=document.createElement('div');
  Object.assign(dragShieldEl.style,{position:'fixed',inset:'0',zIndex:'9998',background:'transparent',pointerEvents:'none'});
  document.body.appendChild(dragShieldEl);addTouchBlockers();
}

/**Unlock page after drag.*/
function unlockDrag(){
  if(!dragLocked)return;dragLocked=false;
  const s=getScroller();s.style.scrollBehavior=prevScrollBehavior;
  document.documentElement.style.overflow='';document.body.style.overflow='';
  const html=document.documentElement.style;html.userSelect=prevUA;html.webkitTouchCallout=prevCallout;
  dragShieldEl?.remove();dragShieldEl=null;removeTouchBlockers();
}

/**Create placeholder element.*/
function createPlaceholder(h){
  const el=document.createElement('div');
  Object.assign(el.style,{height:h,width:'100%',border:'2px dashed var(--placeholder-border,rgba(0,0,0,0.2))',
    borderRadius:'12px',boxSizing:'border-box',background:'var(--placeholder-bg,transparent)'});
  el.className='drag-placeholder';return el;
}

/**Insert placeholder at origin.*/
function placeOriginPlaceholder(){
  if(!moving)return;
  originParent=moving.parentElement;originNextSibling=moving.nextElementSibling;
  if(!placeholderEl)placeholderEl=createPlaceholder(moving.dataset.originalHeight||(moving.clientHeight+'px'));
  if(originParent)originParent.insertBefore(placeholderEl,originNextSibling);
}

/**Remove placeholder from DOM.*/
function removePlaceholder(){
  if(placeholderEl?.parentElement)placeholderEl.parentElement.removeChild(placeholderEl);
  placeholderEl=null;originParent=null;originNextSibling=null;
}

/**Mark list as droppable.*/
function makeListDroppable(list){
  if(!list)return;list.classList.add('list-drop-target');
  if(!list.style.minHeight)list.style.minHeight='280px';
  if(!listDropPad){
    listDropPad=document.createElement('div');
    listDropPad.className='list-drop-pad';
    Object.assign(listDropPad.style,{height:'24px',margin:'8px 0',borderRadius:'8px',
      border:'2px dashed var(--placeholder-border,rgba(0,0,0,0.18))',pointerEvents:'none'});
  }
  if(!listDropPad.parentElement)list.appendChild(listDropPad);
}

/**Clear droppable styles.*/
function clearDroppableState(){
  if(currentHoverList){
    currentHoverList.classList.remove('list-drop-target');
    currentHoverList.style.minHeight='';
  }
  if(listDropPad?.parentElement)listDropPad.parentElement.removeChild(listDropPad);
  currentHoverList=null;
}

/**Find list under pointer.*/
function setTargetList(els){
  for(const el of els){
    const l=el.closest?.('.list');if(l&&l.id&&listNames.includes(l.id))return l;
    if(el.id&&listNames.includes(el.id))return el;
  }
  return null;
}

/**Change list if valid.*/
function checkTargetList(target,movingEl){
  if(!target||target.contains(movingEl))return;
  const id=target.id;if(listNames.includes(id)){try{changeList(id);}catch(_){ }}
}

/**Delay hover activation.*/
function scheduleHoverList(list){
  if(pendingHoverTimer){clearTimeout(pendingHoverTimer);pendingHoverTimer=null;}
  pendingHoverList=list;if(!list)return;
  pendingHoverTimer=setTimeout(()=>{
    clearDroppableState();currentHoverList=pendingHoverList;
    if(currentHoverList)makeListDroppable(currentHoverList);
    pendingHoverTimer=null;
  },LIST_HOVER_DELAY_MS);
}

/**Cancel delayed hover.*/
function cancelHoverList(){
  if(pendingHoverTimer){clearTimeout(pendingHoverTimer);pendingHoverTimer=null;}
  pendingHoverList=null;
}

/**Return card element upwards.*/
function findCard(el){
  if(el.classList?.contains('task-card'))return el;
  for(let n=el.parentElement;n;n=n.parentElement){if(n.classList?.contains('task-card'))return n;}
  return null;
}

/**Init visual drag element.*/
function initMoving(h,w){
  moving.style.height=h;moving.style.width=w;moving.style.position='fixed';
  moving.style.zIndex='10000';moving.classList.add('dragging');moving.style.pointerEvents='none';
}

/**Clamp dragged card inside scroller.*/
function clampToScroller(x,y){
  const r=rect(getScroller()),w=moving.offsetWidth,h=moving.offsetHeight;
  moving.style.left=Math.max(r.left,Math.min(r.right-w,x))+'px';
  moving.style.top=Math.max(r.top,Math.min(r.bottom-h,y))+'px';
}

/**Start dragging card.*/
function pickup(ev){
  moving=findCard(ev.target);if(!moving)return;
  const h=moving.clientHeight+'px',w=moving.clientWidth+'px';
  moving.dataset.originalHeight=h;moving.dataset.originalWidth=w;
  placeOriginPlaceholder();ensureScrollSpacer();initMoving(h,w);
  lockDrag();armedForDrag=true;setPickUpPosition(ev);
  const t=ev.touches?.[0],x=t?t.clientX:(ev.clientX??ev.pageX),y=t?t.clientY:(ev.clientY??ev.pageY);
  rememberPointer(x,y);
}

/**Position card on pickup.*/
function setPickUpPosition(e){
  const t=e.touches?e.touches[0]:null,x=t?t.clientX:(e.clientX??e.pageX),y=t?t.clientY:(e.clientY??e.pageY);
  clampToScroller(x,y);
}

/**Handle drag move.*/
function move(ev){
  if(!moving)return;
  const p=ev.changedTouches?ev.changedTouches[0]:ev;
  ev.stopImmediatePropagation?.();
  if(armedForDrag&&!dragActive)activateDrag();
  const x=(p.clientX??p.pageX),y=(p.clientY??p.pageY);
  clampToScroller(x,y);rememberPointer(x,y);updateEdgeAutoScrollByPointer();
  const target=setTargetList(document.elementsFromPoint(x,y));
  if(target!==currentHoverList)scheduleHoverList(target);
}

/**Finish drag and drop.*/
function drop(ev){
  if(!moving)return;
  stopEdgeLoop();unlockDrag();
  const p=ev.changedTouches?ev.changedTouches[0]:ev;
  const x=(p.clientX??p.pageX),y=(p.clientY??p.pageY);
  const list=setTargetList(document.elementsFromPoint(x,y));
  checkTargetList(list,moving);
  try{if(moving?.id)removeDragging(moving.id);}catch(_){}
  moving.classList.remove('dragging');moving.style.transform='';
  cancelHoverList();clearDroppableState();removePlaceholder();removeScrollSpacer();
  moving=resetEl(moving);dragActive=false;armedForDrag=false;
}

/**Reset dragged element.*/
function resetEl(el){
  if(el?.style){
    el.style.left='';el.style.top='';el.style.height='';el.style.width='';
    el.style.position='';el.style.zIndex='';el.style.pointerEvents='';el.style.transform='';
  }
  return null;
}

/**Full drag reset.*/
function resetDragVisuals(){
  stopEdgeLoop();unlockDrag();
  if(moving){
    moving.classList.remove('dragging');moving.style.transform='';
    moving=resetEl(moving);
  }
  cancelHoverList();clearDroppableState();removePlaceholder();removeScrollSpacer();
  dragActive=false;armedForDrag=false;dragStarted=false;cancel();
}

/**Mark drag active.*/
function activateDrag(){if(!moving||dragActive)return;dragActive=true;moving.style.pointerEvents='none';}
/**Cancel longpress timer.*/

function cancel(){clearTimeout(timer);timer=null;}

/**Start mouse drag.*/
function onMouseDown(e){
  const c=e.target.closest?.('.task-card');if(!c)return;
  pressedCard=c;downX=e.clientX;downY=e.clientY;dragStarted=false;
}

/**Promote to drag on move.*/
function onMouseMoveDesk(e){
  if(moving||!pressedCard)return;
  const dx=Math.abs(e.clientX-downX),dy=Math.abs(e.clientY-downY);
  if(dx>DRAG_START_PX||dy>DRAG_START_PX){
    pickup(e);activateDrag();
    try{if(pressedCard?.id)startDragging(pressedCard.id);}catch(_){}
    dragStarted=true;
  }
}

/**End mouse drag.*/
function onMouseUp(e){
  if(moving&&dragStarted){drop(e);pressedCard=null;dragStarted=false;return;}
  resetDragVisuals();
  if(pressedCard){
    const idx=Number(pressedCard.id);
    if(Number.isFinite(idx)){try{showOverlayDetailsTask(idx);}catch(_){ }}
  }
  pressedCard=null;
}

/**Move dragged card with mouse.*/
function onMouseMoveMain(e){
  if(moving&&armedForDrag&&!dragActive){
    const dx=Math.abs(e.clientX-downX),dy=Math.abs(e.clientY-downY);
    if(dx>DRAG_START_PX||dy>DRAG_START_PX)activateDrag();
  }
  if(moving){
    clampToScroller(e.clientX,e.clientY);
    rememberPointer(e.clientX,e.clientY);
    updateEdgeAutoScrollByPointer();
  }
}

/**Move dragged card with touch.*/
function onTouchMoveMain(e){
  if(!moving)return;
  e.preventDefault();
  const t=e.touches[0];
  if(armedForDrag&&!dragActive)activateDrag();
  clampToScroller(t.clientX,t.clientY);
  rememberPointer(t.clientX,t.clientY);
  updateEdgeAutoScrollByPointer();
}

/**Prepare touch longpress.*/
function onTouchStartDelegated(ev){
  const c=ev.target.closest?.('.task-card');if(!c)return;
  timer=setTimeout(()=>{longPressed(ev);},400);
}

/**End touch longpress.*/
function onTouchEndOrCancelDelegated(){cancel();}
/**Convert longpress to drag.*/

function longPressed(ev){
  pickup(ev);activateDrag();
  try{if(moving?.id)startDragging(moving.id);}catch(_){}
}

/**External touch entry.*/
window.onTouch=function(ev,id){
  cancel();
  timer=setTimeout(()=>{
    pickup(ev);activateDrag();
    try{if(id!=null)startDragging(String(id));}catch(_){}
  },400);
};

/**Prevent context menu on drag.*/
function onContextMenu(e){
  if(moving||e.target.closest?.('.task-card')){e.preventDefault();e.stopPropagation();}
}

/**Block native HTML drags.*/
function onNativeDragStart(e){if(e.target.closest?.('.task-card'))e.preventDefault();}

/**Bind all drag listeners.*/
function bindListeners(){
  document.addEventListener('contextmenu',onContextMenu,{capture:true});
  document.addEventListener('dragstart',onNativeDragStart);
  document.addEventListener('mousemove',onMouseMoveMain,{capture:true});
  document.addEventListener('touchmove',onTouchMoveMain,{capture:true,passive:false});
  document.addEventListener('mousedown',onMouseDown,{capture:true});
  document.addEventListener('mousemove',onMouseMoveDesk,{capture:true});
  document.addEventListener('mouseup',onMouseUp,{capture:true});
  document.addEventListener('touchstart',onTouchStartDelegated,{capture:true,passive:true});
  document.addEventListener('touchend',onTouchEndOrCancelDelegated,{capture:true});
  document.addEventListener('touchcancel',onTouchEndOrCancelDelegated,{capture:true});
}
bindListeners();
