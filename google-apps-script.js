/**
 * MIRACLE IT CAREER ACADEMY — GOOGLE APPS SCRIPT LEAD API
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1S2NJv_zpO1Uo7iBf3kCotJigzz5zck6I3QVb5nwBpkA/edit?gid=0#gid=0
 * 
 * Deployment Instructions:
 * 1. Open the Google Sheet above.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code with this file.
 * 4. Click "Deploy" > "Manage deployments" (or "New deployment").
 * 5. Edit configuration:
 *      - Type: Web app
 *      - Execute as: Me (<your_email@gmail.com>)
 *      - Who has access: Anyone  <-- (CRITICAL: Must be "Anyone", NOT "Only myself")
 * 6. Click "Deploy", authorize permissions when prompted.
 * 7. Ensure the Web App URL matches your project config:
 *    https://script.google.com/macros/s/AKfycbyMkZtOwDdkUDARaL16YADv4DocQMN3WG-K0-2qD20_q467nGbqIjfwht9414gjDJhh/exec
 */

const SPREADSHEET_ID = '1S2NJv_zpO1Uo7iBf3kCotJigzz5zck6I3QVb5nwBpkA';
const SHEET_NAME = 'Leads';

const HEADERS = [
  'Time', 'Name', 'Phone', 'You are', 'Course',
  'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term', 'fbclid', 'Landing URL'
];

/**
 * Health check / browser test endpoint
 */
function doGet(e) {
  return ContentService.createTextOutput(
    'Miracle IT Lead API is running. Method: GET OK'
  ).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Form submission receiver endpoint
 */
function doPost(e) {
  // Concurrency lock to prevent overlapping write collisions
  var lock = LockService.getScriptLock();
  
  try {
    // Wait up to 10 seconds for concurrent writes to finish
    lock.waitLock(10000);

    var d = {};
    if (e && e.postData && e.postData.contents) {
      try {
        d = JSON.parse(e.postData.contents);
      } catch (parseError) {
        d = e.parameter || {};
      }
    } else if (e && e.parameter) {
      d = e.parameter;
    }

    // Resolve Spreadsheet & Target Sheet
    var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
    }

    // Auto-create and format Header Row if newly created or empty
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      var headerRange = sh.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F1F5F9');
      sh.setFrozenRows(1);
    }

    // Format IST Timestamp (Asia/Kolkata timezone)
    var timeFormatted = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    if (d.submitted_at || d.submissionTime) {
      try {
        var rawDate = new Date(d.submitted_at || d.submissionTime);
        if (!isNaN(rawDate.getTime())) {
          timeFormatted = Utilities.formatDate(rawDate, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
        }
      } catch (_) {}
    }

    // Format Phone number safely with leading quote so Google Sheets doesn't truncate or drop leading digits
    var rawPhone = String(d.phone || d.phoneNumber || d.raw_phone || '').trim();
    var safePhone = rawPhone ? "'" + rawPhone : '';

    var nameVal = String(d.name || d.fullName || '').trim();
    var statusVal = String(d.status || d.currentEducation || d.educationBackground || '').trim();
    var courseVal = String(d.course || d.courseInterest || '').trim();
    var utmSource = String(d.utm_source || '').trim();
    var utmMedium = String(d.utm_medium || '').trim();
    var utmCampaign = String(d.utm_campaign || '').trim();
    var utmContent = String(d.utm_content || '').trim();
    var utmTerm = String(d.utm_term || '').trim();
    var fbclid = String(d.fbclid || '').trim();
    var landingUrl = String(d.landing_url || d.landingUrl || '').trim();

    // Append lead row to sheet
    sh.appendRow([
      timeFormatted,
      nameVal,
      safePhone,
      statusVal,
      courseVal,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      fbclid,
      landingUrl
    ]);

    // Return success response compatible with text and JSON parsers
    return ContentService.createTextOutput('ok')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error('[AppsScript Lead Error]:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}
