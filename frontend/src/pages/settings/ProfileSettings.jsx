import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/Input";
import AvatarEditor from "../../components/profile/AvatarEditor";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { UserContext } from "../../context/userContext";
import { AUTH_PROVIDERS, PROVIDER_LABELS } from "../../constants/authProviders";
import { getUserAvatar } from "../../utils/userAvatar";
import { updateProfileName } from "../../utils/profileApi";
import { FcGoogle } from "react-icons/fc";

const ProfileSettings = () => {
    const { user, refreshUser, updateUser } = useContext(UserContext);
    const location = useLocation();
    const editSectionRef = useRef(null);

    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    useEffect(() => {
        if (location.state?.scrollToEdit && editSectionRef.current) {
            editSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [location.state]);

    if (!user) return null;

    const isGoogleProvider = user.provider === AUTH_PROVIDERS.GOOGLE;
    const isGoogleLinked = Boolean(user.googleId);
    const isLocalProvider = user.provider === AUTH_PROVIDERS.LOCAL;
    const avatar = getUserAvatar(user);

    const handleGoogleLinked = (updatedUser) => {
        if (updatedUser) {
            updateUser({ data: updatedUser });
        } else {
            refreshUser();
        }
        toast.success("Google account connected successfully!");
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const response = await updateProfileName(name);
            if (response?.data) {
                updateUser({ data: response.data });
                toast.success("Profile updated successfully");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update profile";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600 mb-8">Manage your profile, avatar, and connected accounts</p>

            <div className="space-y-6">
                <section
                    ref={editSectionRef}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update your name and profile photo</p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                        <AvatarEditor disabled={saving} />

                        <Input
                            value={name}
                            onChange={({ target }) => setName(target.value)}
                            label="Full Name"
                            placeholder="Your name"
                            type="text"
                            disabled={saving}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                readOnly
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Sign-in Provider
                            </label>
                            <input
                                type="text"
                                value={PROVIDER_LABELS[user.provider] || user.provider}
                                readOnly
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold transition ${
                                saving || !name.trim()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-black hover:bg-gray-800"
                            }`}
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </form>
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                        <div className="flex items-center gap-4">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                {user.isEmailVerified && (
                                    <span className="inline-flex items-center mt-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                        Email verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Authentication</h3>
                            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Primary sign-in method</p>
                                        <p className="text-sm text-gray-500">
                                            {PROVIDER_LABELS[user.provider] || user.provider}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                        {user.provider}
                                    </span>
                                </div>

                                {isGoogleProvider && (
                                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                                        <FcGoogle size={22} />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Connected with Google</p>
                                            <p className="text-xs text-blue-700">
                                                You signed up using your Google account. You can still edit your name and upload a custom photo.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isLocalProvider && isGoogleLinked && (
                                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                                        <FcGoogle size={22} />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Google connected</p>
                                            <p className="text-xs text-blue-700">
                                                You can sign in with Google or your password
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isLocalProvider && !isGoogleLinked && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600">
                                            Connect your Google account for faster, verified sign-in.
                                        </p>
                                        <GoogleSignInButton
                                            label="Connect Google Account"
                                            linkAccount
                                            onLinkSuccess={handleGoogleLinked}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account details</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="rounded-lg bg-gray-50 px-4 py-3">
                                    <dt className="text-gray-500">Role</dt>
                                    <dd className="font-medium text-gray-900 capitalize">{user.role || "user"}</dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 px-4 py-3">
                                    <dt className="text-gray-500">Member since</dt>
                                    <dd className="font-medium text-gray-900">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "—"}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileSettings;
