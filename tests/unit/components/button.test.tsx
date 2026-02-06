import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>送信</Button>);
    expect(screen.getByText("送信")).toBeInTheDocument();
  });
});
