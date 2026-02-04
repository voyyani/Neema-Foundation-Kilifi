// Volunteer Opportunities Manager
// Add/edit/remove volunteer opportunities with skills and slots

import { useState } from 'react';
import { Users, Plus, X, Tag, Hash, Briefcase, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VolunteerOpportunitiesManagerProps {
  opportunities: string[];
  slots?: number;
  skillsNeeded: string[];
  onOpportunitiesChange: (opportunities: string[]) => void;
  onSlotsChange: (slots: number | undefined) => void;
  onSkillsChange: (skills: string[]) => void;
}

// Preset skills for quick selection
const COMMON_SKILLS = [
  'Teaching',
  'Healthcare',
  'Counseling',
  'Driving',
  'Administration',
  'Social Work',
  'IT Support',
  'Photography',
  'Event Planning',
  'Fundraising',
  'Marketing',
  'Translation',
  'Legal Aid',
  'Child Care',
  'Agriculture',
];

// Sortable opportunity item
function SortableOpportunity({
  id,
  opportunity,
  onRemove,
}: {
  id: string;
  opportunity: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg group ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />
      <span className="flex-1 text-gray-700">{opportunity}</span>
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function VolunteerOpportunitiesManager({
  opportunities,
  slots,
  skillsNeeded,
  onOpportunitiesChange,
  onSlotsChange,
  onSkillsChange,
}: VolunteerOpportunitiesManagerProps) {
  const [newOpportunity, setNewOpportunity] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isEnabled, setIsEnabled] = useState(opportunities.length > 0 || slots !== undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = opportunities.indexOf(active.id as string);
      const newIndex = opportunities.indexOf(over.id as string);
      onOpportunitiesChange(arrayMove(opportunities, oldIndex, newIndex));
    }
  };

  const addOpportunity = () => {
    if (newOpportunity.trim() && !opportunities.includes(newOpportunity.trim())) {
      onOpportunitiesChange([...opportunities, newOpportunity.trim()]);
      setNewOpportunity('');
    }
  };

  const removeOpportunity = (index: number) => {
    onOpportunitiesChange(opportunities.filter((_, i) => i !== index));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !skillsNeeded.includes(skill.trim())) {
      onSkillsChange([...skillsNeeded, skill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    onSkillsChange(skillsNeeded.filter(s => s !== skill));
  };

  const handleToggle = () => {
    if (isEnabled) {
      onOpportunitiesChange([]);
      onSlotsChange(undefined);
      onSkillsChange([]);
    }
    setIsEnabled(!isEnabled);
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Volunteer Opportunities</h4>
            <p className="text-sm text-gray-500">Enable to recruit volunteers for this program</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-6 pl-1">
          {/* Available Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Volunteer Slots
            </label>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={slots || ''}
                onChange={(e) => onSlotsChange(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                min="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited slots
            </p>
          </div>

          {/* Opportunities List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volunteer Roles & Opportunities
            </label>
            
            {/* Add new opportunity */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newOpportunity}
                onChange={(e) => setNewOpportunity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOpportunity())}
                placeholder="e.g., Community Health Worker, Teaching Assistant..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={addOpportunity}
                disabled={!newOpportunity.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Opportunities list with drag and drop */}
            {opportunities.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={opportunities} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {opportunities.map((opportunity, index) => (
                      <SortableOpportunity
                        key={opportunity}
                        id={opportunity}
                        opportunity={opportunity}
                        onRemove={() => removeOpportunity(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-300 rounded-lg text-center">
                No opportunities added yet. Add roles that volunteers can apply for.
              </div>
            )}
          </div>

          {/* Skills Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Needed
            </label>

            {/* Quick add common skills */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.filter(skill => !skillsNeeded.includes(skill)).slice(0, 8).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom skill input */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                  placeholder="Add custom skill..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={() => addSkill(newSkill)}
                disabled={!newSkill.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Selected skills */}
            {skillsNeeded.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skillsNeeded.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-purple-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {(opportunities.length > 0 || slots) && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
              <div className="text-sm text-gray-600">
                {slots && (
                  <p className="mb-1">
                    <strong>{slots}</strong> volunteer slots available
                  </p>
                )}
                {opportunities.length > 0 && (
                  <p>
                    <strong>{opportunities.length}</strong> role{opportunities.length !== 1 ? 's' : ''} available:{' '}
                    {opportunities.join(', ')}
                  </p>
                )}
                {skillsNeeded.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Looking for: {skillsNeeded.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
