/**
 * SiteMapView — Visual Site Map with Toggle Overlays (Phase 6)
 *
 * Interactive visual representation of the entire Neema Foundation site structure.
 * Shows all pages as cards, sections as nested elements, and applies color-coded
 * status overlays based on active maintenance rules. Supports:
 *
 * - Click-to-toggle maintenance on any page/section
 * - Feature group overlay highlighting
 * - Real-time health score indicator
 * - Compact and expanded view modes
 * - Responsive grid layout
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Home,
  Heart,
  Building,
  Gift,
  Users,
  Handshake,
  HeartHandshake,
  Building2,
  BookOpen,
  FileText,
  Camera,
  Calendar,
  Image,
  Images,
  ChevronDown,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  Layers,
  ZapOff,
  Zap,
  AlertTriangle,
  Info,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PAGE_REGISTRY,
  FEATURE_GROUPS,
  buildSiteHealthMap,
  computeSiteHealth,
  featureGroupMapper,
} from '../../config/maintenanceRegistry';
import type {
  MaintenanceRule,
  MaintenanceSeverity,
  FeatureGroupEntry,
} from '../../types/maintenance';

// =============================================================================
// Icon mapping
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Heart,
  Building,
  Gift,
  Users,
  Handshake,
  HeartHandshake,
  Building2,
  BookOpen,
  FileText,
  Camera,
  Calendar,
  Image,
  Images,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? FileText;
}

// =============================================================================
// Status colors
// =============================================================================

const STATUS_STYLES: Record<string, {
  bg: string;
  border: string;
  dot: string;
  text: string;
  label: string;
}> = {
  online: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    label: 'Online',
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    label: 'Degraded',
  },
  blocked: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
    label: 'Blocked',
  },
  notice: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    label: 'Notice',
  },
};

// =============================================================================
// Types
// =============================================================================

export interface SiteMapViewProps {
  rules: MaintenanceRule[];
  onToggleRule?: (targetKey: string, scope: 'page' | 'section', severity: MaintenanceSeverity) => void;
  onEditRule?: (ruleId: string) => void;
  className?: string;
}

// =============================================================================
// Health Score Ring
// =============================================================================

function HealthScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const progress = (score / 100) * circumference;
  const color =
    score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-red-500';
  const strokeColor =
    score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{score}%</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

// =============================================================================
// Section Status Dot
// =============================================================================

function SectionRow({
  sectionKey,
  label,
  status,
  pageKey,
  highlighted,
  onToggle,
}: {
  sectionKey: string;
  label: string;
  status: 'online' | 'degraded' | 'blocked' | 'notice';
  pageKey: string;
  highlighted: boolean;
  onToggle?: () => void;
}) {
  const style = STATUS_STYLES[status];

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left
        transition-all duration-200 group
        ${highlighted ? 'ring-2 ring-indigo-300 bg-indigo-50/50' : 'hover:bg-gray-50'}
      `}
      title={`${pageKey}:${sectionKey} — ${style.label}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
      <span className="text-xs text-gray-700 truncate flex-1">{label}</span>
      <span className={`text-[10px] font-medium ${style.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
        {style.label}
      </span>
    </motion.button>
  );
}

// =============================================================================
// Page Card
// =============================================================================

function PageCard({
  pageKey,
  label,
  icon,
  route,
  status,
  sections,
  highlightedTargets,
  onToggle,
  onEditRule,
  activeRules,
}: {
  pageKey: string;
  label: string;
  icon: string;
  route: string;
  status: 'online' | 'degraded' | 'blocked' | 'notice';
  sections: Array<{
    section: string;
    label: string;
    status: 'online' | 'degraded' | 'blocked' | 'notice';
    rule?: MaintenanceRule;
  }>;
  highlightedTargets: Set<string>;
  onToggle?: (targetKey: string, scope: 'page' | 'section') => void;
  onEditRule?: (ruleId: string) => void;
  activeRules: MaintenanceRule[];
}) {
  const [expanded, setExpanded] = useState(status !== 'online' || sections.some((s) => s.status !== 'online'));
  const style = STATUS_STYLES[status];
  const IconComponent = getIcon(icon);
  const isHighlighted = highlightedTargets.has(pageKey);

  const pageRule = activeRules.find(
    (r) => r.is_active && (r.target_key === pageKey || r.target_key === 'global')
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border-2 overflow-hidden transition-all duration-200
        ${style.border} ${style.bg}
        ${isHighlighted ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-100' : 'shadow-sm'}
      `}
    >
      {/* Page Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          status === 'online' ? 'bg-white/80' : style.bg
        }`}>
          <IconComponent className={`h-4 w-4 ${style.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{label}</h3>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
              ${style.text} ${status !== 'online' ? style.bg + ' border ' + style.border : 'bg-emerald-100 text-emerald-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono">{route}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {pageRule && onEditRule && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditRule(pageRule.id);
              }}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Edit rule"
            >
              <Eye className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Sections */}
      <AnimatePresence>
        {expanded && sections.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-0.5 border-t border-gray-200/50 pt-2">
              {sections.map((section) => (
                <SectionRow
                  key={section.section}
                  sectionKey={section.section}
                  label={section.label}
                  status={section.status}
                  pageKey={pageKey}
                  highlighted={highlightedTargets.has(`${pageKey}:${section.section}`)}
                  onToggle={
                    onToggle
                      ? () => onToggle(`${pageKey}:${section.section}`, 'section')
                      : undefined
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// Feature Group Overlay Panel
// =============================================================================

function FeatureGroupPanel({
  groups,
  activeGroup,
  onSelectGroup,
  rules,
}: {
  groups: FeatureGroupEntry[];
  activeGroup: string | null;
  onSelectGroup: (key: string | null) => void;
  rules: MaintenanceRule[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">Feature Groups</h3>
      </div>
      <div className="space-y-1.5">
        {groups.map((group) => {
          const coverage = featureGroupMapper.getGroupCoverage(group.key, rules);
          const isActive = activeGroup === group.key;
          const GroupIcon = getIcon(group.icon);

          return (
            <button
              key={group.key}
              onClick={() => onSelectGroup(isActive ? null : group.key)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                ${isActive
                  ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent'}
              `}
            >
              <GroupIcon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {group.label}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{group.description}</p>
              </div>
              {coverage.covered > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        coverage.percentage >= 100
                          ? 'bg-red-500'
                          : coverage.percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${coverage.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 tabular-nums w-8 text-right">
                    {coverage.covered}/{coverage.total}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Legend
// =============================================================================

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
      {Object.entries(STATUS_STYLES).map(([key, style]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <span>{style.label}</span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main SiteMapView
// =============================================================================

export default function SiteMapView({
  rules,
  onToggleRule,
  onEditRule,
  className = '',
}: SiteMapViewProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');

  // Build health map
  const healthMap = useMemo(() => buildSiteHealthMap(rules), [rules]);
  const health = useMemo(() => computeSiteHealth(healthMap), [healthMap]);

  // Highlighted targets when a feature group is selected
  const highlightedTargets = useMemo(() => {
    if (!activeGroup) return new Set<string>();
    const targets = featureGroupMapper.getTargetsForGroup(activeGroup);
    return new Set(targets);
  }, [activeGroup]);

  // Sort pages
  const sortedHealth = useMemo(() => {
    const sorted = [...healthMap];
    if (sortBy === 'status') {
      const order = { blocked: 0, degraded: 1, notice: 2, online: 3 };
      sorted.sort((a, b) => order[a.status] - order[b.status]);
    } else {
      sorted.sort((a, b) => a.page.label.localeCompare(b.page.label));
    }
    return sorted;
  }, [healthMap, sortBy]);

  const handleToggle = useCallback(
    (targetKey: string, scope: 'page' | 'section') => {
      onToggleRule?.(targetKey, scope, 'degraded');
    },
    [onToggleRule]
  );

  // Summary stats
  const onlineCount = healthMap.filter((h) => h.status === 'online').length;
  const issueCount = healthMap.filter((h) => h.status !== 'online').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <HealthScoreRing score={health.healthScore} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Site Health Map</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {onlineCount} of {PAGE_REGISTRY.length} pages online
                {issueCount > 0 && (
                  <span className="text-red-600 font-medium"> · {issueCount} with issues</span>
                )}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {health.blocked > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                    <ZapOff className="h-3 w-3" /> {health.blocked}% blocked
                  </span>
                )}
                {health.degraded > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" /> {health.degraded}% degraded
                  </span>
                )}
                {health.notice > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                    <Info className="h-3 w-3" /> {health.notice}% notice
                  </span>
                )}
                {health.healthScore === 100 && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <Zap className="h-3 w-3" /> All systems operational
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy((s) => (s === 'name' ? 'status' : 'name'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600
                         bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title={`Sort by ${sortBy === 'name' ? 'status' : 'name'}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortBy === 'name' ? 'By Name' : 'By Status'}
            </button>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map + Feature Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Site Map Grid */}
        <div className={`lg:col-span-3 ${
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'
            : 'space-y-2'
        }`}>
          {sortedHealth.map((entry) =>
            viewMode === 'grid' ? (
              <PageCard
                key={entry.page.key}
                pageKey={entry.page.key}
                label={entry.page.label}
                icon={entry.page.icon}
                route={entry.page.route}
                status={entry.status}
                sections={entry.sectionStatuses}
                highlightedTargets={highlightedTargets}
                onToggle={onToggleRule ? handleToggle : undefined}
                onEditRule={onEditRule}
                activeRules={rules.filter((r) => r.is_active)}
              />
            ) : (
              <CompactRow
                key={entry.page.key}
                pageKey={entry.page.key}
                label={entry.page.label}
                icon={entry.page.icon}
                route={entry.page.route}
                status={entry.status}
                sectionCount={entry.sectionStatuses.length}
                issueCount={entry.sectionStatuses.filter((s) => s.status !== 'online').length}
                highlighted={highlightedTargets.has(entry.page.key)}
                onEditRule={
                  onEditRule
                    ? () => {
                        const rule = rules.find(
                          (r) => r.is_active && r.target_key === entry.page.key
                        );
                        if (rule) onEditRule(rule.id);
                      }
                    : undefined
                }
              />
            )
          )}
        </div>

        {/* Feature Group Panel */}
        <div className="lg:col-span-1 space-y-4">
          <FeatureGroupPanel
            groups={FEATURE_GROUPS}
            activeGroup={activeGroup}
            onSelectGroup={setActiveGroup}
            rules={rules}
          />
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <Legend />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Compact Row (list view mode)
// =============================================================================

function CompactRow({
  pageKey,
  label,
  icon,
  route,
  status,
  sectionCount,
  issueCount,
  highlighted,
  onEditRule,
}: {
  pageKey: string;
  label: string;
  icon: string;
  route: string;
  status: 'online' | 'degraded' | 'blocked' | 'notice';
  sectionCount: number;
  issueCount: number;
  highlighted: boolean;
  onEditRule?: () => void;
}) {
  const style = STATUS_STYLES[status];
  const IconComponent = getIcon(icon);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        flex items-center gap-3 px-4 py-3 bg-white rounded-lg border
        transition-all duration-200
        ${highlighted ? 'ring-2 ring-indigo-300 border-indigo-200' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
      <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-xs text-gray-400 ml-2 font-mono">{route}</span>
      </div>
      <span className="text-xs text-gray-400">{sectionCount} sections</span>
      {issueCount > 0 && (
        <span className="text-xs text-red-600 font-medium">{issueCount} issues</span>
      )}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg}`}>
        {style.label}
      </span>
      {onEditRule && status !== 'online' && (
        <button
          onClick={onEditRule}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="View rule"
        >
          <Eye className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}
    </motion.div>
  );
}
