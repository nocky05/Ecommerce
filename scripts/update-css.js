const fs = require('fs');
const path = 'src/app/globals.css';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `@media (max-width: 768px) {

  body,
  html {
    overflow-x: hidden !important;
    width: 100% !important;
    position: relative;
  }

  .container {
    padding-left: 15px !important;
    padding-right: 15px !important;
    max-width: 100vw !important;
    overflow-x: hidden;
  }

  .section-header-flex {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 1.5rem !important;
    width: 100% !important;
    margin-bottom: 2rem;
  }

  .tabs-nav {
    display: flex !important;
    gap: 1.25rem !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    width: 100% !important;
    padding-bottom: 10px !important;
    margin-bottom: 0 !important;
    border-bottom: 1px solid #eee !important;
    -webkit-overflow-scrolling: touch;
    justify-content: flex-start !important;
  }

  .tabs-nav::-webkit-scrollbar {
    display: none;
  }

  .view-all-btn-mobile {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 200px;
    margin: 0 auto !important;
    text-align: center;
    order: 2;
  }

  .header-main-grid {
    gap: 0.5rem !important;
    padding: 0 !important;
  }

  .logo-text {
    font-size: 1.1rem !important;
  }

  .search-form-container {
    margin-top: 10px !important;
  }
}`;

const newBlock = `@media (max-width: 768px) {

  body,
  html {
    overflow-x: hidden !important;
    width: 100% !important;
    position: relative;
  }

  .container {
    padding-left: 15px !important;
    padding-right: 15px !important;
    max-width: 100vw !important;
    overflow-x: hidden;
  }

  .section-header-flex {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 1.5rem !important;
    width: 100% !important;
    margin-bottom: 2rem;
  }

  .tabs-nav {
    display: flex !important;
    gap: 1.5rem !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    width: 100% !important;
    padding: 0.5rem 0 10px 0 !important;
    margin-bottom: 1rem !important;
    border-bottom: 1px solid #eee !important;
    -webkit-overflow-scrolling: touch;
    justify-content: flex-start !important;
  }

  .tabs-nav::-webkit-scrollbar {
    display: none;
  }

  .tabs-btn {
    font-size: 0.85rem !important;
    font-weight: 800 !important;
    flex-shrink: 0 !important;
  }

  .view-all-btn-mobile {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 200px;
    margin: 1rem auto !important;
    text-align: center;
    order: 2;
  }

  .header-main-grid {
    gap: 0.5rem !important;
    padding: 0 !important;
    grid-template-columns: 1fr auto !important;
  }

  .logo-text {
    font-size: 1.1rem !important;
  }

  .search-form-container {
    margin-top: 10px !important;
    width: 100% !important;
  }

  .search-form-container > div:nth-child(2) span {
    display: none !important;
  }

  .search-form-container > div:nth-child(2) {
    min-width: 45px !important;
    padding: 0 5px !important;
    justify-content: center !important;
  }
}`;

// Normalize line endings for replacement
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOldBlock = oldBlock.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedOldBlock)) {
    const updatedContent = normalizedContent.replace(normalizedOldBlock, newBlock);
    fs.writeFileSync(path, updatedContent, 'utf8');
    console.log("Successfully updated globals.css with mobile fixes.");
} else {
    // Fallback: finding search-form-container block specifically
    console.log("Old block not found exactly, trying alternative replace...");
    const altUpdated = normalizedContent.replace(/\.search-form-container\s*\{\s*margin-top:\s*10px\s*!important;\s*\}/g, '.search-form-container { margin-top: 10px !important; width: 100% !important; } .search-form-container > div:nth-child(2) span { display: none !important; } .search-form-container > div:nth-child(2) { min-width: 45px !important; padding: 0 5px !important; justify-content: center !important; }');
    fs.writeFileSync(path, altUpdated, 'utf8');
}
