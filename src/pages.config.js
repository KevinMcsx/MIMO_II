import DailyChallenge from './pages/DailyChallenge';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Store from './pages/Store';


export const PAGES = {
    "DailyChallenge": DailyChallenge,
    "Game": Game,
    "Leaderboard": Leaderboard,
    "Profile": Profile,
    "Statistics": Statistics,
    "Store": Store,
}

export const pagesConfig = {
    mainPage: "Game",
    Pages: PAGES,
};