import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Get the specific game data from the request body
    // Assumes you send a JSON object with these fields from your game frontend
    const gameData = await req.json();
    
    const {
      player_name = 'Unknown',
      game_type = 'LoopyBrain',
      difficulty = 'Normal',
      score = 0,
      avg_reaction_time = 0,
      total_time = 0,
      correct_hits = 0,
      wrong_hits = 0,
      correct_shapes = 0,
      wrong_shapes = 0
    } = gameData;

    // Calculate Accuracy
    const totalHits = correct_hits + wrong_hits;
    const accuracy = totalHits > 0 
      ? ((correct_hits / totalHits) * 100).toFixed(1) 
      : '0';

    // 2. Format a single-row CSV
    const headers = ['Player Name', 'Game Type', 'Difficulty', 'Score', 'Avg Reaction Time', 'Total Time', 'Correct Hits', 'Wrong Hits', 'Correct Shapes', 'Wrong Shapes', 'Accuracy', 'Date'];
    
    // Helper to safely escape CSV values
    const escapeCsv = (val) => {
      const stringVal = String(val);
      if (stringVal.search(/("|,|\n)/g) >= 0) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const row = [
      player_name, game_type, difficulty, score, 
      avg_reaction_time, total_time, 
      correct_hits, wrong_hits, correct_shapes, wrong_shapes, 
      `${accuracy}%`, new Date().toISOString()
    ];

    const csvContent = [
      headers.map(escapeCsv).join(','), // Include header so file is readable on its own
      row.map(escapeCsv).join(',')
    ].join('\n');

    // 3. Define File Name and Target Folder
    // Target Folder ID extracted from your link
    const FOLDER_ID = '1olS6d1ajpHuaruxPcuy3yF5A_vPtfLT3'; 
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Naming convention: Game_Score_[Time]_[Player].csv
    const filename = `Game_Score_${score}_${timestamp}.csv`;

    // 4. Get Google Drive Access Token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googledrive");

    // 5. Prepare Multipart Upload
    const boundary = '-------314159265358979323846';
    
    const metadata = {
      name: filename,
      mimeType: 'text/csv',
      parents: [FOLDER_ID] // <--- THIS IS THE MAGIC PART
    };

    const multipartRequestBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: text/csv',
      '',
      csvContent,
      `--${boundary}--`
    ].join('\r\n');

    // 6. Upload to Google Drive
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Google Drive API Error:', errorText);
      throw new Error(`Google Drive upload failed: ${errorText}`);
    }

    const result = await uploadResponse.json();
    const webViewLink = `https://drive.google.com/file/d/${result.id}/view`;

    return Response.json({
      success: true,
      message: 'Game score uploaded!',
      fileLink: webViewLink,
      fileName: filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});