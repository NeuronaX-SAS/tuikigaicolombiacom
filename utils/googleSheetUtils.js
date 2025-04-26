// MOCK IMPLEMENTATION: No credentials file needed
// If you need to restore Google Sheets functionality, replace this file with the original
// and ensure the tuikigaicolombia-617d50e9b56d.json file exists in the parent directory

// Mock authentication function
export async function authenticate() {
    try {
        if (typeof window === 'undefined') {
            // Only import google-spreadsheet on the server
            const { GoogleSpreadsheet } = await import('google-spreadsheet');
            const SPREADSHEET_ID = '1K4awiX_XmFbizrzPttFEru-ZDf2SDTnI3TlpnNzDFOU';
            const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
            // ...use doc as needed in real implementation...
        }
        console.warn('[SheetUtil Auth] MOCK MODE: No actual Google Sheets authentication will occur');
        return true;
    } catch (error) {
        console.error('[SheetUtil Auth] Error in mock auth:', error);
        throw error;
    }
}

// --- Mock implementations of Google Sheets functions ---

/**
 * Mock function for adding a row to the "Ikigai Responses" sheet.
 * @param {object} data - { userName, love, talent, need, payment, timestamp }
 */
export async function addIkigaiResponse(data) {
    try {
        console.warn('[SheetUtil addIkigai] MOCK MODE: No actual data will be saved to Google Sheets');
        console.log('[SheetUtil addIkigai] Would have saved:', data);
        return true;
    } catch (error) {
        console.error('[SheetUtil addIkigai] Error in mock function:', error);
        throw error;
    }
}

/**
 * Mock function for adding a row to the "Promo Codes" sheet.
 * @param {object} data - { name, email, promoCode, timestamp }
 */
export async function addPromoCodeUsage(data) {
    try {
        console.warn('[SheetUtil] MOCK MODE: No actual promo code data will be saved to Google Sheets');
        console.log('[SheetUtil] Would have saved promo code:', data);
        return true;
    } catch (error) {
        console.error('[SheetUtil] Error in mock promo code function:', error);
        throw error;
    }
}

/**
 * Mock function for adding a row to the "Purchases" sheet.
 * @param {object} data - { userName, email, love, talent, need, payment, purchaseType, giftEmail, giftMessage, timestamp, orderNumber }
 */
export async function addPurchase(data) {
    try {
        console.warn('[SheetUtil] MOCK MODE: No actual purchase data will be saved to Google Sheets');
        console.log('[SheetUtil] Would have saved purchase:', data);
        return true;
    } catch (error) {
        console.error('[SheetUtil] Error in mock purchase function:', error);
        throw error;
    }
}

/**
 * Mock function for updating a row in the "Purchases" sheet.
 * @param {string} orderNumberToFind - The initial orderNumber (MP Preference ID) used to find the row.
 * @param {object} dataToUpdate - { paymentId, paymentStatus }
 */
export async function updatePurchasePaymentStatus(orderNumberToFind, dataToUpdate) {
    try {
        console.warn('[SheetUtil] MOCK MODE: No actual purchase status will be updated in Google Sheets');
        console.log(`[SheetUtil] Would have updated row for orderNumber ${orderNumberToFind} with:`, dataToUpdate);
        return true;
    } catch (error) {
        console.error('[SheetUtil] Error in mock update function:', error);
        throw error;
    }
}

// Ensure the mock authentication appears to be working
let isAuthenticating = false;
let authPromise = null;

export async function ensureAuthenticated() {
    console.warn('[SheetUtil] MOCK MODE: No actual Google Sheets authentication will occur');
    return true;
}