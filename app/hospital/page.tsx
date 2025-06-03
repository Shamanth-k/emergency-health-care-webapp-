"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building2, AlertTriangle, Droplets, Phone, MapPin, Clock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SOSAlert {
  _id: string
  location: { lat: number; lng: number }
  timestamp: string
  type: string
  status: string
  distance?: number
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function HospitalDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "",
    address: "",
    contactNumber: "",
  })
  const [hospitalLocation, setHospitalLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [bloodRequest, setBloodRequest] = useState({
    bloodGroup: "",
    unitsRequired: "",
    urgency: "normal",
    additionalNotes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingBloodRequest, setIsSendingBloodRequest] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isLoggedIn && hospitalLocation) {
      fetchNearbySOSAlerts()
      // Poll for new SOS alerts every 15 seconds
      const interval = setInterval(fetchNearbySOSAlerts, 15000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn, hospitalLocation])

  useEffect(() => {
    // Get hospital's current location
    if (navigator.geolocation && isLoggedIn) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setHospitalLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Mangalore coordinates
          setHospitalLocation({ lat: 12.8714, lng: 74.8431 })
        },
      )
    }
  }, [isLoggedIn])

  const handleLogin = () => {
    if (!hospitalInfo.name || !hospitalInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please enter hospital name and address",
        variant: "destructive",
      })
      return
    }
    setIsLoggedIn(true)
    toast({
      title: "Login Successful",
      description: `Welcome, ${hospitalInfo.name}!`,
      variant: "default",
    })
  }

  const fetchNearbySOSAlerts = async () => {
    if (!hospitalLocation) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sos-alerts?lat=${hospitalLocation.lat}&lng=${hospitalLocation.lng}`)
      if (response.ok) {
        const data = await response.json()
        setSosAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching SOS alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBloodRequest = async () => {
    if (!bloodRequest.bloodGroup || !bloodRequest.unitsRequired) {
      toast({
        title: "Missing Information",
        description: "Please fill in blood group and units required",
        variant: "destructive",
      })
      return
    }

    setIsSendingBloodRequest(true)
    try {
      const response = await fetch("/api/blood-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bloodRequest,
          hospitalName: hospitalInfo.name,
          hospitalAddress: hospitalInfo.address,
          contactNumber: hospitalInfo.contactNumber,
          location: hospitalLocation,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Blood Request Sent!",
          description: "Email notifications have been sent to all registered blood banks and donors",
          variant: "default",
        })
        setBloodRequest({ bloodGroup: "", unitsRequired: "", urgency: "normal", additionalNotes: "" })
      } else {
        throw new Error("Blood request failed")
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Please try again or contact blood banks directly",
        variant: "destructive",
      })
    } finally {
      setIsSendingBloodRequest(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-500" />
              <span>Hospital Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                value={hospitalInfo.name}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <Label htmlFor="hospitalAddress">Hospital Address</Label>
              <Textarea
                id="hospitalAddress"
                value={hospitalInfo.address}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
                placeholder="Enter complete hospital address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={hospitalInfo.contactNumber}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, contactNumber: e.target.value })}
                placeholder="Hospital contact number"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login to Hospital Dashboard
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
              <Building2 className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">LifeLine - Hospital Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{hospitalInfo.name}</Badge>
              <span className="text-sm text-gray-600">Emergency Center</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - SOS Alerts */}
          <div className="space-y-6">
            {/* Hospital Status */}
            <Card>
              <CardHeader>
                <CardTitle>Hospital Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hospital:</span>
                    <span className="font-medium">{hospitalInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contact:</span>
                    <span className="text-sm">{hospitalInfo.contactNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOS Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Nearby SOS Alerts</span>
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
                      <Card key={alert._id} className="border-l-4 border-l-red-500 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="font-medium text-red-700">Emergency SOS Alert</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{formatTime(alert.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {hospitalLocation
                                    ? `${calculateDistance(
                                        hospitalLocation.lat,
                                        hospitalLocation.lng,
                                        alert.location.lat,
                                        alert.location.lng,
                                      ).toFixed(1)} km away`
                                    : "Calculating distance..."}
                                </span>
                              </div>
                            </div>
                            <Badge variant="destructive">{alert.status.toUpperCase()}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Blood Request */}
          <div className="space-y-6">
            {/* Blood Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-red-500" />
                  <span>Blood Request</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                    <Select
                      value={bloodRequest.bloodGroup}
                      onValueChange={(value) => setBloodRequest({ ...bloodRequest, bloodGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unitsRequired">Units Required *</Label>
                    <Input
                      id="unitsRequired"
                      type="number"
                      value={bloodRequest.unitsRequired}
                      onChange={(e) => setBloodRequest({ ...bloodRequest, unitsRequired: e.target.value })}
                      placeholder="Number of units"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={bloodRequest.urgency}
                    onValueChange={(value) => setBloodRequest({ ...bloodRequest, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hospitalAddressDisplay">Hospital Address</Label>
                  <Textarea
                    id="hospitalAddressDisplay"
                    value={hospitalInfo.address}
                    readOnly
                    className="bg-gray-50"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={bloodRequest.additionalNotes}
                    onChange={(e) => setBloodRequest({ ...bloodRequest, additionalNotes: e.target.value })}
                    placeholder="Any additional information about the blood requirement"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBloodRequest}
                  disabled={isSendingBloodRequest}
                  className="w-full bg-red-500 hover:bg-red-600"
                  size="lg"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingBloodRequest ? "Sending Request..." : "Send Blood Request"}
                </Button>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Email Notification</h4>
                  <p className="text-sm text-blue-700">
                    This request will be sent to all registered blood banks, hospitals, and voluntary donors in the
                    database via email with complete details including blood group, required units, and hospital contact
                    information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Emergency Services
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Hospital Network
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Droplets className="h-4 w-4 mr-2" />
                  Blood Bank Directory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
