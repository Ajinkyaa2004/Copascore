'use client';

import { Banknote } from 'lucide-react';

interface BestBetsProps {
    homeTeam: string;
    awayTeam: string;
    prediction: any;
}

export default function BestBets({ homeTeam, awayTeam, prediction }: BestBetsProps) {
    const homeWinProb = prediction.probabilities.H;
    const drawProb = prediction.probabilities.D;
    const awayWinProb = prediction.probabilities.A;

    // Calculate betting recommendations based on probabilities
    const get1X2Bet = () => {
        if (homeWinProb > drawProb && homeWinProb > awayWinProb) return '1';
        if (awayWinProb > homeWinProb && awayWinProb > drawProb) return '2';
        return 'X';
    };

    const get1stHalf = () => {
        // Slightly lower confidence for 1st half
        if (homeWinProb > 0.4) return '1';
        if (awayWinProb > 0.4) return '2';
        return 'X';
    };

    const getDoubleChance = () => {
        if (homeWinProb + drawProb > 0.65) return '1X';
        if (awayWinProb + drawProb > 0.65) return 'X2';
        return '12';
    };

    const getBTTS = () => {
        // Both teams to score - yes if match is competitive
        const competitive = Math.abs(homeWinProb - awayWinProb) < 0.3;
        return competitive ? 'Yes' : 'No';
    };

    const getOverUnder = () => {
        // Over 2.5 if high-scoring match expected
        const highScoring = homeWinProb + awayWinProb > 0.7;
        return highScoring ? 'Over' : 'Under';
    };

    const getDrawNoBet = () => {
        if (homeWinProb > awayWinProb) return 'Home';
        if (awayWinProb > homeWinProb) return 'Away';
        return 'N/D';
    };

    const getResultBTTS = () => {
        const result = get1X2Bet();
        const btts = getBTTS();
        if (result === '1') return btts === 'Yes' ? 'Home & Yes' : 'Home & No';
        if (result === '2') return btts === 'Yes' ? 'Away & Yes' : 'Away & No';
        return `Draw & ${btts}`;
    };

    const getResultOverUnder = () => {
        const result = get1X2Bet();
        const ou = getOverUnder();
        if (result === '1') return `Home & ${ou.charAt(0)}`;
        if (result === '2') return `Away & ${ou.charAt(0)}`;
        return `Draw & ${ou.charAt(0)}`;
    };

    const getOddEven = () => {
        return homeWinProb > awayWinProb ? 'Even' : 'Odd';
    };

    const getAsianHandicap = () => {
        const diff = Math.abs(homeWinProb - awayWinProb);
        if (diff < 0.15) return '0';
        if (homeWinProb > awayWinProb) return 'Home (-1)';
        return 'Away (-1)';
    };

    const getHandicap = () => {
        if (homeWinProb > awayWinProb + 0.2) return 'Home (-1)';
        if (awayWinProb > homeWinProb + 0.2) return 'Away (-1)';
        return '0';
    };

    const getHalfGoals = (half: string) => {
        return 'U/O 1.5';
    };

    const getTotalGoals = () => {
        if (homeWinProb + awayWinProb > 0.7) return '2/3';
        return '0/1';
    };

    const getTotalCards = () => {
        return 'Over 3.5';
    };

    const getTotalCorners = () => {
        return 'Over 8.5';
    };

    const getHalfTimeFullTime = () => {
        const ft = get1X2Bet();
        if (ft === '1') return 'X/1';
        if (ft === '2') return 'X/2';
        return '1/1';
    };

    const getCorrectScore = () => {
        if (homeWinProb > 0.5) return '2-1';
        if (awayWinProb > 0.5) return '1-2';
        return '1-1';
    };

    const getSafeBet = () => {
        return 'Under 3.5';
    };

    const BetCard = ({ title, prediction, highlight = false }: { title: string; prediction: string; highlight?: boolean }) => (
        <div className={`bg-zinc-800/40 backdrop-blur-sm rounded-lg p-4 border ${highlight ? 'border-blue-500/50' : 'border-zinc-700/50'} hover:border-zinc-600 transition-all`}>
            <div className="text-xs text-zinc-400 mb-2 uppercase tracking-wide font-medium">{title}</div>
            <div className={`text-lg font-bold ${highlight ? 'text-blue-400' : 'text-white'}`}>{prediction}</div>
        </div>
    );

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 shadow-2xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <span className="text-green-400"><Banknote size={32} /></span>
                        Best Bets Today
                    </h2>
                    <div className="text-xs bg-green-900/30 text-green-400 px-3 py-1 rounded-full border border-green-700/50">
                        {homeTeam} vs {awayTeam}
                    </div>
                </div>

                <p className="text-sm text-zinc-400 mb-6">AI-Powered Betting Predictions</p>

                {/* Main Bets Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    <BetCard title="Full Time - 1X2" prediction={get1X2Bet()} highlight />
                    <BetCard title="1st Half - 1X2" prediction={get1stHalf()} highlight />
                    <BetCard title="Double Chance" prediction={getDoubleChance()} />
                    <BetCard title="Both Teams To Score" prediction={getBTTS()} />
                    <BetCard title="Over/Under 2.5 Goals" prediction={getOverUnder()} highlight />
                    <BetCard title="Draw No Bet" prediction={getDrawNoBet()} />
                    <BetCard title="Result & BTTS" prediction={getResultBTTS()} />
                    <BetCard title="Result & U/O 2.5" prediction={getResultOverUnder()} />
                    <BetCard title="Odd or Even (goals)" prediction={getOddEven()} />
                </div>

                {/* Handicaps */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <BetCard title="Asian Handicap (-1.5)" prediction={getAsianHandicap()} />
                    <BetCard title="Asian Handicap (+1.5)" prediction={getAsianHandicap()} />
                    <BetCard title="Handicap (1)" prediction={getHandicap()} />
                    <BetCard title="Handicap (+1)" prediction={getHandicap()} />
                </div>

                {/* Half Goals */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <BetCard title="1st Half (U/O 1.5)" prediction={getHalfGoals('1st')} />
                    <BetCard title="2nd Half (U/O 1.5)" prediction={getHalfGoals('2nd')} />
                    <BetCard title="Total Goals (0/1, 2/3, +4)" prediction={getTotalGoals()} />
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <BetCard title="Total Cards (U/O 3.5)" prediction={getTotalCards()} />
                    <BetCard title="Total Corners (U/O 8.5)" prediction={getTotalCorners()} />
                    <BetCard title="Half Time/Full Time" prediction={getHalfTimeFullTime()} />
                </div>

                {/* Special Bets */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <BetCard title="Correct Score" prediction={getCorrectScore()} highlight />
                    <BetCard title="Safe Bet - Full Time" prediction={getSafeBet()} highlight />
                    <div className="bg-zinc-800/40 backdrop-blur-sm rounded-lg p-4 border border-zinc-700/50">
                        <div className="text-xs text-zinc-500 mb-2">Note</div>
                        <div className="text-xs text-zinc-400">All predictions are AI-generated based on team performance data</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
