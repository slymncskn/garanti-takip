import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { I18nProvider } from '@/i18n'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { UploadProvider } from '@/hooks/useUploads'
import { AppShell } from '@/components/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ReviewPage } from '@/features/review/ReviewPage'
import { SearchPage } from '@/features/search/SearchPage'
import { ProductDetailPage } from '@/features/product/ProductDetailPage'
import { ProductFormPage } from '@/features/product/ProductFormPage'
import { Spinner } from '@/components/ui/Spinner'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Dil en dışta: alt katmanlardaki her metin ve biçimlendirici buna bağlı. */}
      <I18nProvider>
        <AuthProvider>
        <UploadProvider>
          {/* GitHub Pages alt dizinde servis ediyor; basename olmadan
              yollar /garanti-takip/ önekini kaybeder. */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/giris" element={<GuestOnly />}>
                <Route index element={<LoginPage />} />
              </Route>
              <Route path="/sifre-sifirla" element={<ResetPasswordPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="ara" element={<SearchPage />} />
                  <Route path="yeni" element={<ProductFormPage />} />
                  <Route path="onay/:receiptId" element={<ReviewPage />} />
                  <Route path="urun/:id" element={<ProductDetailPage />} />
                  <Route
                    path="urun/:id/duzenle"
                    element={<ProductFormPage />}
                  />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </UploadProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}

function RequireAuth() {
  const { session, loading, recovery } = useAuth()

  if (loading) return <Splash />
  if (!session) return <Navigate to="/giris" replace />
  // Şifre sıfırlama oturumuyla girildiyse önce yeni şifre belirlensin.
  if (recovery) return <Navigate to="/sifre-sifirla" replace />

  return <Outlet />
}

function GuestOnly() {
  const { session, loading, recovery } = useAuth()

  if (loading) return <Splash />
  if (session && !recovery) return <Navigate to="/" replace />

  return <Outlet />
}

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper">
      <Spinner className="size-6 text-ink-faint" />
    </div>
  )
}
