'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const token = useAuthStore((state) => state.token)
  const initialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  useEffect(() => {
    // Redirige si l'utilisateur n'est pas admin ou non connecté
    if (initialized && (!token || !user || user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [initialized, token, user, router])

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!initialized || !token) return

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setData(response.data)
      } catch (error) {
        console.error('Erreur dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [token, initialized])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-center text-red-500">Échec du chargement des données</p>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord admin</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Utilisateurs" value={data.total_users} />
        <StatCard title="Nouveaux aujourd’hui" value={data.new_users_today} />
        <StatCard title="Utilisateurs en ligne" value={data.online_users} />
        <StatCard title="Agriculteurs" value={data.total_farmers} />
        <StatCard title="Clients" value={data.total_clients} />
        <StatCard title="Commandes" value={data.total_orders} />
        <StatCard title="En attente" value={data.pending_orders} />
        <StatCard title="Livrées" value={data.delivered_orders} />
        <StatCard title="Revenu total" value={`${data.total_revenue} FCFA`} />
        <StatCard title="Produits à valider" value={data.pending_products} />
        <StatCard title="Contenus à valider" value={data.pending_content} />
        <StatCard title="Signalements non résolus" value={data.unresolved_reports} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <RecentOrders orders={data.recent_orders} />
        <PopularProducts products={data.popular_products} />
      </div>

      <ActiveUsers users={data.active_users} />
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  )
}

function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="border-b pb-1">
            <p className="font-medium">{order.product__name}</p>
            <p className="text-sm text-gray-500">
              Client: {order.client__username} - {order.total_price} FCFA
            </p>
            <p className="text-xs text-gray-400">{order.status} | {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PopularProducts({ products }: { products: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits populaires</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="border-b pb-1">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">{p.price} FCFA — {p.order_count} commandes</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ActiveUsers({ users }: { users: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs actifs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="border-b pb-1">
            <p className="font-medium">{u.username}</p>
            <p className="text-sm text-gray-500">{u.role} — {u.activity_count} activités</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
