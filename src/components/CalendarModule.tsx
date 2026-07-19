import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentItem, SocialEvent, EvidenceDeliverable, ContentPhase, SocialPhase, PeriodLog, CycleSettings, JournalEntry } from '../types';
import { getCycleInfoForDate } from '../utils/cycleUtils';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, 
  Layers, Users, ShieldAlert, Award, Star, Activity, BarChart, Plus, Trash2, Edit 
} from 'lucide-react';

interface CalendarModuleProps {
  contentItems: ContentItem[];
  socialEvents: SocialEvent[];
  evidenceDeliverables: EvidenceDeliverable[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onAddContentItem: (item: Omit<ContentItem, 'id'>) => void;
  onAddSocialEvent: (item: Omit<SocialEvent, 'id'>) => void;
  onAddEvidenceDeliverable: (item: Omit<EvidenceDeliverable, 'id'>) => void;
  onDeleteContentItem: (id: string) => void;
  onDeleteSocialEvent: (id: string) => void;
  onDeleteEvidenceDeliverable: (id: string) => void;
  periodLogs?: PeriodLog[];
  cycleSettings?: CycleSettings;
  journalEntries?: JournalEntry[];
}

const MOOD_INTENSITIES: Record<string, number> = {
  '🌸 Serene': 7,
  '⚡ Focused': 8,
  '🔋 Energetic': 10,
  '📝 Grateful': 8,
  '😴 Tired': 3,
  '💭 Reflective': 6,
  '🌱 Growing': 9,
};

const getHeatmapColorClass = (intensity: number) => {
  if (intensity <= 3) return 'bg-[#E3E6E8] hover:bg-[#D5D9DC] border-slate-300 text-slate-800';
  if (intensity <= 5) return 'bg-[#ECE2EB] hover:bg-[#DFD3E1] border-purple-200 text-purple-800';
  if (intensity <= 7) return 'bg-[#E9F0E8] hover:bg-[#DBE7DA] border-emerald-200 text-emerald-800';
  if (intensity <= 8.5) return 'bg-[#F8EFE4] hover:bg-[#F2E3CD] border-amber-200 text-amber-800';
  return 'bg-[#FDECEB] hover:bg-[#FAD9D6] border-rose-200 text-rose-800';
};


const CONTENT_STATUS_MAP: Record<ContentPhase, string[]> = {
  Planning: ['Idea', 'Planned', 'Briefed'],
  Production: ['In Progress', 'Draft', 'Review'],
  Completion: ['Scheduled', 'Published', 'Archived']
};

const CONTENT_MODIFIERS = ['On Hold', 'Cancelled', 'Needs Revision', 'Final Approval'];

const SOCIAL_STATUS_MAP: Record<SocialPhase, string[]> = {
  Planning: ['Proposed', 'Invited', 'Confirmed'],
  Active: ['Upcoming', 'This Week', 'Today'],
  Completed: ['Attended', 'Cancelled', 'Missed']
};

export default function CalendarModule({
  contentItems,
  socialEvents,
  evidenceDeliverables,
  selectedDate,
  onSelectDate,
  onAddContentItem,
  onAddSocialEvent,
  onAddEvidenceDeliverable,
  onDeleteContentItem,
  onDeleteSocialEvent,
  onDeleteEvidenceDeliverable,
  periodLogs = [],
  cycleSettings,
  journalEntries = []
}: CalendarModuleProps) {
  // Lenses Toggles
  const [lensContent, setLensContent] = useState(true);
  const [lensSocial, setLensSocial] = useState(true);
  const [lensEvidence, setLensEvidence] = useState(true);
  const [lensHeatmap, setLensHeatmap] = useState(true);

  // Month and Year navigation
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed: 6)

