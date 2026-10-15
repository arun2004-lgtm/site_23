/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: E/23 BATCH PROFILE PICTURE AUTO-UPLOADER
 * Account: peradeniyaguys@gmail.com
 * =========================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Log in to Google Drive with: peradeniyaguys@gmail.com
 * 2. Create a folder named: "E23 Batch Profile Pictures"
 * 3. Open the folder and copy the Folder ID from the browser URL:
 *    https://drive.google.com/drive/folders/PASTE_YOUR_FOLDER_ID_HERE
 * 4. Go to https://script.google.com and click "New Project"
 * 5. Replace all code in the editor with this script.
 * 6. Replace "PASTE_YOUR_FOLDER_ID_HERE" below on line 25 with your actual folder ID.
 * 7. Click "Deploy" (top right) -> "New deployment"
 * 8. Select type: "Web app" (click gear icon next to 'Select type')
 * 9. Set the following options:
 *    - Description: E23 Profile Photos Uploader
 *    - Execute as: Me (peradeniyaguys@gmail.com)
 *    - Who has access: Anyone  <-- (CRITICAL: Must be "Anyone" so students can upload)
 * 10. Click "Deploy" -> "Authorize access" -> choose peradeniyaguys@gmail.com -> "Advanced" -> "Go to Project (unsafe)" -> "Allow"
 * 11. Copy the "Web app URL" (it ends with /exec).
 * 12. Paste the URL into .env as VITE_GOOGLE_DRIVE_UPLOAD_URL or in the website's modal.
 * =========================================================================
 */

// Your Google Drive "E23 Batch Profile Pictures" folder ID
var PROFILE_PICTURES_FOLDER_ID = "1_VBM374H-BypVbpChe1H6JqdC9XkoAhp";

/**
 * Handles incoming POST requests containing image data
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildJsonResponse({ success: false, error: "No post data received" });
    }

    // Parse incoming payload
    var data = JSON.parse(e.postData.contents);
    var rawBase64 = data.base64;
    
    if (!rawBase64) {
      return buildJsonResponse({ success: false, error: "Missing base64 image data" });
    }

    // Strip "data:image/...;base64," header if present
    if (rawBase64.indexOf(",") > -1) {
      rawBase64 = rawBase64.split(",")[1];
    }

    var rawFolderId = data.folderId || PROFILE_PICTURES_FOLDER_ID;
    // Auto-extract pure ID if full Drive URL was passed or pasted
    var folderIdMatch = (typeof rawFolderId === 'string') ? rawFolderId.match(/folders\/([a-zA-Z0-9_-]+)/) : null;
    var folderId = folderIdMatch ? folderIdMatch[1] : (rawFolderId || '').trim();
    var folder;
    
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (folderErr) {
      return buildJsonResponse({ 
        success: false, 
        error: "Folder ID not found. Please verify folder ID in script: " + folderErr.toString() 
      });
    }

    // Decode base64 to binary
    var decoded = Utilities.base64Decode(rawBase64);
    var mimeType = data.type || "image/jpeg";
    var filename = data.filename || ("e23_profile_" + new Date().getTime() + ".jpg");

    // Create file inside designated Drive folder
    var blob = Utilities.newBlob(decoded, mimeType, filename);
    var file = folder.createFile(blob);

    // Make file viewable by anyone with link (so website can display it)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    // High-resolution Google Drive direct thumbnail embed URL
    var directThumbnailUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600";
    var webViewLink = file.getUrl();

    return buildJsonResponse({
      success: true,
      fileId: fileId,
      url: directThumbnailUrl,
      viewUrl: webViewLink,
      filename: filename
    });

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: "Exception in Apps Script: " + err.toString()
    });
  }
}

/**
 * Health check endpoint (open the Web App URL in your browser to verify it works)
 */
function doGet(e) {
  return buildJsonResponse({
    status: "ok",
    message: "E/23 Profile Photo Auto-Uploader is running on peradeniyaguys@gmail.com!",
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper to return JSON response with appropriate headers
 */
function buildJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
