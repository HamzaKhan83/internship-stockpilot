# StockPilot Testing Report

Fill in the **Result** and **Issue and fix** columns as you test (Pass / Fail). Test in Chrome, Edge and Firefox, and at 375px, 768px and desktop widths using DevTools (F12).

| Page / Feature | Test | Result | Issue and fix |
|----------------|------|--------|---------------|
| Navigation | Every header link opens the right page on all 4 pages | | |
| Hamburger menu | Open and close at 375px width | | |
| Dark mode | Toggle, refresh page, theme is remembered | | |
| Home stats | Numbers match the Inventory page | | |
| Catalog (API) | 6 products load; "Add to my stock" adds one to Inventory | | |
| Catalog (API) | Turn off internet, refresh: error message shows, no crash | | |
| FAQ accordion | Each question opens and closes | | |
| Add product | Valid data saves and appears in table | | |
| Add product | Empty name / duplicate SKU / negative qty shows error | | |
| Edit product | Changes are saved and totals update | | |
| +1 / −1 buttons | Quantity changes; −1 never goes below 0 | | |
| Delete product | Confirm dialog, row removed | | |
| Search and filters | Name, SKU, category and status filters work together | | |
| Low stock badge | Qty at or below reorder level shows "Low stock" | | |
| Export CSV | File downloads and opens in Excel | | |
| Reset demo data | Sample products restored | | |
| Contact form | Submit with empty fields shows errors | | |
| Contact form | Submit with invalid email ("abc") shows error | | |
| Contact form | Valid submit with backend running shows success message | | |
| Contact form | Backend stopped shows friendly error message | | |
| Responsiveness | Looks good at 375px, 768px and desktop | | |
| Console | No red errors on any page (F12 Console) | | |
| Lighthouse | Performance, Accessibility, Best Practices, SEO scores | | |
