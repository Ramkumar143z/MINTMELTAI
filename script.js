// ================================
// SNOW AI - INTERACTIVE JAVASCRIPT
// ================================

// Global state management
const state = {
    currentPortal: 1,
    portal1: {
        completed: false,
        timer: 600, // 10 minutes in seconds
        timerInterval: null,
        messages: []
    },
    portal2: {
        completed: false,
        currentQuestion: 0,
        answers: []
    },
    portal3: {
        completed: false,
        scanData: null
    },
    finalReport: null
};

// Questions for Portal 2
const questions = [
    "How would you describe your overall mood and emotional state over the past week?",
    "What activities or experiences bring you the most joy and fulfillment?",
    "When you feel stressed or overwhelmed, what thoughts or feelings typically arise?",
    "How do you typically handle difficult emotions or challenging situations?",
    "Describe a recent moment when you felt truly at peace with yourself.",
    "What aspects of your daily routine contribute positively to your mental well-being?",
    "Are there any recurring thoughts or worries that occupy your mind frequently?",
    "How connected do you feel to the people around you - family, friends, colleagues?",
    "What does 'mental wellness' mean to you personally?",
    "If you could change one thing about how you care for your mental health, what would it be?"
];

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initPortalButtons();
    initModals();
    unlockPortal(1); // Unlock first portal
});

// ================================
// SCROLL ANIMATIONS
// ================================

function initScrollAnimations() {
    const portals = document.querySelectorAll('.portal');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    portals.forEach(portal => observer.observe(portal));
}

// ================================
// PORTAL MANAGEMENT
// ================================

function unlockPortal(portalNum) {
    const portal = document.getElementById(`portal-${portalNum}`);
    if (!portal) return;
    
    const card = portal.querySelector('.portal-card');
    const button = portal.querySelector('.portal-button');
    const statusBadge = portal.querySelector('.status-badge');
    const lockOverlay = portal.querySelector('.lock-overlay');
    
    // Remove locked state
    card.classList.remove('locked-portal');
    if (lockOverlay) lockOverlay.remove();
    
    // Update status
    statusBadge.textContent = 'Ready to Begin';
    statusBadge.classList.remove('locked');
    statusBadge.classList.add('active');
    
    // Enable button
    button.disabled = false;
    button.querySelector('.button-text').textContent = 'Begin Journey';
    button.querySelector('.button-icon').textContent = '→';
}

function completePortal(portalNum) {
    const portal = document.getElementById(`portal-${portalNum}`);
    if (!portal) return;
    
    const card = portal.querySelector('.portal-card');
    const statusBadge = portal.querySelector('.status-badge');
    const button = portal.querySelector('.portal-button');
    
    // Mark as completed
    card.classList.add('completed');
    statusBadge.textContent = 'Completed ✓';
    statusBadge.classList.remove('active');
    statusBadge.classList.add('completed');
    
    // Disable button
    button.disabled = true;
    button.querySelector('.button-text').textContent = 'Completed';
    button.querySelector('.button-icon').textContent = '✓';
    
    // Unlock next portal
    const nextPortal = portalNum === 3 ? 'final' : portalNum + 1;
    setTimeout(() => {
        unlockPortal(nextPortal);
        
        // Scroll to next portal
        const nextPortalElement = document.getElementById(`portal-${nextPortal}`);
        if (nextPortalElement) {
            nextPortalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1000);
}

function initPortalButtons() {
    // Portal 1: Journaling
    document.querySelector('#portal-1 .portal-button').addEventListener('click', () => {
        openModal('modal-1');
        startJournalingTimer();
    });
    
    // Portal 2: Enquiry
    document.querySelector('#portal-2 .portal-button').addEventListener('click', () => {
        openModal('modal-2');
        loadQuestion(0);
    });
    
    // Portal 3: Face Scan
    document.querySelector('#portal-3 .portal-button').addEventListener('click', () => {
        openModal('modal-3');
    });
    
    // Final Portal: Report
    document.querySelector('#portal-final .portal-button').addEventListener('click', () => {
        openModal('modal-final');
        generateFinalReport();
    });
}

// ================================
// MODAL MANAGEMENT
// ================================

function initModals() {
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = 'modal-' + e.target.dataset.modal;
            closeModal(modalId);
        });
    });
    
    // Click outside to close
    document.querySelectorAll('.portal-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Stop camera if modal 3
        if (modalId === 'modal-3') {
            stopCamera();
        }
    }
}

// ================================
// PORTAL 1: JOURNALING CHATBOT
// ================================

