/**
 * Turbo Answer AI Widget - Universal Integration
 * Easy integration for any website or browser
 * Version: 2.1.0
 * 
 * Usage:
 * 1. Copy this entire code
 * 2. Paste it in browser console or add to any webpage
 * 3. Widget will automatically appear and work
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Widget server URL - change this to your deployed server
        serverUrl: 'https://0793dfe8-d2b4-4335-aa5b-3b80b98b8a9e-00-3nxxzhypf36ju.riker.replit.dev',
        
        // Widget appearance
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        theme: 'dark', // dark or light
        primaryColor: '#8B5CF6', // Purple theme
        
        // Widget behavior
        autoOpen: false, // Auto-open widget on page load
        showWelcome: true, // Show welcome message
        enableVoice: true, // Enable voice features
        
        // Widget size
        width: '400px',
        height: '600px',
        
        // Advanced options
        enableTyping: true,
        enableMarkdown: true,
        enableFileUpload: false
    };
    
    // Prevent multiple instances
    if (window.TurboAnswerWidget) {
        console.log('Turbo Answer Widget already loaded');
        return;
    }
    
    class TurboAnswerWidget {
        constructor(config = {}) {
            this.config = { ...CONFIG, ...config };
            this.isOpen = false;
            this.sessionId = null;
            this.messages = [];
            this.isTyping = false;
            
            this.init();
        }
        
        init() {
            this.createWidget();
            this.addStyles();
            this.attachEventListeners();
            this.initializeSession();
            
            if (this.config.autoOpen) {
                this.openWidget();
            }
            
            console.log('🚀 Turbo Answer Widget initialized successfully!');
        }
        
        createWidget() {
            // Create widget container
            this.container = document.createElement('div');
            this.container.id = 'turbo-answer-widget';
            this.container.className = 'turbo-widget-container';
            
            // Create toggle button
            this.toggleButton = document.createElement('button');
            this.toggleButton.className = 'turbo-widget-toggle';
            this.toggleButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            `;
            
            // Create widget panel
            this.panel = document.createElement('div');
            this.panel.className = 'turbo-widget-panel';
            this.panel.innerHTML = `
                <div class="turbo-widget-header">
                    <div class="turbo-widget-title">
                        <strong>Turbo Answer AI</strong>
                        <span class="turbo-widget-status">Online</span>
                    </div>
                    <button class="turbo-widget-close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="turbo-widget-messages" id="turbo-messages"></div>
                <div class="turbo-widget-input-area">
                    <div class="turbo-widget-input-container">
                        <textarea 
                            class="turbo-widget-input" 
                            placeholder="Ask me anything..." 
                            rows="1"
                            id="turbo-input"
                        ></textarea>
                        <button class="turbo-widget-send" id="turbo-send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                            </svg>
                        </button>
                        ${this.config.enableVoice ? `
                        <button class="turbo-widget-voice" id="turbo-voice">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </div>
                <div class="turbo-widget-footer">
                    <span>Powered by Turbo Answer AI</span>
                </div>
            `;
            
            this.container.appendChild(this.toggleButton);
            this.container.appendChild(this.panel);
            document.body.appendChild(this.container);
        }
        
        addStyles() {
            if (document.getElementById('turbo-widget-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'turbo-widget-styles';
            styles.textContent = `
                .turbo-widget-container {
                    position: fixed;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    ${this.getPositionStyles()}
                }
                
                .turbo-widget-toggle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${this.config.primaryColor};
                    border: none;
                    color: white;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .turbo-widget-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(0,0,0,0.3);
                }
                
                .turbo-widget-panel {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: ${this.config.width};
                    height: ${this.config.height};
                    background: ${this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e1e5e9'};
                }
                
                .turbo-widget-panel.open {
                    display: flex;
                    animation: turboSlideUp 0.3s ease;
                }
                
                @keyframes turboSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .turbo-widget-header {
                    background: ${this.config.primaryColor};
                    color: white;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .turbo-widget-title {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .turbo-widget-status {
                    font-size: 12px;
                    opacity: 0.8;
                }
                
                .turbo-widget-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    opacity: 0.8;
                }
                
                .turbo-widget-close:hover {
                    opacity: 1;
                    background: rgba(255,255,255,0.1);
                }
                
                .turbo-widget-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: ${this.config.theme === 'dark' ? '#000000' : '#f8f9fa'};
                }
                
                .turbo-message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    line-height: 1.4;
                    font-size: 14px;
                }
                
                .turbo-message.user {
                    align-self: flex-end;
                    background: ${this.config.primaryColor};
                    color: white;
                }
                
                .turbo-message.assistant {
                    align-self: flex-start;
                    background: ${this.config.theme === 'dark' ? '#333' : '#ffffff'};
                    color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
                    border: 1px solid ${this.config.theme === 'dark' ? '#444' : '#e1e5e9'};
                }
                
                .turbo-typing {
                    align-self: flex-start;
                    background: ${this.config.theme === 'dark' ? '#333' : '#ffffff'};
                    border: 1px solid ${this.config.theme === 'dark' ? '#444' : '#e1e5e9'};
                    padding: 12px 16px;
                    border-radius: 12px;
                    max-width: 80px;
                }
                
                .turbo-typing-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .turbo-typing-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${this.config.primaryColor};
                    animation: turboTyping 1.4s infinite ease-in-out;
                }
                
                .turbo-typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .turbo-typing-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes turboTyping {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
                
                .turbo-widget-input-area {
                    padding: 16px;
                    background: ${this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
                    border-top: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e1e5e9'};
                }
                
                .turbo-widget-input-container {
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                }
                
                .turbo-widget-input {
                    flex: 1;
                    border: 1px solid ${this.config.theme === 'dark' ? '#444' : '#e1e5e9'};
                    border-radius: 8px;
                    padding: 12px;
                    background: ${this.config.theme === 'dark' ? '#333' : '#ffffff'};
                    color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
                    resize: none;
                    font-family: inherit;
                    font-size: 14px;
                    max-height: 120px;
                    min-height: 44px;
                }
                
                .turbo-widget-input:focus {
                    outline: none;
                    border-color: ${this.config.primaryColor};
                    box-shadow: 0 0 0 2px ${this.config.primaryColor}20;
                }
                
                .turbo-widget-send, .turbo-widget-voice {
                    width: 44px;
                    height: 44px;
                    border: none;
                    border-radius: 8px;
                    background: ${this.config.primaryColor};
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .turbo-widget-send:hover, .turbo-widget-voice:hover {
                    opacity: 0.9;
                    transform: scale(1.05);
                }
                
                .turbo-widget-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .turbo-widget-voice {
                    background: ${this.config.theme === 'dark' ? '#444' : '#f0f0f0'};
                    color: ${this.config.theme === 'dark' ? '#ffffff' : '#666666'};
                }
                
                .turbo-widget-voice.listening {
                    background: #ef4444;
                    animation: turboPulse 1s infinite;
                }
                
                @keyframes turboPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .turbo-widget-footer {
                    padding: 8px 16px;
                    background: ${this.config.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
                    border-top: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e1e5e9'};
                    text-align: center;
                    font-size: 11px;
                    color: ${this.config.theme === 'dark' ? '#888' : '#666'};
                }
                
                @media (max-width: 480px) {
                    .turbo-widget-panel {
                        width: calc(100vw - 20px);
                        height: calc(100vh - 100px);
                        bottom: 10px;
                        right: 10px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        getPositionStyles() {
            const positions = {
                'bottom-right': 'bottom: 20px; right: 20px;',
                'bottom-left': 'bottom: 20px; left: 20px;',
                'top-right': 'top: 20px; right: 20px;',
                'top-left': 'top: 20px; left: 20px;'
            };
            return positions[this.config.position] || positions['bottom-right'];
        }
        
        attachEventListeners() {
            // Toggle button
            this.toggleButton.addEventListener('click', () => this.toggleWidget());
            
            // Close button
            this.panel.querySelector('.turbo-widget-close').addEventListener('click', () => this.closeWidget());
            
            // Send button
            this.panel.querySelector('#turbo-send').addEventListener('click', () => this.sendMessage());
            
            // Input field
            const input = this.panel.querySelector('#turbo-input');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
            
            // Voice button (if enabled)
            if (this.config.enableVoice) {
                const voiceBtn = this.panel.querySelector('#turbo-voice');
                if (voiceBtn) {
                    voiceBtn.addEventListener('click', () => this.toggleVoice());
                }
            }
            
            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target) && this.isOpen) {
                    this.closeWidget();
                }
            });
        }
        
        toggleWidget() {
            if (this.isOpen) {
                this.closeWidget();
            } else {
                this.openWidget();
            }
        }
        
        openWidget() {
            this.panel.classList.add('open');
            this.isOpen = true;
            
            // Focus input
            setTimeout(() => {
                this.panel.querySelector('#turbo-input').focus();
            }, 100);
            
            // Show welcome message
            if (this.config.showWelcome && this.messages.length === 0) {
                this.addMessage('Hello! I\'m Turbo Answer AI. Ask me anything you\'d like to know!', 'assistant');
            }
        }
        
        closeWidget() {
            this.panel.classList.remove('open');
            this.isOpen = false;
        }
        
        async initializeSession() {
            try {
                const response = await fetch(`${this.config.serverUrl}/api/widget/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.sessionId = data.sessionId;
                    console.log('Widget session initialized:', this.sessionId);
                } else {
                    console.error('Failed to initialize session:', response.status);
                }
            } catch (error) {
                console.error('Session initialization error:', error);
            }
        }
        
        async sendMessage() {
            const input = this.panel.querySelector('#turbo-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            this.addMessage(message, 'user');
            input.value = '';
            input.style.height = 'auto';
            
            // Show typing indicator
            this.showTyping();
            
            try {
                const response = await fetch(`${this.config.serverUrl}/api/widget/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: this.sessionId,
                        message: message
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.hideTyping();
                    this.addMessage(data.response, 'assistant');
                } else {
                    this.hideTyping();
                    this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                }
            } catch (error) {
                this.hideTyping();
                this.addMessage('Connection error. Please check your internet connection.', 'assistant');
                console.error('Send message error:', error);
            }
        }
        
        addMessage(text, sender) {
            const messagesContainer = this.panel.querySelector('#turbo-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `turbo-message ${sender}`;
            messageDiv.textContent = text;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.messages.push({ text, sender, timestamp: Date.now() });
        }
        
        showTyping() {
            if (this.isTyping) return;
            
            const messagesContainer = this.panel.querySelector('#turbo-messages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'turbo-typing';
            typingDiv.id = 'turbo-typing-indicator';
            typingDiv.innerHTML = `
                <div class="turbo-typing-dots">
                    <div class="turbo-typing-dot"></div>
                    <div class="turbo-typing-dot"></div>
                    <div class="turbo-typing-dot"></div>
                </div>
            `;
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            this.isTyping = true;
        }
        
        hideTyping() {
            const typingIndicator = this.panel.querySelector('#turbo-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.isTyping = false;
        }
        
        toggleVoice() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert('Voice recognition is not supported in this browser.');
                return;
            }
            
            const voiceBtn = this.panel.querySelector('#turbo-voice');
            
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        }
        
        startListening() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.panel.querySelector('#turbo-voice').classList.add('listening');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.panel.querySelector('#turbo-input').value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onend = () => {
                this.stopListening();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
            };
            
            this.recognition.start();
        }
        
        stopListening() {
            if (this.recognition) {
                this.recognition.stop();
            }
            this.isListening = false;
            const voiceBtn = this.panel.querySelector('#turbo-voice');
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
            }
        }
        
        // Public API
        open() { this.openWidget(); }
        close() { this.closeWidget(); }
        toggle() { this.toggleWidget(); }
        
        sendCustomMessage(message) {
            this.panel.querySelector('#turbo-input').value = message;
            this.sendMessage();
        }
        
        destroy() {
            if (this.container) {
                this.container.remove();
            }
            const styles = document.getElementById('turbo-widget-styles');
            if (styles) {
                styles.remove();
            }
            delete window.TurboAnswerWidget;
        }
    }
    
    // Initialize widget
    window.TurboAnswerWidget = new TurboAnswerWidget();
    
    // Global functions for easy access
    window.openTurboWidget = () => window.TurboAnswerWidget.open();
    window.closeTurboWidget = () => window.TurboAnswerWidget.close();
    window.toggleTurboWidget = () => window.TurboAnswerWidget.toggle();
    
    console.log('🎉 Turbo Answer Widget loaded! Use openTurboWidget() to open it.');
    
})();