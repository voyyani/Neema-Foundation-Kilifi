// Enhanced Program Editor Modal
// World-class admin form with all the new fields and components

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react';
import type { Program, ProgramInput, ProgramCategory, ProgramTestimonial } from '../../types/content';
import RichTextEditor from '../content/RichTextEditor';
import ImageGalleryUploader from './ImageGalleryUploader';
import ProgramImageUploader from './ProgramImageUploader';
import VideoUrlInput from './VideoUrlInput';
import DonationGoalConfig from './DonationGoalConfig';
import VolunteerOpportunitiesManager from './VolunteerOpportunitiesManager';
import TestimonialsEditor from './TestimonialsEditor';
import SEOFieldsEditor from './SEOFieldsEditor';

interface EnhancedProgramFormProps {
  program: Program | null;
  onClose: () => void;
  onSave: (data: ProgramInput) => Promise<void>;
}

// Form sections for step navigation
type FormSection = 'basic' | 'content' | 'media' | 'engagement' | 'seo';

const SECTIONS: { id: FormSection; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic Info', description: 'Name, category, summary' },
  { id: 'content', label: 'Content', description: 'Description, objectives, activities' },
  { id: 'media', label: 'Media', description: 'Images, video, gallery' },
  { id: 'engagement', label: 'Engagement', description: 'Donations, volunteers, testimonials' },
  { id: 'seo', label: 'SEO', description: 'Search & social optimization' },
];

