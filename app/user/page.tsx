"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Heart, Volume2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const languages = {
  en: "English",
  kn: "ಕನ್ನಡ (Kannada)",
  tcy: "ತುಳು (Tulu)",
  kok: "कोंकणी (Konkani)",
};

const emergencyTypes = [
  "Heart Attack",
  "Stroke",
  "Accident",
  "Breathing Problems",
  "Severe Bleeding",
  "Unconscious",
  "Poisoning",
  "Burns",
  "Other",
];

const firstAidInstructions = {
  "Heart Attack": {
    en: "Call emergency services immediately. Have the person sit down and rest. Give aspirin if available and not allergic.",
    kn: "ತುರ್ತು ಸೇವೆಗಳಿಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ. ವ್ಯಕ್ತಿಯನ್ನು ಕುಳಿತುಕೊಳ್ಳಿಸಿ ವಿಶ್ರಾಂತಿ ನೀಡಿ.",
    tcy: "ತುರ್ತು ಸೇವೆಗೆ ಕರೆ ಮಲ್ಪುಲೆ. ಆ ವ್ಯಕ್ತಿನ್ ಕೂರ್ಚಿ ವಿಶ್ರಾಂತಿ ಕೊಡುಲೆ.",
    kok: "तुरंत आपातकालीन सेवांक कॉल करा. व्यक्तीक बसोवन विश्राम दिया.",
  },
  Stroke: {
    en: "Call emergency services. Check for FAST signs: Face drooping, Arm weakness, Speech difficulty, Time to call.",
    kn: "ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ. FAST ಚಿಹ್ನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    tcy: "ತುರ್ತು ಸೇವೆಗೆ ಕರೆ ಮಲ್ಪುಲೆ. FAST ಚಿಹ್ನೆಲೆನ್ ಪರಿಶೀಲಿಸುಲೆ.",
    kok: "आपातकालीन सेवांक कॉल करा. FAST चिन्हां तपासा.",
  },
};

export default function UserDashboard() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    emergency: "",
    destination: "",
    details: "",
  });
  const [selectedFirstAid, setSelectedFirstAid] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Mangalore coordinates
          setLocation({ lat: 12.8714, lng: 74.8431 });
        }
      );
    }
  }, []);

  const handleBookAmbulance = async () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.emergency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch("/api/book-ambulance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          location,
          timestamp: new Date().toISOString(),
          assigned: false,
          driver: null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Ambulance Booked!",
          description:
            "Your emergency request has been sent. Help is on the way.",
          variant: "default",
        });
        setBookingForm({
          name: "",
          phone: "",
          emergency: "",
          destination: "",
          details: "",
        });
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or call emergency services directly",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleSOS = async () => {
    try {
      const response = await fetch("/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          timestamp: new Date().toISOString(),
          type: "SOS",
        }),
      });

      if (response.ok) {
        toast({
          title: "SOS Alert Sent!",
          description: "Emergency services have been notified of your location",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "SOS Failed",
        description: "Please try calling emergency services directly",
        variant: "destructive",
      });
    }
  };

  const speakInstructions = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === "en" ? "en-US" : "hi-IN";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                LifeLine - Emergency Help
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Globe className="h-5 w-5 text-gray-500" />
              <Select
                value={currentLanguage}
                onValueChange={setCurrentLanguage}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Map and Location */}
          <div className="space-y-6">
            {/* Current Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Your Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {location
                        ? `Lat: ${location.lat.toFixed(
                            4
                          )}, Lng: ${location.lng.toFixed(4)}`
                        : "Getting location..."}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      Live Location
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Nearby Hospitals</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">KMC Hospital Mangalore</span>
                      <Badge variant="outline">2.3 km</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Manipal Hospital</span>
                      <Badge variant="outline">3.1 km</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">AJ Hospital</span>
                      <Badge variant="outline">4.2 km</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOS Button */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Emergency SOS</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSOS}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-8 text-xl"
                  size="lg"
                >
                  <AlertTriangle className="h-8 w-8 mr-2" />
                  EMERGENCY SOS
                </Button>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Press for immediate emergency alert
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking and First Aid */}
          <div className="space-y-6">
            {/* Ambulance Booking */}
            <Card>
              <CardHeader>
                <CardTitle>Book Ambulance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={bookingForm.name}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={bookingForm.phone}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergency">Emergency Type *</Label>
                  <Select
                    value={bookingForm.emergency}
                    onValueChange={(value) =>
                      setBookingForm({ ...bookingForm, emergency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select emergency type" />
                    </SelectTrigger>
                    <SelectContent>
                      {emergencyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destination">Destination Hospital</Label>
                  <Input
                    id="destination"
                    value={bookingForm.destination}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        destination: e.target.value,
                      })
                    }
                    placeholder="Preferred hospital (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    value={bookingForm.details}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        details: e.target.value,
                      })
                    }
                    placeholder="Any additional information"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBookAmbulance}
                  disabled={isBooking}
                  className="w-full"
                  size="lg"
                >
                  {isBooking ? "Booking..." : "Book Ambulance"}
                </Button>
              </CardContent>
            </Card>

            {/* First Aid Assistant */}
            <Card>
              <CardHeader>
                <CardTitle>First Aid Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="firstaid">Select Emergency Type</Label>
                  <Select
                    value={selectedFirstAid}
                    onValueChange={setSelectedFirstAid}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose emergency for first aid" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(firstAidInstructions).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFirstAid &&
                  firstAidInstructions[
                    selectedFirstAid as keyof typeof firstAidInstructions
                  ] && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-800">
                          First Aid Instructions
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            speakInstructions(
                              firstAidInstructions[
                                selectedFirstAid as keyof typeof firstAidInstructions
                              ][
                                currentLanguage as keyof typeof firstAidInstructions.HeartAttack
                              ]
                            )
                          }
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-blue-700">
                        {
                          firstAidInstructions[
                            selectedFirstAid as keyof typeof firstAidInstructions
                          ][
                            currentLanguage as keyof typeof firstAidInstructions.HeartAttack
                          ]
                        }
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
