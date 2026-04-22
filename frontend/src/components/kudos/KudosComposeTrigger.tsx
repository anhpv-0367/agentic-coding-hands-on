"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import { useUrlState } from "@/hooks/useUrlState";
import type { Kudo } from "@/types/kudos";
import KudosComposeDialog from "./KudosComposeDialog";

type Props = {
  onKudoCreated?: (kudo: Kudo) => void;
};

export default function KudosComposeTrigger({ onKudoCreated }: Props) {
  const tAction = useTranslations("kudos.action_bar");
  const tCompose = useTranslations("kudos.compose");
  const [compose, setCompose] = useUrlState("compose", { mode: "push" });

  const open = compose === "1";
  const onOpen = useCallback(() => setCompose("1"), [setCompose]);
  const onClose = useCallback(() => setCompose(null), [setCompose]);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={tCompose("open_aria")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          maxWidth: 738,
          height: 72,
          padding: "0 16px",
          background: "transparent",
          border: "1px solid var(--color-border-bronze, #998C5F)",
          borderRadius: 8,
          cursor: "pointer",
          textAlign: "left",
          alignSelf: "center",
          transition: "border-color 150ms ease-out",
        }}
      >
        <Icon src="/assets/icons/pen.svg" size={24} alt="" aria-hidden="true" />
        <span
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: 14,
            fontWeight: 500,
            lineHeight: "20px",
            color: "var(--color-text-meta, #999999)",
          }}
        >
          {tAction("placeholder")}
        </span>
      </button>
      <KudosComposeDialog
        open={open}
        onClose={onClose}
        onKudoCreated={onKudoCreated}
      />
    </>
  );
}
