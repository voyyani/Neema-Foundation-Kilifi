/**
 * ScopePicker — Visual page/section/component selector
 *
 * Renders an interactive tree of the site's pages and sections.
 * Admins click to select a target for a maintenance rule.
 * Supports all scope levels: global, page, section, component, feature_group.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
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
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  Layers,
  Box,
  LayoutGrid,
  MapPin,
} from 'lucide-react';
import type { MaintenanceScope } from '../../types/maintenance';
import { PAGE_REGISTRY, FEATURE_GROUPS } from '../../config/maintenanceRegistry';

// =============================================================================
// Icon resolver
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Heart, Building, Gift, Users, Handshake, HeartHandshake,
  Building2, BookOpen, FileText, Camera, Calendar, Image, Images,
  Globe, Layers, Box, LayoutGrid, MapPin,
};

function IconComponent({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? FileText;
  return <Icon className={className} />;
}

// =============================================================================
// Types
// =============================================================================

interface ScopePickerProps {
  scope: MaintenanceScope;
  targetKey: string;
  onScopeChange: (scope: MaintenanceScope) => void;
  onTargetKeyChange: (key: string) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function ScopePicker({
  scope,
  targetKey,
  onScopeChange,
  onTargetKeyChange,
  className = '',
}: ScopePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  // Auto-expand the page that contains the current selection
  useMemo(() => {
    if (scope === 'section' || scope === 'component') {
      const pageKey = targetKey.split(':')[0];
      if (pageKey) {
        setExpandedPages((prev) => new Set([...prev, pageKey]));
      }
    }
  }, [scope, targetKey]);

  const toggleExpand = (pageKey: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageKey)) next.delete(pageKey);
      else next.add(pageKey);
      return next;
    });
  };

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return PAGE_REGISTRY;
    const q = searchQuery.toLowerCase();
    return PAGE_REGISTRY.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.route.toLowerCase().includes(q) ||
        p.sections.some((s) => s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredFeatureGroups = useMemo(() => {
    if (!searchQuery.trim()) return FEATURE_GROUPS;
    const q = searchQuery.toLowerCase();
    return FEATURE_GROUPS.filter(
      (fg) =>
        fg.label.toLowerCase().includes(q) ||
        fg.key.toLowerCase().includes(q) ||
        fg.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (newScope: MaintenanceScope, newTargetKey: string) => {
    onScopeChange(newScope);
    onTargetKeyChange(newTargetKey);
  };

  const isSelected = (checkScope: MaintenanceScope, checkKey: string) =>
    scope === checkScope && targetKey === checkKey;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scope Tabs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scope Level</label>
        <div className="flex flex-wrap gap-1.5">
          {SCOPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                onScopeChange(tab.value);
                // Reset target for global
                if (tab.value === 'global') onTargetKeyChange('global');
                else onTargetKeyChange('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                          border transition-all duration-200 ${
                scope === tab.value
                  ? 'bg-[#B01C2E] text-white border-[#B01C2E] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global — no picker needed */}
      {scope === 'global' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl"
        >
          <Globe className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">Entire Public Site</p>
            <p className="text-xs text-purple-600">
              This rule will affect every public page and section.
            </p>
          </div>
        </motion.div>
      )}

      {/* Feature Group Picker */}
      {scope === 'feature_group' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700">Select Feature Group</label>
          <div className="grid gap-2">
            {filteredFeatureGroups.map((fg) => (
              <button
                key={fg.key}
                type="button"
                onClick={() => handleSelect('feature_group', fg.key)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected('feature_group', fg.key)
                    ? 'border-[#B01C2E] bg-[#B01C2E]/5 ring-1 ring-[#B01C2E]/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected('feature_group', fg.key)
                      ? 'bg-[#B01C2E]/10'
                      : 'bg-gray-100'
                  }`}
                >
                  <IconComponent
                    name={fg.icon}
                    className={`h-4.5 w-4.5 ${
                      isSelected('feature_group', fg.key) ? 'text-[#B01C2E]' : 'text-gray-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{fg.label}</span>
                    {isSelected('feature_group', fg.key) && (
                      <Check className="h-4 w-4 text-[#B01C2E]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{fg.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {fg.targets.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Page / Section / Component Tree Picker */}
      {(scope === 'page' || scope === 'section' || scope === 'component') && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages and sections…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
            />
          </div>

          {/* Tree */}
          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            {filteredPages.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No pages match your search</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredPages.map((page) => {
                  const isExpanded = expandedPages.has(page.key);
                  const isPageSelected = isSelected('page', page.key);
                  const hasMatchingSections =
                    scope !== 'page' &&
                    page.sections.some(
                      (s) =>
                        isSelected('section', `${page.key}:${s.key}`) ||
                        (s.components ?? []).some((c) =>
                          isSelected('component', `${page.key}:${s.key}:${c.key}`)
                        )
                    );

                  return (
                    <div key={page.key}>
                      {/* Page Row */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                          isPageSelected
                            ? 'bg-[#B01C2E]/5'
                            : hasMatchingSections
                              ? 'bg-blue-50/50'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Expand toggle (only if showing sections/components) */}
                        {scope !== 'page' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(page.key);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        ) : (
                          <div className="w-5" />
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (scope === 'page') {
                              handleSelect('page', page.key);
                            } else {
                              toggleExpand(page.key);
                            }
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isPageSelected
                                ? 'bg-[#B01C2E]/10'
                                : 'bg-gray-100'
                            }`}
                          >
                            <IconComponent
                              name={page.icon}
                              className={`h-4 w-4 ${
                                isPageSelected ? 'text-[#B01C2E]' : 'text-gray-500'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isPageSelected ? 'text-[#B01C2E]' : 'text-gray-900'
                              }`}
                            >
                              {page.label}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">{page.route}</p>
                          </div>
                          {isPageSelected && (
                            <Check className="h-4 w-4 text-[#B01C2E] flex-shrink-0" />
                          )}
                        </button>
                      </div>

                      {/* Sections (expandable) */}
                      <AnimatePresence>
                        {isExpanded && scope !== 'page' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-gray-50/50"
                          >
                            {page.sections.map((section) => {
                              const sectionKey = `${page.key}:${section.key}`;
                              const isSectionSelected = isSelected('section', sectionKey);
                              const hasComponents =
                                scope === 'component' &&
                                (section.components ?? []).length > 0;

                              return (
                                <div key={section.key}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (scope === 'section') {
                                        handleSelect('section', sectionKey);
                                      }
                                    }}
                                    disabled={scope === 'component' && !hasComponents}
                                    className={`w-full flex items-center gap-2.5 pl-12 pr-3 py-2 text-left transition-colors ${
                                      isSectionSelected
                                        ? 'bg-[#B01C2E]/5'
                                        : scope === 'component' && !hasComponents
                                          ? 'opacity-40 cursor-not-allowed'
                                          : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <LayoutGrid
                                      className={`h-3.5 w-3.5 ${
                                        isSectionSelected ? 'text-[#B01C2E]' : 'text-gray-400'
                                      }`}
                                    />
                                    <span
                                      className={`text-sm flex-1 ${
                                        isSectionSelected
                                          ? 'font-medium text-[#B01C2E]'
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {section.label}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {section.component_name}
                                    </span>
                                    {isSectionSelected && (
                                      <Check className="h-3.5 w-3.5 text-[#B01C2E]" />
                                    )}
                                  </button>

                                  {/* Component level */}
                                  {scope === 'component' &&
                                    hasComponents &&
                                    section.components!.map((comp) => {
                                      const compKey = `${page.key}:${section.key}:${comp.key}`;
                                      const isCompSelected = isSelected('component', compKey);

                                      return (
                                        <button
                                          key={comp.key}
                                          type="button"
                                          onClick={() =>
                                            handleSelect('component', compKey)
                                          }
                                          className={`w-full flex items-center gap-2.5 pl-20 pr-3 py-1.5 text-left transition-colors ${
                                            isCompSelected
                                              ? 'bg-[#B01C2E]/5'
                                              : 'hover:bg-gray-100'
                                          }`}
                                        >
                                          <Box
                                            className={`h-3 w-3 ${
                                              isCompSelected
                                                ? 'text-[#B01C2E]'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                          <span
                                            className={`text-xs ${
                                              isCompSelected
                                                ? 'font-medium text-[#B01C2E]'
                                                : 'text-gray-600'
                                            }`}
                                          >
                                            {comp.label}
                                          </span>
                                          {isCompSelected && (
                                            <Check className="h-3 w-3 text-[#B01C2E]" />
                                          )}
                                        </button>
                                      );
                                    })}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current selection indicator */}
          {targetKey && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Selected:</span>
              <code className="text-xs font-mono text-[#B01C2E] bg-[#B01C2E]/5 px-2 py-0.5 rounded">
                {targetKey}
              </code>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// =============================================================================
// Scope Tab Config
// =============================================================================

const SCOPE_TABS: {
  value: MaintenanceScope;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'global', label: 'Global', icon: Globe },
  { value: 'page', label: 'Page', icon: FileText },
  { value: 'section', label: 'Section', icon: LayoutGrid },
  { value: 'component', label: 'Component', icon: Box },
  { value: 'feature_group', label: 'Feature Group', icon: Layers },
];
