import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'loopybrain_game_scores';

// Save to localStorage
const saveToLocalStorage = (gameData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const scores = stored ? JSON.parse(stored) : [];
    
    const newScore = {
      ...gameData,
      id: Date.now() + Math.random(),
      created_date: new Date().toISOString()
    };
    
    scores.push(newScore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return newScore;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return null;
  }
};

// Get from localStorage
const getFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return [];
  }
};

export const saveGameResult = async (gameData) => {
  // Always save to localStorage
  const localResult = saveToLocalStorage(gameData);
  
  // Try to save to database
  try {
    const result = await base44.entities.GameScore.create(gameData);
    console.log('Game result saved to database:', result);
    
    // Save to Google Drive
    try {
      await base44.functions.invoke('saveScoreToDrive', {
        gameResult: gameData,
        playerName: gameData.player_name,
      });
    } catch (driveError) {
      console.error('Failed to save to Drive (non-critical):', driveError);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to save to database, using localStorage only:', error);
    return localResult;
  }
};

export const getAllResults = async () => {
  try {
    // Get from both sources
    const dbResults = await base44.entities.GameScore.list('-created_date', 1000);
    const localResults = getFromLocalStorage();
    
    // Merge and deduplicate
    const allResults = [...dbResults, ...localResults];
    
    // Sort by date (newest first)
    allResults.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    return allResults;
  } catch (error) {
    console.error('Failed to fetch from database, using localStorage only:', error);
    return getFromLocalStorage();
  }
};

export const downloadResultsAsText = async () => {
  try {
    const results = await getAllResults();
    
    let textContent = '========================================\n';
    textContent += '         MIMO GAME RESULTS\n';
    textContent += '========================================\n\n';
    
    results.forEach((result, index) => {
      const gameNames = ['Color Reaction', 'Color + Shape', 'Memory Match', 'Pro Challenge', 'Pattern Recognition', 'Number Memory', 'Sequence Memory', 'Juice Maker', 'Pattern Prediction', 'Shape Sorting', 'Twin Hunt', 'Quick Count', 'Speed Match', 'Light Track', 'Color Invaders', 'Reverse Sequence', 'Visual Search', 'Stroop Color'];
      const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert'];
      
      textContent += `--- Record #${index + 1} ---\n`;
      textContent += `Player: ${result.player_name || 'Unknown'}\n`;
      textContent += `Game: ${gameNames[result.game_type - 1] || 'Unknown'}\n`;
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