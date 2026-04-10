// VenueFlow Application Logic

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const bottomNav = document.getElementById('bottom-navigation');
const notificationFeed = document.getElementById('notification-feed');
const amenitiesList = document.getElementById('amenities-list');
const stadiumGraphic = document.getElementById('stadium-graphic');
const pushAlert = document.getElementById('push-notification');
const pushTitle = document.getElementById('push-title');
const pushMessage = document.getElementById('push-message');

let currentEvent = null;
let currentTimelineIndex = 0;
let previousViewId = null;
let currentViewId = 'view-events';
let ticketUploaded = false;
let activeIntentContext = null;
let hasCrossedGate = false;
let isEventEnded = false;
let isOrderWindowOpen = false;

window.simulateGateEntry = function() {
    if(hasCrossedGate) return;
    hasCrossedGate = true;
    
    const simBtn = document.getElementById('sim-gate-btn');
    if(simBtn) {
        simBtn.style.opacity = '0.5';
        simBtn.style.pointerEvents = 'none';
        simBtn.disabled = true;
        simBtn.textContent = 'Gate Crossed';
    }
    
    appendBotMessage("📍 **GPS Update: You've crossed Gate B!** Welcome inside. Tap below for the fastest path to your seat.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-B', 'zone-D'); switchView('view-map');">Fastest Path to Seat</button>`);
    
    setTimeout(() => {
         appendBotMessage("I can help you navigate to your seat, find the fastest exit gate, or order food. What would you like to do?");
    }, 1500);
}

window.simulateTimeAdvance = function() {
    isOrderWindowOpen = true;
    const btn = document.getElementById('sim-time-btn');
    if (btn) {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.textContent = 'Orders Open';
    }
    
    const activeTab = document.querySelector('.filter-tabs .tab.active');
    if (activeTab) renderAmenities(activeTab.dataset.type);
    
    appendBotMessage("🕒 **Time Update:** It is now exactly 30 minutes before the event. Food and beverage ordering is now available!");
}

window.simulateEventEnd = function() {
    isEventEnded = true;
    appendBotMessage("The event has concluded! Thank you for using VenueFlow today. The fastest route to the parking lot is via **Exit C**.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-D', 'zone-E'); switchView('view-map');">View Exit Route</button>`);
    
    const activeTab = document.querySelector('.filter-tabs .tab.active');
    if (activeTab) renderAmenities(activeTab.dataset.type);
    
    // Trigger post-event feedback 
    setTimeout(() => {
        document.getElementById('feedback-modal').classList.remove('hidden');
    }, 2000);
}