  // Quick Add states
  const [activeTab, setActiveTab] = useState<'content' | 'social' | 'evidence'>('content');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states - Content
  const [cTitle, setCTitle] = useState('');
  const [cPhase, setCPhase] = useState<ContentPhase>('Planning');
  const [cStatus, setCStatus] = useState('Idea');
  const [cNotes, setCNotes] = useState('');

  // Form states - Social
  const [sTitle, setSTitle] = useState('');
  const [sPhase, setSPhase] = useState<SocialPhase>('Planning');
  const [sStatus, setSStatus] = useState('Proposed');
  const [sNotes, setSNotes] = useState('');

  // Form states - Evidence
  const [eTitle, setETitle] = useState('');
  const [eCapacity, setECapacity] = useState(1);
  const [eImpactValue, setEImpactValue] = useState(1);
  const [eImpactUnit, setEImpactUnit] = useState<'currency' | 'hours' | 'percent'>('hours');
  const [eQualityScore, setEQualityScore] = useState(100);
  const [eNotes, setENotes] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getFormattedDate = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const handleCellClick = (day: number) => {
    onSelectDate(getFormattedDate(day));
  };

  // Add Item actions
  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim()) return;
    onAddContentItem({
      date: selectedDate,
      title: cTitle,
      phase: cPhase,
      status: cStatus,
      notes: cNotes
    });
    setCTitle('');
    setCNotes('');
    setShowAddForm(false);
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle.trim()) return;
    onAddSocialEvent({
      date: selectedDate,
      title: sTitle,
      phase: sPhase,
      status: sStatus,
      notes: sNotes
    });
    setSTitle('');
    setSNotes('');
    setShowAddForm(false);
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTitle.trim()) return;
    onAddEvidenceDeliverable({
      date: selectedDate,
      title: eTitle,
      capacityCount: eCapacity,
      impactValue: eImpactValue,
      impactUnit: eImpactUnit,
      qualityScore: eQualityScore,
      notes: eNotes
    });
    setETitle('');
    setENotes('');
    setShowAddForm(false);
  };

  // Fetch lists for day inspector
  const dayContentItems = contentItems.filter(item => item.date === selectedDate);
  const daySocialEvents = socialEvents.filter(event => event.date === selectedDate);
  const dayEvidenceDeliverables = evidenceDeliverables.filter(dev => dev.date === selectedDate);

  // Render variables for calendar grid
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = startDayOfWeek(currentYear, currentMonth);
  const gridCells = [];

  // Padding cells for previous month
  for (let i = 0; i < startDay; i++) {
    gridCells.push(<div key={`empty-${i}`} className="h-14 sm:h-24 bg-[#FAF0EC]/30 border border-matcha-primary/5 opacity-50 rounded-xl"></div>);
  }

  // Active month days
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = getFormattedDate(day);
    const isSelected = dateStr === selectedDate;
    
    const dayContent = contentItems.filter(item => item.date === dateStr);
    const daySocial = socialEvents.filter(item => item.date === dateStr);
    const dayEvidence = evidenceDeliverables.filter(item => item.date === dateStr);
    const dayEntries = (journalEntries || []).filter(entry => entry.date === dateStr);

    const isPeriodDay = periodLogs?.some(p => p.date === dateStr && p.flow !== 'None');
    const cycleDayInfo = cycleSettings ? getCycleInfoForDate(dateStr, cycleSettings, periodLogs) : null;
    const isMenstrualPhase = cycleDayInfo?.phase === 'Menstrual';

    const hasEntries = dayEntries.length > 0;
    const avgIntensity = hasEntries
      ? dayEntries.reduce((sum, entry) => sum + (MOOD_INTENSITIES[entry.mood] || 5), 0) / dayEntries.length
      : 0;

    const heatmapBgClass = (lensHeatmap && hasEntries)
      ? getHeatmapColorClass(avgIntensity)
      : '';

    const gridIndex = startDay + day - 1;
    const isTopRows = gridIndex < 14;

    gridCells.push(
      <button
        key={`day-${day}`}
        onClick={() => handleCellClick(day)}
        className={`h-14 sm:h-24 p-1 sm:p-2 border text-left flex flex-col justify-between transition-all rounded-xl relative focus:outline-none cursor-pointer group ${
          isSelected 
            ? 'bg-matcha-primary text-white border-matcha-primary ring-2 ring-matcha-primary/30 z-10 shadow-sm hover:bg-[#97b58e]' 
            : (lensHeatmap && hasEntries)
              ? heatmapBgClass
              : isPeriodDay
                ? 'bg-rose-50/85 border-rose-200/80 hover:bg-rose-100/60 text-[#5D524F]'
                : isMenstrualPhase
                  ? 'bg-[#FCDBD9]/20 border-rose-100 hover:bg-[#FCDBD9]/40 text-[#5D524F]'
                  : 'bg-white border-matcha-primary/10 hover:bg-[#FAF0EC]/40 text-[#5D524F]'
        }`}
      >
        <span className="flex items-center justify-between w-full">
          <span className={`text-[10px] sm:text-xs font-mono font-bold ${isSelected ? 'text-white' : (lensHeatmap && hasEntries) ? '' : 'text-[#5D524F]/70'}`}>
            {day}
          </span>
          {lensHeatmap && hasEntries && !isSelected ? (
            <span className="text-[8px] sm:text-[9px] font-bold bg-[#5D524F]/10 text-[#5D524F]/85 px-1 py-0.2 rounded-md font-mono" title={`Avg Mood Intensity: ${avgIntensity.toFixed(1)}`}>
              {avgIntensity.toFixed(1)}
            </span>
          ) : !isSelected && (isPeriodDay || isMenstrualPhase) ? (
            <span className="text-[9px] sm:text-[10px]" title={`${cycleDayInfo?.phase} Phase`}>
              {isPeriodDay ? '🩸' : '🌸'}
            </span>
          ) : null}
        </span>

        {/* Mobile-only dot indicators */}
        <div className="flex sm:hidden justify-center gap-0.5 w-full mt-auto">
          {lensContent && dayContent.length > 0 && (
            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`}></span>
          )}
          {lensSocial && daySocial.length > 0 && (
            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-strawberry-accent'}`}></span>
          )}
          {lensEvidence && dayEvidence.length > 0 && (
            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>
          )}
          {lensHeatmap && dayEntries.length > 0 && (
            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></span>
          )}
        </div>


        {/* Lenses Overlays on the grid cell (Desktop Only) */}
        <div className="hidden sm:block space-y-1 w-full overflow-hidden mt-1">
          {lensHeatmap && dayEntries.map((entry) => (
            <div 
              key={entry.id} 
              className={`text-[9px] truncate px-1 rounded-sm border ${
                isSelected 
                  ? 'bg-amber-950/40 border-amber-800 text-amber-100 font-medium' 
                  : 'bg-amber-50/50 border-amber-100 text-[#5D524F] font-semibold'
              }`}
              title={`${entry.mood}: ${entry.content}`}
            >
              💭 {entry.mood}
            </div>
          ))}

          {lensContent && dayContent.map((item) => (
            <div 
              key={item.id} 
              className={`text-[9px] truncate px-1 rounded-sm border ${
                isSelected 
                  ? 'bg-purple-950/40 border-purple-800 text-purple-100 font-medium' 
                  : 'bg-purple-50 border-purple-100 text-purple-600 font-semibold'
              }`}
              title={item.title}
            >
              🎬 {item.title}
            </div>
          ))}

          {lensSocial && daySocial.map((event) => (
            <div 
              key={event.id} 
              className={`text-[9px] truncate px-1 rounded-sm border ${
                isSelected 
                  ? 'bg-[#b38180] border-[#915e5d] text-white font-medium' 
                  : 'bg-[#FCDBD9]/50 border-strawberry-accent/20 text-strawberry-accent font-semibold'
              }`}
              title={event.title}
            >
              🥂 {event.title}
            </div>
          ))}

          {lensEvidence && dayEvidence.map((dev) => (
            <div 
              key={dev.id} 
              className={`text-[9px] truncate px-1.5 rounded-sm border font-bold ${
                isSelected 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-100' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}
              title={`${dev.title} (${dev.capacityCount} - ${dev.impactValue}${dev.impactUnit === 'currency' ? '$' : dev.impactUnit})`}
            >
              🎯 {dev.title}
            </div>
          ))}
        </div>

        {/* Interactive Hover Tooltip */}
        <div className={`absolute left-1/2 -translate-x-1/2 w-60 sm:w-68 bg-white border border-matcha-primary/20 text-[#5D524F] p-3.5 rounded-2xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 select-none ${
          isTopRows 
            ? 'top-full mt-2.5 origin-top' 
            : 'bottom-full mb-2.5 origin-bottom'
        }`}>
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-matcha-primary/10 pb-2 mb-2">
            <span className="font-mono text-[10px] font-bold text-matcha-primary">
              {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {cycleDayInfo && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                cycleDayInfo.phase === 'Menstrual' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                cycleDayInfo.phase === 'Follicular' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                cycleDayInfo.phase === 'Ovulatory' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                cycleDayInfo.phase === 'Extended Follicular' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                'bg-purple-50 text-purple-600 border border-purple-100'
              }`}>
                Day {cycleDayInfo.cycleDay} • {cycleDayInfo.phase}
              </span>
            )}
          </div>

          {/* Heatmap/Mood Info */}
          {hasEntries ? (
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                  <span className="text-[#5D524F]/70">Daily Mood Energy</span>
                  <span className="text-amber-600 font-mono font-bold">{avgIntensity.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-[#FAF0EC] h-1.5 rounded-full overflow-hidden border border-matcha-primary/5">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${avgIntensity * 10}%`,
                      backgroundColor: avgIntensity <= 3 ? '#94a3b8' :
                                      avgIntensity <= 5 ? '#a78bfa' :
                                      avgIntensity <= 7 ? '#10b981' :
                                      avgIntensity <= 8.5 ? '#f59e0b' : '#f43f5e'
                    }}
                  />
                </div>
              </div>

              {/* Logged Moods list */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[9px] font-bold text-[#5D524F]/50 uppercase tracking-wider">Moods:</span>
                {dayEntries.map((entry, idx) => (
                  <span key={entry.id || idx} className="bg-amber-50/70 border border-amber-200/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#5D524F]/85 inline-block">
                    {entry.mood}
                  </span>
                ))}
              </div>

              {/* Tag Highlights */}
              {dayEntries.some(entry => entry.tags && entry.tags.length > 0) ? (
                <div className="pt-2 border-t border-matcha-primary/5">
                  <div className="text-[9px] font-bold text-[#5D524F]/50 uppercase tracking-wider mb-1">Tag Highlights</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(dayEntries.flatMap(entry => entry.tags || []))).map((tag, tagIdx) => (
                      <span key={tagIdx} className="bg-matcha-primary/10 text-matcha-primary border border-matcha-primary/20 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-[#5D524F]/40 italic pt-1.5 border-t border-matcha-primary/5">
                  No custom tags logged for this day
                </div>
              )}

              {/* First Entry Preview snippet */}
              {dayEntries[0]?.content && (
                <div className="pt-2 border-t border-matcha-primary/5 text-[9px] text-[#5D524F]/75 italic line-clamp-2 leading-relaxed bg-[#FAF0EC]/30 p-1.5 rounded-lg border border-matcha-primary/5">
                  "{dayEntries[0].content}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 space-y-1">
              <p className="text-[10px] text-[#5D524F]/60">No journal logs for this day</p>
              <p className="text-[8px] text-matcha-primary/80 font-bold uppercase tracking-wider">Click cell to add journal entry</p>
            </div>
          )}

          {/* Quick summary of other events/deliverables on that day */}
          {(dayContent.length > 0 || daySocial.length > 0 || dayEvidence.length > 0) && (
            <div className="mt-2.5 pt-2.5 border-t border-matcha-primary/10 text-[9px] text-[#5D524F]/60 space-y-1">
              {dayContent.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span>🎬</span>
                  <span className="font-semibold">{dayContent.length} Content Item{dayContent.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {daySocial.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span>🥂</span>
                  <span className="font-semibold">{daySocial.length} Social Event{daySocial.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {dayEvidence.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span>🎯</span>
                  <span className="font-semibold">{dayEvidence.length} Deliverable{dayEvidence.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Little tooltip pointer arrow */}
          <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
            isTopRows 
              ? 'bottom-full -mb-1 border-b-white' 
              : 'top-full -mt-1 border-t-white'
          }`} />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white border border-matcha-primary/20 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full text-[#5D524F]" id="calendar-module-container">
      {/* Header Panel */}
      <div className="bg-[#FAF0EC]/60 border-b border-matcha-primary/20 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-matcha-primary drop-shadow-[0_0_8px_rgba(168,198,159,0.5)]" />
            <div>
              <h2 className="text-lg font-bold tracking-tight font-sans text-[#5D524F]">3-Lens Life Calendar</h2>
              <p className="text-xs text-[#5D524F]/70">Integrated personal, professional & evidence layers</p>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-matcha-primary/20 shadow-xs self-stretch md:self-auto justify-between">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-[#FAF0EC] rounded-full transition-colors text-[#5D524F] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold tracking-wide min-w-[110px] text-center text-[#5D524F]">
              {months[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-[#FAF0EC] rounded-full transition-colors text-[#5D524F] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lenses Filters Controllers */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-matcha-primary/20">
          <span className="text-[10px] uppercase font-bold text-[#5D524F]/70 tracking-wider font-mono">Active Lenses:</span>
          
          {/* Content Lens Toggle */}
          <button
            onClick={() => setLensContent(!lensContent)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              lensContent 
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs' 
                : 'bg-white border-matcha-primary/20 text-[#5D524F]/50 hover:bg-[#FAF0EC]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${lensContent ? 'bg-purple-500 animate-pulse' : 'bg-matcha-primary/20'}`}></span>
            <span>Content Lens</span>
          </button>

          {/* Social Lens Toggle */}
          <button
            onClick={() => setLensSocial(!lensSocial)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              lensSocial 
                ? 'bg-[#FCDBD9]/40 border-strawberry-accent/50 text-strawberry-accent shadow-xs' 
                : 'bg-white border-matcha-primary/20 text-[#5D524F]/50 hover:bg-[#FAF0EC]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${lensSocial ? 'bg-strawberry-accent animate-pulse' : 'bg-matcha-primary/20'}`}></span>
            <span>Social Lens</span>
          </button>

          {/* Evidence Portfolio Toggle */}
          <button
            onClick={() => setLensEvidence(!lensEvidence)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              lensEvidence 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs' 
                : 'bg-white border-matcha-primary/20 text-[#5D524F]/50 hover:bg-[#FAF0EC]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${lensEvidence ? 'bg-emerald-500 animate-pulse' : 'bg-matcha-primary/20'}`}></span>
            <span>Evidence Lens</span>
          </button>

          {/* Mood Heatmap Toggle */}
          <button
            onClick={() => setLensHeatmap(!lensHeatmap)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              lensHeatmap 
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs' 
                : 'bg-white border-matcha-primary/20 text-[#5D524F]/50 hover:bg-[#FAF0EC]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${lensHeatmap ? 'bg-amber-500 animate-pulse' : 'bg-matcha-primary/20'}`}></span>
            <span>Mood Heatmap</span>
          </button>
        </div>
      </div>

      {/* Shared Grid */}
      <div className="p-4 bg-transparent border-b border-matcha-primary/10 flex-1 overflow-y-auto">
        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-mono font-bold text-[#5D524F]/60 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {gridCells}
        </div>

        {/* Heatmap Soft Legend */}
        {lensHeatmap && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#FAF0EC]/40 rounded-xl border border-matcha-primary/10 text-[10px]">
            <span className="font-bold text-[#5D524F]/70 uppercase font-mono">Heatmap Legend:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E3E6E8] border border-slate-300 inline-block"></span>
                <span>Low (1-3)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ECE2EB] border border-purple-200 inline-block"></span>
                <span>Muted (3.1-5)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E9F0E8] border border-emerald-200 inline-block"></span>
                <span>Balanced (5.1-7)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F8EFE4] border border-amber-200 inline-block"></span>
                <span>Active (7.1-8.5)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FDECEB] border border-rose-200 inline-block"></span>
                <span>Peak (8.5-10)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Date Inspector & Operations Section */}
      <div className="p-5 border-t border-matcha-primary/10 space-y-4 bg-[#FAF0EC]/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#5D524F]/70 tracking-wider font-mono">Inspecting Date</span>
            <h3 className="text-sm font-bold text-[#5D524F] flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-matcha-primary" /> {selectedDate}
            </h3>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-matcha-primary hover:bg-[#97b58e] text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Close Creator' : 'Add Item'}
          </button>
        </div>

        {/* Add Entry Form Expansion */}
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border border-matcha-primary/20 rounded-2xl p-4 bg-white space-y-4 shadow-sm"
          >
            {/* Tab selection for layout creation */}
            <div className="flex border-b border-matcha-primary/10">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'content' ? 'border-purple-500 text-purple-700 font-bold' : 'border-transparent text-[#5D524F]/60 hover:text-[#5D524F]'
                }`}
              >
                🎬 Content Pipeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'social' ? 'border-strawberry-accent text-strawberry-accent font-bold' : 'border-transparent text-[#5D524F]/60 hover:text-[#5D524F]'
                }`}
              >
                🥂 Social Pipeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'evidence' ? 'border-emerald-500 text-emerald-700 font-bold' : 'border-transparent text-[#5D524F]/60 hover:text-[#5D524F]'
                }`}
              >
                🎯 Evidence Portfolio
              </button>
            </div>

            {/* Content pipeline form */}
            {activeTab === 'content' && (
              <form onSubmit={handleAddContent} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Content Title / Deliverable</label>
                    <input
                      type="text"
                      value={cTitle}
                      onChange={(e) => setCTitle(e.target.value)}
                      placeholder="e.g., Draft LifeOS launch copy"
                      className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-[#5D524F]/40"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Pipeline Phase</label>
                      <select
                        value={cPhase}
                        onChange={(e) => {
                          const phase = e.target.value as ContentPhase;
                          setCPhase(phase);
                          setCStatus(CONTENT_STATUS_MAP[phase][0]);
                        }}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Production">Production</option>
                        <option value="Completion">Completion</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Current Status</label>
                      <select
                        value={cStatus}
                        onChange={(e) => setCStatus(e.target.value)}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {CONTENT_STATUS_MAP[cPhase].map(s => <option key={s} value={s}>{s}</option>)}
                        <option disabled>── Modifiers ──</option>
                        {CONTENT_MODIFIERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Notes / Details</label>
                  <input
                    type="text"
                    value={cNotes}
                    onChange={(e) => setCNotes(e.target.value)}
                    placeholder="Brief notes, link references or distribution plans..."
                    className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-[#5D524F]/40"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-xs">
                    Save Content Item
                  </button>
                </div>
              </form>
            )}

            {/* Social pipeline form */}
            {activeTab === 'social' && (
              <form onSubmit={handleAddSocial} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Commitment / Event</label>
                    <input
                      type="text"
                      value={sTitle}
                      onChange={(e) => setSTitle(e.target.value)}
                      placeholder="e.g., Dinner with mentors"
                      className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-strawberry-accent placeholder-[#5D524F]/40"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Commitment Phase</label>
                      <select
                        value={sPhase}
                        onChange={(e) => {
                          const phase = e.target.value as SocialPhase;
                          setSPhase(phase);
                          setSStatus(SOCIAL_STATUS_MAP[phase][0]);
                        }}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-strawberry-accent"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Status</label>
                      <select
                        value={sStatus}
                        onChange={(e) => setSStatus(e.target.value)}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-strawberry-accent"
                      >
                        {SOCIAL_STATUS_MAP[sPhase].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Notes / Details</label>
                  <input
                    type="text"
                    value={sNotes}
                    onChange={(e) => setSNotes(e.target.value)}
                    placeholder="Location, agenda, attendees, follow-ups..."
                    className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-strawberry-accent placeholder-[#5D524F]/40"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-[#F4B9B8] hover:bg-[#e4a5a4] text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-xs">
                    Save Social Event
                  </button>
                </div>
              </form>
            )}

            {/* Evidence Portfolio form */}
            {activeTab === 'evidence' && (
              <form onSubmit={handleAddEvidence} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Proof of Work / Completed Deliverable</label>
                    <input
                      type="text"
                      value={eTitle}
                      onChange={(e) => setETitle(e.target.value)}
                      placeholder="e.g., Built room database interface"
                      className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-matcha-primary placeholder-[#5D524F]/40"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1 truncate" title="Raw capacity of completed projects/reports">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={eCapacity}
                        onChange={(e) => setECapacity(Number(e.target.value))}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-matcha-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1 truncate" title="Business ROI delta (revenue, cost or time saved)">Impact</label>
                      <input
                        type="number"
                        min="0"
                        value={eImpactValue}
                        onChange={(e) => setEImpactValue(Number(e.target.value))}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-2 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-matcha-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1 truncate">Unit</label>
                      <select
                        value={eImpactUnit}
                        onChange={(e) => setEImpactUnit(e.target.value as any)}
                        className="w-full bg-white border border-matcha-primary/20 rounded-lg px-1.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-matcha-primary"
                      >
                        <option value="hours">Hours Saved</option>
                        <option value="currency">Currency ($)</option>
                        <option value="percent">Percent (%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#5D524F]/80 font-semibold flex items-center justify-between mb-1">
                      <span>Reliability & Accuracy Score</span>
                      <span className="font-mono font-bold text-matcha-primary">{eQualityScore}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={eQualityScore}
                      onChange={(e) => setEQualityScore(Number(e.target.value))}
                      className="w-full h-1 bg-[#EAE0DC] rounded-lg appearance-none cursor-pointer accent-matcha-primary my-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5D524F]/80 font-semibold block mb-1">Proof Details / Metrics Source</label>
                    <input
                      type="text"
                      value={eNotes}
                      onChange={(e) => setENotes(e.target.value)}
                      placeholder="Audit sign-off, client feedback, error-free completion logs..."
                      className="w-full bg-[#FAF0EC]/20 border border-matcha-primary/20 rounded-lg px-2.5 py-1.5 text-xs text-[#5D524F] focus:outline-none focus:ring-1 focus:ring-matcha-primary placeholder-[#5D524F]/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-matcha-primary hover:bg-[#97b58e] text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-xs">
                    Log Proof of Work
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Day Items Grid representation */}
        <div className="space-y-4">
          {/* Content layer entries */}
          {lensContent && dayContentItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 font-mono">
                🎬 Content Lens Items ({dayContentItems.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dayContentItems.map(item => (
                  <div key={item.id} className="p-3 bg-purple-50/50 border border-purple-200/60 rounded-xl flex items-start justify-between gap-3 hover:bg-purple-100/40 transition-all">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-200/40 font-sans">
                          {item.phase}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-purple-200/50 text-purple-800 rounded-full border border-purple-200/30">
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#5D524F] leading-tight">{item.title}</h4>
                      {item.notes && <p className="text-[11px] text-[#5D524F]/70 truncate">{item.notes}</p>}
                    </div>
                    <button
                      onClick={() => onDeleteContentItem(item.id)}
                      className="text-purple-400 hover:text-red-500 p-1 hover:bg-purple-100/50 rounded transition-colors self-start cursor-pointer"
                      title="Delete Content Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social layer entries */}
          {lensSocial && daySocialEvents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-strawberry-accent uppercase tracking-wider flex items-center gap-1 font-mono">
                🥂 Social Lens Commitments ({daySocialEvents.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {daySocialEvents.map(event => (
                  <div key={event.id} className="p-3 bg-[#FCDBD9]/30 border border-[#F4B9B8]/40 rounded-xl flex items-start justify-between gap-3 hover:bg-[#FCDBD9]/50 transition-all">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FCDBD9] text-strawberry-accent rounded border border-[#F4B9B8]/20 font-sans">
                          {event.phase}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white text-strawberry-accent rounded-full border border-[#F4B9B8]/20">
                          {event.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#5D524F] leading-tight">{event.title}</h4>
                      {event.notes && <p className="text-[11px] text-[#5D524F]/70 truncate">{event.notes}</p>}
                    </div>
                    <button
                      onClick={() => onDeleteSocialEvent(event.id)}
                      className="text-strawberry-accent/80 hover:text-red-500 p-1 hover:bg-[#FCDBD9]/40 rounded transition-colors self-start cursor-pointer"
                      title="Delete Social Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence layer entries */}
          {lensEvidence && dayEvidenceDeliverables.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1 font-mono">
                🎯 Evidence Portfolio / Completed Work ({dayEvidenceDeliverables.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayEvidenceDeliverables.map(dev => (
                  <div key={dev.id} className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex flex-col justify-between gap-2.5 hover:bg-emerald-100/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#5D524F] leading-tight">{dev.title}</h4>
                        {dev.notes && <p className="text-[11px] text-[#5D524F]/80 leading-normal">{dev.notes}</p>}
                      </div>
                      <button
                        onClick={() => onDeleteEvidenceDeliverable(dev.id)}
                        className="text-emerald-500 hover:text-red-500 p-1 hover:bg-emerald-100/50 rounded transition-colors self-start cursor-pointer"
                        title="Delete Deliverable Proof"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Deliverable scoring presentation */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-matcha-primary/10 text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-matcha-primary/15">
                        <span className="text-[8px] uppercase text-[#5D524F]/60 font-bold block">Capacity</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                          <Activity className="w-3 h-3 text-emerald-600" /> {dev.capacityCount}x
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-matcha-primary/15">
                        <span className="text-[8px] uppercase text-[#5D524F]/60 font-bold block">Impact</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 truncate block">
                          {dev.impactUnit === 'currency' ? `$${dev.impactValue}` : `${dev.impactValue}${dev.impactUnit === 'hours' ? 'h' : '%'}`}
                        </span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-matcha-primary/15">
                        <span className="text-[8px] uppercase text-[#5D524F]/60 font-bold block">Quality</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {dev.qualityScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty fallback for current selections */}
          {(!lensContent || dayContentItems.length === 0) && 
           (!lensSocial || daySocialEvents.length === 0) && 
           (!lensEvidence || dayEvidenceDeliverables.length === 0) && (
            <div className="text-center py-6 bg-white border border-dashed border-matcha-primary/20 rounded-2xl">
              <p className="text-xs font-semibold text-[#5D524F]/80">No active lens entries recorded on this date.</p>
              <p className="text-[10px] text-[#5D524F]/50 mt-1">Click "Add Item" above to create calendar events or proof logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
