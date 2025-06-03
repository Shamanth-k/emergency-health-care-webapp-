"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ambulance, Users, Shield, Heart, Building2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">LifeLine</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/user">
                <Button variant="outline">Emergency Help</Button>
              </Link>
              <Link href="/admin">
                <Button>Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Smart Emergency Healthcare Platform</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get immediate emergency medical assistance with real-time ambulance tracking, first aid guidance, and
          multilingual support.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Existing User card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>For Patients</CardTitle>
              <CardDescription>Book ambulances, get first aid guidance, and trigger SOS alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/user">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">Get Emergency Help</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Existing Admin card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Ambulance className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>For Ambulance Drivers</CardTitle>
              <CardDescription>View nearby emergencies and accept booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-red-500 hover:bg-red-600">Driver Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          {/* New Hospital card */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>For Hospitals</CardTitle>
              <CardDescription>Monitor SOS alerts and send blood requests to donors</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/hospital">
                <Button className="w-full bg-green-500 hover:bg-green-600">Hospital Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Real-time Tracking</h4>
              <p className="text-gray-600">Live location tracking and ambulance dispatch</p>
            </div>
            <div className="text-center">
              <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">First Aid Guidance</h4>
              <p className="text-gray-600">Step-by-step emergency medical instructions</p>
            </div>
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Multilingual Support</h4>
              <p className="text-gray-600">Available in English, Kannada, Tulu, and Konkani</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
