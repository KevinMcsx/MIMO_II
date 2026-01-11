import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googledrive");
    
    // Fetch all game scores
    const scores = await base44.asServiceRole.entities.GameScore.list('-created_date', 1000);
    
    // Format data as CSV
    const headers = ['Player Name', 'Game Type', 'Difficulty', 'Score', 'Avg Reaction Time', 'Total Time', 'Correct Hits', 'Wrong Hits', 'Correct Shapes', 'Wrong Shapes', 'Accuracy', 'Date'];
    
    const csvRows = [headers.join(',')];
    
    for (const score of scores) {
      const accuracy = score.correct_hits > 0 
        ? ((score.correct_hits / (score.correct_hits + score.wrong_hits)) * 100).toFixed(1)
        : '0';
        
      const row = [
        score.player_name || 'Unknown',
        score.game_type || '',
        score.difficulty || '',
        score.score || 0,
        score.avg_reaction_time || '',
        score.total_time || '',
        score.correct_hits || 0,
        score.wrong_hits || 0,
        score.correct_shapes || 0,
        score.wrong_shapes || 0,
        `${accuracy}%`,
        score.created_date || ''
      ];
      
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `LoopyBrain_Statistics_${timestamp}.csv`;
    
    // Upload to Google Drive
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const metadata = {
      name: filename,
      mimeType: 'text/csv',
      parents: ['1olS6d1ajpHuaruxPcuy3yF5A_vPtfLT3']
    };
    
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/csv\r\n\r\n' +
      csvContent +
      closeDelimiter;
    
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
      throw new Error(`Google Drive upload failed: ${errorText}`);
    }
    
    const result = await uploadResponse.json();
    
    return Response.json({
      success: true,
      fileId: result.id,
      fileName: filename,
      totalRecords: scores.length,
      message: 'Game statistics uploaded to Google Drive successfully'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});