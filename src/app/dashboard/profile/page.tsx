"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Edit,
  Camera,
  Mail,
  AtSign,
  Save,
  X,
  Upload,
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Home,
} from "lucide-react";
import { getActiveAccount, updateAccountProfile } from "@/lib/authStorage";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Profile state ──────────────────────────────────────
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    location: "",
    bio: "",
    profilePhoto: null as string | null,
  });

  // ─── Load account data ──────────────────────────────────
  useEffect(() => {
    const syncProfile = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      const account = getActiveAccount();
      if (account) {
        setProfile({
          fullName: account.fullName || "",
          username: account.username || "",
          email: account.email || "",
          phone: account.phone || "",
          address: account.address || "",
          dob: account.dob || "",
          location: account.location || "",
          bio: account.bio || "",
          profilePhoto: account.profilePhoto || null,
        });
      }

      setIsLoading(false);
    };

    syncProfile();
    window.addEventListener("auth-state-changed", syncProfile);
    window.addEventListener("storage", syncProfile);
    window.addEventListener("pageshow", syncProfile);
    return () => {
      window.removeEventListener("auth-state-changed", syncProfile);
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("pageshow", syncProfile);
    };
  }, [router]);

  // ─── Handle save ────────────────────────────────────────
  const handleSave = () => {
    const account = getActiveAccount();
    if (!account) {
      alert("No active account found.");
      return;
    }

    updateAccountProfile(account.id, {
      fullName: profile.fullName,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      dob: profile.dob,
      location: profile.location,
      bio: profile.bio,
      profilePhoto: profile.profilePhoto,
    });

    setIsEditing(false);
  };

  // ─── Photo upload ──────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, GIF, or WEBP image.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile((prev) => ({ ...prev, profilePhoto: base64 }));
      const account = getActiveAccount();
      if (account) {
        updateAccountProfile(account.id, { profilePhoto: base64 });
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert("Failed to upload image.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, profilePhoto: null }));
    const account = getActiveAccount();
    if (account) {
      updateAccountProfile(account.id, { profilePhoto: null });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ─── Helper: display empty fields as "Not set" ──────────
  const displayValue = (value: string) => value || "Not set";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-sm"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft size={18} />
              Cancel
            </button>
          )}
        </div>

        {/* ─── Profile Card ───────────────────────────────── */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">

          {/* ─── View Mode ────────────────────────────────── */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Photo + Name + Username */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-red-200 dark:border-red-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.fullName.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayValue(profile.fullName)}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{profile.username || "username"}
                  </p>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{displayValue(profile.email)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">{displayValue(profile.phone)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-900 dark:text-white">{displayValue(profile.location)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 dark:text-white">{displayValue(profile.address)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="text-sm text-gray-900 dark:text-white">{displayValue(profile.dob)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AtSign size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                    <p className="text-sm text-gray-900 dark:text-white">@{profile.username || "username"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (

            /* ─── Edit Mode ────────────────────────────────── */
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
              {/* Photo edit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative group">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-red-200 dark:border-red-800"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {profile.fullName.charAt(0) || "U"}
                    </div>
                  )}
                  <button
                    onClick={triggerFileInput}
                    className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1.5 text-white hover:bg-red-700 transition shadow-lg"
                    disabled={isUploading}
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG, GIF, WEBP • Max 5MB</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                      disabled={isUploading}
                    >
                      <Upload size={16} />
                      {isUploading ? "Uploading..." : "Upload New"}
                    </button>
                    {profile.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                    placeholder="January 1, 1990"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <input
                    type="text"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-transparent dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-sm"
              >
                <Save size={20} />
                Save Changes
              </button>
            </form>
          )}
        </div>

        {/* ─── Hidden file input ──────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}