# Hilan Automation Script

This script automates the extraction and form-filling process for Hilan reports directly in your browser. It is designed to be used as a bookmarklet for quick access and automation.

## How to Create a Bookmarklet from `hilan.js`

### 1. Minify the Script
To use the script as a bookmarklet, you need to minify it (remove whitespace, newlines, and comments). You can use any online JavaScript minifier, such as:
- https://javascript-minifier.com/
- https://www.toptal.com/developers/javascript-minifier

Copy the entire contents of `hilan.js` and paste it into the minifier. Click "Minify" and copy the output.

### 2. Wrap the Minified Code for Bookmarklet Use
Prefix the minified code with `javascript:` and wrap it in an immediately-invoked function expression (IIFE) if not already done. Example:

```javascript
javascript:(function(){/* minified code here */})();
```

### 3. Create the Bookmarklet
- Open your browser's bookmarks manager.
- Create a new bookmark.
- In the URL field, paste the entire bookmarklet code (starting with `javascript:`).
- Name the bookmark (e.g., "Hilan Automation").

### 4. Use the Bookmarklet
1. Navigate to the Hilan report page in your browser.
2. Click the bookmarklet you created.
3. Follow the on-screen menu to select a month or upload a report file.

## Troubleshooting
- Make sure you are on the correct Hilan page before running the bookmarklet.
- If the script does not work, check the browser console for errors.
- Some browsers may block bookmarklets by default; ensure JavaScript is enabled for bookmarks.

## Notes
- This script is intended for personal use and may require updates if the Hilan website changes its structure.
- For maintainability, keep the original `hilan.js` file with comments and documentation.

---

Feel free to reach out if you need help minifying or deploying the bookmarklet!
