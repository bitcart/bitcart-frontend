import { formatCalendarDate } from "@bitcart/core/utils"
import { useLingui } from "@lingui/react/macro"

import type { PostSummary } from "#/common/content/posts"

export type PostMetaProps = {
  post: PostSummary
}

export const PostMeta: React.FC<PostMetaProps> = ({ post }) => {
  const { t, i18n } = useLingui()

  return (
    <>
      <time dateTime={post.date}>{formatCalendarDate(new Date(post.date), i18n.locale)}</time>
      <span aria-hidden>·</span>
      <span>{t`${post.readingMinutes} min read`}</span>
    </>
  )
}