function startJournalingTimer() {
    const timerDisplay = document.getElementById('timer-1');
    
    state.portal1.timerInterval = setInterval(() => {
        state.portal1.timer--;
        
        const minutes = Math.floor(state.portal1.timer / 60);
        const seconds = state.portal1.timer % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (state.portal1.timer <= 0) {
            clearInterval(state.portal1.timerInterval);
            endJournalingSession();
        }
    }, 1000);
}

function endJournalingSession() {
    const messagesContainer = document.getElementById('messages-1');
    const aiMessage = createMessage('Thank you for sharing with me. Your 10 minutes are complete. Take a moment to reflect on our conversation. You can now proceed to the next step when you\'re ready.', 'ai');
    messagesContainer.appendChild(aiMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Disable input
    document.getElementById('chat-input-1').disabled = true;
    document.getElementById('send-btn-1').disabled = true;
    
    // Save to backend
    saveJournalingData();
    
    // Complete portal
    state.portal1.completed = true;
    setTimeout(() => {
        closeModal('modal-1');
        completePortal(1);
    }, 2000);
}

// Chat functionality
document.getElementById('send-btn-1')?.addEventListener('click', sendMessage);
document.getElementById('chat-input-1')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('chat-input-1');
    const message = input.value.trim();
    
    if (!message || state.portal1.timer <= 0) return;
    
    // Add user message
    const messagesContainer = document.getElementById('messages-1');
    const userMsg = createMessage(message, 'user');
    messagesContainer.appendChild(userMsg);
    
    // Save message
    state.portal1.messages.push({ role: 'user', content: message });
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Generate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse();
        const aiMsg = createMessage(aiResponse, 'ai');
        messagesContainer.appendChild(aiMsg);
        state.portal1.messages.push({ role: 'ai', content: aiResponse });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 800);
}

function createMessage(content, type) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.innerHTML = `<div class="message-content"><p>${content}</p></div>`;
    return div;
}

