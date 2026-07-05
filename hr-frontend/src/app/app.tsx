import { RouterProvider } from 'react-router'

import { AppProvider } from '@/app/providers/app-provider'
import { router } from '@/app/router'

export function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}