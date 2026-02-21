// Site Settings Page

import { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { HexColorPicker } from 'react-colorful';
import { Save, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SiteSettingsPage() {
  const { settings, isLoading, updateSettings } = useSiteSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: settings?.brand_name || '',
    tagline: settings?.tagline || '',
    mission: settings?.mission || '',
    vision: settings?.vision || '',
    values: settings?.values || [],
    primary_color: settings?.primary_color || '#B01C2E',
    secondary_color: settings?.secondary_color || '#111827',
    social_facebook: settings?.social_facebook || '',
    social_facebook_enabled: settings?.social_facebook_enabled ?? true,
    social_instagram: settings?.social_instagram || '',
    social_instagram_enabled: settings?.social_instagram_enabled ?? true,
    social_twitter: settings?.social_twitter || '',
    social_twitter_enabled: settings?.social_twitter_enabled ?? true,
    social_linkedin: settings?.social_linkedin || '',
    social_linkedin_enabled: settings?.social_linkedin_enabled ?? true,
    social_youtube: settings?.social_youtube || '',
    social_youtube_enabled: settings?.social_youtube_enabled ?? true,
    contact_email: settings?.contact_email || '',
    contact_phone: settings?.contact_phone || '',
    contact_address: settings?.contact_address || '',
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        brand_name: settings.brand_name,
        tagline: settings.tagline || '',
        mission: settings.mission || '',
        vision: settings.vision || '',
        values: settings.values || [],
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        social_facebook: settings.social_facebook || '',
        social_facebook_enabled: settings.social_facebook_enabled ?? true,
        social_instagram: settings.social_instagram || '',
        social_instagram_enabled: settings.social_instagram_enabled ?? true,
        social_twitter: settings.social_twitter || '',
        social_twitter_enabled: settings.social_twitter_enabled ?? true,
        social_linkedin: settings.social_linkedin || '',
        social_linkedin_enabled: settings.social_linkedin_enabled ?? true,
        social_youtube: settings.social_youtube || '',
        social_youtube_enabled: settings.social_youtube_enabled ?? true,
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addValue = () => {
    setFormData({
      ...formData,
      values: [...formData.values, ''],
    });
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...formData.values];
    newValues[index] = value;
    setFormData({ ...formData, values: newValues });
  };

  const removeValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your website's global configuration</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Brand Identity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Identity</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                placeholder="Neema Foundation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mission & Vision</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label>
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vision Statement</label>
              <textarea
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Core Values</label>
              <div className="space-y-2">
                {formData.values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateValue(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                      placeholder="Enter a core value"
                    />
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addValue}
                  className="text-sm text-[#B01C2E] hover:text-[#8A1624]"
                >
                  + Add Value
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                  className="w-full h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: formData.primary_color }}
                />
                <span className="block text-center mt-1 text-sm text-gray-600">{formData.primary_color}</span>
                {showPrimaryPicker && (
                  <div className="absolute z-10 mt-2">
                    <div className="fixed inset-0" onClick={() => setShowPrimaryPicker(false)} />
                    <HexColorPicker color={formData.primary_color} onChange={(color) => setFormData({ ...formData, primary_color: color })} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                  className="w-full h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: formData.secondary_color }}
                />
                <span className="block text-center mt-1 text-sm text-gray-600">{formData.secondary_color}</span>
                {showSecondaryPicker && (
                  <div className="absolute z-10 mt-2">
                    <div className="fixed inset-0" onClick={() => setShowSecondaryPicker(false)} />
                    <HexColorPicker color={formData.secondary_color} onChange={(color) => setFormData({ ...formData, secondary_color: color })} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
          
          <div className="space-y-4">
            {[
              { name: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
              { name: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
              { name: 'social_twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
              { name: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
              { name: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">{label} URL</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[`${name}_enabled` as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [`${name}_enabled`]: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-[#B01C2E]"
                    />
                    <span className="text-sm text-gray-600">Show in footer</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={formData[name as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                placeholder="neemafoundationkilifi@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                placeholder="+254 797 484 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
              <textarea
                value={formData.contact_address}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent"
                rows={3}
                placeholder="Ganze Sub-county, Kilifi County, Kenya"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
