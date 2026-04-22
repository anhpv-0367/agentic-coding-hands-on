import Icon from "@/components/ui/Icon";
import type { UserRef } from "@/types/kudos";

type Props = {
  sender: UserRef;
  recipient: UserRef;
  avatarSize?: number;
};

function Avatar({ user, size }: { user: UserRef; size: number }) {
  const label = user.display_name;
  return user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={label}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #ffffff",
        flexShrink: 0,
      }}
    />
  ) : (
    <span
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255, 234, 158, 0.2)",
        color: "#FFEA9E",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: size / 2.4,
        fontWeight: 700,
        border: "1px solid #ffffff",
        flexShrink: 0,
      }}
    >
      {label.charAt(0)}
    </span>
  );
}

export default function KudoAvatarPair({ sender, recipient, avatarSize = 48 }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Avatar user={sender} size={avatarSize} />
      <Icon
        src="/assets/kudos/send.svg"
        size={16}
        alt=""
        aria-hidden="true"
        style={{ opacity: 0.8 }}
      />
      <Avatar user={recipient} size={avatarSize} />
    </div>
  );
}
