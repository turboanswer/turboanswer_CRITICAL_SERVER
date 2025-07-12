# Turbo Answer AI Widget - Universal Integration Guide

## Quick Setup (30 seconds)

### Method 1: Browser Console (Instant Test)
1. Open any website
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Copy and paste the entire `turbo-answer-widget.js` code
5. Press Enter - Widget appears instantly!

### Method 2: Website Integration
Add this to your website's HTML:

```html
<script src="path/to/turbo-answer-widget.js"></script>
```

Or include it inline:
```html
<script>
// Paste the entire turbo-answer-widget.js content here
</script>
```

### Method 3: Bookmarklet (Any Browser)
Create a bookmark with this URL:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://your-domain.com/turbo-answer-widget.js';document.head.appendChild(s);})();
```

## Configuration Options

```javascript
// Custom configuration example
const widget = new TurboAnswerWidget({
    serverUrl: 'https://your-server.com',
    position: 'bottom-left',    // bottom-right, bottom-left, top-right, top-left
    theme: 'light',             // dark or light
    primaryColor: '#FF6B6B',    // Any hex color
    autoOpen: true,             // Auto-open on load
    enableVoice: true,          // Voice recognition
    width: '350px',
    height: '500px'
});
```

## Global Functions

After loading, these functions are available globally:

```javascript
openTurboWidget()     // Open the widget
closeTurboWidget()    // Close the widget
toggleTurboWidget()   // Toggle open/close

// Send a message programmatically
window.TurboAnswerWidget.sendCustomMessage("Hello AI!");
```

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Opera 47+

✅ **Features:**
- Voice recognition (Chrome, Edge)
- Text chat (All browsers)
- Mobile responsive
- Dark/Light themes
- Customizable positioning

## Server Configuration

Update the `serverUrl` in the widget configuration to point to your deployed Turbo Answer server:

```javascript
const CONFIG = {
    serverUrl: 'https://your-turbo-answer-server.com',
    // ... other options
};
```

## Examples

### E-commerce Website
```html
<script>
// Load widget with custom branding
const widget = new TurboAnswerWidget({
    primaryColor: '#e74c3c',
    theme: 'light',
    position: 'bottom-right',
    showWelcome: true
});
</script>
```

### Documentation Site
```html
<script>
// Auto-open for immediate help
const widget = new TurboAnswerWidget({
    autoOpen: true,
    theme: 'dark',
    enableVoice: false
});
</script>
```

### Mobile App (WebView)
```html
<script>
// Optimized for mobile
const widget = new TurboAnswerWidget({
    width: '100%',
    height: '80vh',
    position: 'bottom-right'
});
</script>
```

## API Integration

The widget automatically handles:
- Session management
- Message history
- Error handling
- Typing indicators
- Voice recognition
- Mobile responsiveness

## Troubleshooting

**Widget not appearing?**
- Check browser console for errors
- Verify server URL is accessible
- Ensure JavaScript is enabled

**Voice not working?**
- Only works in Chrome/Edge
- Requires HTTPS for voice features
- Check microphone permissions

**Styling conflicts?**
- Widget uses high z-index (999999)
- All styles are prefixed with 'turbo-'
- CSS is scoped to avoid conflicts

## Support

For issues or customization requests:
- Email: turboaswer@hotmail.com
- Phone: (201) 691-8466

---

**Ready to use!** The widget is completely self-contained and works on any website instantly.