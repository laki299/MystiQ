import React, { useState } from 'react';
import { UserProfile } from '../../types/user.types';
import { updateUserProvices/firebase/profile.service';
import { AvatarSelector } from './AvatarSelector';

interface ProfileEditModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [interestInput, setInterestInput] = useState('');

  if (!isOpen) return null;

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (!interestInput.trim()) return;
    const list = formData.interests || [];
    if (!list.includes(interestInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...list, interestInput.trim()],
      }));
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((i) => i !== item),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { uid, createdAt, ...updates } = formData;
      await updateUserProfile(profile.uid, updates);
      onSaved({ ...formData, lastProfileUpdate: Date.now() });
      onClose();
    } catch (err) {
      console.error('[Update Profile Error]:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <AvatarSelector
          currentAvatar={formData.avatar}
          onAvatarSelected={(url) => handleChange('avatar', url)}
        />

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Anonymous Name</label>
            <input
              type="text"
              value={formData.anonymousName}
              onChange={(e) => handleChange('anonymousName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              required
              maxLength={32}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={formData.age || ''}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="unspecified">Unspecified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Country</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Language</label>
              <input
                type="text"
                value={formData.language || ''}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Profession</label>
              <input
                type="text"
                value={formData.profession || ''}
                onChange={(e) => handleChange('profession', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Bio</label>
            <textarea
              rows={2}
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
              maxLength={150}
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Interests</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add interest..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="bg-purple-900 border border-purple-700 text-purple-200 px-3 py-2 rounded-xl font-bold"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(formData.interests || []).map((item) => (
                <span
                  key={item}
                  className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
