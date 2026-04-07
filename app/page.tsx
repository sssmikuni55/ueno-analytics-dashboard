'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  MousePointerClick, 
  Eye, 
  Heart, 
  Calendar, 
  MessageCircle, 
  Info,
  ChevronRight,
  TrendingUp,
  Loader2,
  Smartphone,
  Monitor,
  LayoutGrid,
  ExternalLink,
  Sparkles,
  X,
  ChevronLeft,
  Search,
  MousePointer2,
  BarChart3
} from 'lucide-react';
import { 
  ComposedChart,
  Area, 
  Line,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';

/**
 * カスタム・カレンダーコンポーネント (保育園/プレミアム・デザイン)
 */
const CustomCalendarPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const [viewDate, setViewDate] = useState(new Date(value.slice(0,4) + '-' + value.slice(4,6) + '-' + value.slice(6,8)));
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(currentYear, currentMonth);
  const offset = firstDayOfMonth(currentYear, currentMonth);

  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const handleDayClick = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}${mm}${dd}`);
    setShow(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="font-black text-sm block mb-2 text-white/80">{label}</label>
      <button 
        type="button"
        onClick={() => setShow(!show)}
        className="w-full bg-slate-950/60 text-white p-4 rounded-xl border border-white/20 text-left font-bold flex justify-between items-center hover:bg-slate-900 transition-all font-black"
      >
        {value.slice(0,4)}/{value.slice(4,6)}/{value.slice(6,8)}
        <Calendar className="w-5 h-5 text-primary opacity-60" />
      </button>

      {show && (
        <div className="absolute top-full left-0 mt-3 w-[340px] bg-slate-900 border-2 border-white/30 p-6 shadow-2xl rounded-3xl z-[150] animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-6">
            <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-white"><ChevronLeft size={24} /></button>
            <div className="text-white font-black text-lg">{currentYear}年 {currentMonth + 1}月</div>
            <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-white"><ChevronRight size={24} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-black text-xs text-white/60 mb-2">
            <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const isSelected = value === `${currentYear}${String(currentMonth + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`p-3 rounded-xl font-black text-base transition-all ${isSelected ? 'ichika-gradient text-white shadow-lg' : 'text-white hover:bg-white/10'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 読みやすいカスタムツールチップ
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border-2 border-white/20 p-5 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-150">
        <p className="text-white text-lg font-black mb-4 pb-2 border-b border-white/10 uppercase tracking-widest">{label}</p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                <span className="text-white/80 text-sm font-bold">{entry.name}</span>
              </div>
              <span className="text-white text-base font-black">
                {entry.value.toLocaleString()} <span className="text-[10px] opacity-60">累計</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const formatDateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const past7Days = new Date(new Date().setDate(today.getDate() - 7));
  const yesterday = new Date(new Date().setDate(today.getDate() - 1));
  
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(past7Days));
  const [endDate, setEndDate] = useState(formatDateToYYYYMMDD(yesterday));
  const [tempStartDate, setTempStartDate] = useState(startDate); 
  const [tempEndDate, setTempEndDate] = useState(endDate); 
  
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState('all'); 
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'こんにちは！サイト分析アシスタントの「いちか」です。園のWebサイトがより多くの方に届くよう、データを分析してサポートさせていただきます。気になることがあればいつでもご相談ください。' }
  ]);
  
  const [gscData, setGscData] = useState<{ trends: any[], keywords: any[] }>({ trends: [], keywords: [] });
  const [gscLoading, setGscLoading] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/data?startDate=${startDate}&endDate=${endDate}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setData(result);
      } catch (err) {
        console.error(err);
        const demo = [];
        let cur = new Date(startDate.slice(0,4) + '-' + startDate.slice(4,6) + '-' + startDate.slice(6,8));
        const end = new Date(endDate.slice(0,4) + '-' + endDate.slice(4,6) + '-' + endDate.slice(6,8));
        while(cur <= end) {
          const dStr = cur.toISOString().split('T')[0];
          demo.push({ event_date: { value: dStr }, device_category: 'mobile', source: 'google', medium: 'organic', sessions: Math.random() > 0.8 ? 1 : 0, pageviews: Math.random() > 0.6 ? 2 : 0, goal_clicks: Math.random() > 0.95 ? 1 : 0, engagement_rate: 0.65 });
          cur.setDate(cur.getDate() + 1);
        }
        setData(demo);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const fetchGscData = async () => {
      setGscLoading(true);
      try {
        const res = await fetch(`/api/gsc?startDate=${startDate}&endDate=${endDate}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setGscData(result);
      } catch (err) {
        console.error('GSC Fetch Error:', err);
        // Fallback for demo if needed
        setGscData({ trends: [], keywords: [] });
      } finally {
        setGscLoading(false);
      }
    };
    fetchGscData();
  }, [startDate, endDate]);

  const filteredData = useMemo(() => {
    if (deviceFilter === 'all') return data;
    return data.filter(row => row.device_category === deviceFilter);
  }, [data, deviceFilter]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      sessions: acc.sessions + (Number(row.sessions) || 0),
      pv: acc.pv + (Number(row.pageviews) || 0),
      goals: acc.goals + (Number(row.goal_clicks) || 0),
      engagement: acc.engagement + (Number(row.engagement_rate) || 0),
    }), { sessions: 0, pv: 0, goals: 0, engagement: 0 });
  }, [filteredData]);
  
  const avgEngagement = filteredData.length > 0 ? (totals.engagement / filteredData.length * 100).toFixed(1) : '0';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, data: filteredData })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: '申し訳ございません。通信エラーが発生しました。もう一度ご質問いただけますでしょうか。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chartData = useMemo(() => {
    const dailyMap = filteredData.reduce((acc: any, row: any) => {
      const d = row.event_date?.value || row.event_date || '';
      const dateKey = typeof d === 'string' ? d : '';
      if (!acc[dateKey]) acc[dateKey] = { sessions: 0, pageviews: 0, goals: 0 };
      acc[dateKey].sessions += Number(row.sessions) || 0;
      acc[dateKey].pageviews += Number(row.pageviews) || 0;
      acc[dateKey].goals += Number(row.goal_clicks) || 0;
      return acc;
    }, {});

    let runningSessions = 0;
    let runningPV = 0;
    let runningGoals = 0;

    return Object.entries(dailyMap).sort().map(([dateKey, values]: any) => {
      runningSessions += values.sessions;
      runningPV += values.pageviews;
      runningGoals += values.goals;
      return {
        date: dateKey.includes('-') ? dateKey.split('-').slice(1).join('/') : dateKey,
        sessions: runningSessions,
        pageviews: runningPV,
        goals: runningGoals
      };
    });
  }, [filteredData]);

  const sourceRanking = useMemo(() => {
    const map = filteredData.reduce((acc: any, row: any) => {
      let name = row.source === 'direct' ? '直接' : row.source;
      if (row.source === 'google' && row.medium === 'organic') name = 'Google検索';
      const key = name;
      if (!acc[key]) acc[key] = { name, sessions: 0 };
      acc[key].sessions += Number(row.sessions) || 0;
      return acc;
    }, {});

    return Object.values(map)
      .sort((a: any, b: any) => b.sessions - a.sessions)
      .slice(0, 8);
  }, [filteredData]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black tracking-widest uppercase border border-primary/20 shadow-sm">こども園うえの</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-4 text-[#1e293b]">
            サイト分析レポート
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </h2>
          <p className="text-slate-600 text-xl mt-2 font-medium">園のWebサイトへの訪問状況を、誠実に分析いたします。</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 relative font-black">
          <div className="glass-card p-1.5 flex items-center gap-1.5 shadow-md">
            <FilterButton active={deviceFilter === 'all'} onClick={() => setDeviceFilter('all')} icon={<LayoutGrid size={20} />} label="すべて" />
            <FilterButton active={deviceFilter === 'mobile'} onClick={() => setDeviceFilter('mobile')} icon={<Smartphone size={20} />} label="スマホ" />
            <FilterButton active={deviceFilter === 'desktop'} onClick={() => setDeviceFilter('desktop')} icon={<Monitor size={20} />} label="PC" />
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsDateMenuOpen(!isDateMenuOpen)} className="glass-card px-6 py-3 flex items-center gap-4 border border-white/10 hover:bg-white/20 shadow-md">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-base text-[#1e293b]">{startDate.slice(4,6)}/{startDate.slice(6,8)} - {endDate.slice(4,6)}/{endDate.slice(6,8)}</span>
              <span className="text-xs font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">期間変更</span>
            </button>

            {isDateMenuOpen && (
              <div className="absolute top-full right-0 mt-4 w-[420px] bg-slate-900 border-2 border-white/30 p-10 shadow-2xl rounded-3xl z-[100]">
                <div className="flex justify-between items-center mb-8 text-white"><h4 className="font-black text-2xl text-white">期間を選択</h4><X className="w-8 h-8 opacity-60 cursor-pointer" onClick={() => setIsDateMenuOpen(false)} /></div>
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    <PresetButton label="直近1週間" onClick={() => { setStartDate(formatDateToYYYYMMDD(past7Days)); setEndDate(formatDateToYYYYMMDD(yesterday)); setIsDateMenuOpen(false); }} />
                    <PresetButton label="直近1ヶ月" onClick={() => { const d = new Date(); d.setDate(d.getDate()-30); setStartDate(formatDateToYYYYMMDD(d)); setEndDate(formatDateToYYYYMMDD(yesterday)); setIsDateMenuOpen(false); }} />
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      {/* カスタムカレンダー・ピッカーを適用 */}
                      <CustomCalendarPicker label="開始日" value={tempStartDate} onChange={setTempStartDate} />
                      <CustomCalendarPicker label="終了日" value={tempEndDate} onChange={setTempEndDate} />
                    </div>
                    <button 
                      onClick={() => { setStartDate(tempStartDate); setEndDate(tempEndDate); setIsDateMenuOpen(false); }}
                      className="w-full py-5 ichika-gradient text-white rounded-2xl text-xl font-black shadow-xl"
                    >
                      この期間で集計する
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-6 text-primary"><Loader2 className="w-12 h-12 animate-spin" /><p className="text-xl font-black animate-pulse">分析中...</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-black text-[#1e293b]">
              <MetricCard title="保護者・関係者の訪問数" value={totals.sessions.toLocaleString()} unit="回" icon={<Users className="w-8 h-8 text-indigo-400" />} color="indigo" description="サイトを訪れてくれた合計回数です。" />
              <MetricCard title="累積閲覧ページ数(PV)" value={totals.pv.toLocaleString()} unit="回" icon={<Eye className="w-8 h-8 text-sky-400" />} color="sky" description="見られたページの累計回数です。" />
              <MetricCard title="園への相談・反応" value={totals.goals.toLocaleString()} unit="回" icon={<MousePointerClick className="w-8 h-8 text-pink-400" />} color="pink" description="電話や応募フォームがクリックされた回数です。" />
              <MetricCard title="平均関心度" value={avgEngagement} unit="%" icon={<Heart className="w-8 h-8 text-rose-400" />} color="rose" description="サイトを熱心に見てくれた人の割合です。" />
            </div>

            <div className="glass-card p-10 h-[580px] shadow-2xl border-white/10 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 ichika-gradient opacity-40"></div>
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3"><TrendingUp size={28} className="text-primary" /> 成長の軌跡 (累計アクセス)</h3>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#1e293b" fontSize={14} fontWeight="black" dy={10} />
                    <YAxis stroke="#1e293b" fontSize={14} fontWeight="black" />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="pageviews" fill="#6366f1" fillOpacity={0.2} stroke="#6366f1" strokeWidth={3} name="累計閲覧数" />
                    <Area type="monotone" dataKey="sessions" fill="#818cf8" fillOpacity={0.1} stroke="#818cf8" strokeWidth={2} name="累計訪問数" />
                    <Bar dataKey="goals" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={25} name="累計相談数" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-10 shadow-lg border-white/10">
              <h3 className="font-black text-2xl mb-8 text-[#1e293b] flex items-center gap-3"><ExternalLink size={28} className="text-primary" /> 流入ルート別のアクセス数</h3>
              <div className="space-y-6">
                {sourceRanking.map((source: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 p-5 rounded-2xl bg-white/30 border border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">{idx + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between font-black text-[#1e293b] text-base mb-3"><span>{source.name}</span><span>{source.sessions} 人</span></div>
                      <div className="h-3 bg-white/50 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(source.sessions / (sourceRanking[0] as any).sessions) * 100}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Search Console - 検索パフォーマンス */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 h-[500px] shadow-2xl border-white/10 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 opacity-40"></div>
                <h3 className="font-black text-2xl text-[#1e293b] mb-8 flex items-center gap-3"><Search size={28} className="text-sky-500" /> 検索パフォーマンス推移</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={gscData.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#1e293b" 
                        fontSize={12} 
                        fontWeight="black" 
                        tickFormatter={(val) => {
                          const dateStr = val?.value || val || '';
                          return dateStr.includes('-') ? dateStr.split('-').slice(1).join('/') : dateStr;
                        }}
                      />
                      <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={12} fontWeight="black" name="IMP" />
                      <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={12} fontWeight="black" name="Clicks" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area yAxisId="left" type="monotone" dataKey="impressions" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" strokeWidth={3} name="表示回数" />
                      <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e' }} name="クリック数" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-10 h-[500px] shadow-2xl border-white/10 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-40"></div>
                <h3 className="font-black text-2xl text-[#1e293b] mb-8 flex items-center gap-3"><BarChart3 size={28} className="text-emerald-500" /> 平均掲載順位の推移</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={gscData.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#1e293b" 
                        fontSize={12} 
                        fontWeight="black"
                        tickFormatter={(val) => {
                          const dateStr = val?.value || val || '';
                          return dateStr.includes('-') ? dateStr.split('-').slice(1).join('/') : dateStr;
                        }}
                      />
                      <YAxis domain={[0, 'dataMax + 10']} reversed stroke="#10b981" fontSize={12} fontWeight="black" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="avg_position" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} name="平均順位" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* キーワードランキング */}
            <div className="glass-card p-10 shadow-lg border-white/10 overflow-hidden">
              <h3 className="font-black text-2xl mb-8 text-[#1e293b] flex items-center gap-3"><MousePointer2 size={28} className="text-pink-500" /> 検索キーワード・インサイト</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-[#1e293b]/60 text-sm font-black uppercase tracking-widest">
                      <th className="pb-4 pr-4">検索キーワード</th>
                      <th className="pb-4 px-4 text-right">表示回数</th>
                      <th className="pb-4 px-4 text-right">クリック</th>
                      <th className="pb-4 px-4 text-right">クリック率(CTR)</th>
                      <th className="pb-4 pl-4 text-right">平均順位</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-[#1e293b]">
                    {gscData.keywords.length > 0 ? gscData.keywords.map((kw: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-4 max-w-[200px] truncate">{kw.query}</td>
                        <td className="py-4 px-4 text-right tabular-nums">{Number(kw.impressions).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right tabular-nums font-black text-pink-600">{Number(kw.clicks).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right tabular-nums">{(Number(kw.ctr) * 100).toFixed(1)}%</td>
                        <td className="py-4 pl-4 text-right tabular-nums">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${Number(kw.avg_position) <= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {Number(kw.avg_position).toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-400 font-black">データ収集中、または期間内にデータがありません</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card h-[920px] flex flex-col overflow-hidden border-2 border-primary/20 shadow-2xl sticky top-4">
              <div className="p-8 ichika-gradient text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-18 h-18 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden shadow-2xl">
                    <img src="/ichika-icon.png" alt="Ichika" className="w-full h-full object-cover" />
                  </div>
                  <div><h3 className="font-black text-2xl">いちかに相談</h3><p className="text-xs opacity-90 uppercase font-bold tracking-widest">Site Analysis Assistant</p></div>
                </div>
                <MessageCircle className="opacity-60 w-8 h-8" />
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth text-[#1e293b]">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-end gap-3 max-w-[95%]">
                      {msg.role === 'assistant' && (
                        <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 overflow-hidden shadow-md flex-shrink-0"><img src="/ichika-icon.png" alt="Icon" className="w-full h-full object-cover" /></div>
                      )}
                      <div className={`p-6 rounded-3xl shadow-xl leading-relaxed text-base ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none font-bold' : 'bg-white/50 backdrop-blur-xl border border-white/60 rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden"><img src="/ichika-icon.png" alt="Icon" className="w-full h-full object-cover opacity-50" /></div>
                    <div className="flex gap-2 p-5 bg-white/40 rounded-3xl"><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-150"></div><div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-300"></div></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-8 border-t border-white/30 bg-white/10 flex gap-4">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="サイトについて質問してください"
                  className="flex-1 bg-white/40 border-2 border-white/50 rounded-2xl px-6 py-5 text-base font-bold text-[#1e293b] focus:outline-none focus:border-primary/50 shadow-inner"
                />
                <button type="submit" disabled={chatLoading} className="w-16 h-16 rounded-2xl ichika-gradient flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"><ChevronRight size={32} /></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-3 rounded-2xl text-base font-black transition-all flex items-center gap-3 ${active ? 'bg-primary text-white shadow-2xl' : 'text-[#1e293b]/60'}`}>{icon}{label}</button>
  );
}

function PresetButton({ label, onClick }: any) {
  return (
    <button onClick={onClick} className="px-5 py-4 bg-white/10 border-2 border-white/30 rounded-2xl text-base font-black hover:bg-primary transition-all text-white shadow-lg">{label}</button>
  );
}

function MetricCard({ title, value, unit, description, icon, color }: any) {
  return (
    <div className="glass-card p-10 border-white/20 relative overflow-hidden group shadow-xl">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-inner">{icon}</div>
        <div className="relative group/tip"><Info className="w-6 h-6 text-slate-400 cursor-help" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 w-64 p-6 bg-slate-900/95 text-white text-sm rounded-2xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 font-medium shadow-2xl backdrop-blur-md">{description}</div></div>
      </div>
      <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-baseline gap-3"><span className="text-5xl font-black text-[#1e293b]">{value}</span><span className="text-lg font-black text-slate-400">{unit}</span></div>
    </div>
  );
}
