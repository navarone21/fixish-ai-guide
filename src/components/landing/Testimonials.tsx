import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "DIY Enthusiast",
      image: "/placeholder.svg",
      quote: "Fix-ISH helped me repair my car's headlight in 20 minutes. The visual detection was spot-on!",
    },
    {
      name: "Mike Chen",
      role: "Small Business Owner",
      image: "/placeholder.svg",
      quote: "As a repair shop owner, Fix-ISH has become an invaluable training tool for my team.",
    },
    {
      name: "Emily Rodriguez",
      role: "Homeowner",
      image: "/placeholder.svg",
      quote: "I fixed my dishwasher myself thanks to Fix-ISH. Saved hundreds on a service call!",
    },
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Loved by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about Fix-ISH.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="animate-fade-in hover:shadow-soft transition-all" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-8">
                <p className="text-lg mb-6 text-foreground italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
