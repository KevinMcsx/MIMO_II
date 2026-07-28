import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { gameResult, playerName } = await req.json();
    
    // Get Google Sheets access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    
    // Map game type number to game name
    const gameNames = {
      1: 'Color Reaction',
      2: 'Color + Shape',
      3: 'Memory Match',
      4: 'Pro Challenge',
      5: 'Pattern Recognition',
      6: 'Number Memory',
      7: 'Sequence Memory',
      8: 'Juice Maker',
    };
    const gameName = gameNames[gameResult.game_type] || 'Unknown';
    
    // Format the score data as a row
    const rowData = [
      new Date().toISOString(),
      playerName,
      gameResult.game_type,
      gameName,
      gameResult.difficulty,
      gameResult.score,
      gameResult.avg_reaction_time,
      gameResult.correct_hits,
      gameResult.wrong_hits,
      gameResult.total_time,
    ];
    
    const sheetName = 'LoopyBrain_Scores';
    
    // Search for existing spreadsheet
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const searchData = await searchResponse.json();
    let spreadsheetId;
    
    if (searchData.files && searchData.files.length > 0) {
      // Spreadsheet exists, append to it
      spreadsheetId = searchData.files[0].id;

      // Update header row to include Game Name column
      const headerValues = [
        'Date', 'Player', 'Game Type', 'Game Name', 'Difficulty',
        'Score', 'Avg Reaction Time (ms)', 'Correct Hits', 'Wrong Hits', 'Total Time (ms)',
      ];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores!A1:J1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [headerValues] }),
        }
      );
    } else {
      // Create new spreadsheet with headers
      const createResponse = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              title: sheetName,
            },
            sheets: [{
              properties: {
                title: 'Scores',
              },
              data: [{
                startRow: 0,
                startColumn: 0,
                rowData: [{
                  values: [
                    { userEnteredValue: { stringValue: 'Date' } },
                    { userEnteredValue: { stringValue: 'Player' } },
                    { userEnteredValue: { stringValue: 'Game Type' } },
                    { userEnteredValue: { stringValue: 'Game Name' } },
                    { userEnteredValue: { stringValue: 'Difficulty' } },
                    { userEnteredValue: { stringValue: 'Score' } },
                    { userEnteredValue: { stringValue: 'Avg Reaction Time (ms)' } },
                    { userEnteredValue: { stringValue: 'Correct Hits' } },
                    { userEnteredValue: { stringValue: 'Wrong Hits' } },
                    { userEnteredValue: { stringValue: 'Total Time (ms)' } },
                  ],
                }],
              }],
            }],
          }),
        }
      );
      
      if (!createResponse.ok) {
        throw new Error('Failed to create spreadsheet');
      }
      
      const createData = await createResponse.json();
      spreadsheetId = createData.spreadsheetId;
    }
    
    // Append the new row
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Scores:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );
    
    if (!appendResponse.ok) {
      throw new Error('Failed to append row to spreadsheet');
    }
    
    return Response.json({ success: true, spreadsheetId });
  } catch (error) {
    console.error('Sheets save error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});