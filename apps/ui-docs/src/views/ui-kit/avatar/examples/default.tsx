import { getInitials } from "@bitcart/core/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@bitcart/ui-kit/components"

export const DefaultAvatarExample: React.FC = () => (
  <div className="gap-4 flex items-center">
    <Avatar size="sm">
      <AvatarFallback>{getInitials("Ada Lovelace")}</AvatarFallback>
    </Avatar>

    <Avatar>
      <AvatarFallback>{getInitials("MrNaif2018")}</AvatarFallback>
    </Avatar>

    <Avatar size="lg">
      <AvatarImage src="/favicon.ico" alt="Bitcart" />
      <AvatarFallback>{getInitials("Bitcart")}</AvatarFallback>
    </Avatar>
  </div>
)
