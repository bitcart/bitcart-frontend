//* Originally ported from: https://ui.shadcn.com

import { t } from "@lingui/core/macro"
import { type VariantProps } from "class-variance-authority"
import { useMemo } from "react"

import { cn } from "@/utils"

import { fieldVariants } from "./field-variants"
import { Label } from "./label"
import { Separator } from "./separator"

export type FieldSetProps = React.ComponentProps<"fieldset"> & {}

export const FieldSet: React.FC<FieldSetProps> = ({ className, ...props }) => {
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

export type FieldLegendProps = React.ComponentProps<"legend"> & {
  variant?: "legend" | "label"
}

export const FieldLegend: React.FC<FieldLegendProps> = ({
  className,
  variant = "legend",
  ...props
}) => {
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

export type FieldGroupProps = React.ComponentProps<"div"> & {}

export const FieldGroup: React.FC<FieldGroupProps> = ({ className, ...props }) => {
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

export type FieldProps = React.ComponentProps<"div"> & VariantProps<typeof fieldVariants> & {}

export const Field: React.FC<FieldProps> = ({ className, orientation = "vertical", ...props }) => {
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

export type FieldContentProps = React.ComponentProps<"div"> & {}

export const FieldContent: React.FC<FieldContentProps> = ({ className, ...props }) => {
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

export const FieldLabel: React.FC<FieldLabelProps> = ({
  hasRedAsterisk,
  className,
  children,
  ...props
}) => {
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
    >
      {children}
      {hasRedAsterisk && <span className="sr-only">{` ${t`(required)`}`}</span>}
    </Label>
  )
}

export type FieldTitleProps = React.ComponentProps<"div"> & {}

export const FieldTitle: React.FC<FieldTitleProps> = ({ className, ...props }) => {
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

export type FieldDescriptionProps = React.ComponentProps<"p"> & {}

export const FieldDescription: React.FC<FieldDescriptionProps> = ({ className, ...props }) => {
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

export type FieldSeparatorProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode
}

export const FieldSeparator: React.FC<FieldSeparatorProps> = ({
  children,
  className,
  ...props
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

export type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: ({ message?: string } | undefined)[]
}

export const FieldError: React.FC<FieldErrorProps> = ({
  className,
  children,
  errors,
  ...props
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
      data-slot="field-error"
      className={cn("text-destructive-foreground text-sm font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}