window.closeApp = function() {
    document.body.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#0f172a; color:#f8fafc; flex-direction:column; gap:20px; font-family: 'Inter', sans-serif;">
            <ion-icon name="power" style="font-size: 48px; color: #4ade80;"></ion-icon>
            <h2>Application Closed</h2>
            <p style="color: #94a3b8; font-size: 14px;">Session data forcefully cleared.</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: rgba(74, 222, 128, 0.15); border: 1px solid #4ade80; color: #4ade80; border-radius: 8px; font-weight: 600; cursor: pointer;">Relaunch Prototype</button>
        </div>
    `;
}

window.handleEventClick = function() {
    if(ticketUploaded) {
        switchView('view-dashboard');
    } else {
        switchView('view-upload');
    }
}

// View Navigation
window.switchView = function(targetId) {
    views.forEach(v => {
        v.classList.add('hidden');
        setTimeout(() => v.classList.remove('active'), 50); // slight delay for animation
    });
    
    // update state tracking for the back button gracefully
    if (currentViewId !== targetId) {
         previousViewId = currentViewId;
    }
    currentViewId = targetId;

    navItems.forEach(n => n.classList.remove('active'));

    const targetView = document.getElementById(targetId);
    if(targetView) {
        targetView.classList.remove('hidden');
        setTimeout(() => targetView.classList.add('active'), 50);
    }

    const activeNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if(activeNav) activeNav.classList.add('active');
}

window.goBack = function() {
    if (previousViewId) {
        switchView(previousViewId);
    } else {
        switchView('view-events');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        switchView(item.dataset.target);
    });
});

// Actual File Upload Handler
window.handleTicketUpload = function(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const uploadZone = document.getElementById('upload-zone');
    const uploadTitle = document.getElementById('upload-title');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    
    // Check for "wrong" ticket (e.g. filename doesn't contain 'ticket')
    const fileName = file.name.toLowerCase();
    if (!fileName.includes('ticket') && !fileName.includes('pass')) {
        const icon = uploadZone.querySelector('ion-icon');
        
        uploadTitle.textContent = 'Invalid Ticket. Please upload correct ticket.';
        uploadTitle.style.color = '#ff6b6b';
        if (icon) {
            icon.setAttribute('name', 'alert-circle-outline');
            icon.style.color = '#ff6b6b';
        }
        
        input.value = ''; // clear the input so they can retry
        
        // Reset the UI back to normal after 3 seconds
        setTimeout(() => {
            uploadTitle.textContent = 'Upload or Scan Ticket';
            uploadTitle.style.color = '';
            if (icon) {
                icon.setAttribute('name', 'qr-code-outline');
                icon.style.color = 'var(--primary)';
            }
        }, 3000);
        
        return; // stop the upload process
    }

    // Hide zone, show loader
    uploadZone.style.opacity = '0.5';
    uploadZone.style.pointerEvents = 'none';
    uploadProgress.classList.remove('hidden');
    
    // Simulate progression
    setTimeout(() => { progressFill.style.width = '100%'; }, 50);
    
    setTimeout(() => {
        // Transition to dashboard
        currentEvent = 'championship';
        ticketUploaded = true;
        bottomNav.classList.remove('hidden');
        switchView('view-dashboard');
        
        setTimeout(() => {
            appendBotMessage("🎫 **Ticket Analyzed Successfully!** Welcome to the VenueFlow Assistant.");
            appendBotMessage("Based on your seat in Section 104, I recommend using **Gate B** for entry as it currently has the lowest wait time.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-outside', 'zone-B'); switchView('view-map'); simulateGateEntry();">Route to Gate B</button>`);
        }, 1000);
        
        // Reset upload view in background
        setTimeout(() => {
            uploadZone.style.opacity = '1';
            uploadZone.style.pointerEvents = 'auto';
            uploadProgress.classList.add('hidden');
            progressFill.style.width = '0%';
            uploadTitle.textContent = 'Upload or Scan Ticket';
            input.value = ''; // clear input
        }, 2000);
    }, 1600);
};

// Push Notifications
function showPush(title, message) {
    pushTitle.textContent = title;
    pushMessage.textContent = message;
    
    pushAlert.classList.remove('hidden');
    setTimeout(() => pushAlert.classList.add('show'), 50);
    
    setTimeout(() => {
        pushAlert.classList.remove('show');
        setTimeout(() => pushAlert.classList.add('hidden'), 500);
    }, 4000);
}

// Conversational Chat Interface
window.handleChatKeyPress = function(e) {
    if(e.key === 'Enter') {
        sendChatMessage();
    }
}

window.sendChatMessage = function() {
    const input = document.getElementById('chat-input-field');
    const text = input.value.trim();
    if(!text) return;
    
    appendUserMessage(text);
    input.value = '';
    
    // Simulate thinking delay
    setTimeout(() => {
        handleUserQuery(text.toLowerCase());
    }, 600);
}

function appendUserMessage(text) {
    const history = document.getElementById('chat-history');
    history.innerHTML += `
        <div class="chat-message user">
            <div class="bubble">${text}</div>
        </div>
    `;
    history.scrollTop = history.scrollHeight;
}

function appendBotMessage(text, actionHtml = '') {
    const history = document.getElementById('chat-history');
    history.innerHTML += `
        <div class="chat-message bot">
            <div class="bubble">
               ${text}
               ${actionHtml ? `<div>${actionHtml}</div>` : ''}
            </div>
        </div>
    `;
    history.scrollTop = history.scrollHeight;
}

