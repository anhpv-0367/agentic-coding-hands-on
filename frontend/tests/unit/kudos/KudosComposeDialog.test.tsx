import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import viMessages from "@/i18n/messages/vi.json";
import ToastProvider from "@/components/ui/ToastProvider";
import KudosComposeDialog from "@/components/kudos/KudosComposeDialog";
import type { Kudo, UserRef } from "@/types/kudos";
import { KudosServiceError } from "@/lib/services/kudos-service";

jest.mock("@/lib/services/kudos-service", () => {
  const actual = jest.requireActual("@/lib/services/kudos-service");
  return {
    ...actual,
    searchSunners: jest.fn(),
    createKudo: jest.fn(),
  };
});

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, string>) => {
    const path = `${ns}.${key}`.split(".");
    let cur: unknown = viMessages;
    for (const p of path) {
      if (typeof cur !== "object" || cur === null) return `${ns}.${key}`;
      cur = (cur as Record<string, unknown>)[p];
    }
    if (typeof cur !== "string") return `${ns}.${key}`;
    if (!params) return cur;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
      cur
    );
  },
}));

import { searchSunners, createKudo } from "@/lib/services/kudos-service";

const mockSearch = searchSunners as jest.MockedFunction<typeof searchSunners>;
const mockCreate = createKudo as jest.MockedFunction<typeof createKudo>;

const RECIPIENT: UserRef = {
  id: "00000000-0000-0000-0000-000000000001",
  display_name: "Trần Văn B",
  avatar_url: null,
  tier: "rising",
};

const FAKE_KUDO: Kudo = {
  id: "k-new",
  sender: {
    id: "00000000-0000-0000-0000-000000000099",
    display_name: "Me",
    avatar_url: null,
    tier: "new",
  },
  recipient: RECIPIENT,
  title: "Người truyền động lực",
  is_anonymous: false,
  message: "Cảm ơn bạn rất nhiều vì đã hỗ trợ tôi trong sprint vừa qua.",
  hashtags: ["teamwork"],
  created_at: "2026-04-22T10:00:00Z",
  heart_count: 0,
  liked_by_me: false,
  attachment_urls: [],
  share_url: "/kudos/k-new",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function renderDialog(props: Partial<React.ComponentProps<typeof KudosComposeDialog>> = {}) {
  return render(
    <ToastProvider>
      <KudosComposeDialog open onClose={() => {}} {...props} />
    </ToastProvider>
  );
}

describe("<KudosComposeDialog>", () => {
  it("renders the modal with title + Gửi disabled when form empty", () => {
    renderDialog();
    expect(screen.getByText(viMessages.kudos.compose.title)).toBeInTheDocument();
    const submit = screen.getByTestId("kudos-compose-submit");
    expect(submit).toHaveAttribute("aria-disabled", "true");
  });

  it("submits with all required fields and fires onKudoCreated", async () => {
    mockSearch.mockResolvedValue([RECIPIENT]);
    mockCreate.mockResolvedValue(FAKE_KUDO);
    const onClose = jest.fn();
    const onCreated = jest.fn();

    renderDialog({ onClose, onKudoCreated: onCreated });

    // Recipient: type → pick suggestion
    const recipientInput = screen.getByTestId("kudos-compose-recipient");
    await act(async () => {
      fireEvent.change(recipientInput, { target: { value: "Trần" } });
    });
    await act(async () => {
      // Advance past debounce
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    await waitFor(() => expect(mockSearch).toHaveBeenCalled());
    const option = await screen.findByRole("option", { name: /Trần Văn B/ });
    fireEvent.mouseDown(option);

    // Title
    const title = screen.getByTestId("kudos-compose-title");
    fireEvent.change(title, { target: { value: "Người truyền động lực" } });

    // Message ≥ 10 chars
    const msg = screen.getByTestId("kudos-compose-message");
    fireEvent.change(msg, {
      target: { value: "Cảm ơn bạn rất nhiều vì đã hỗ trợ tôi trong sprint vừa qua." },
    });

    // Hashtag: open, type, press Enter
    fireEvent.click(screen.getByTestId("kudos-compose-hashtag-add"));
    const hashInput = await screen.findByTestId("kudos-compose-hashtag-input");
    fireEvent.change(hashInput, { target: { value: "teamwork" } });
    fireEvent.keyDown(hashInput, { key: "Enter" });

    // Submit
    const submit = screen.getByTestId("kudos-compose-submit");
    expect(submit).toHaveAttribute("aria-disabled", "false");
    await act(async () => {
      submit.click();
    });

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: RECIPIENT.id,
          title: "Người truyền động lực",
          hashtags: ["teamwork"],
          is_anonymous: false,
        })
      )
    );
    expect(onCreated).toHaveBeenCalledWith(FAKE_KUDO);
    expect(onClose).toHaveBeenCalled();
  });

  it("surfaces self_recipient error inline on 403 from server", async () => {
    mockSearch.mockResolvedValue([RECIPIENT]);
    mockCreate.mockRejectedValue(
      new KudosServiceError(403, "self_recipient", "self_recipient")
    );
    renderDialog();

    const recipientInput = screen.getByTestId("kudos-compose-recipient");
    fireEvent.change(recipientInput, { target: { value: "Trần" } });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    const option = await screen.findByRole("option", { name: /Trần Văn B/ });
    fireEvent.mouseDown(option);

    fireEvent.change(screen.getByTestId("kudos-compose-title"), {
      target: { value: "Danh hiệu" },
    });
    fireEvent.change(screen.getByTestId("kudos-compose-message"), {
      target: { value: "Đây là nội dung rất dài." },
    });
    fireEvent.click(screen.getByTestId("kudos-compose-hashtag-add"));
    const hashInput = await screen.findByTestId("kudos-compose-hashtag-input");
    fireEvent.change(hashInput, { target: { value: "teamwork" } });
    fireEvent.keyDown(hashInput, { key: "Enter" });

    await act(async () => {
      screen.getByTestId("kudos-compose-submit").click();
    });

    await waitFor(() =>
      expect(
        screen.getByText(viMessages.kudos.compose.recipient_self_not_allowed)
      ).toBeInTheDocument()
    );
  });
});
