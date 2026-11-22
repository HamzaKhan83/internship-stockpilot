# StockPilot

A simple, responsive inventory management website built for the Verstech Web Development Internship (Track 3).

**Live site:** _add your Netlify/Vercel/GitHub Pages link here_
**Live API:** _add your Render link here (optional)_

## Purpose
Help small shops, offices and warehouses track products, spot low stock early and see the value of their inventory in one place.

## Target audience
Shop owners, office managers, school stores and small warehouse teams.

## Pages
| Page | File | What it does |
|------|------|--------------|
| Home | `index.html` | Hero, live stats, features, live product catalog (API), FAQ |
| Inventory | `inventory.html` | Add / edit / delete products, search, filter, export CSV |
| About | `about.html` | Purpose, audience and technologies |
| Contact | `contact.html` | Validated contact form connected to the Node.js backend |

## Features
- Add, edit, delete products and adjust quantity with +1 / −1 buttons
- Low stock and out-of-stock badges based on each product's reorder level
- Search by name or SKU, filter by category and status
- Automatic stock value and totals
- Export inventory to CSV
- Live product catalog from the DummyJSON public API (add items to your stock)
- Responsive layout with hamburger menu
- Dark mode toggle, FAQ accordion, modal form
- Form validation on the contact and product forms
- Data saved in the browser (localStorage)

## Technologies
HTML5, CSS3 (Flexbox, Grid, variables, media queries), JavaScript (DOM, fetch, localStorage), Node.js + Express, Git/GitHub.

## Run locally
**Frontend:** open the project folder in VS Code, right-click `index.html` and choose **Open with Live Server**.

**Backend (contact form):**
```bash
cd server
npm install
npm start
```
The API runs on `http://localhost:3000`. Test it at `http://localhost:3000/api/health`.

## Project structure
```
stockpilot/
|-- index.html
|-- inventory.html
|-- about.html
|-- contact.html
|-- css/style.css
|-- js/script.js
|-- images/logo.svg
|-- server/
|   |-- server.js
|   |-- package.json
|-- TESTING.md
|-- README.md
|-- .gitignore
```

