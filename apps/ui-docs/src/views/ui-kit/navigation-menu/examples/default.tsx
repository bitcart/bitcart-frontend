import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@bitcart/ui-kit/components"
import { CircleAlertIcon, CircleCheckIcon, CircleDashedIcon } from "lucide-react"

const COMPONENT_LINKS: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "#",

    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },

  {
    title: "Hover Card",
    href: "#",
    description: "For sighted users to preview content available behind a link.",
  },

  {
    title: "Progress",
    href: "#",

    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },

  {
    title: "Scroll-area",
    href: "#",
    description: "Visually or semantically separates content.",
  },

  {
    title: "Tabs",
    href: "#",

    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },

  {
    title: "Tooltip",
    href: "#",

    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

const ListItem = ({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) => {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <a href={href}>
            <div className="gap-1 text-sm flex flex-col">
              <div className="font-medium leading-none">{title}</div>
              <div className="text-muted-foreground line-clamp-2">{children}</div>
            </div>
          </a>
        }
      />
    </li>
  )
}

export const DefaultNavigationMenuExample: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>

          <NavigationMenuContent>
            <ul className="w-96">
              <ListItem href="#" title="Introduction">
                Re-usable components built with Tailwind CSS.
              </ListItem>

              <ListItem href="#" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>

              <ListItem href="#" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="md:flex hidden">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>

          <NavigationMenuContent>
            <ul className="gap-2 md:w-125 md:grid-cols-2 lg:w-150 w-100 grid">
              {COMPONENT_LINKS.map((link) => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>

          <NavigationMenuContent>
            <ul className="w-50 grid">
              {[
                { title: "Backlog", icon: CircleAlertIcon },
                { title: "To Do", icon: CircleDashedIcon },
                { title: "Done", icon: CircleCheckIcon },
              ].map(({ title, icon: Icon }) => (
                <li key={title}>
                  <NavigationMenuLink
                    className="gap-2 flex-row items-center"
                    render={
                      <a href="#">
                        <Icon />
                        {title}
                      </a>
                    }
                  />
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={<a href="#">Docs</a>}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
