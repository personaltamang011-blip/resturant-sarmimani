# 🍽️ Restaurant Menu & Invoice Generator - PWA

A Progressive Web App for generating restaurant menus and invoices with offline functionality.

## 🚀 Features

- **Progressive Web App (PWA)**: Installable on mobile and desktop
- **Offline Support**: Works without internet connection
- **Responsive Design**: Optimized for all screen sizes
- **Modern UI**: Clean, professional interface with gray theme
- **Invoice Generation**: Create and manage restaurant invoices
- **Menu Management**: Dynamic menu loading from JSON data

## 📱 Installation

### On Mobile (Android/iOS)
1. Open the app in your browser
2. Tap the "Add to Home Screen" or "Install App" button
3. Follow the prompts to install

### On Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the install icon in the address bar or use the menu
3. Follow the prompts to install

## 🛠️ Development

### Prerequisites
- Modern web browser with PWA support
- Local web server (for development)

### Running Locally
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using any static file server
```

### PWA Files
- `manifest.json` - App manifest with metadata and icons
- `sw.js` - Service worker for offline functionality
- `index.html` - Main application with PWA meta tags
- `style.css` - Responsive styles
- `script.js` - Application logic

## 📋 PWA Features

- **Installable**: Can be installed like a native app
- **Offline First**: Caches resources for offline use
- **Fast Loading**: Service worker provides instant loading
- **Responsive**: Works on all device sizes
- **Secure**: Requires HTTPS in production

## 🔧 Browser Support

- Chrome 70+
- Firefox 68+
- Safari 12.1+
- Edge 79+

## 📊 Data Structure

Menu data is stored in JSON files:
- `data/drinks.json` - Beverage menu items
- `data/foods.json` - Food menu items
- `data/juice.json` - Juice menu items
- `data/list.json` - Complete menu list

## 🎨 Customization

- **Colors**: Modify `style.css` for theme changes
- **Icons**: Update `manifest.json` with custom icons
- **Menu Data**: Edit JSON files in the `data/` folder
- **Functionality**: Modify `script.js` for custom features

## 📄 License

This project is open source and available under the MIT License.