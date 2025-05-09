// ✅ BACKEND: Express App (index.js or app.js)
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const SHEET_TEMPLATES = {
  'KX 2 Cost Template V0.1': {
    spreadsheetId: '1AblxbQvFR6j142noUwRPXrngnQNFMBYLUSqwPLO_-a0',
    sheetId: 669704309,
  },
  'KX 1 Cost Template V0.1': {
    spreadsheetId: '1v8DNTtEmfCWGDASzunnKxBfNcHumJglilZSgx_6EOgU',
    sheetId: 1383679528,
  },
  'KX 3 Cost Template V0.1': {
    spreadsheetId: '13Oj32-uRSuzWQuFUd5CnAsm-cJQDz0GBTjMwWqA_Dik',
    sheetId: 1638538331,
  },
};

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.get('/templates', (req, res) => {
  res.json(SHEET_TEMPLATES);
});

app.post('/duplicate-sheet', async (req, res) => {
  const { newSheetName, templateSheetId, templateSpreadsheetId } = req.body;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const result = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: templateSpreadsheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: {
              sourceSheetId: templateSheetId,
              insertSheetIndex: 1,
              newSheetName,
            },
          },
        ],
      },
    });
    res.json(result.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/update-values', async (req, res) => {
  const { spreadsheetId, range, values } = req.body;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    res.json(result.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/read-values', async (req, res) => {
  const { spreadsheetId, range } = req.query;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    res.json(result.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`✅ Express backend running at http://localhost:${port}`);
});
