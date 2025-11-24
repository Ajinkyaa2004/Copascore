// API service for backend communication
import axios from 'axios';
import type { MatchPrediction, MatchStats, TeamForm, TableRow, PlayerCard } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Get all teams
  getTeams: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/teams`);
    return response.data.teams;
  },

  // Predict match outcome
  predictMatch: async (
    homeTeam: string,
    awayTeam: string,
    odds: { b365h: number; b365d: number; b365a: number }
  ): Promise<MatchPrediction> => {
    const response = await axios.post(`${API_BASE_URL}/predict`, {
      home_team: homeTeam,
      away_team: awayTeam,
      b365h: parseFloat(odds.b365h.toString()),
      b365d: parseFloat(odds.b365d.toString()),
      b365a: parseFloat(odds.b365a.toString()),
    });
    return response.data;
  },

  // Get match statistics
  getMatchStats: async (homeTeam: string, awayTeam: string): Promise<MatchStats> => {
    const response = await axios.post(`${API_BASE_URL}/stats`, {
      home_team: homeTeam,
      away_team: awayTeam,
    });
    return response.data;
  },

  // Get team form
  getTeamForm: async (team: string, matches: number = 5): Promise<TeamForm | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team-form/${team}`, {
        params: { matches },
      });
      return response.data;
    } catch {
      return null;
    }
  },

  // Simulate season
  simulateSeason: async (): Promise<TableRow[]> => {
    const response = await axios.get(`${API_BASE_URL}/simulate`);
    return response.data.table;
  },

  // Chat with AI
  chatWithAI: async (message: string): Promise<string> => {
    const response = await axios.post(`${API_BASE_URL}/chat`, { message });
    return response.data.response;
  },

  // Get team players
  getTeamPlayers: async (team: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/players/${team}`);
    return response.data.players;
  },

  // Get player card
  getPlayerCard: async (team: string, player: string): Promise<PlayerCard | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/player-card`, { team, player });
      return response.data;
    } catch {
      return null;
    }
  },
};
