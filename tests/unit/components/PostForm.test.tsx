import { render, screen } from "@testing-library/react";
import PostForm from "@/components/component/PostForm";

jest.mock("@/lib/action", () => ({
  addPostAction: jest.fn(),
}));

jest.mock("react-dom", () => {
  const actual = jest.requireActual("react-dom");
  return {
    ...actual,
    useFormState: jest.fn(),
    useFormStatus: jest.fn(),
  };
});

const mockedUseFormState = jest.requireMock("react-dom").useFormState as jest.Mock;
const mockedUseFormStatus = jest.requireMock("react-dom").useFormStatus as jest.Mock;

describe("PostForm", () => {
  beforeEach(() => {
    mockedUseFormStatus.mockReturnValue({ pending: false });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  it("renders input and submit button", () => {
    mockedUseFormState.mockReturnValue([{ error: undefined, success: false }, jest.fn()]);

    render(<PostForm />);

    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows validation error text when state has error", () => {
    mockedUseFormState.mockReturnValue([{ error: "入力してください", success: false }, jest.fn()]);

    render(<PostForm />);

    expect(screen.getByText("入力してください")).toBeInTheDocument();
  });
});
