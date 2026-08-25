# Mock API Prototype Mode

The frontend can run without a backend by enabling the mock API adapter.

## Toggle

Set this in `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Set it back to `false` or remove it when connecting to the real Django API.

## Demo Logins

Any password works in mock mode.

- Student: `student@mock.local`
- Organisation: `sam@northside.example`
- Coordinator: `coordinator@mock.local`

The selected account type is inferred from the email and stored in localStorage
so page refreshes keep the same prototype role.

## Data

- Mock data lives in `src/mocks/mockData.ts`.
- API handlers live in `src/mocks/setupMockApi.ts`.
- Unhandled GET requests return 404 and log the missing route in the browser
  console; unhandled mutations return a generic success response.
