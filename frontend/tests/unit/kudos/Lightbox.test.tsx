import { render, screen, fireEvent } from "@testing-library/react";
import Lightbox from "@/components/ui/Lightbox";

const IMAGES = [
  "https://example.com/a.jpg",
  "https://example.com/b.jpg",
  "https://example.com/c.jpg",
];

describe("<Lightbox>", () => {
  it("renders nothing when closed", () => {
    render(<Lightbox images={IMAGES} open={false} onClose={() => {}} />);
    expect(screen.queryByTestId("kudos-lightbox")).toBeNull();
  });

  it("renders the image at initialIndex when open", () => {
    render(<Lightbox images={IMAGES} open={true} initialIndex={1} onClose={() => {}} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", IMAGES[1]);
  });

  it("ArrowRight advances, ArrowLeft rewinds (wraps)", () => {
    render(<Lightbox images={IMAGES} open={true} onClose={() => {}} />);
    const lightbox = screen.getByTestId("kudos-lightbox");

    fireEvent.keyDown(lightbox, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("src", IMAGES[1]);

    fireEvent.keyDown(lightbox, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("src", IMAGES[2]);

    fireEvent.keyDown(lightbox, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute("src", IMAGES[0]);

    fireEvent.keyDown(lightbox, { key: "ArrowLeft" });
    expect(screen.getByRole("img")).toHaveAttribute("src", IMAGES[2]);
  });

  it("calls onClose on ESC", () => {
    const onClose = jest.fn();
    render(<Lightbox images={IMAGES} open={true} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("close button fires onClose", () => {
    const onClose = jest.fn();
    render(<Lightbox images={IMAGES} open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
