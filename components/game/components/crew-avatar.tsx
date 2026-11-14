import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCrew, type CrewId } from "../model";

export function CrewAvatar({ id, size = 42 }: { id: CrewId; size?: number }) {
  const member = getCrew(id);
  return (
    <Avatar
      className="portrait"
      style={{
        width: size,
        height: size,
        borderColor: `${member.color}75`,
        backgroundColor: `${member.color}55`,
      }}
    >
      <AvatarImage
        src={`/assets/avatars/${member.id}-avatar.svg`}
        alt=""
        className="portrait-image"
      />
      <AvatarFallback style={{ backgroundColor: member.color, color: "#111720" }}>
        {member.shortName[0]}
      </AvatarFallback>
    </Avatar>
  );
}
