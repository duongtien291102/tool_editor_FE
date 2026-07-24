import React from 'react';
import { useAuth } from '../AuthProvider';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { session } = useAuth();
  const userPermissions: string[] = session?.user?.permissions ?? [];

  const hasPermission =
    userPermissions.includes('*') ||
    userPermissions.includes('*:*') ||
    userPermissions.includes(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  allowedRoles: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  fallback = null,
  children,
}) => {
  const { session } = useAuth();
  const userRoles: string[] = session?.user?.roles ?? ['User'];

  const isAllowed =
    userRoles.includes('SuperAdmin') || userRoles.some((role) => allowedRoles.includes(role));

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
