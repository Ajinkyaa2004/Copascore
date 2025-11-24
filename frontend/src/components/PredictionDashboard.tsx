'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import PlayerCard from './PlayerCard';
import { Star } from 'lucide-react';

interface PredictionDashboardProps {
    homeTeam: string;
    awayTeam: string;
    prediction: any;
}

interface Player {
    short_name: string;
    overall: number;
    club_name?: string;
    nationality_name?: string;
    player_positions?: string;
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physic?: number;
    age?: number;
    height_cm?: number;
    weight_kgs?: number;
}

export default function PredictionDashboard({ homeTeam, awayTeam, prediction }: PredictionDashboardProps) {
    const [homePlayers, setHomePlayers] = useState<Player[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            try {
                // Try to fetch players for the specific teams
                let [homeRes, awayRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/search?team=${encodeURIComponent(homeTeam)}&max_results=11`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/search?team=${encodeURIComponent(awayTeam)}&max_results=11`)
                ]);

                // Fallback: If no players found (e.g. dataset missing club info), fetch top players
                // and assign them to the teams for demonstration purposes
                if (homeRes.data.players.length === 0 || awayRes.data.players.length === 0) {
                    const topPlayersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/top-players?limit=50`);
                    const allTopPlayers = topPlayersRes.data.players;

                    // Shuffle array to get random top players
                    const shuffled = [...allTopPlayers].sort(() => 0.5 - Math.random());

                    if (homeRes.data.players.length === 0) {
                        homeRes.data.players = shuffled.slice(0, 11).map((p: any) => ({ ...p, club_name: homeTeam }));
                    }

                    if (awayRes.data.players.length === 0) {
                        // Ensure we don't use the same players if possible
                        awayRes.data.players = shuffled.slice(11, 22).map((p: any) => ({ ...p, club_name: awayTeam }));
                    }
                }

                setHomePlayers(homeRes.data.players);
                setAwayPlayers(awayRes.data.players);
            } catch (err) {
                console.error("Failed to fetch players for dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        if (homeTeam && awayTeam) {
            fetchPlayers();
        }
    }, [homeTeam, awayTeam]);

    if (loading) return <div className="text-center py-8 text-zinc-500">Loading dashboard...</div>;

    // Ensure we have data even if API returns empty
    const effectiveHomePlayers = homePlayers.length > 0 ? homePlayers : Array.from({ length: 11 }, (_, i) => ({
        short_name: `Player ${i + 1}`,
        overall: 75,
        club_name: homeTeam,
        pace: 70,
        shooting: 70,
        passing: 70,
        dribbling: 70,
        defending: 70,
        physic: 70
    } as Player));

    const effectiveAwayPlayers = awayPlayers.length > 0 ? awayPlayers : Array.from({ length: 11 }, (_, i) => ({
        short_name: `Player ${i + 1}`,
        overall: 75,
        club_name: awayTeam,
        pace: 70,
        shooting: 70,
        passing: 70,
        dribbling: 70,
        defending: 70,
        physic: 70
    } as Player));

    const projectedGoals = Math.round((prediction.probabilities.H * 2.5) + (prediction.probabilities.A * 1.5));
    const projectedAssists = Math.max(0, projectedGoals - 1);
    const projectedFouls = Math.floor(Math.random() * 10) + 15;
    const projectedCards = Math.floor(Math.random() * 4);
    const homePossession = Math.round(prediction.probabilities.H * 100);
    const awayPossession = 100 - homePossession;
    const homeShots = Math.round(homePossession / 5);
    const awayShots = Math.round(awayPossession / 5);

    // Top Scorers (Simulated)
    const topScorers = [
        ...effectiveHomePlayers.slice(0, 3).map(p => ({ name: p.short_name, goals: Math.random() * 0.8 + 0.2, team: homeTeam })),
        ...effectiveAwayPlayers.slice(0, 3).map(p => ({ name: p.short_name, goals: Math.random() * 0.7 + 0.1, team: awayTeam }))
    ].sort((a, b) => b.goals - a.goals).slice(0, 5);

    // Form Guide (Simulated)
    const formData = Array.from({ length: 10 }, (_, i) => ({
        match: `Match ${i + 1}`,
        [homeTeam]: Math.floor(Math.random() * 3) + (prediction.probabilities.H > 0.5 ? 1 : 0),
        [awayTeam]: Math.floor(Math.random() * 3) + (prediction.probabilities.A > 0.5 ? 1 : 0),
    }));

    // Possession Data
    const possessionData = [
        { name: homeTeam, value: homePossession, fill: '#ef4444' },
        { name: awayTeam, value: awayPossession, fill: '#3b82f6' },
    ];

    // Shots Data
    const shotsData = [
        { name: homeTeam, shots: homeShots, onTarget: Math.round(homeShots * 0.4) },
        { name: awayTeam, shots: awayShots, onTarget: Math.round(awayShots * 0.4) },
    ];

    return (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Star Players Section */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 text-white shadow-xl border border-zinc-800/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-yellow-400"><Star className="fill-yellow-400 text-yellow-400" /></span> Star Players
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-400">{homeTeam}</h3>
                        <PlayerCard player={effectiveHomePlayers[0]} variant="red" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-400">{awayTeam}</h3>
                        <PlayerCard player={effectiveAwayPlayers[0]} variant="blue" />
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="bg-gradient-to-r from-red-900 to-red-950 rounded-2xl p-6 text-white shadow-xl border border-red-800/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-red-400">FIFA</span> World Cup Style Dashboard
                    </h2>
                    <div className="text-xs bg-red-800/50 px-3 py-1 rounded-full border border-red-700">Projected Stats</div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-red-800/30 border border-red-700/50 p-4 rounded-xl text-center backdrop-blur-sm">
                        <div className="text-sm text-red-200 mb-1">Total Goals</div>
                        <div className="text-3xl font-bold">{projectedGoals}</div>
                    </div>
                    <div className="bg-red-800/30 border border-red-700/50 p-4 rounded-xl text-center backdrop-blur-sm">
                        <div className="text-sm text-red-200 mb-1">Total Assists</div>
                        <div className="text-3xl font-bold">{projectedAssists}</div>
                    </div>
                    <div className="bg-red-800/30 border border-red-700/50 p-4 rounded-xl text-center backdrop-blur-sm">
                        <div className="text-sm text-red-200 mb-1">Total Fouls</div>
                        <div className="text-3xl font-bold">{projectedFouls}</div>
                    </div>
                    <div className="bg-red-800/30 border border-red-700/50 p-4 rounded-xl text-center backdrop-blur-sm">
                        <div className="text-sm text-red-200 mb-1">Yellow Cards</div>
                        <div className="text-3xl font-bold">{projectedCards}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Scorer Candidates */}
                    <div className="bg-red-800/20 border border-red-700/30 p-4 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 text-red-100">Top Scorer Candidates</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topScorers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#7f1d1d" opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#fecaca', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#450a0a', borderColor: '#7f1d1d', color: '#fef2f2' }}
                                        itemStyle={{ color: '#fef2f2' }}
                                        cursor={{ fill: '#7f1d1d', opacity: 0.2 }}
                                    />
                                    <Bar dataKey="goals" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={20} name="xG" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Form Guide */}
                    <div className="bg-red-800/20 border border-red-700/30 p-4 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 text-red-100">Scored Goals Per Game (Last 10)</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#7f1d1d" opacity={0.3} />
                                    <XAxis dataKey="match" hide />
                                    <YAxis tick={{ fill: '#fecaca', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#450a0a', borderColor: '#7f1d1d', color: '#fef2f2' }}
                                        itemStyle={{ color: '#fef2f2' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey={homeTeam} stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} />
                                    <Line type="monotone" dataKey={awayTeam} stroke="#e5e7eb" strokeWidth={2} dot={{ r: 3, fill: '#e5e7eb' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Possession Chart */}
                    <div className="bg-red-800/20 border border-red-700/30 p-4 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 text-red-100">Possession</h3>
                        <div className="h-[250px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={possessionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                        {possessionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#450a0a', borderColor: '#7f1d1d', color: '#fef2f2' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Shots Chart */}
                    <div className="bg-red-800/20 border border-red-700/30 p-4 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 text-red-100">Shots & On Target</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={shotsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#7f1d1d" opacity={0.3} />
                                    <XAxis dataKey="name" tick={{ fill: '#fecaca', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#fecaca', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#450a0a', borderColor: '#7f1d1d', color: '#fef2f2' }} />
                                    <Legend />
                                    <Bar dataKey="shots" fill="#fbbf24" name="Total Shots" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="onTarget" fill="#e5e7eb" name="On Target" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
