import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible button that responds to clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Get this</Button>);

    const button = screen.getByRole("button", { name: "Get this" });
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks clicks and announces itself as busy while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("can be reached with the keyboard", async () => {
    render(<Button>Continue</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
  });
});
