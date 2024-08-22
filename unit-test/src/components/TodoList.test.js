import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { fireEvent, render, screen } from "@testing-library/react";
import TodoList from "./TodoList";

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
        return res(ctx.status(200), ctx.json(mockData));
    })
);

beforeEach(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

test("renders fetched todos on mount", async () => {
    render(<TodoList />)
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    const todo1 = await screen.findByText('todo 1');
    const todo2 = await screen.findByText('todo 2');
    const todo3 = await screen.findByText('todo 3');
    expect(todo1).toBeInTheDocument();
    expect(todo2).toBeInTheDocument();
    expect(todo3).toBeInTheDocument();
});
test('handles API fetch failure', async() => {
    server.use(
        rest.get("https://jsonplaceholder.typicode.com/todos", (req, res, ctx) => {
            return res(ctx.status(500), ctx.json({ error: "Internal Server Error" }));
        })
    );
    render(<TodoList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText("Error: Failed to fetch todos")).toBeInTheDocument();
    expect(screen.queryByText('todo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('todo 2')).not.toBeInTheDocument();
    expect(screen.queryByText('todo 3')).not.toBeInTheDocument();
})
test('add a new todo item', async() => {
    render(<TodoList />);
    await screen.findByText('Add Todo');

    const input = screen.getByPlaceholderText('Enter todo');
    const addBtn = screen.getByText('Add Todo');

    fireEvent.change(input, { target: { value: 'todo 4' }});
    fireEvent.click(addBtn);

    expect(screen.getByText('todo 4')).toBeInTheDocument();
});

test('removes a todo item', async() => {
    render(<TodoList />);
    const todo1 = await screen.findByText('todo 1');
    expect(todo1).toBeInTheDocument();

    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);
    
    const todo1_refresh = screen.queryByText('todo 1');
    expect(todo1_refresh).not.toBeInTheDocument();
});