import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameResult, playerName } = await req.json();
    
    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    
    // Format the score data
    const scoreData = {
      date: new Date().toISOString(),
      playerName,
      gameType: gameResult.game_type,
      difficulty: gameResult.difficulty,
      score: gameResult.score,
      avgReactionTime: gameResult.avg_reaction_time,
      correctHits: gameResult.correct_hits,
      wrongHits: gameResult.wrong_hits,
      totalTime: gameResult.total_time,
    };
    
    // Create CSV content
    const csvContent = `${scoreData.date},${scoreData.playerName},${scoreData.gameType},${scoreData.difficulty},${scoreData.score},${scoreData.avgReactionTime},${scoreData.correctHits},${scoreData.wrongHits},${scoreData.totalTime}\n`;
    
    // Check if file exists
    const fileName = 'LoopyBrain_Scores.csv';
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const searchData = await searchResponse.json();
    
    if (searchData.files && searchData.files.length > 0) {
      // File exists, append to it
      const fileId = searchData.files[0].id;
      
      // Get current content
      const getResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      const currentContent = await getResponse.text();
      const newContent = currentContent + csvContent;
      
      // Update file
      const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
          },
          body: newContent,
        }
      );
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update file in Drive');
      }
      
      return Response.json({ success: true, action: 'updated' });
    } else {
      // Create new file with header
      const header = 'Date,Player,GameType,Difficulty,Score,AvgReactionTime,CorrectHits,WrongHits,TotalTime\n';
      const fullContent = header + csvContent;
      
      const metadata = {
        name: fileName,
        mimeType: 'text/csv',
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fullContent], { type: 'text/csv' }));
      
      const createResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: form,
        }
      );
      
      if (!createResponse.ok) {
        throw new Error('Failed to create file in Drive');
      }
      
      return Response.json({ success: true, action: 'created' });
    }
  } catch (error) {
    console.error('Drive save error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});