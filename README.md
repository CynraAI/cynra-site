# Cynra Temporary Site

A minimal, premium temporary website for Cynra while under redevelopment.

## Features

- **Premium Design**: Dark background with subtle green accent glow
- **Smooth Animations**: Logo fades in first, followed by text and CTA
- **Responsive**: Optimized for desktop (1440px) and mobile devices
- **Accessible**: Supports `prefers-reduced-motion` for users who prefer less animation
- **Fast**: Lightweight HTML/CSS/JS with no framework dependencies

## Local Development

### Option 1: Using Vite (Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

### Option 2: Static Files Only

Simply open `index.html` in your browser. For best results, use a local server:

- **Python 3**: `python -m http.server 8000`
- **Node.js**: `npx serve .`
- **VS Code**: Use the "Live Server" extension

## Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select your branch and `/ (root)` folder
4. Your site will be available at `https://yourusername.github.io/cynra-site`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Netlify

1. Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository in Netlify dashboard

## File Structure

```
cynra-site/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── main.js             # Animation logic and year setting
├── package.json        # Vite dev server configuration
├── cynra-logo.png      # Logo + wordmark image
└── README.md           # This file
```

## Customization

### Logo Path
The logo currently points to `./cf2140d4-0736-4909-a786-a77713e0c542.png`. If you move the logo (e.g., to `/assets/cynra-logo.png`), update the `src` attribute in `index.html`.

### CTA Links
- **Social Links**: Uncomment the social links section in `index.html` and update the `href` attributes
- **Get Updates Button**: Replace the `mailto:hello@cynra.ai` link with your waitlist form URL

### Colors
Edit CSS variables in `styles.css`:
- `--accent-green`: Main green accent color
- `--bg-dark` / `--bg-darker`: Background colors

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## License

© 2024 Cynra. All rights reserved.

