"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, User, Ambulance, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmergencyBooking {
  _id: string
  name: string
  phone: string
  emergency: string
  location: { lat: number; lng: number }
  destination: string
  details: string
  timestamp: string
  assigned: boolean
  driver: any
  distance?: number
}

interface SOSAlert {
  _id: string
  location: { lat: number; lng: number }
  timestamp: string
  type: string
  status: string
  distance?: number
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [driverInfo, setDriverInfo] = useState({
    name: "",
    ambulanceId: "",
  })
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [emergencies, setEmergencies] = useState<EmergencyBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])

  const fetchNearbySOSAlerts = async () => {
    if (!driverLocation) return

    try {
      const response = await fetch(`/api/sos-alerts?lat=${driverLocation.lat}&lng=${driverLocation.lng}`)
      if (response.ok) {
        const data = await response.json()
        setSosAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching SOS alerts:", error)
    }
  }

  useEffect(() => {
    if (isLoggedIn && driverLocation) {
      fetchNearbyEmergencies()
      fetchNearbySOSAlerts()
      // Poll for new emergencies and SOS alerts every 30 seconds
      const interval = setInterval(() => {
        fetchNearbyEmergencies()
        fetchNearbySOSAlerts()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn, driverLocation])

  useEffect(() => {
    // Get driver's current location
    if (navigator.geolocation && isLoggedIn) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Mangalore coordinates
          setDriverLocation({ lat: 12.8714, lng: 74.8431 })
        },
      )
    }
  }, [isLoggedIn])

  const handleLogin = () => {
    if (!driverInfo.name || !driverInfo.ambulanceId) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and ambulance ID",
        variant: "destructive",
      })
      return
    }
    setIsLoggedIn(true)
    toast({
      title: "Login Successful",
      description: `Welcome, ${driverInfo.name}!`,
      variant: "default",
    })
  }

  const fetchNearbyEmergencies = async () => {
    if (!driverLocation) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/emergencies?lat=${driverLocation.lat}&lng=${driverLocation.lng}`)
      if (response.ok) {
        const data = await response.json()
        setEmergencies(data)
      }
    } catch (error) {
      console.error("Error fetching emergencies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/accept-booking/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverName: driverInfo.name,
          ambulanceId: driverInfo.ambulanceId,
          location: driverLocation,
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Accepted!",
          description: "You have successfully accepted this emergency request",
          variant: "default",
        })
        fetchNearbyEmergencies() // Refresh the list
      } else {
        throw new Error("Failed to accept booking")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Ambulance className="h-6 w-6 text-red-500" />
              <span>Driver Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                value={driverInfo.name}
                onChange={(e) => setDriverInfo({ ...driverInfo, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="ambulanceId">Ambulance ID</Label>
              <Input
                id="ambulanceId"
                value={driverInfo.ambulanceId}
                onChange={(e) => setDriverInfo({ ...driverInfo, ambulanceId: e.target.value })}
                placeholder="e.g., AMB001"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ambulance className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">LifeLine - Driver Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{driverInfo.ambulanceId}</Badge>
              <span className="text-sm text-gray-600">Driver: {driverInfo.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Driver Info and Map */}
          <div className="space-y-6">
            {/* Driver Status */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ambulance:</span>
                    <span className="font-medium">{driverInfo.ambulanceId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm">
                      {driverLocation
                        ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`
                        : "Getting location..."}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            <Card>
              <CardHeader>
                <CardTitle>Your Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Ambulance className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Live Ambulance Tracking</p>
                    <Badge variant="secondary" className="mt-2">
                      Your Position
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Emergency Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nearby Emergency Requests</CardTitle>
                  <Button variant="outline" onClick={fetchNearbyEmergencies} disabled={isLoading}>
                    {isLoading ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencies.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No emergency requests in your area</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencies.map((emergency) => (
                      <Card key={emergency._id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{emergency.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{emergency.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatTime(emergency.timestamp)}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Badge variant="destructive">{emergency.emergency}</Badge>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {driverLocation
                                    ? `${calculateDistance(
                                        driverLocation.lat,
                                        driverLocation.lng,
                                        emergency.location.lat,
                                        emergency.location.lng,
                                      ).toFixed(1)} km away`
                                    : "Calculating distance..."}
                                </span>
                              </div>
                              {emergency.destination && (
                                <p className="text-sm text-gray-600">Destination: {emergency.destination}</p>
                              )}
                              {emergency.details && (
                                <p className="text-sm text-gray-600">Details: {emergency.details}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-end">
                              <Button
                                onClick={() => acceptBooking(emergency._id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Accept Request
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Add this new section after the emergency requests card */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Active SOS Alerts</span>
                  </CardTitle>
                  <Button variant="outline" onClick={fetchNearbySOSAlerts} disabled={isLoading}>
                    {isLoading ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sosAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active SOS alerts in your area</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sosAlerts.map((alert) => (
                      <Card key={alert._id} className="border-l-4 border-l-orange-500 bg-orange-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-orange-700">SOS Emergency Alert</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatTime(alert.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {driverLocation
                                    ? `${calculateDistance(
                                        driverLocation.lat,
                                        driverLocation.lng,
                                        alert.location.lat,
                                        alert.location.lng,
                                      ).toFixed(1)} km away`
                                    : "Calculating distance..."}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Badge variant="destructive">{alert.status.toUpperCase()}</Badge>
                              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                Respond to SOS
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