export default function EnhancedProgramForm({
  program,
  onClose,
  onSave,
}: EnhancedProgramFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<ProgramInput>({
    // Basic info
    name: program?.name || '',
    slug: program?.slug || '',
    category: program?.category || 'other',
    summary: program?.summary || '',
    is_active: program?.is_active ?? true,
    is_featured: program?.is_featured ?? false,
    
    // Content
    description: program?.description || '',
    objectives: program?.objectives || [],
    activities: program?.activities || [],
    partners: program?.partners || [],
    beneficiary_who: program?.beneficiary_who || '',
    beneficiary_where: program?.beneficiary_where || '',
    beneficiary_count: program?.beneficiary_count || undefined,
    impact_statement: program?.impact_statement || '',
    
    // CTA
    cta_label: program?.cta_label || '',
    cta_href: program?.cta_href || '',
    
    // Media
    cover_image: program?.cover_image || '',
    gallery_images: program?.gallery_images || [],
    video_url: program?.video_url || '',
    video_thumbnail: program?.video_thumbnail || '',
    
    // Donations
    donation_goal: program?.donation_goal || undefined,
    donation_current: program?.donation_current || 0,
    donation_currency: program?.donation_currency || 'KES',
    donation_deadline: program?.donation_deadline || undefined,
    
    // Volunteers
    volunteer_opportunities: program?.volunteer_opportunities || [],
    volunteer_slots: program?.volunteer_slots || undefined,
    volunteer_skills_needed: program?.volunteer_skills_needed || [],
    
    // Testimonials
    testimonials: program?.testimonials || [],
    
    // SEO
    meta_title: program?.meta_title || '',
    meta_description: program?.meta_description || '',
    social_image: program?.social_image || '',
    
    // Scheduling
    start_date: program?.start_date || undefined,
    end_date: program?.end_date || undefined,
  });

  // List management state
  const [newObjective, setNewObjective] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newPartner, setNewPartner] = useState('');

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Program name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < SECTIONS.length - 1;

  const goToNext = () => {
    if (canGoForward) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (canGoBack) {
      setActiveSection(SECTIONS[currentIndex - 1].id);
    }
  };

  // Save handler
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      setActiveSection('basic');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  // List helpers
  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...(prev.objectives || []), newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index)
    }));
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...(prev.activities || []), newActivity.trim()]
      }));
      setNewActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities?.filter((_, i) => i !== index)
    }));
  };

  const addPartner = () => {
    if (newPartner.trim()) {
      setFormData(prev => ({
        ...prev,
        partners: [...(prev.partners || []), newPartner.trim()]
      }));
      setNewPartner('');
    }
  };

  const removePartner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {program ? 'Edit Program' : 'Create New Program'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {SECTIONS.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
          {SECTIONS.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`
                relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${activeSection === section.id
                  ? 'text-[#B01C2E]'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${activeSection === section.id
                    ? 'bg-[#B01C2E] text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index + 1}
                </span>
                {section.label}
              </span>
              {activeSection === section.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B01C2E]" />
              )}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* BASIC INFO SECTION */}
            {activeSection === 'basic' && (
              <div className="space-y-6 max-w-2xl">
                {/* Program Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-lg ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Community Health Outreach"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">/programs/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      placeholder="auto-generated-from-name"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from name
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['health', 'education', 'empowerment', 'community', 'other'] as ProgramCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                          formData.category === cat
                            ? 'bg-[#B01C2E] text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {cat === 'health' && '🏥 '}
                        {cat === 'education' && '📚 '}
                        {cat === 'empowerment' && '💪 '}
                        {cat === 'community' && '🤝 '}
                        {cat === 'other' && '📋 '}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] resize-none"
                    placeholder="Brief description shown on program cards (up to 500 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.summary?.length || 0}/500 characters
                  </p>
                </div>

                {/* Status toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-5 h-5 text-[#B01C2E] rounded focus:ring-2 focus:ring-[#B01C2E]"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Active</div>
                      <div className="text-xs text-gray-500">Visible to public</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Featured</div>
                      <div className="text-xs text-gray-500">Highlight on homepage</div>
                    </div>
                  </label>
                </div>

                {/* Scheduling */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Dates (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.start_date?.split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value || undefined }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date?.split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value || undefined }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT SECTION */}
            {activeSection === 'content' && (
              <div className="space-y-6">
                {/* Rich Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <RichTextEditor
                    key={program?.id ?? 'new-description'}
                    content={formData.description || ''}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Detailed program description with rich formatting..."
                    minHeight="300px"
                  />
                </div>

                {/* Impact Statement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact Statement
                  </label>
                  <textarea
                    value={formData.impact_statement || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact_statement: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] resize-none"
                    placeholder="e.g., 'Transforming lives through healthcare access in rural Kilifi'"
                  />
                </div>

                {/* Beneficiaries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiaries
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Who</label>
                      <input
                        type="text"
                        value={formData.beneficiary_who || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_who: e.target.value }))}
                        placeholder="e.g., School children"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Where</label>
                      <input
                        type="text"
                        value={formData.beneficiary_where || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_where: e.target.value }))}
                        placeholder="e.g., Kilifi County"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Count</label>
                      <input
                        type="number"
                        value={formData.beneficiary_count || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_count: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="e.g., 5000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectives
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                      placeholder="Add an objective..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      className="px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
                    >
                      Add
                    </button>
                  </div>
                  {formData.objectives && formData.objectives.length > 0 && (
                    <ul className="space-y-2">
                      {formData.objectives.map((obj, index) => (
                        <li key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-green-600">✓</span>
                          <span className="flex-1">{obj}</span>
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activities
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                      placeholder="Add an activity..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                    />
                    <button
                      type="button"
                      onClick={addActivity}
                      className="px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
                    >
                      Add
                    </button>
                  </div>
                  {formData.activities && formData.activities.length > 0 && (
                    <ul className="space-y-2">
                      {formData.activities.map((activity, index) => (
                        <li key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-[#B01C2E]">•</span>
                          <span className="flex-1">{activity}</span>
                          <button
                            type="button"
                            onClick={() => removeActivity(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Partners */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partners
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newPartner}
                      onChange={(e) => setNewPartner(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPartner())}
                      placeholder="Add a partner organization..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                    />
                    <button
                      type="button"
                      onClick={addPartner}
                      className="px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
                    >
                      Add
                    </button>
                  </div>
                  {formData.partners && formData.partners.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.partners.map((partner, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B01C2E]/10 text-blue-800 rounded-full text-sm"
                        >
                          {partner}
                          <button
                            type="button"
                            onClick={() => removePartner(index)}
                            className="hover:text-[#B01C2E]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call-to-Action Button
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={formData.cta_label || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_label: e.target.value }))}
                        placeholder="e.g., Support This Program"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Button Link</label>
                      <input
                        type="text"
                        value={formData.cta_href || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_href: e.target.value }))}
                        placeholder="/donate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MEDIA SECTION */}
            {activeSection === 'media' && (
              <div className="space-y-8">
                {/* ── Phase 9: Supabase-backed Program Photo Gallery ── */}
                <ProgramImageUploader programId={program?.id} />

                {/* ── Legacy cover image + gallery_images (URL-based) ── */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
                    Legacy cover image (URL-based)
                  </p>
                  <ImageGalleryUploader
                    images={[
                      ...(formData.cover_image ? [formData.cover_image] : []),
                      ...(formData.gallery_images || [])
                    ]}
                    onChange={(images) => {
                      if (images.length > 0) {
                        setFormData(prev => ({
                          ...prev,
                          cover_image: images[0],
                          gallery_images: images.slice(1)
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          cover_image: '',
                          gallery_images: []
                        }));
                      }
                    }}
                    maxImages={10}
                  />
                </div>

                {/* Video */}
                <div className="pt-6 border-t border-gray-200">
                  <VideoUrlInput
                    videoUrl={formData.video_url || ''}
                    thumbnailUrl={formData.video_thumbnail}
                    onVideoChange={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
                    onThumbnailChange={(url) => setFormData(prev => ({ ...prev, video_thumbnail: url }))}
                  />
                </div>
              </div>
            )}

            {/* ENGAGEMENT SECTION */}
            {activeSection === 'engagement' && (
              <div className="space-y-8">
                {/* Donation Goal */}
                <DonationGoalConfig
                  goal={formData.donation_goal}
                  current={formData.donation_current}
                  currency={formData.donation_currency}
                  deadline={formData.donation_deadline}
                  onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                />

                {/* Volunteer Opportunities */}
                <div className="pt-6 border-t border-gray-200">
                  <VolunteerOpportunitiesManager
                    opportunities={formData.volunteer_opportunities || []}
                    slots={formData.volunteer_slots}
                    skillsNeeded={formData.volunteer_skills_needed || []}
                    onOpportunitiesChange={(opps) => setFormData(prev => ({ ...prev, volunteer_opportunities: opps }))}
                    onSlotsChange={(slots) => setFormData(prev => ({ ...prev, volunteer_slots: slots }))}
                    onSkillsChange={(skills) => setFormData(prev => ({ ...prev, volunteer_skills_needed: skills }))}
                  />
                </div>

                {/* Testimonials */}
                <div className="pt-6 border-t border-gray-200">
                  <TestimonialsEditor
                    testimonials={formData.testimonials || []}
                    onChange={(testimonials) => setFormData(prev => ({ ...prev, testimonials }))}
                    maxTestimonials={10}
                  />
                </div>
              </div>
            )}

            {/* SEO SECTION */}
            {activeSection === 'seo' && (
              <div className="space-y-6">
                <SEOFieldsEditor
                  metaTitle={formData.meta_title}
                  metaDescription={formData.meta_description}
                  socialImage={formData.social_image}
                  programName={formData.name}
                  programSummary={formData.summary}
                  onMetaTitleChange={(value) => setFormData(prev => ({ ...prev, meta_title: value }))}
                  onMetaDescriptionChange={(value) => setFormData(prev => ({ ...prev, meta_description: value }))}
                  onSocialImageChange={(value) => setFormData(prev => ({ ...prev, social_image: value }))}
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrev}
              disabled={!canGoBack}
              className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            
            {canGoForward ? (
              <button
                type="button"
                onClick={goToNext}
                className="flex items-center gap-1 px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {program ? 'Update Program' : 'Create Program'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
