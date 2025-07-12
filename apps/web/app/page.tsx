import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="mb-4">
            Welcome to your new project
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            Welcome to{" "}
            <span className="text-primary">
              Next.js
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started by editing this page. Built with shadcn/ui and Tailwind CSS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Documentation
              </CardTitle>
              <CardDescription>
                Find in-depth information about Next.js features and API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Components
              </CardTitle>
              <CardDescription>
                Beautiful UI components built with Radix UI and Tailwind CSS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Deploy
              </CardTitle>
              <CardDescription>
                Instantly deploy your Next.js site to a shareable URL with Vercel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Deploy Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Powered by{" "}
            <Badge variant="outline">Next.js 15</Badge>{" "}
            <Badge variant="outline">shadcn/ui</Badge>{" "}
            <Badge variant="outline">Tailwind CSS</Badge>
          </p>
        </div>
      </div>
    </main>
  );
}
