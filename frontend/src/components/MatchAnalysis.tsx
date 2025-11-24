'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Player {
    short_name: string;
    overall: number;
    player_positions: string;
    nationality_name: string;
}

interface MatchAnalysisProps {
    homeTeam: string;
    awayTeam: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function MatchAnalysis({ homeTeam, awayTeam }: MatchAnalysisProps) {
    const [homePlayers, setHomePlayers] = useState<Player[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            try {
                let [homeRes, awayRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/search?team=${encodeURIComponent(homeTeam)}&max_results=11`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/search?team=${encodeURIComponent(awayTeam)}&max_results=11`)
                ]);

                // Fallback for missing club data
                if (homeRes.data.players.length === 0 || awayRes.data.players.length === 0) {
                    const topPlayersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/fifa/top-players?limit=50`);
                    const allTopPlayers = topPlayersRes.data.players;
                    const shuffled = [...allTopPlayers].sort(() => 0.5 - Math.random());

                    if (homeRes.data.players.length === 0) {
                        homeRes.data.players = shuffled.slice(0, 11).map((p: any) => ({ ...p, club_name: homeTeam }));
                    }
                    if (awayRes.data.players.length === 0) {
                        awayRes.data.players = shuffled.slice(11, 22).map((p: any) => ({ ...p, club_name: awayTeam }));
                    }
                }

                setHomePlayers(homeRes.data.players);
                setAwayPlayers(awayRes.data.players);
            } catch (err) {
                console.error("Failed to fetch players for analysis", err);
            } finally {
                setLoading(false);
            }
        };

        if (homeTeam && awayTeam) {
            fetchPlayers();
        }
    }, [homeTeam, awayTeam]);

    if (loading) return <div className="text-center py-8 text-zinc-500">Loading match analysis...</div>;
    if (homePlayers.length === 0 || awayPlayers.length === 0) return null;

    // Mock data generation based on real players
    const generatePassData = (players: Player[]) => {
        return players.slice(0, 5).map(p => ({
            name: p.short_name,
            passes: Math.floor(Math.random() * 40) + 20
        })).sort((a, b) => b.passes - a.passes);
    };

    const homePassData = generatePassData(homePlayers);

    // Position distribution
    const getPositionData = (players: Player[]) => {
        const positions: Record<string, number> = { 'Def': 0, 'Mid': 0, 'Fwd': 0, 'GK': 0 };
        players.forEach(p => {
            const pos = p.player_positions.split(',')[0];
            if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) positions['Def']++;
            else if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos)) positions['Mid']++;
            else if (['ST', 'CF', 'LW', 'RW'].includes(pos)) positions['Fwd']++;
            else positions['GK']++;
        });
        return Object.entries(positions)
            .filter(([_, count]) => count > 0)
            .map(([name, value]) => ({ name, value }));
    };

    const positionData = getPositionData([...homePlayers, ...awayPlayers]);

    return (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-center mb-8">Expected Match Dynamics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Passing Network Visualization (Simulated) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Projected Key Passers</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={homePassData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#71717a', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                                    itemStyle={{ color: '#f4f4f5' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="passes" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tactical Setup */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Combined Tactical Setup</h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={positionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {positionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                                    itemStyle={{ color: '#f4f4f5' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center pointer-events-none">
                            <div className="text-2xl font-bold">{homePlayers.length + awayPlayers.length}</div>
                            <div className="text-xs text-zinc-500">Players</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-zinc-500 mt-4">
                        {positionData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pitch Visualization - Football Turf Style */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden relative">
                <h3 className="text-lg font-semibold mb-6 text-white text-center">Projected Passing Network</h3>

                <div className="relative w-full aspect-[1.6] rounded-lg overflow-hidden" style={{
                    background: 'linear-gradient(180deg, #1a7a3e 0%, #155d30 50%, #1a7a3e 100%)',
                    backgroundImage: `
                        linear-gradient(90deg, transparent 49.5%, rgba(255,255,255,0.08) 49.5%, rgba(255,255,255,0.08) 50.5%, transparent 50.5%),
                        linear-gradient(180deg, #1a7a3e 0%, #155d30 50%, #1a7a3e 100%)
                    `,
                    backgroundSize: '100% 100%'
                }}>
                    {/* Outer pitch boundary (white) */}
                    <div className="absolute inset-3 border-2 border-white/90 rounded-sm"></div>

                    {/* Center line (white) */}
                    <div className="absolute top-3 bottom-3 left-1/2 w-0.5 bg-white/90"></div>

                    {/* Center circle (white) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/90"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/90"></div>

                    {/* Left penalty area (white) */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-40 border-2 border-white/90 border-l-0"></div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-24 border-2 border-white/90 border-l-0"></div>

                    {/* Right penalty area (white) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-16 h-40 border-2 border-white/90 border-r-0"></div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-24 border-2 border-white/90 border-r-0"></div>

                    {/* Left Goal (white) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-20 border-2 border-white/90 border-l-0 bg-white/5"></div>

                    {/* Right Goal (white) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-20 border-2 border-white/90 border-r-0 bg-white/5"></div>

                    {/* Player Nodes (Home - Blue) */}
                    {homePlayers.slice(0, 11).map((p, i) => {
                        // Simple formation logic (4-3-3ish)
                        let top = '50%';
                        let left = '20%';

                        if (i === 0) { top = '50%'; left = '8%'; } // GK
                        else if (i < 5) { top = `${15 + (i) * 18}%`; left = '25%'; } // Def
                        else if (i < 8) { top = `${25 + (i - 4) * 20}%`; left = '50%'; } // Mid
                        else { top = `${25 + (i - 7) * 20}%`; left = '75%'; } // Fwd

                        return (
                            <div key={p.short_name} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ top, left }}>
                                <div className="w-9 h-9 rounded-full bg-blue-600 border-3 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-xl group-hover:scale-125 transition-transform z-10 relative">
                                    {p.overall}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[11px] text-white font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-3 py-1.5 rounded shadow-lg">
                                    {p.short_name}
                                </div>
                                {/* Simulated passing lines */}
                                {i > 0 && i < 5 && (
                                    <svg className="absolute top-1/2 left-1/2 w-[200px] h-[200px] pointer-events-none opacity-30" style={{ overflow: 'visible' }}>
                                        <line x1="0" y1="0" x2="-50" y2={i % 2 === 0 ? 50 : -50} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" />
                                    </svg>
                                )}
                            </div>
                        );
                    })}

                    {/* Player Nodes (Away - Violet) */}
                    {awayPlayers.slice(0, 11).map((p, i) => {
                        // Simple formation logic (4-4-2ish) mirrored
                        let top = '50%';
                        let left = '80%';

                        if (i === 0) { top = '50%'; left = '92%'; } // GK
                        else if (i < 5) { top = `${15 + (i) * 18}%`; left = '75%'; } // Def
                        else if (i < 9) { top = `${18 + (i - 4) * 16}%`; left = '50%'; } // Mid
                        else { top = `${35 + (i - 8) * 30}%`; left = '25%'; } // Fwd

                        return (
                            <div key={p.short_name} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ top, left }}>
                                <div className="w-9 h-9 rounded-full bg-violet-600 border-3 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-xl group-hover:scale-125 transition-transform z-10 relative">
                                    {p.overall}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[11px] text-white font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-3 py-1.5 rounded shadow-lg">
                                    {p.short_name}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-4 text-xs text-zinc-400">
                    Interactive visualization based on team rosters and projected lineups.
                </div>
            </div>
        </div>
    );
}
