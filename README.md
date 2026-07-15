# andrew-c-hay.github.io

# System Prompt / Task Specification

**Role:** You are an expert frontend web developer. Your task is to build a single-page HTML/JS/CSS application for a wedding photo upload portal.

**Context & Objective:** 
Guests will access this site via a QR code at the venue in Indianapolis to upload photos and videos taken during the August 22, 2026 wedding celebration for Kate and her partner. The application will be a purely static site hosted on GitHub Pages. There is no custom backend. 

**Architecture:**
*   **Frontend:** Vanilla HTML5, CSS3, and modern JavaScript. No heavy frameworks (React/Vue) are needed. All code should reside in a single `index.html` file for simplicity.
*   **Backend / Storage:** Cloudinary Unsigned Uploads via their REST API. 

**UI/UX Requirements:**
*   **Mobile-First:** 99% of users will access this via their smartphones. Buttons must be large, accessible, and tap-friendly.
*   **Theme:** Elegant, clean, and celebratory (e.g., a simple white/off-white background, elegant serif fonts for headings, and a refined accent color). 
*   **Copy:** The page should warmly welcome guests to "Kate & [Partner's Name]'s Wedding" and invite them to share their memories. 

**Functional Requirements:**
1.  **File Selection:** Include a standard `<input type="file" accept="image/*,video/*" multiple>` element to allow batch selection from a mobile camera roll.
2.  **Client-Side Resizing (Crucial):** Venue cellular networks can be congested. Before uploading, the JavaScript must use an HTML5 `<canvas>` to resize images to a maximum width/height of 1920px to save bandwidth and speed up uploads. 
3.  **Upload Mechanism:** Iterate through the selected files and send them to Cloudinary using `fetch()`.
    *   **Endpoint:** `https://api.cloudinary.com/v1_1/<YOUR_CLOUD_NAME>/auto/upload` (Using `/auto/` allows the endpoint to dynamically handle both image and video uploads).
    *   **Method:** `POST`
    *   **Payload:** `FormData` containing the `file` and `upload_preset=<YOUR_UNSIGNED_PRESET>`.
4.  **State Management & Feedback:**
    *   Show a clear loading state (e.g., a progress bar or spinner) while uploads are processing.
    *   Disable the upload button during the process to prevent duplicate submissions.
    *   Display a success message upon completion, or specific error messages if a file fails.

**Configuration Variables:**
At the top of the JavaScript script tag, extract the Cloudinary configuration into two clear constants that the user will populate manually:
`const CLOUD_NAME = 'your_cloud_name_here';`
`const UPLOAD_PRESET = 'your_unsigned_preset_here';`

**Output:**
Please generate the complete, production-ready `index.html` file based on these specifications.
