'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import AvatarCropper from '@/components/AvatarCropper';
import { User, Lock, Settings, Check } from 'lucide-react';

type Tab = 'profile' | 'privacy' | 'account';

export default function SettingsPage() {
  const { currentUser, updateProfile } = useApp();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('profile');

  // Profile tab state
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl ?? '');
  const [coverUrl, setCoverUrl] = useState(currentUser.coverUrl ?? '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);      // dataURL while cropper is open
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Privacy tab state
  const [journalPublicDefault, setJournalPublicDefault] = useState(currentUser.journalPublicDefault ?? false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // Account tab state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Avatar: file selected → open cropper ──────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setCropSrc(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Avatar: cropper applied → upload blob ─────────────────
  const handleCropApply = async (blob: Blob) => {
    setCropSrc(null);
    setUploadingAvatar(true);
    setProfileError('');
    // Optimistic preview
    const localUrl = URL.createObjectURL(blob);
    setAvatarUrl(localUrl);
    try {
      const path = `${currentUser.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Upload failed');
      setAvatarUrl(currentUser.avatarUrl ?? '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Cover photo ──────────────────────────────────────────
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingCover(true);
    setProfileError('');
    const localUrl = URL.createObjectURL(file);
    setCoverUrl(localUrl);
    try {
      const path = `${currentUser.id}/cover.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      setCoverUrl(publicUrl);
      await updateProfile({ coverUrl: publicUrl });
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Cover upload failed');
      setCoverUrl(currentUser.coverUrl ?? '');
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Save profile ─────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      await updateProfile({
        name,
        username,
        bio,
        avatarUrl: avatarUrl || undefined,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save privacy ─────────────────────────────────────────
  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    setPrivacySuccess(false);
    await updateProfile({ journalPublicDefault });
    setSavingPrivacy(false);
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 3000);
  };

  // ── Change password ──────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords don\'t match.'); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setSavingPassword(false);
  };

  // ── Sign out ─────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  // ── Delete account ───────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Deletion failed');
      }
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong');
      setDeletingAccount(false);
    }
  };

  const TABS: { id: Tab; label: string; Icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', Icon: User },
    { id: 'privacy', label: 'Privacy', Icon: Lock },
    { id: 'account', label: 'Account', Icon: Settings },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Avatar crop modal */}
      {cropSrc && (
        <AvatarCropper
          src={cropSrc}
          onApply={handleCropApply}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 rounded-t-2xl px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 pt-3 px-5 text-sm font-semibold transition-colors flex items-center gap-2 ${
              tab === t.id
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.Icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ─────────────────────────────────── */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700">
                <Avatar
                  initials={currentUser.avatar}
                  colorSeed={currentUser.id}
                  avatarUrl={avatarUrl || currentUser.avatarUrl}
                  className="w-full h-full"
                />
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs">…</span>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-sm px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? 'Uploading…' : 'Change photo'}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">JPG, PNG or GIF — max 5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Cover photo */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover photo</p>
            <div className="relative h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer" onClick={() => !uploadingCover && coverInputRef.current?.click()}>
              {coverUrl ? (
                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-400 to-pink-400" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                  {uploadingCover ? 'Uploading…' : 'Change cover photo'}
                </span>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </div>
          </div>

          {profileError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {profileError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <span className="text-xs text-gray-400 dark:text-gray-500">{bio.length}/200</span>
            </div>
            <textarea
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the community a bit about yourself…"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
            {profileSuccess && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile updated
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── Privacy tab ─────────────────────────────────── */}
      {tab === 'privacy' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Journal entries</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Control how your reading journal appears to other users.</p>

            <label className="flex items-center justify-between gap-4 cursor-pointer group">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Make new journal entries public by default</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">You can still override this per entry.</p>
              </div>
              <button
                type="button"
                onClick={() => setJournalPublicDefault(!journalPublicDefault)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  journalPublicDefault ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    journalPublicDefault ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Reading activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your shelf and posts are visible to all users on Chedder.</p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">More granular privacy controls are coming soon.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePrivacy}
              disabled={savingPrivacy}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {savingPrivacy ? 'Saving…' : 'Save preferences'}
            </button>
            {privacySuccess && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Account tab ─────────────────────────────────── */}
      {tab === 'account' && (
        <div className="space-y-4">
          {/* Change password */}
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Change password</h2>

            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
              {passwordSuccess && (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Password updated
                </span>
              )}
            </div>
          </form>

          {/* Sign out */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Sign out</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You'll be returned to the login page.</p>
            <button
              onClick={handleSignOut}
              className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/50 shadow-sm p-6">
            <h2 className="font-bold text-red-600 mb-1">Danger zone</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Deleting your account is permanent. All your books, journals, posts, and messages will be removed and cannot be recovered.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2.5 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Delete account
              </button>
            ) : (
              <div className="space-y-4 border border-red-200 dark:border-red-800 rounded-xl p-4 bg-red-50/50 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Type <span className="font-bold font-mono">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-2.5 border border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-400"
                />
                {deleteError && (
                  <p className="text-sm text-red-600">{deleteError}</p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingAccount ? 'Deleting…' : 'Delete my account'}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                    className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
