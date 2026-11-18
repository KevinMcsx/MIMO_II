import { consumeInputMode } from '@/lib/inputMode';
import { gameName } from '@/lib/gameDefinitions';
import { localData } from '@/api/localData';
import { queueSheetResult } from '@/lib/sheetsSync';

export async function saveGameResult(gameData) {
  const result = await localData.entities.GameScore.create({ ...gameData, input_mode: gameData.input_mode ?? consumeInputMode(), sheetSyncPending: true });
  queueSheetResult();
  return result;
}

export const getAllResults = () => localData.entities.GameScore.list('-created_date');

export const downloadResultsAsText = async () => {
  try {
    const results = await getAllResults();
    
    let textContent = '========================================\n';
    textContent += '         MIMO GAME RESULTS\n';
    textContent += '========================================\n\n';
    
    results.forEach((result, index) => {

      const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert'];
      
      textContent += `--- Record #${index + 1} ---\n`;
      textContent += `Player: ${result.player_name || 'Unknown'}\n`;
      textContent += `Game: ${gameName(result.game_type) || 'Unknown'}\n`;
      textContent += `Difficulty: ${difficultyNames[result.difficulty - 1] || 'Unknown'}\n`;
      textContent += `Score: ${result.score || 0}\n`;
      textContent += `Total Time: ${((result.total_time || 0) / 1000).toFixed(2)}s\n`;
      textContent += `Avg Reaction Time: ${(result.avg_reaction_time || 0).toFixed(0)}ms\n`;
      textContent += `Correct Hits: ${result.correct_hits || 0}\n`;
      textContent += `Wrong Hits: ${result.wrong_hits || 0}\n`;
      
      if (result.correct_shapes !== undefined) {
        textContent += `Correct Shapes: ${result.correct_shapes}\n`;
        textContent += `Wrong Shapes: ${result.wrong_shapes}\n`;
      }
      
      const date = new Date(result.created_date);
      textContent += `Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`;
      textContent += '\n';
    });
    
    textContent += '========================================\n';
    textContent += `Total Records: ${results.length}\n`;
    textContent += '========================================\n';
    
    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimo_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download results:', error);
  }
};