import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Statistics from './pages/Statistics';
import DailyChallenge from './pages/DailyChallenge';


export const PAGES = {
    "Game": Game,
    "Leaderboard": Leaderboard,
    "Statistics": Statistics,
    "DailyChallenge": DailyChallenge,
}

export const pagesConfig = {
    mainPage: "Game",
    Pages: PAGES,
};