import React, { useContext } from "react";
import { toast } from "react-toastify";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { UserContext } from "../../context/userContext";
import { AUTH_PROVIDERS, PROVIDER_LABELS } from "../../constants/authProviders";
import { FcGoogle } from "react-icons/fc";

const ProfileSettings = () => {
    const { user, refreshUser, updateUser } = useContext(UserContext);

    if (!user) return null;

    const isGoogleProvider = user.provider === AUTH_PROVIDERS.GOOGLE;
    const isGoogleLinked = Boolean(user.googleId);
    const isLocalProvider = user.provider === AUTH_PROVIDERS.LOCAL;

    const handleGoogleLinked = (updatedUser) => {
        if (updatedUser) {
            updateUser({ data: updatedUser });
        } else {
            refreshUser();
        }
        toast.success("Google account connected successfully!");
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600 mb-8">Manage your account and authentication methods</p>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex items-center gap-4">
                        {user.profileImageUrl ? (
                            <img
                                src={user.profileImageUrl}
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
                                            You signed up using your Google account
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
            </div>
        </div>
    );
};

export default ProfileSettings;
