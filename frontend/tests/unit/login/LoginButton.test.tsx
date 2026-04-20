import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginButton from "@/components/auth/LoginButton";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      button_label: "LOGIN With Google",
      "errors.auth_failed": "Authentication failed. Please try again.",
      "errors.service_unavailable":
        "Authentication service is temporarily unavailable. Please try again later.",
      "aria.login_button": "Login with Google",
    };
    return map[key] ?? key;
  },
}));

const mockSignInWithOAuth = jest.fn().mockResolvedValue({ error: null });
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("LoginButton", () => {
  it("renders button with correct aria-label", () => {
    render(<LoginButton error={null} />);
    expect(
      screen.getByRole("button", { name: /login with google/i })
    ).toBeInTheDocument();
  });

  it("renders Google icon inside button", () => {
    render(<LoginButton error={null} />);
    expect(screen.getByAltText("Google")).toBeInTheDocument();
  });

  it("button is enabled by default", () => {
    render(<LoginButton error={null} />);
    expect(
      screen.getByRole("button", { name: /login with google/i })
    ).not.toBeDisabled();
  });

  it("calls signInWithOAuth on click", async () => {
    render(<LoginButton error={null} />);
    fireEvent.click(screen.getByRole("button", { name: /login with google/i }));
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });
  });

  it("disables button while loading after click", async () => {
    render(<LoginButton error={null} />);
    const button = screen.getByRole("button", { name: /login with google/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it("does not show error when error prop is null", () => {
    render(<LoginButton error={null} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error message with role=alert when error prop is auth_failed", () => {
    render(<LoginButton error="auth_failed" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/authentication failed/i);
  });
});
