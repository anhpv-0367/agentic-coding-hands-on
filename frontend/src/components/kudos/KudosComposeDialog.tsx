"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Dialog from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/ToastProvider";
import { createKudo, KudosServiceError } from "@/lib/services/kudos-service";
import type { Kudo, UserRef } from "@/types/kudos";
import RecipientPicker from "./RecipientPicker";
import KudoTitleInput from "./KudoTitleInput";
import MarkdownEditor from "./MarkdownEditor";
import HashtagPicker from "./HashtagPicker";
import AnonymousCheckbox from "./AnonymousCheckbox";
import ComposeSubmitButton from "./ComposeSubmitButton";
import ComposeCancelButton from "./ComposeCancelButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onKudoCreated?: (kudo: Kudo) => void;
};

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const TITLE_MAX = 80;

type FormErrors = {
  recipient?: string;
  title?: string;
  message?: string;
  hashtags?: string;
  form?: string;
};

export default function KudosComposeDialog({ open, onClose, onKudoCreated }: Props) {
  const t = useTranslations("kudos.compose");
  const { showToast } = useToast();
  const titleId = useId();

  const [recipient, setRecipient] = useState<UserRef | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitInFlight, setSubmitInFlight] = useState(false);

  const canSubmit = useMemo(() => {
    if (!recipient) return false;
    if (title.trim().length === 0 || title.length > TITLE_MAX) return false;
    if (message.trim().length < MESSAGE_MIN || message.length > MESSAGE_MAX) return false;
    if (hashtags.length < 1) return false;
    return true;
  }, [recipient, title, message, hashtags]);

  const resetForm = () => {
    setRecipient(null);
    setTitle("");
    setMessage("");
    setHashtags([]);
    setIsAnonymous(false);
    setErrors({});
  };

  const handleClose = () => {
    if (submitInFlight) return;
    resetForm();
    onClose();
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!recipient) next.recipient = t("recipient_required");
    if (title.trim().length === 0) next.title = t("title_field_required");
    else if (title.length > TITLE_MAX) next.title = t("title_field_max_length");
    const trimmedMsg = message.trim();
    if (trimmedMsg.length === 0) next.message = t("message_required");
    else if (trimmedMsg.length < MESSAGE_MIN) next.message = t("message_min_length");
    else if (message.length > MESSAGE_MAX) next.message = t("message_max_length");
    if (hashtags.length < 1) next.hashtags = t("hashtag_required");
    return next;
  };

  const handleSubmit = async () => {
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0 || !recipient) return;

    setSubmitInFlight(true);
    try {
      const created = await createKudo({
        recipient_id: recipient.id,
        title: title.trim(),
        message,
        hashtags,
        attachment_urls: [],
        is_anonymous: isAnonymous,
      });
      showToast(
        isAnonymous ? t("success_anonymous_toast") : t("success_toast"),
        "success"
      );
      onKudoCreated?.(created);
      resetForm();
      onClose();
    } catch (err) {
      if (err instanceof KudosServiceError && err.code === "self_recipient") {
        setErrors({ recipient: t("recipient_self_not_allowed") });
      } else {
        setErrors({ form: t("error_generic") });
      }
    } finally {
      setSubmitInFlight(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} labelledBy={titleId}>
      <div
        style={{
          width: "min(752px, 92vw)",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "var(--space-compose-modal-padding, 40px)",
          background: "var(--color-bg-kudos-card, #FFF8E1)",
          borderRadius: "var(--radius-compose-modal, 24px)",
          boxShadow: "var(--shadow-compose-modal, 0 12px 48px rgba(0,0,0,0.35))",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-compose-section-gap, 32px)",
          color: "var(--color-text-on-btn, #00101A)",
          fontFamily: "var(--font-montserrat), sans-serif",
        }}
      >
        <h2
          id={titleId}
          style={{
            margin: 0,
            fontSize: "var(--text-kudos-compose-title-size, 32px)",
            fontWeight: 700,
            lineHeight: "var(--text-kudos-compose-title-line-height, 40px)",
            textAlign: "center",
            color: "var(--color-text-on-btn, #00101A)",
          }}
        >
          {t("title")}
        </h2>

        <RecipientPicker
          label={t("recipient_label")}
          placeholder={t("recipient_placeholder")}
          emptyLabel={t("recipient_empty")}
          selectHint={t("recipient_select_hint")}
          errorMessage={errors.recipient}
          value={recipient}
          onChange={(val) => {
            setRecipient(val);
            if (errors.recipient) setErrors((e) => ({ ...e, recipient: undefined }));
          }}
        />

        <KudoTitleInput
          label={t("title_field_label")}
          placeholder={t("title_field_placeholder")}
          hintExample={t("title_field_hint_example")}
          hintDisplay={t("title_field_hint_display")}
          errorMessage={errors.title}
          value={title}
          onChange={(val) => {
            setTitle(val);
            if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
          }}
          maxLength={TITLE_MAX}
        />

        <MarkdownEditor
          placeholder={t("message_placeholder")}
          hint={t("message_hint")}
          minLengthHint={t("message_min_length")}
          errorMessage={errors.message}
          value={message}
          onChange={(val) => {
            setMessage(val);
            if (errors.message) setErrors((e) => ({ ...e, message: undefined }));
          }}
          maxLength={MESSAGE_MAX}
        />

        <HashtagPicker
          label={t("hashtag_label")}
          addLabel={t("hashtag_add")}
          maxHint={t("hashtag_max_hint")}
          placeholder={t("hashtag_placeholder")}
          duplicateMessage={t("hashtag_duplicate")}
          removeAriaFor={(tag) => t("hashtag_remove_aria", { tag })}
          errorMessage={errors.hashtags}
          value={hashtags}
          onChange={(val) => {
            setHashtags(val);
            if (errors.hashtags && val.length > 0)
              setErrors((e) => ({ ...e, hashtags: undefined }));
          }}
        />

        <AnonymousCheckbox
          label={t("anonymous_label")}
          checked={isAnonymous}
          onChange={setIsAnonymous}
        />

        {errors.form && (
          <p
            role="alert"
            data-testid="kudos-compose-form-error"
            style={{
              margin: 0,
              padding: "12px 16px",
              background: "rgba(207, 19, 34, 0.08)",
              border: "1px solid var(--color-required-asterisk, #CF1322)",
              borderRadius: 8,
              color: "var(--color-required-asterisk, #CF1322)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {errors.form}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-compose-footer-gap, 24px)",
            alignItems: "center",
          }}
        >
          <ComposeCancelButton label={t("cancel")} onClick={handleClose} />
          <ComposeSubmitButton
            label={t("submit")}
            loadingLabel={t("submitting")}
            disabled={!canSubmit}
            loading={submitInFlight}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
}
