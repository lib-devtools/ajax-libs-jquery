/* 
/*! This website is protected by copyright.
Developed by Victor Abdo.
To get the source code, please contact on WhatsApp: +212682497757
*/

    let apiOffersData = [];
    let currentApiOffer = null;
    let pendingTimerOffers = {};
    
    const OFFER_TIMER_DURATION = 210000; 
    
    function loadApiOffers() {
        const apiOffersContainer = document.getElementById('api-offers-container');
        apiOffersContainer.innerHTML = `
            <div class="loading will-change">
                <div class="spinner"></div>
                <p>Loading amazing offers for you...</p>
            </div>
        `;
        
        const apiUrl = "https://d1y3y09sav47f5.cloudfront.net/public/offers/feed.php?user_id=511022&api_key=3197b8ec5712836c30c668f82c8c6e4a&s1=&s2=&callback=?";
        
        $.getJSON(apiUrl, function(offers) {
            if (offers && offers.length > 0) {
                apiOffersData = processApiOffers(offers.slice(0, 9));
                renderApiOffers();
            } else {
                showToast("No offers available at the moment. Please try again later.", "info");
                apiOffersContainer.innerHTML = `
                    <div class="offer-card will-change" style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                        <p style="color: var(--text-secondary);">No offers available at the moment. Please check back later!</p>
                    </div>
                `;
            }
        }).fail(function() {
            showToast("Failed to load offers. Please try again.", "error");
            apiOffersContainer.innerHTML = `
                <div class="offer-card will-change" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <p style="color: var(--text-secondary);">Failed to load offers. Please check your connection and try again.</p>
                </div>
            `;
        });
    }


    function processApiOffers(offers) {
        const robuxValues = [32, 30, 24, 19, 13, 13, 17, 12, 12, 10];
        
        return offers.map((offer, index) => {
            const robux = robuxValues[index] || 50;
            const cleanAnchor = (offer.anchor || offer.name || `Offer ${index + 1}`)
                .replace(/&nbsp;/g, ' ')
                .replace(/<[^>]*>/g, '')
                .trim()
                .substring(0, 100);
            const conversion = offer.conversion || "Complete the task to earn Sweeps Coins";
            const thumbnailUrl = getThumbnailUrl(offer);
            
            return {
                id: offer.id,
                anchor: cleanAnchor,
                conversion: conversion,
                url: offer.url || "#",
                robux: robux,
                thumbnail: thumbnailUrl,
                pendingTimer: pendingTimerOffers[offer.id] || null
            };
        });
    }

    function getThumbnailUrl(offer) {
        if (offer.network_icon) {
            return offer.network_icon;
        } else if (offer.thumbnail) {
            return offer.thumbnail;
        } else if (offer.icon) {
            return offer.icon;
        } else if (offer.image_url) {
            return offer.image_url;
        } else {
            return "https://via.placeholder.com/100/6A11CB/FFFFFF?text=Offer";
        }
    }

    function renderApiOffers() {
        const apiOffersContainer = document.getElementById('api-offers-container');
        apiOffersContainer.innerHTML = '';
        
        if (apiOffersData.length === 0) {
            apiOffersContainer.innerHTML = `
                <div class="offer-card will-change" style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <p style="color: var(--text-secondary);">No offers available at the moment. Check back later!</p>
                </div>
            `;
            return;
        }
        
        apiOffersData.forEach((offer, index) => {
            const isCompleted = userData.completedApiOffers.includes(offer.id);
            const hasPendingTimer = offer.pendingTimer && offer.pendingTimer > Date.now();
            
            const offerCard = document.createElement('div');
            offerCard.className = `offer-card will-change ${index < 3 ? 'highlight' : ''}`;
            offerCard.innerHTML = `
                <div class="offer-header">
                    <div class="offer-image">
                        <img src="${offer.thumbnail}" alt="${offer.anchor}" onerror="this.onerror=null; this.src='https://via.placeholder.com/100/6A11CB/FFFFFF?text=Offer';">
                    </div>
                    <div class="offer-content">
                        <div class="offer-title">${offer.anchor}</div>
                        <div class="offer-info">
                            <div class="offer-points">
                                <img src="https://cdn.jsdelivr.net/gh/lib-devtools/crown@main/s.webp" alt="sc" style="width:20px; height:20px;"> ${offer.robux}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="offer-description">${offer.conversion}</div>
                <button class="btn-offer ${isCompleted || hasPendingTimer ? 'btn-disabled' : ''} will-change" 
                        data-offer-id="${offer.id}"
                        ${isCompleted || hasPendingTimer ? 'disabled' : ''}>
                    <i class="fas fa-${isCompleted ? 'check' : hasPendingTimer ? 'clock' : 'play'}"></i>
                    ${isCompleted ? 'Completed' : hasPendingTimer ? 'Processing...' : 'Start Task'}
                </button>
            `;
            
            if (!isCompleted && !hasPendingTimer) {
                offerCard.querySelector('.btn-offer').addEventListener('click', () => handleApiOfferClick(offer));
            }
            apiOffersContainer.appendChild(offerCard);
        });
        
        updateApiOffersStatus();
    }

    function updateApiOffersStatus() {
        const completedCount = userData.completedApiOffers.length;
        const totalOffers = apiOffersData.length;
        const progress = totalOffers > 0 ? (completedCount / totalOffers) * 100 : 0;
        
        document.getElementById('completed-offers-count').textContent = completedCount;
        document.getElementById('api-total-earnings').textContent = userData.apiOffersEarnings;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        const offerStatusEl = document.getElementById('offer-status');
        offerStatusEl.style.display = completedCount > 0 ? 'block' : 'none';
    }

    function handleApiOfferClick(offer) {
        currentApiOffer = offer;
        document.getElementById('api-ad-description').textContent = 
            `Complete this task to earn ${offer.robux} Sweeps Coins: ${offer.conversion}`;
        document.getElementById('api-ad-modal').classList.add('active');
    }

    function startOfferTimer() {
        if (!currentApiOffer) return;
        
        userData.totalOffersAttempted = (userData.totalOffersAttempted || 0) + 1;
        pendingTimerOffers[currentApiOffer.id] = Date.now() + OFFER_TIMER_DURATION;
        
        if (currentApiOffer.url) {
            window.open(currentApiOffer.url, '_blank');
        }
        
        renderApiOffers();
        document.getElementById('api-ad-modal').classList.remove('active');
        showToast(`Offer started! Sweeps Coins will be added to your account in 3 minutes.`, 'success', 5000);
        saveUserToLocalStorage();
        setTimeout(checkPendingTimers, OFFER_TIMER_DURATION + 1000);
        currentApiOffer = null;
    }

    function checkPendingTimers() {
        const now = Date.now();
        let hasPending = false;
        
        for (const offerId in pendingTimerOffers) {
            if (pendingTimerOffers[offerId] <= now) {
                const offer = apiOffersData.find(o => o.id == offerId);
                if (offer && !userData.completedApiOffers.includes(offer.id)) {
                    const earned = addPoints(offer.robux, "api");
                    userData.apiOffersEarnings += offer.robux;
                    userData.completedApiOffers.push(offer.id);
                    delete pendingTimerOffers[offerId];
                    saveUserToLocalStorage();
                    updateAllDisplays();
                    showToast(`🎉 +${earned} Sweeps Coins earned from completed offer!`, 'success', 5000);
                }
            } else {
                hasPending = true;
            }
        }
        
        if (hasPending) {
            setTimeout(checkPendingTimers, 10000);
        }
    }



    
    // Game Data
    let userData = {
        userId: '',
        email: null,
        username: "Guest",
        points: 0,
        level: 1,
        xp: 0,
        xpNeeded: 100,
        referralCount: 0,
        referralPoints: 0,
        lastDailyBonusClaimed: null,
        referredBy: null,
        completedApiOffers: [],
        apiOffersEarnings: 0,
        gameUsername: null,
        selectedGame: "roblox",
        pendingWithdrawal: 0,
        totalWithdrawn: 0,
        withdrawalsCount: 0,
        todayEarnings: 0,
        lastLoginDate: null,
        totalOffersAttempted: 0,
        avatarInitial: "U",
        totalRobuxEarned: 0,
        dailyBonusesClaimed: 0
    };
