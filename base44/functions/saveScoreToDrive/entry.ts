import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SHEET_NAME = 'LoopyBrain_Scores';
const HEADER_VALUES = [
  'Date', 'Player', 'Game Type', 'Game Name', 'Difficulty',
  'Score', 'Avg Reaction Time (ms)', 'Correct Hits', 'Wrong Hits',
  'Correct Shapes', 'Wrong Shapes', 'Total Time (ms)',
];

const GAME_NAMES = {
  1: 'Color Reaction',
  2: 'Color + Shape',
  3: 'Memory Match',
  4: 'Pro Challenge',
  5: 'Pattern Recognition',
  6: 'Number Memory',
  7: 'Sequence Memory',
  8: 'Juice Maker',
  9: 'Pattern Prediction',
  10: 'Shape Sorting',
  11: 'Twin Hunt',
  12: 'Quick Count',
  13: 'Speed Match',
  14: 'Light Track',
  15: 'Color Invaders',
  16: 'Reverse Sequence',
  17: 'Visual Search',
  18: 'Stroop Color',
  19: 'Reaction Target',
  20: 'Speed Tap',
  21: 'Quick Color',
  22: 'Go / No-Go',
  23: 'Memory Matrix',
  24: 'Shape Stack',
  25: 'N-Back',
  26: 'Odd Color',
  27: 'Odd Size',
  28: 'Spot Difference',
  29: 'Find Max',
  30: 'Tap Order',
  31: 'Math Flash',
  32: 'Higher Lower',
  33: 'Number Sequence',
  34: 'Even Odd',
  35: 'Color Sort',
  36: 'Shape Match',
};

const gameName = (gt) => GAME_NAMES[gt] || 'Unknown';

const formatRow = (r, nameOverride) => [
  r.created_date || new Date().toISOString(),
  nameOverride || r.player_name || '',
  r.game_type,
  gameName(r.game_type),
  r.difficulty,
  r.score,
  r.avg_reaction_time,
  r.correct_hits,
  r.wrong_hits,
  r.correct_shapes ?? '',
  r.wrong_shapes ?? '',
  r.total_time,
];

async function findOrCreateSpreadsheet(accessToken) {
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  const searchData = await searchResponse.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  const createResponse = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: { title: SHEET_NAME },
        sheets: [{ properties: { title: 'Scores' } }],
      }),
    }
  );
  if (!createResponse.ok) throw new Error('Failed to create spreadsheet');
  const createData = await createResponse.json();
  return createData.spreadsheetId;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    const spreadsheetId = await findOrCreateSpreadsheet(accessToken);

    // Bulk sync mode: rewrite the entire sheet from the database so all
    // historical + new records are present.
    if (body.syncAll) {
      const allScores = await base44.asServiceRole.entities.GameScore.list('-created_date', 1000);
      const rows = allScores.map((r) => formatRow(r));
      const values = [HEADER_VALUES, ...rows];

      // Clear existing content, then write everything in one batch.
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores!A:L:clear`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const writeResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores!A1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values }),
        }
      );
      if (!writeResponse.ok) throw new Error('Failed to write bulk data to spreadsheet');
      return Response.json({ success: true, spreadsheetId, synced: rows.length });
    }

    // Single record mode (called automatically after each game).
    const { gameResult, playerName } = body;
    const rowData = formatRow(gameResult, playerName);

    // Ensure the header row is present.
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores!A1:L1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [HEADER_VALUES] }),
      }
    );

    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [rowData] }),
      }
    );
    if (!appendResponse.ok) throw new Error('Failed to append row to spreadsheet');

    return Response.json({ success: true, spreadsheetId });
  } catch (error) {
    console.error('Sheets save error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});