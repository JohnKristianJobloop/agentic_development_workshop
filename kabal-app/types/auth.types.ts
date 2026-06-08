export type AnonymousUser = {
  kind: 'anonymous'
}

export type AuthenticatedUser = {
  kind: 'authenticated'
  uid: string
  email: string
  displayName: string
}

export type AuthUser = AnonymousUser | AuthenticatedUser

export type UserProfile = {
  uid: string
  displayName: string
  avatarUrl?: string
  createdAt: number
}
