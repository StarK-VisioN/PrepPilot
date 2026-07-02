export const getUserAvatar = (user) => user?.avatar || user?.profileImageUrl || null;

export const getUserInitials = (user) =>
    user?.name?.charAt(0)?.toUpperCase() || "U";
