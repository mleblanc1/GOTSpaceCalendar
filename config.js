// ============================================================
//  CONFIGURATION — fill these in before deploying
// ============================================================

const CONFIG = {
  // 1. Your Google Sheet ID
  //    Found in the sheet URL:
  //    https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
  SHEET_ID: "https://docs.google.com/spreadsheets/d/1PRdcTklrPqs_reUsddv-dTG8Rr9JUfecqUSCRMhAe0s/edit?usp=sharing",

  // 2. Your Google Sheets API key
  //    Get one at: https://console.cloud.google.com
  //    Enable "Google Sheets API", then create an API key
  API_KEY: "AIzaSyDO1LhSpp3GQ2CHS1HL7T7T3qOq02WeDDk",

  // 3. The name of the tab/sheet that holds your events (default: Sheet1)
  SHEET_NAME: "2025/2026 Academic Year",

  // 4. Column mapping — your sheet needs these columns:
  //      A: Date        (format: YYYY-MM-DD, e.g. 2025-07-04)
  //      B: Event Name
  //      C: Description
  //      D: Location
  //      E: Spots Available  (number, leave blank for unlimited)
  //    Column F is no longer needed — one shared form handles all sign-ups.
  COLUMNS: {
    Date: 0,         // column A
    Time: 1,         // column B
    Organization: 2,  // column C
    Where: 3,     // column D
    spots: 4,        // column E
  },

  // 5. Your shared Google Form URL (embedded in every event modal)
  //
  //    How to get this:
  //      a) Create your form at forms.google.com
  //      b) Click Send → link icon → copy the link
  //      c) Paste it below — the code will add ?embedded=true automatically
  //
  //    Tip: add a "Which event are you signing up for?" dropdown to your
  //    form so you know who signed up for what.
  //
  SIGNUP_FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSf2Mq-o-03D9ShdQIJdGPk7GOUI5YHa2e3diSr3Rk4vsKgREw/viewform?usp=publish-editor",

  // 6. Site display name shown in the header
  SITE_NAME: "Community Calendar",

  // 7. How often to refresh data from the sheet (milliseconds)
  //    300000 = 5 minutes. Set to 0 to disable auto-refresh.
  REFRESH_INTERVAL: 300000,
};
