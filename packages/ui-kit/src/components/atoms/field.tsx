//* Ported from: https://ui.shadcn.com

import { type VariantProps } from "class-variance-authority"
import { useMemo } from "react"

import { cn } from "@/utils"

import { fieldVariants } from "./field-variants"
import { Label } from "./label"
import { Separator } from "./separator"

export const FieldSet = ({ className, ...props }: React.ComponentProps<"fieldset">) => {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "gap-6 flex flex-col",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  )
}

export const FieldLegend = ({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) => {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export const FieldGroup = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-group"
      className={cn(
        `
          group/field-group gap-7
          data-[slot=checkbox-group]:gap-3
          [&>[data-slot=field-group]]:gap-4
          @container/field-group flex w-full flex-col
        `,

        className,
      )}
      {...props}
    />
  )
}

export const Field = ({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) => {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

export const FieldContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content gap-1.5 leading-snug flex flex-1 flex-col", className)}
      {...props}
    />
  )
}

export type FieldLabelProps = React.ComponentProps<typeof Label> & {
  hasRedAsterisk?: boolean
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ hasRedAsterisk, className, ...props }) => {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        `
          group/field-label peer/field-label gap-2 leading-snug flex w-fit
          group-data-[disabled=true]/field:opacity-50
        `,

        `
          has-[>[data-slot=field]]:rounded-md
          [&>*]:data-[slot=field]:p-4
          has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col
          has-[>[data-slot=field]]:border
        `,

        `
          has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary
          dark:has-data-[state=checked]:bg-primary/10
        `,

        {
          [`
            after:text-destructive-foreground after:font-medium after:top--0.5 after:left--1.5
            after:relative after:leading-none after:content-['*']
          `]: hasRedAsterisk,
        },

        className,
      )}
      {...props}
    />
  )
}

export const FieldTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="field-label"
      className={cn(
        `
          gap-2 text-sm leading-snug font-medium flex w-fit items-center
          group-data-[disabled=true]/field:opacity-50
        `,

        className,
      )}
      {...props}
    />
  )
}

export const FieldDescription = ({ className, ...props }: React.ComponentProps<"p">) => {
  return (
    <p
      data-slot="field-description"
      className={cn(
        `
          text-muted-foreground text-sm leading-normal font-normal
          group-has-data-[orientation=horizontal]/field:text-balance
        `,

        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  )
}

export const FieldSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) => {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "-my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2 relative",
        className,
      )}
      {...props}
    >
      <Separator className="inset-0 absolute top-1/2" />

      {children && (
        <span
          className="bg-background text-muted-foreground px-2 relative mx-auto block w-fit"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

export const FieldError = ({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: ({ message?: string } | undefined)[]
}) => {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 gap-1 flex list-disc flex-col">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive-foreground text-sm font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}
