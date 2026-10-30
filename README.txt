GROUP 10 — PETAL PRODUCT SHOWCASE
================================

CONTENTS
- index.html: website structure and content
- styles.css: responsive visual design
- app.js: interactive Three.js STL viewer and gallery interactions
- models/: the three original STL files from the supplied ZIP
- images/: supplied CAD images and prototype photographs

RUN LOCALLY
The 3D viewer uses Three.js modules and must be served over HTTP (opening index.html directly as a file may block module loading).

Option 1 — Python:
1. Install Python if it is not already installed.
2. Open a terminal in this folder.
3. Run: python -m http.server 8000
4. Visit: http://localhost:8000

Option 2 — VS Code:
1. Open this folder in VS Code.
2. Install the Live Server extension.
3. Right-click index.html and choose "Open with Live Server".

PUBLISH FREE WITH GITHUB PAGES
1. Create a GitHub repository, e.g. group10-petal-showcase.
2. Upload the complete contents of this folder (not just index.html).
3. Open repository Settings > Pages.
4. Under Build and deployment, choose "Deploy from a branch".
5. Select the main branch and /(root), then Save.
6. Wait for GitHub Pages to publish and share the generated website URL.

IMPORTANT
- Keep the models/ and images/ folders in the same locations; the site references these paths.
- The STL files are included in the site and downloadable from the 3D viewer.
- Three.js and fonts load from public CDNs, so the interactive preview requires an internet connection.
- The project photographs show a prototype; the report/site describes 3D printing as the next fabrication stage where final print measurements and settings have not been provided.
- The 3D viewer displays the exact STL geometry. It does not convert the photos into 3D models.
