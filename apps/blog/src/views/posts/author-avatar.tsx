import { getInitials } from "@bitcart/core/utils"
import { Avatar, AvatarFallback, AvatarStaticImage } from "@bitcart/ui-kit/components"

import { getResponsiveImage } from "#/common/content/media"
import type { Author } from "#/common/content/taxonomy"

export type AuthorAvatarProps = {
  author: Author
  className?: string
}

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ author, className }) => (
  <Avatar size="sm" className={className}>
    {author.avatarSrc ? (
      <AvatarStaticImage {...getResponsiveImage(author.avatarSrc)} sizes="1.5rem" alt="" />
    ) : (
      <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
    )}
  </Avatar>
)
