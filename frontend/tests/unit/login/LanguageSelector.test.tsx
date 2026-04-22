import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelector from "@/components/layout/LanguageSelector";

jest.mock("next-intl", () => ({
  useLocale: jest.fn(() => "vi"),
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      language_selector: "Select language",
    };
    return map[key] ?? key;
  },
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => "/login",
}));

describe("LanguageSelector", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it("renders VN flag and VN label by default", () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /select language/i });
    expect(button).toHaveTextContent("VN");
    // Flag icon is decorative (aria-hidden), identified by src
    const flagImg = button.querySelector('img[src*="flag-vn"]');
    expect(flagImg).toBeInTheDocument();
  });

  it("dropdown is closed by default (aria-expanded=false)", () => {
    render(<LanguageSelector />);
    expect(
      screen.getByRole("button", { name: /select language/i })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("opens dropdown when trigger is clicked", () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole("button", { name: /select language/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows both VN and EN options when dropdown is open", () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
  });

  it("closes dropdown when Escape key is pressed", () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole("button", { name: /select language/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("calls router.refresh() when an option is selected", () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    const options = screen.getAllByRole("option");
    const enOption = options.find((o) => o.textContent?.includes("EN"));
    expect(enOption).toBeTruthy();
    fireEvent.click(enOption!);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("closes dropdown after selecting an option", () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole("button", { name: /select language/i });
    fireEvent.click(trigger);
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
