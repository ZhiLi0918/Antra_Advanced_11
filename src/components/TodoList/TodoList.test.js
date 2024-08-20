import TodoList from "./TodoList";
import { setupServer } from "msw/node";
import { rest } from "msw";
import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/react";

const mockData = [
    {
        "userId": 1,
        "id": 1,
        "title": "todo 1",
        "completed": false
    },
    {
        "userId": 1,
        "id": 2,
        "title": "todo 2",
        "completed": false
    },
    {
        "userId": 1,
        "id": 3,
        "title": "todo 3",
        "completed": true
    },
];

const server = setupServer(
    rest.get("https://jsonplaceholder.typicode.com/todos", (req, res, ctx) => {
        return res(ctx.json(mockData));
    })
);

// TODO: Mock the fetch API, and do reset and clean up
beforeEach(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

// TODO: Test component to render correctly with the fetched data
test("renders fetched todos on mount", async () => {
    render(<TodoList />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    const todo1 = await screen.findByText('todo 1');
    const todo2 = await screen.findByText('todo 2');
    const todo3 = await screen.findByText('todo 3');
    expect(todo1).toBeInTheDocument();
    expect(todo2).toBeInTheDocument();
    expect(todo3).toBeInTheDocument();
});

// TODO: Test component to handle API fetch failure and display error message
test("handles API fetch failure", async () => {
    server.use(
        rest.get("https://jsonplaceholder.typicode.com/todos", (req, res, ctx) => {
            return res(ctx.status(500));
        })
    )
    render(<TodoList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const errMsg = await screen.findByText('Failed to load todos');
    expect(errMsg).toBeInTheDocument()
});

// TODO: Test adding a new todo
test("adds a new todo item", async () => {
    render(<TodoList />);
    fireEvent.change(screen.getByPlaceHolderText("Enter todo"), { target: { value: 'todo 4' }});
    fireEvent.click(screen.getByText('Add Todo'));
    const todo4 = await screen.findByText('todo 4');
    expect(todo4).toBeInTheDocument();
});

// TODO: Test removing a todo
test("removes a todo item", async () => {
    render(<TodoList />);
    const todo1 = await screen.findByText("todo 1");
    expect(todo1).toBeInTheDocument();
    fireEvent.click(screen.getByText("Remove"));
    expect(todo1).not.toBeInTheDocument();
});
