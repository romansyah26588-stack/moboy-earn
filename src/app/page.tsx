"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, PieChart, Wallet, Settings, LogOut } from "lucide-react";

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = () => {
    // Di sini nanti akan ada logika koneksi wallet yang sesungguhnya
    setIsConnected(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-slate-900 p-6 flex flex-col items-center border-r border-slate-800">
        <img src="/moboy-character.png" alt="Moboy Character" className="w-32 h-32 mb-8" />
        <nav className="flex flex-col space-y-6 w-full">
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Home className="mr-3 h-5 w-5" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <PieChart className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Wallet className="mr-3 h-5 w-5" />
            Wallet
          </Button>
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </nav>
        <div className="mt-auto w-full">
          <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800 w-full">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Share your social media content and earn rewards based on views
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <div className="text-center">
                  <Button onClick={handleConnectWallet} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Connect Phantom
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="content-url" className="block text-sm font-medium text-slate-300 mb-2">
                      Content URL
                    </label>
                    <Input
                      id="content-url"
                      type="url"
                      placeholder="https://twitter.com/your-post"
                      defaultValue="https://twitter.com/your-f"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Submit Content
                  </Button>
                </div>
              )}

              {!isConnected && (
                <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg text-center">
                  <p className="text-yellow-400">Connect Wallet First</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