function generateAIResponse() {
    const responses = [
        "I hear you. That sounds like it's been on your mind. Would you like to explore that feeling further?",
        "Thank you for sharing that with me. How does acknowledging this make you feel?",
        "That's an important observation. What do you think might help you with this?",
        "I appreciate your openness. Can you tell me more about when you first noticed this?",
        "It takes courage to reflect on these things. What would support look like for you right now?",
        "That's completely valid. How has this been affecting your daily life?",
        "I understand. Sometimes just expressing these thoughts can be helpful. How are you feeling now?",
        "That makes sense given what you've shared. What brings you comfort when you feel this way?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

async function saveJournalingData() {
    try {
        await fetch('/api/save-journaling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: state.portal1.messages })
        });
    } catch (error) {
        console.error('Error saving journaling data:', error);
    }
}

// ================================
// PORTAL 2: ENQUIRY QUESTIONS
// ================================

function loadQuestion(index) {
    if (index >= questions.length) {
        completeEnquiry();
        return;
    }
    
    state.portal2.currentQuestion = index;
    
    document.getElementById('q-num').textContent = index + 1;
    document.getElementById('current-q').textContent = index + 1;
    document.getElementById('total-q').textContent = questions.length;
    document.getElementById('question-text').textContent = questions[index];
    document.getElementById('answer-input').value = '';
    
    // Animate question
    const questionCard = document.querySelector('.question-card');
    questionCard.style.animation = 'none';
    setTimeout(() => {
        questionCard.style.animation = 'fadeInUp 0.5s ease';
    }, 10);
}

document.getElementById('next-question')?.addEventListener('click', () => {
    const answer = document.getElementById('answer-input').value.trim();
    
    if (!answer) {
        alert('Please provide an answer before continuing.');
        return;
    }
    
    // Save answer
    state.portal2.answers.push({
        question: questions[state.portal2.currentQuestion],
        answer: answer
    });
    
    // Load next question
    loadQuestion(state.portal2.currentQuestion + 1);
});

async function completeEnquiry() {
    // Save to backend
    try {
        await fetch('/api/save-enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: state.portal2.answers })
        });
    } catch (error) {
        console.error('Error saving enquiry data:', error);
    }
    
    // Show completion message
    const container = document.getElementById('enquiry-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 24px;">✓</div>
            <h3 style="font-size: 28px; margin-bottom: 16px;">Reflection Complete</h3>
            <p style="font-size: 18px; color: var(--text-secondary);">
                Thank you for your thoughtful responses. Your insights will help create a personalized understanding of your mental wellness journey.
            </p>
        </div>
    `;
    
    state.portal2.completed = true;
    
    setTimeout(() => {
        closeModal('modal-2');
        completePortal(2);
    }, 2500);
}

// ================================
// PORTAL 3: FACE SCAN
// ================================

let videoStream = null;

document.getElementById('start-scan')?.addEventListener('click', async () => {
    document.getElementById('scan-prompt').style.display = 'none';
    document.getElementById('scan-active').style.display = 'block';
    
    try {
        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        
        const video = document.getElementById('video-feed');
        video.srcObject = videoStream;
        
        // Start scan animation
        performFaceScan();
        
    } catch (error) {
        console.error('Camera access denied:', error);
        alert('Camera access is required for emotional analysis. Please enable camera permissions and try again.');
        closeModal('modal-3');
    }
});

function performFaceScan() {
    const statusElement = document.getElementById('scan-status');
    const progressBar = document.getElementById('scan-progress-bar');
    
    const scanSteps = [
        { message: 'Detecting facial features...', progress: 20 },
        { message: 'Analyzing micro-expressions...', progress: 40 },
        { message: 'Measuring emotional resonance...', progress: 60 },
        { message: 'Processing biometric data...', progress: 80 },
        { message: 'Finalizing analysis...', progress: 100 }
    ];
    
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
        if (currentStep >= scanSteps.length) {
            clearInterval(stepInterval);
            completeFaceScan();
            return;
        }
        
        const step = scanSteps[currentStep];
        statusElement.textContent = step.message;
        progressBar.style.width = step.progress + '%';
        currentStep++;
    }, 1500);
}

async function completeFaceScan() {
    // Generate mock scan data
    const emotions = ['Calm', 'Reflective', 'Hopeful', 'Contemplative', 'Serene'];
    const stressLevels = ['Low', 'Moderate', 'Balanced'];
    const wellnessScore = Math.floor(Math.random() * 30) + 70; // 70-100
    
    state.portal3.scanData = {
        dominantEmotion: emotions[Math.floor(Math.random() * emotions.length)],
        stressLevel: stressLevels[Math.floor(Math.random() * stressLevels.length)],
        wellnessScore: wellnessScore,
        timestamp: new Date().toISOString()
    };
    
    // Save to backend
    try {
        await fetch('/api/save-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.portal3.scanData)
        });
    } catch (error) {
        console.error('Error saving scan data:', error);
    }
    
    // Show completion
    const statusElement = document.getElementById('scan-status');
    statusElement.textContent = 'Scan complete! ✓';
    
    state.portal3.completed = true;
    
    setTimeout(() => {
        stopCamera();
        closeModal('modal-3');
        completePortal(3);
    }, 2000);
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// ================================
// FINAL REPORT GENERATION
// ================================

async function generateFinalReport() {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    
    loading.style.display = 'block';
    content.style.display = 'none';
    
    try {
        // Fetch combined analysis from backend
        const response = await fetch('/api/generate-report');
        const data = await response.json();
        
        setTimeout(() => {
            displayReport(data);
            loading.style.display = 'none';
            content.style.display = 'block';
        }, 2000);
        
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

function displayReport(data) {
    const content = document.getElementById('report-content');
    
    const reportHTML = `
        <div class="report-header">
            <h3>Your Personal Companion Report</h3>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            })}</p>
        </div>
        
        <div class="report-section">
            <h4>
                <span class="section-icon">🌟</span>
                Overall Mental Wellness
            </h4>
            <p>${data.overallSummary}</p>
            <div class="mood-indicator">
                <span>Wellness Score:</span>
                <strong>${data.wellnessScore}/100</strong>
            </div>
        </div>
        
        <div class="report-section">
            <h4>
                <span class="section-icon">💭</span>
                Emotional Insights
            </h4>
            <p>${data.emotionalInsights}</p>
            <div class="mood-indicator">
                <span>Current State:</span>
                <strong>${data.currentMood}</strong>
            </div>
        </div>
        
        <div class="report-section">
            <h4>
                <span class="section-icon">🎯</span>
                Key Observations
            </h4>
            <ul class="insight-list">
                ${data.keyObservations.map(obs => `<li>${obs}</li>`).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4>
                <span class="section-icon">💡</span>
                Personalized Recommendations
            </h4>
            <ul class="insight-list">
                ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="report-section">
            <h4>
                <span class="section-icon">🌱</span>
                Moving Forward
            </h4>
            <p>${data.closingMessage}</p>
        </div>
    `;
    
    content.innerHTML = reportHTML;
}