/**Array of Listnames for the Tasks Status,Moving and Timer null Value */
let moving = null;
let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
let timer = null;
const mainContent = document.querySelector('.main-content');
const boardLists = document.getElementById('board-lists');

/**Eventlistener for the Mousemove (Desktop Version)*/
document.addEventListener('mousemove', function (e) {
    if (moving) {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
});

/**Eventlistener for the Touchmove (Mobile Version)*/
document.addEventListener('touchmove', function (e) {
    if (moving) {
        e.preventDefault();
        const touch = e.touches[0];
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';

        scrollToPoint(e, touch);
    }
}, { passive: false });

/**This function scrolls the div .board-lists according to the touch*/
function scrollToPoint(e, touch) {
    const elementsBottom = getElementsFromPoint(e);
    if (elementsBottom.length > 0) {
        const rect = boardLists.getBoundingClientRect();
        const scrollThreshold = 30; 
        const scrollSpeed = 10; 
        if (touch.clientY - rect.top < scrollThreshold) { 
            boardLists.scrollTop -= scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop - 10;}
        if (touch.clientY + rect.top > rect.height - scrollThreshold) { 
            boardLists.scrollTop += scrollSpeed;
            mainContent.scrollTop = boardLists.scrollTop;}}
}

/**This function resets timeout*/
function cancel() {
    clearTimeout(timer);
    timer = null;
}

/**This function checks the user touch is long pressed*/
function onTouch(event, id) {
    timer = setTimeout(() => longPressed(event, id), 500);
}

/**This function starts the longpressed routines*/
function longPressed(event, id) {
    pickup(event);
    startDragging(id);
    removeDragging(id);
}

/**This function checks and save the pressed element*/
function pickup(event) {
    if (!event.target.classList.contains('task-card')) {
        for (moving = event.target.parentElement; !moving.classList.contains('task-card'); 
            moving = moving.parentElement);
    } else {
    moving = event.target;}
    moving.dataset.originalHeight = moving.clientHeight + "px"; 
    moving.dataset.originalWidth = moving.clientWidth + "px";
    moving.style.height = moving.clientHeight + "px"; 
    moving.style.width = moving.clientWidth + "px";
    moving.style.position = 'fixed';
    moving.style.zIndex = '10';
    setPickUpPosition(event, moving);
}

/**This function sets the position of the picked up element*/
function setPickUpPosition(e, moving) {
    const touch = e.touches[0];
    if (touch) {
        moving.style.left = touch.pageX + 'px';
        moving.style.top = touch.pageY + 'px';
    } else {
        moving.style.left = e.pageX + 'px';
        moving.style.top = e.pageY + 'px';
    }
}

/**This function checks and save the drop zone*/
function move(event) {
  if (!moving) return;
  const p = event.changedTouches ? event.changedTouches[0] : event;
  event.stopImmediatePropagation?.();
  moving.style.left = (p.clientX ?? p.pageX) + 'px';
  moving.style.top  = (p.clientY ?? p.pageY) + 'px';
}
window.move = move; 


/**This function gets the element according to the point*/
function getElementsFromPoint(event) {
    if (event.clientX) {
        return document.elementsFromPoint(event.clientX, event.clientY);
    } else {
        return document.elementsFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
}

/**This function drops the element according to the drop zone*/
function drop(event) {
    if (moving) {
        if (event.currentTarget.classList.contains('list')) {
            let target = getElementsFromPoint(event);
            let targetList = setTargetList(target);
        checkTargetList(targetList, moving);
        }
        removeDragging(moving.id);
        moving = resetElement(moving);
    }
}

/**This function checks and returns the drop zone*/
function setTargetList(target) {
    if (target.at('div.list') != undefined)
        if (target.at('div.list').childNodes[3] != undefined) {
            if (listNames.includes(target.at('div.list').childNodes[3].id)) {
                return target.at('div.list').childNodes[3];
            }
        }

    for (let index = 0; index < target.length; index++) {
        const element = target[index];
        if (listNames.includes(element.id))
            return element;
    }

}

/**This function checks if the list does have the task and drags it*/
function checkTargetList(targetList, moving) {
    if (targetList) {
        if (!targetList.contains(moving)) {
            let list = targetList.className;
            if (listNames.includes(list)) {
                changeList(list);
            }
        }
    }
}

/**This function resets element for the Drop Event*/
function resetElement(moving) {
    if (moving.style) {
        moving.style.left = '';
        moving.style.top = '';
        moving.style.height = '';
        moving.style.width = '';
        moving.style.position = '';
        moving.style.zIndex = '';
    }

    return null;
}

  
/** ================== JOIN BOARD – CARD-EDGE AUTOSCROLL + SAFE DRAG-LOCK ================== */
// let moving = null;
// let listNames = ['to-do', 'in-progress', 'await-feedback', 'done'];
// let timer = null;

// const mainContent = document.querySelector('.main-content');
// const boardLists  = document.getElementById('board-lists'); // bleibt, scrollt aber nicht (overflow:hidden)

// /* -------- Edge-Autoscroll Config (nur Kartenkante steuert Scroll) -------- */
// const EDGE_PX   = 58;   // kleinere Hot-Zone -> reagiert „früher“
// const SPEED_MIN = 12;   // schnelleres Anlaufen
// const SPEED_MAX = 35;   // höheres Topspeed
// let edgeRAF = 0;        // requestAnimationFrame ID
// let edgeVY  = 0;        // aktuelle Scrollgeschwindigkeit (px/frame)

// /* -------- Drag-Lock: blockiert global native Scrolls, lässt unsere Handler laufen -------- */
// let dragShieldEl = null;
// let dragLocked   = false;

// function globalTouchBlocker(e){
//   if (moving) {
//     // Nur native Gesten stoppen – NICHT andere Listener killen
//     e.preventDefault();
//     // KEIN e.stopImmediatePropagation();
//   }
// }
// function lockDrag() {
//   if (dragLocked) return;
//   dragLocked = true;

//   // Body/HTML-Scroll hart sperren
//   document.documentElement.style.overflow = 'hidden';
//   document.body.style.overflow = 'hidden';

//   // native Gesten im Container deaktivieren (wir scrollen per JS)
//   if (mainContent) mainContent.style.touchAction = 'none';

//   // Transparenter Fullscreen-Shield (durchlässig!)
//   dragShieldEl = document.createElement('div');
//   Object.assign(dragShieldEl.style, {
//     position: 'fixed', inset: '0', zIndex: '9998', background: 'transparent', pointerEvents: 'none'
//   });
//   document.body.appendChild(dragShieldEl);

//   // Global native Touch-Scrolls in Capture-Phase verhindern
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

// /* =================== UX-Fixes auf Karten =================== */
// document.addEventListener('contextmenu', (e) => {
//   const card = e.target.closest?.('.task-card');
//   if (card) e.preventDefault();
// }, { passive: false });

// document.addEventListener('dragstart', (e) => {
//   const card = e.target.closest?.('.task-card');
//   if (card) e.preventDefault();
// });

// /* =================== Hilfsfunktionen =================== */
// /** Karte im sichtbaren Bereich von .main-content halten */
// function clampDragToMainContent(x, y) {
//   const rect = mainContent.getBoundingClientRect();
//   const w = moving.offsetWidth;
//   const h = moving.offsetHeight;

//   const minX = rect.left;
//   const maxX = rect.right  - w;
//   const minY = rect.top;
//   const maxY = rect.bottom - h;

//   const clampedX = Math.max(minX, Math.min(maxX, x));
//   const clampedY = Math.max(minY, Math.min(maxY, y));

//   moving.style.left = clampedX + 'px';
//   moving.style.top  = clampedY + 'px';
// }

// /** Elemente an der Position unter Finger/Maus holen */
// function getElementsFromPoint(event) {
//   if (event.clientX) {
//     return document.elementsFromPoint(event.clientX, event.clientY);
//   } else {
//     const t = event.changedTouches[0];
//     return document.elementsFromPoint(t.clientX, t.clientY);
//   }
// }

// /** Autosroll nur anhand der KARTENKANTE (nicht Finger) steuern */
// function updateEdgeAutoScrollByCard() {
//   if (!moving || !mainContent) { stopEdgeAutoScroll(); return; }

//   const cRect = mainContent.getBoundingClientRect();
//   const mRect = moving.getBoundingClientRect();

//   let dir = 0;   // -1 = nach oben scrollen, 1 = nach unten scrollen
//   let depth = 0; // wie tief die Karte in die Zone ragt

//   if (mRect.top < cRect.top + EDGE_PX) {
//     dir = -1;
//     depth = (cRect.top + EDGE_PX) - mRect.top;
//   } else if (mRect.bottom > cRect.bottom - EDGE_PX) {
//     dir = 1;
//     depth = mRect.bottom - (cRect.bottom - EDGE_PX);
//   } else {
//     edgeVY = 0;
//     stopEdgeAutoScroll();
//     return;
//   }

//   // Non-lineares Speed-Mapping + Turbo am Rand
//   const factorLinear = Math.min(1, Math.max(0, depth / EDGE_PX)); // 0..1
//   const factor       = Math.pow(factorLinear, 1.9);               // steilere Kurve
//   let speed = Math.round(SPEED_MIN + (SPEED_MAX - SPEED_MIN) * factor);
//   if (EDGE_PX - depth <= 10) speed = Math.max(speed, SPEED_MAX);  // Turbo in letzten 10px

//   edgeVY = dir * speed;

//   if (!edgeRAF) edgeRAF = requestAnimationFrame(edgeScrollStep);
// }
// function edgeScrollStep() {
//   edgeRAF = 0;
//   if (!moving || !mainContent) return;
//   if (edgeVY !== 0) {
//     mainContent.scrollTop += edgeVY;
//     edgeRAF = requestAnimationFrame(edgeScrollStep);
//   }
// }
// function stopEdgeAutoScroll() {
//   if (edgeRAF) cancelAnimationFrame(edgeRAF);
//   edgeRAF = 0;
//   edgeVY  = 0;
// }

// /* =================== MOVE HANDLER (Desktop & Touch) =================== */
// // Capture:true, damit unsere Handler sicher laufen
// document.addEventListener('mousemove', function (e) {
//   if (moving) {
//     clampDragToMainContent(e.clientX, e.clientY);
//     updateEdgeAutoScrollByCard();
//   }
// }, { capture: true });

// document.addEventListener('touchmove', function (e) {
//   if (!moving) return;
//   e.preventDefault(); // natives Scrollen komplett aus
//   const t = e.touches[0];
//   clampDragToMainContent(t.clientX, t.clientY);
//   updateEdgeAutoScrollByCard();
// }, { capture: true, passive: false });

// /* =================== Timer / Long-Press =================== */
// function cancel() { clearTimeout(timer); timer = null; }
// function onTouch(event, id) { timer = setTimeout(() => longPressed(event, id), 500); }
// function longPressed(event, id) {
//   pickup(event);
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
//   moving.style.zIndex   = '10000';       // über dem Shield
//   moving.style.pointerEvents = 'none';   // Drop-Ziele darunter „treffbar“
//   moving.classList.add('dragging');

//   lockDrag();                            // <<< Hintergrund-Scroll blocken

//   setPickUpPosition(event, moving);
// }
// function setPickUpPosition(e, movingEl) {
//   const t = e.touches ? e.touches[0] : null;
//   if (t) {
//     clampDragToMainContent(t.clientX, t.clientY);
//   } else {
//     clampDragToMainContent(e.clientX ?? e.pageX, e.clientY ?? e.pageY);
//   }
// }
// function move(event) {
//   if (!moving) return;
//   const p = event.changedTouches ? event.changedTouches[0] : event;
//   event.stopImmediatePropagation?.();
//   clampDragToMainContent((p.clientX ?? p.pageX), (p.clientY ?? p.pageY));
//   updateEdgeAutoScrollByCard();
// }
// window.move = move;

// /* =================== Drop =================== */
// function drop(event) {
//   if (!moving) return;

//   stopEdgeAutoScroll();  // AutoScroll stoppen
//   unlockDrag();          // Drag-Lock lösen

//   if (event.currentTarget.classList.contains('list')) {
//     let target = getElementsFromPoint(event);
//     let targetList = setTargetList(target);
//     checkTargetList(targetList, moving);
//   }
//   removeDragging(moving.id);
//   moving.classList.remove('dragging');
//   moving = resetElement(moving);
// }

// /* =================== Ziel-Liste bestimmen / wechseln =================== */
// function setTargetList(target) {
//   if (target.at('div.list') != undefined)
//     if (target.at('div.list').childNodes[3] != undefined) {
//       if (listNames.includes(target.at('div.list').childNodes[3].id)) {
//         return target.at('div.list').childNodes[3];
//       }
//     }
//   for (let index = 0; index < target.length; index++) {
//     const element = target[index];
//     if (listNames.includes(element.id)) return element;
//   }
// }
// function checkTargetList(targetList, movingEl) {
//   if (targetList && !targetList.contains(movingEl)) {
//     let list = targetList.className;
//     if (listNames.includes(list)) changeList(list);
//   }
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
//   }
//   return null;
// }

// // Desktop: Karte greifen
// document.addEventListener('mousedown', function onMouseDown(e){
//   const card = e.target.closest?.('.task-card');
//   if (!card) return;
//   e.preventDefault();                  // Browser-Drag/Selection verhindern
//   pickup(e);                           // vorhandene Logik wiederverwenden
// }, { capture:true });

// // Desktop: Karte loslassen
// document.addEventListener('mouseup', function onMouseUp(e){
//   if (!moving) return;
//   drop(e);                             // vorhandene Drop-Logik nutzen
// }, { capture:true });

// document.addEventListener('mousemove', function (e) {
//   if (moving) {
//     clampDragToMainContent(e.clientX, e.clientY);
//     updateEdgeAutoScrollByCard();
//   }
// }, { capture:true });

// function drop(event) {
//   if (!moving) return;

//   stopEdgeAutoScroll();

//   // Ziel immer über Hit-Test bestimmen – funktioniert für Maus & Touch
//   let target = getElementsFromPoint(event);
//   let targetList = setTargetList(target);
//   checkTargetList(targetList, moving);

//   removeDragging(moving.id);
//   moving.classList.remove('dragging');
//   moving = resetElement(moving);
// }





