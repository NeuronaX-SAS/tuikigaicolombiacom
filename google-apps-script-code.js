// TUIKIGAI Google Apps Script
function doPost(e) {
  // CORS headers for browser compatibility
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    // Parse the incoming request data
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.data;
    
    // Log the received data for debugging
    console.log('Received request action: ' + action);
    console.log('Data: ' + JSON.stringify(payload));
    
    var result;
    // Process based on the action parameter
    switch(action) {
      case 'saveIkigai':
        result = saveIkigaiData(payload);
        break;
      case 'savePromoCode':
        result = savePromoCodeData(payload);
        break;
      case 'savePurchase':
        result = savePurchaseData(payload);
        break;
      default:
        result = { success: false, error: 'Invalid action specified' };
    }
    
    // Return the result as JSON
    return output.setContent(JSON.stringify(result));
    
  } catch(error) {
    console.error('Error processing request: ' + error.toString());
    return output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
}

function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers for preflight requests
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Max-Age', '3600');
  
  return output;
}

// Function for handling GET requests (useful for testing)
function doGet() {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output.setContent(JSON.stringify({
    success: true,
    message: 'TUIKIGAI API is active and working'
  }));
}

// Save Ikigai form data to the sheet
function saveIkigaiData(data) {
  try {
    // Get the active spreadsheet - this is the spreadsheet where the script is attached
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the 'Ikigai Responses' sheet, or create it if it doesn't exist
    var sheet = spreadsheet.getSheetByName('Ikigai Responses');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Ikigai Responses');
      // Add headers if it's a new sheet
      sheet.appendRow(['Timestamp', 'User Name', 'Love', 'Talent', 'Need', 'Payment']);
    }
    
    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.userName || '',
      data.love || '',
      data.talent || '',
      data.need || '',
      data.payment || ''
    ]);
    
    return { success: true };
  } catch(error) {
    console.error('Error saving Ikigai data: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Save promo code data to the sheet
function savePromoCodeData(data) {
  try {
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the 'Promo Codes' sheet, or create it if it doesn't exist
    var sheet = spreadsheet.getSheetByName('Promo Codes');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Promo Codes');
      // Add headers if it's a new sheet
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Promo Code', 'Ikigai Data']);
    }
    
    // Format Ikigai data if available
    var ikigaiDataStr = '';
    if (data.ikigaiData) {
      ikigaiDataStr = JSON.stringify(data.ikigaiData);
    }
    
    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.promoCode || '',
      ikigaiDataStr
    ]);
    
    return { success: true };
  } catch(error) {
    console.error('Error saving promo code data: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Save purchase data to the sheet
function savePurchaseData(data) {
  try {
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the 'Purchases' sheet, or create it if it doesn't exist
    var sheet = spreadsheet.getSheetByName('Purchases');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Purchases');
      // Add headers if it's a new sheet
      sheet.appendRow(['Timestamp', 'User Name', 'Email', 'Love', 'Talent', 'Need', 'Payment', 'Purchase Type', 'Gift Email', 'Gift Message', 'Order Number']);
    }
    
    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.userName || '',
      data.email || '',
      data.love || '',
      data.talent || '',
      data.need || '',
      data.payment || '',
      data.purchaseType || '',
      data.giftEmail || '',
      data.giftMessage || '',
      data.orderNumber || ''
    ]);
    
    return { success: true };
  } catch(error) {
    console.error('Error saving purchase data: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}
