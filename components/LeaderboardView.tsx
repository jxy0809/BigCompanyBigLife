import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Building2, RefreshCw, Medal } from 'lucide-react';
import { LeaderboardType, LeaderboardData, LeaderboardEntry } from '../leaderboard/types';
import { leaderboardClient } from '../leaderboard/leaderboardClient';
import { tapTapMCP } from '../platform/tapTapMCP';

const TAB_CONFIG = [
  { type: LeaderboardType.WEEKLY, label: '周榜', icon: TrendingUp },
  { type: LeaderboardType.TOTAL, label: '总榜', icon: Trophy },
  { type: LeaderboardType.INDUSTRY, label: '行业榜', icon: Building2 },
] as const;

const MEDAL_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
};

const RANK_BG: Record<number, string> = {
  1: 'bg-yellow-50 border-yellow-200',
  2: 'bg-gray-50 border-gray-200',
  3: 'bg-amber-50 border-amber-200',
};

const LeaderboardEntryRow: React.FC<{ entry: LeaderboardEntry; isPlayer: boolean }> = ({ entry, isPlayer }) => {
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-[#f0f1f2] select-none ${
        isPlayer ? 'bg-blue-50 border-blue-100' : ''
      } ${isTop3 && !isPlayer ? RANK_BG[entry.rank] || '' : ''}`}
    >
      {/* Rank */}
      <div className="w-8 flex-shrink-0 text-center">
        {entry.rank <= 3 ? (
          <Medal size={20} className={MEDAL_COLORS[entry.rank] || 'text-gray-400'} />
        ) : (
          <span className="text-sm font-bold text-[#8f959e]">{entry.rank}</span>
        )}
      </div>

      {/* Avatar placeholder */}
      <div className="w-9 h-9 rounded-full bg-[#e1eaff] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-[#3370ff]">
          {entry.nickName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium truncate ${isPlayer ? 'text-[#3370ff]' : 'text-[#1f2329]'}`}>
            {entry.nickName}
          </span>
          {isPlayer && (
            <span className="text-[10px] bg-[#3370ff] text-white px-1.5 py-0.5 rounded font-medium">你</span>
          )}
        </div>
        {entry.meta && (
          <div className="text-[10px] text-[#8f959e] flex gap-2 mt-0.5">
            {entry.meta.week && <span>W{entry.meta.week}</span>}
            {entry.meta.level && <span>Lv{entry.meta.level}</span>}
            {entry.meta.money !== undefined && <span>{Math.floor(entry.meta.money)}元</span>}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-sm font-bold text-[#1f2329] tabular-nums flex-shrink-0">
        {entry.score.toLocaleString()}
      </div>
    </div>
  );
};

const LeaderboardView: React.FC = () => {
  const [activeType, setActiveType] = useState<LeaderboardType>(LeaderboardType.WEEKLY);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const playerId = tapTapMCP.getUserId();

  const fetchLeaderboard = async (type: LeaderboardType) => {
    setLoading(true);
    try {
      const result = await leaderboardClient.getLeaderboard(type);
      setData(result);
    } catch (err) {
      console.error('[Leaderboard] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeType);
  }, [activeType]);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-[#dee0e3]">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={20} className="text-[#3370ff]" />
          <h2 className="text-base font-bold text-[#1f2329]">排行榜</h2>
        </div>

        {/* Tab selector */}
        <div className="flex bg-[#f5f6f7] rounded-lg p-0.5">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveType(tab.type)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive ? 'bg-white text-[#3370ff] shadow-sm' : 'text-[#8f959e]'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Player's rank card */}
      {data?.playerRank && (
        <div className="mx-4 mt-3 bg-gradient-to-r from-[#e1eaff] to-[#f0f4ff] rounded-xl p-3 border border-[#c9d8f8]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#8f959e] font-medium">你的排名</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-[#3370ff]">#{data.playerRank}</span>
                {data.playerScore !== undefined && (
                  <span className="text-sm text-[#646a73]">{data.playerScore.toLocaleString()} 分</span>
                )}
              </div>
            </div>
            <div className="text-[10px] text-[#8f959e]">
              共 {data.totalPlayers} 人参与
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto no-scrollbar mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="text-[#8f959e] animate-spin" />
              <span className="text-sm text-[#8f959e]">加载中...</span>
            </div>
          </div>
        ) : data && data.entries.length > 0 ? (
          data.entries.map((entry) => (
            <LeaderboardEntryRow
              key={`${entry.userId}-${entry.rank}`}
              entry={entry}
              isPlayer={entry.userId === playerId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[#8f959e]">
            <Trophy size={40} className="mb-3 opacity-30" />
            <p className="text-sm">暂无排行数据</p>
            <p className="text-xs mt-1">完成一局游戏后即可上榜</p>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="px-4 py-3 border-t border-[#f0f1f2]">
        <button
          onClick={() => fetchLeaderboard(activeType)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#3370ff] font-medium hover:bg-[#f0f4ff] rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          刷新排行
        </button>
      </div>
    </div>
  );
};

export default LeaderboardView;
