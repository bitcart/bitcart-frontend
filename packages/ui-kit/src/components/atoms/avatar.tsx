//* Originally ported from: https://ui.shadcn.com

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/utils"

export type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg"
}

export const Avatar: React.FC<AvatarProps> = ({ className, size = "default", ...props }) => {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        `
          group/avatar size-8
          after:inset-0 after:border-border data-[size=lg]:size-10
          data-[size=sm]:size-6
          relative
          flex
          shrink-0 rounded-full select-none after:absolute after:rounded-full
          after:border after:mix-blend-darken dark:after:mix-blend-lighten
        `,

        className,
      )}
      {...props}
    />
  )
}

export type AvatarImageProps = AvatarPrimitive.Image.Props & {}

export const AvatarImage: React.FC<AvatarImageProps> = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  )
}

export type AvatarStaticImageProps = React.ComponentProps<"img"> & {}

//* Unlike `AvatarImage`, part of the server HTML instead of rendered once loaded: no fallback.
export const AvatarStaticImage: React.FC<AvatarStaticImageProps> = ({
  className,
  alt,
  ...props
}) => {
  return (
    <img
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  )
}

export type AvatarFallbackProps = AvatarPrimitive.Fallback.Props & {}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        `
          bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs
          flex
          size-full items-center justify-center rounded-full
        `,

        className,
      )}
      {...props}
    />
  )
}