function handleUserQuery(query) {
    function showPush(title, message) {
        // Fallback for any lingering push calls: convert them to bot messages if appropriate, or ignore
        console.log(`Push suppressed: ${title} - ${message}`);
    }

    if (activeIntentContext === 'awaiting_washroom_type') {
        if (query.includes('men') || query.includes('women') || query.includes('unisex')) {
            const typeStr = query.includes('women') ? "Women's" : (query.includes('men') ? "Men's" : "Unisex");
            const restroom = mockAmenities.find(a => a.type === 'restroom' && a.status === 'low') || mockAmenities.find(a => a.type === 'restroom');
            
            appendBotMessage(`Got it. The nearest un-congested ${typeStr} washroom is located at ${restroom.location}. Would you like me to show you the route on the map?`);
            activeIntentContext = 'awaiting_route_confirm';
            return;
        }
        activeIntentContext = null; // Reset and allow query to fall through
    } 
    else if (activeIntentContext === 'awaiting_route_confirm') {
        if (query.includes('yes') || query.includes('sure') || query.includes('ok') || query.includes('map') || query.includes('route')) {
             activeIntentContext = null;
             appendBotMessage("Here is the fastest path to the washrooms.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-D', 'zone-center'); switchView('view-map');">View Washroom Route</button>`);
             return;
        } else if (query.includes('no') || query.includes('nah') || query.includes('cancel')) {
             activeIntentContext = null;
             appendBotMessage("Understood. Let me know if you need anything else!");
             return;
        }
        activeIntentContext = null; // Reset and allow query to fall through
    }
    else if (activeIntentContext === 'awaiting_more_food_confirm') {
        if (query.includes('yes') || query.includes('sure') || query.includes('yeah') || query.includes('ok')) {
             activeIntentContext = null;
             handleUserQuery('food');
             return;
        } else if (query.includes('no') || query.includes('nah') || query.includes('cancel')) {
             activeIntentContext = null;
             appendBotMessage("Alright! Enjoy your food, and let me know if you need anything else to make your event perfect.");
             return;
        }
        activeIntentContext = null; // Reset and allow query to fall through
    }
    else if (activeIntentContext === 'awaiting_entry_redirect_confirm') {
        if (query.includes('yes') || query.includes('sure') || query.includes('yeah') || query.includes('ok') || query.includes('please')) {
             activeIntentContext = null;
             handleUserQuery('entry');
             return;
        } else if (query.includes('no') || query.includes('nah') || query.includes('cancel')) {
             activeIntentContext = null;
             appendBotMessage("Understood! Take your time, and just ask whenever you're ready to head inside.");
             return;
        }
        activeIntentContext = null; // Reset falling through
    }

    if(query.includes('exit') || query.includes('leave') || query.includes('over') || query.includes('end') || query.includes('exist') || query.includes('go out') || query.includes('get out')) {
        if (!hasCrossedGate) {
            appendBotMessage("It looks like you haven't entered the venue yet! Let me know if you need directions to your Entry Gate first.");
            activeIntentContext = 'awaiting_entry_redirect_confirm';
        } else {
            appendBotMessage("The fastest route to the parking lot is via **Exit C**.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-D', 'zone-E'); switchView('view-map');">View Exit Route</button>`);
        }
    }
    else if(query.includes('entry') || query.includes('gate') || query.includes('arrive') || query.includes('directions') || query.includes('route')) {
        appendBotMessage("Based on live congestion data, I suggest using **Gate B** to avoid a 15-minute delay at Gate A.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-outside', 'zone-B'); switchView('view-map');">View Fastest Gate</button>`);
    } 
    else if(query.includes('seat') || query.includes('where')) {
        appendBotMessage("Your ticket is for Section 104, Row G. The fastest route is straight through the main concourse.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-B', 'zone-D'); switchView('view-map');">Route to Section 104</button>`);
    }
    else if(query.includes('washroom') || query.includes('restroom') || query.includes('toilet') || query.includes('bathroom') || query.includes('biobreak') || query.includes('bio break')) {
        if (query.includes('men') || query.includes('women') || query.includes('unisex')) {
            const typeStr = query.includes('women') ? "Women's" : (query.includes('men') ? "Men's" : "Unisex");
            const restroom = mockAmenities.find(a => a.type === 'restroom' && a.status === 'low') || mockAmenities.find(a => a.type === 'restroom');
            
            appendBotMessage(`Got it. The nearest un-congested ${typeStr} washroom is located at ${restroom.location}. Would you like me to show you the route on the map?`);
            activeIntentContext = 'awaiting_route_confirm';
        } else {
            appendBotMessage("Are you looking for Men's, Women's, or Unisex washrooms?");
            activeIntentContext = 'awaiting_washroom_type';
        }
    }
    else if(query.includes('food') || query.includes('hungry') || query.includes('eat') || query.includes('drink')) {
        if (isEventEnded) {
            appendBotMessage("I'm sorry, but all food stalls are physically closed because the event has concluded.");
            return;
        }
        if (!isOrderWindowOpen) {
            appendBotMessage("Food ordering is not available yet. Stalls open exactly 30 minutes before the event starts!");
            return;
        }
        const foodOptions = mockAmenities.filter(a => a.type === 'food');
        const bestVendor = foodOptions.find(a => a.canOrder) || foodOptions[0];
        
        let foodListStr = foodOptions.map(v => {
            let orderBtn = v.canOrder ? `<button class="secondary-btn" style="padding: 4px 10px; font-size: 11px; margin-top: 6px;" onclick='openOrderModal(${JSON.stringify(v)})'>Select ${v.name}</button>` : ``;
            return `• ${v.name} (${v.waitTime}m wait)<br>${orderBtn}`;
        }).join('<br><br>');
        
        appendBotMessage(`Here are your nearby food options:<br><br>${foodListStr}<br><br>I recommend **${bestVendor.name}** as it has the lowest wait time.`, `<button class="primary-btn timeline-action-btn" onclick='openOrderModal(${JSON.stringify(bestVendor)})'>Quick Order: ${bestVendor.name}</button>`);
    }

    else if(query.includes('no need') || query.includes('not required') || query.includes('not now') || query.includes('nothing') || query.includes('nah') || query.includes('none') || query.includes('thank you') || query.includes('thanks') || query.includes('thx')) {
        appendBotMessage("You're very welcome! I'll be here in the background if you need any assistance later on. Enjoy the event!");
    }
    else {
        if (hasCrossedGate) {
            appendBotMessage("I can help you navigate to your seat, find the fastest exit gate, or order food. What would you like to do?");
        } else {
            appendBotMessage("I can help you navigate to your seat, find the fastest entry/exit gate, or order food. What would you like to do?");
        }
    }
}

