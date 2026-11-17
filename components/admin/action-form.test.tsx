import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ActionForm } from "./action-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

describe("ActionForm", () => {
  it("sends the clicked choice and keeps the result on screen when the choices change", async () => {
    const action = vi.fn(async (form: FormData) => ({
      ok: true,
      message: `Done: ${String(form.get("status"))} ${String(form.get("id"))}`,
    }));
    const view = (status: string) => (
      <ActionForm
        action={action}
        choices={
          status === "draft"
            ? [{ name: "status", value: "published", label: "Publish" }]
            : [{ name: "status", value: "archived", label: "Archive" }]
        }
      >
        <input type="hidden" name="id" value="p1" />
      </ActionForm>
    );
    const { rerender } = render(view("draft"));
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Done: published p1");

    // The page refreshes and the product is now published: Publish is gone, the message stays.
    rerender(view("published"));
    expect(screen.queryByRole("button", { name: "Publish" })).toBeNull();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Done: published p1");
  });
});