// Interacting Progressions mapped to standard chat flow
window.simulateEntry = function() {
    document.getElementById('sim-enter-btn').style.display = 'none';
    document.getElementById('sim-exit-btn').style.display = 'block';
    appendBotMessage("Welcome to the Venue! Tap below for the fastest route manually calculated to your seat.", `<button class="primary-btn timeline-action-btn" onclick="drawRoute('zone-B', 'zone-D'); switchView('view-map');">Route to Section 104</button>`);
};

window.showVenueLayout = function() {
    switchView('view-map');
    
    const routeLayer = document.getElementById('route-layer');
    routeLayer.innerHTML = '';
    
    const currentLoc = mockZones.find(z => z.id === 'zone-D');
    
    if (currentLoc) {
        routeLayer.innerHTML = `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; position:absolute; top:0; left:0; pointer-events:none;">
                <circle cx="${currentLoc.x + currentLoc.w/2}" cy="${currentLoc.y + currentLoc.h/2}" r="2" fill="var(--primary)" />
                <circle cx="${currentLoc.x + currentLoc.w/2}" cy="${currentLoc.y + currentLoc.h/2}" r="2" fill="none" stroke="var(--primary)" stroke-width="0.5">
                    <animate attributeName="r" values="2;8" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
    }
};

// Feedback Collection
window.setRating = function(stars) {
    const icons = document.querySelectorAll('.star-rating ion-icon');
    icons.forEach((icon, i) => {
        if(i < stars) icon.classList.add('active');
        else icon.classList.remove('active');
    });
}
window.submitFeedback = function() {
    const feedbackBox = document.getElementById('feedback-text');
    if (!feedbackBox.value.trim()) {
        feedbackBox.style.borderColor = "#ff6b6b";
        feedbackBox.placeholder = "Please enter some feedback first...";
        setTimeout(() => {
            feedbackBox.style.borderColor = "var(--glass-border)";
            feedbackBox.placeholder = "Share your thoughts...";
        }, 2500);
        return;
    }
    
    closeFeedbackModal();
    appendBotMessage("✅ **Feedback Submitted**. Thank you for helping us improve!");
    feedbackBox.value = ''; // Reset for next time
}
window.closeFeedbackModal = function() {
    document.getElementById('feedback-modal').classList.add('hidden');
}


// Render Map Zones and Routes
function renderMap() {
    stadiumGraphic.innerHTML = '<svg class="route-svg" id="route-layer"></svg>';
    mockZones.forEach(zone => {
        const el = document.createElement('div');
        el.className = `map-zone ${zone.density}`;
        el.id = `map-${zone.id}`;
        el.style.left = `${zone.x}%`;
        el.style.top = `${zone.y}%`;
        el.style.width = `${zone.w}%`;
        el.style.height = `${zone.h}%`;
        el.textContent = zone.label;
        stadiumGraphic.appendChild(el);
    });
}

window.drawRoute = function(startZoneId, endZoneId) {
    const routeLayer = document.getElementById('route-layer');
    routeLayer.innerHTML = ''; // clear existing route
    
    const start = mockZones.find(z => z.id === startZoneId);
    const end = mockZones.find(z => z.id === endZoneId);
    if(!start || !end) return;

    // Use Concourse (zone-C) or center point as a joint to make path look curved/complex rather than straight line
    let midX = 45; let midY = 45; 

    // Convert percentages to roughly matched pixel lines based on 100x100 coord system approx
    // We'll draw a bezier curve or simple 2-line polyline
    const lineHtml = `
      <svg viewBox="0 0 100 100" style="width:100%; height:100%; position:absolute; top:0; left:0; pointer-events:none;">
        <path class="route-path" d="M ${start.x+start.w/2} ${start.y+start.h/2} Q ${midX} ${midY} ${end.x+end.w/2} ${end.y+end.h/2}" />
      </svg>
    `;
    routeLayer.innerHTML = lineHtml;
}

// Render Amenities and Ordering
function renderAmenities(filterType = 'all') {
    amenitiesList.innerHTML = '';
    
    const filtered = filterType === 'all' 
        ? mockAmenities 
        : mockAmenities.filter(a => a.type === filterType);
        
    filtered.sort((a,b) => a.waitTime - b.waitTime).forEach(a => {
        let iconName = 'storefront';
        if(a.type === 'food') iconName = 'fast-food';
        if(a.type === 'restroom') iconName = 'man';
        
        let actions = '';
        if(a.canOrder) {
            if (isEventEnded || !isOrderWindowOpen) {
                let reason = isEventEnded ? "Closed" : "Opens T-30m";
                actions = `<div class="fac-actions"><button class="secondary-btn" style="opacity: 0.5; cursor: not-allowed;" disabled>${reason}</button></div>`;
            } else {
                actions = `<div class="fac-actions"><button class="primary-btn" onclick='openOrderModal(${JSON.stringify(a)})'>Order</button></div>`;
            }
        }

        const el = document.createElement('div');
        el.className = 'facility-card';
        el.innerHTML = `
            <div class="facility-info">
                <div class="fac-icon"><ion-icon name="${iconName}"></ion-icon></div>
                <div class="facility-meta">
                    <h4>${a.name}</h4>
                    <p>${a.location}</p>
                </div>
            </div>
            <div class="wait-time ${a.status}">
                <h3>${a.waitTime}</h3>
                <p>min</p>
            </div>
            ${actions}
        `;
        amenitiesList.appendChild(el);
    });
}

// Order Modal Logic
let currentOrderVendor = null;
let currentOrderQuantities = {};
const orderModal = document.getElementById('order-modal');

window.updateQuantity = function(itemId, change) {
    if(!currentOrderQuantities[itemId]) currentOrderQuantities[itemId] = 0;
    currentOrderQuantities[itemId] = Math.max(0, currentOrderQuantities[itemId] + change);
    document.getElementById(`qty-${itemId}`).innerText = currentOrderQuantities[itemId];
}

window.openOrderModal = function(vendor) {
    if (isEventEnded) {
        alert("The event has concluded. Food stalls are now closed!");
        return;
    }
    if (!isOrderWindowOpen) {
        alert("Food stalls are currently closed. They open 30 minutes before the event begins.");
        return;
    }
    
    currentOrderVendor = vendor;
    currentOrderQuantities = {};
    document.getElementById('order-vendor-name').textContent = vendor.name;
    const menuContainer = document.getElementById('order-menu');
    menuContainer.innerHTML = '';
    
    const deliveryRadio = document.querySelector('input[name="orderType"][value="delivery"]');
    if (deliveryRadio) {
        const pickupRadio = document.querySelector('input[name="orderType"][value="pickup"]');
        if (!hasCrossedGate) {
            deliveryRadio.disabled = true;
            if (pickupRadio) pickupRadio.checked = true;
            deliveryRadio.parentElement.style.opacity = '0.4';
            deliveryRadio.parentElement.title = 'Available only after gate entry';
        } else {
            deliveryRadio.disabled = false;
            deliveryRadio.parentElement.style.opacity = '1';
            deliveryRadio.parentElement.title = '';
        }
    }
    
    if(vendor.menu) {
        vendor.menu.forEach(item => {
            currentOrderQuantities[item.id] = 0;
            menuContainer.innerHTML += `
               <div class="menu-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border);">
                   <div>
                       <h4>${item.name}</h4>
                       <h4 style="color:var(--primary); margin-top: 4px;">$${item.price.toFixed(2)}</h4>
                   </div>
                   <div style="display:flex; align-items:center; gap: 15px; background: var(--bg-card); padding: 5px 12px; border-radius: 12px; border: 1px solid var(--glass-border);">
                       <ion-icon name="remove-circle-outline" style="font-size: 24px; cursor: pointer; color: var(--text-muted);" onclick="updateQuantity('${item.id}', -1)"></ion-icon>
                       <span id="qty-${item.id}" style="font-size: 16px; font-weight: 600; width: 16px; text-align: center;">0</span>
                       <ion-icon name="add-circle-outline" style="font-size: 24px; cursor: pointer; color: var(--primary);" onclick="updateQuantity('${item.id}', 1)"></ion-icon>
                   </div>
               </div>
            `;
        });
    }
    orderModal.classList.remove('hidden');
}

window.closeOrderModal = function() {
    orderModal.classList.add('hidden');
    currentOrderVendor = null;
}

window.submitOrder = function() {
    const selectedRadio = document.querySelector('input[name="orderType"]:checked');
    const isDelivery = selectedRadio ? selectedRadio.value === 'delivery' : false;
    
    if (isDelivery && !hasCrossedGate) {
        alert("In-seat delivery is only available after you have entered the venue.");
        return;
    }
    
    let totalItems = 0;
    let menuDetails = '';
    if(currentOrderVendor && currentOrderVendor.menu) {
        currentOrderVendor.menu.forEach(item => {
            const qty = currentOrderQuantities[item.id] || 0;
            if(qty > 0) {
                totalItems += qty;
                menuDetails += `• ${qty}x ${item.name} ($${(item.price * qty).toFixed(2)})<br>`;
            }
        });
    }
    
    if (totalItems === 0) {
        alert("Please add at least one item to your order.");
        return;
    }
    
    // Cache the vendor details before we nullify them by closing the modal
    const orderedVendorName = currentOrderVendor.name;
    
    closeOrderModal();
    
    switchView('view-dashboard');
    
    const successModal = document.getElementById('order-success-modal');
    const successText = document.getElementById('order-success-text');
    
    if(isDelivery) {
        successText.textContent = `Your food from ${orderedVendorName} will be delivered to your seat in 10-15 mins.`;
    } else {
        successText.textContent = `Your order at ${orderedVendorName} is being prepared. It will be ready for pickup in 5 mins.`;
    }
    
    successModal.classList.remove('hidden');
    
    setTimeout(() => {
        successModal.classList.add('hidden');
        
        // Append a persistent chat receipt with item details
        if(isDelivery) {
            appendBotMessage(`✅ **Order Confirmed!** Your order containing:<br>${menuDetails}<br><br>*It will be delivered to your seat in 10-15 mins.*`);
        } else {
            let targetZone = 'zone-center';
            if (orderedVendorName.includes('Pizza')) targetZone = 'zone-B';
            else if (orderedVendorName.includes('Dog')) targetZone = 'zone-C';
            
            const startZone = hasCrossedGate ? 'zone-D' : 'zone-outside';
            
            appendBotMessage(`✅ **Order Confirmed!** Your order containing:<br>${menuDetails}<br><br>*It is being prepared for pickup at ${orderedVendorName} in 5 mins.*`, `<button class="primary-btn timeline-action-btn" onclick="drawRoute('${startZone}', '${targetZone}'); switchView('view-map');">Route to Vendor</button>`);
        }
        
        setTimeout(() => {
            appendBotMessage("Would you like to order anything else from another stall?");
            activeIntentContext = 'awaiting_more_food_confirm';
        }, 1500);
        
    }, 3500);
}


// Setup Filters
document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderAmenities(e.target.dataset.type);
    });
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    renderAmenities('all');
});
