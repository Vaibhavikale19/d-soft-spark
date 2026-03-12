import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
// import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Image, 
  FileText, 
  MessageSquare, 
  Info, 
  Users, 
  LogOut,
  Menu,
  X,
  BookOpen
} from "lucide-react";
import GalleryManager from "@/components/admin/GalleryManager";
import BlogManager from "@/components/admin/BlogManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import AboutEditor from "@/components/admin/AboutEditor";
import StudentApprovals from "@/components/admin/StudentApprovals";
import EnrollmentManager from "@/components/admin/EnrollmentManager";
import InquiryManager from "@/components/admin/InquiryManager";

type Section = "dashboard" | "enrollments" | "inquiries" | "gallery" | "blogs" | "testimonials" | "about" | "approvals";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    enrollments: 0,
    blogs: 0,
    testimonials: 0,
    students: 0,
    inquiries: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [enrollments, blogs, testimonials, profiles, inquiries] = await Promise.all([
        supabase.from("enrollments").select("*", { count: 'exact', head: true }),
        supabase.from("blogs").select("*", { count: 'exact', head: true }),
        supabase.from("testimonials").select("*", { count: 'exact', head: true }),
        supabase.from("profiles").select("*", { count: 'exact', head: true }),
        supabase.from("inquiries").select("*", { count: 'exact', head: true })
      ]);

      setStats({
        enrollments: enrollments.count || 0,
        blogs: blogs.count || 0,
        testimonials: testimonials.count || 0,
        students: profiles.count || 0,
        inquiries: inquiries.count || 0
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      // Don't show toast here to avoid annoying the user if a table is missing
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Failed to logout.");
      return;
    }
    toast.success("Logged out.");
    window.location.href = "/";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "enrollments", label: "Enrollments", icon: BookOpen },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "gallery", label: "Gallery Manager", icon: Image },
    { id: "blogs", label: "Blogs & Insights", icon: FileText },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "about", label: "About DSoft Editor", icon: Info },
    { id: "approvals", label: "Student Approvals", icon: Users },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Enrollments", value: stats.enrollments, icon: BookOpen, color: "text-blue-500" },
                { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-cyan-500" },
                { label: "Blogs", value: stats.blogs, icon: FileText, color: "text-purple-500" },
                { label: "Testimonials", value: stats.testimonials, icon: MessageSquare, color: "text-green-500" },
                { label: "Students", value: stats.students, icon: Users, color: "text-orange-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-4 rounded-2xl glow-card glow-border border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl glow-card glow-border border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Admin Actions</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={async () => {
                    const fakeTestimonials = [
                      {
                        student_name: "Rahul Sharma",
                        course: "Python",
                        rating: 5,
                        review_text: "Deepak Sir's teaching is exceptional! He makes complex concepts look so easy.",
                        is_approved: true
                      },
                      {
                        student_name: "Priya Deshmukh",
                        course: "Web Development",
                        rating: 5,
                        review_text: "The hands-on project-based learning really helped me land a job. Highly recommended!",
                        is_approved: true
                      },
                      {
                        student_name: "Amit Patil",
                        course: "C Programming",
                        rating: 4,
                        review_text: "Very helpful and practical. Great for beginners.",
                        is_approved: true
                      },
                      {
                        student_name: "Sneha Joshi",
                        course: "Java",
                        rating: 5,
                        review_text: "One of the best programming institutes in the city. The focus on basics is amazing.",
                        is_approved: true
                      },
                      {
                        student_name: "Rohit Verma",
                        course: "Data Structures",
                        rating: 5,
                        review_text: "Excellent course! The problem-solving sessions were really helpful for my interviews.",
                        is_approved: true
                      }
                    ];

                    const { error } = await supabase.from("testimonials").insert(fakeTestimonials);
                    if (error) {
                      toast.error("Failed to seed testimonials: " + error.message);
                    } else {
                      toast.success("5 Fake testimonials added successfully!");
                      fetchStats();
                    }
                  }}
                  variant="outline"
                  className="border-primary/60 text-primary hover:bg-primary/10"
                >
                  Seed Fake Testimonials
                </Button>
                <Button 
                  onClick={async () => {
                    const fakeBlogs = [
                      {
                        title: "Mastering C++ in 2026",
                        description: "C++ remains one of the most powerful and versatile programming languages. This guide covers why you should learn it and how to get started.",
                        category: "Tech",
                        published: true,
                        cover_image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60"
                      },
                      {
                        title: "Success Story: Rahul's Journey to Web Dev",
                        description: "How one student went from zero coding knowledge to building a full-stack application in just 4 months.",
                        category: "Student Success",
                        published: true,
                        cover_image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60"
                      },
                      {
                        title: "Top Placement Tips for Tech Roles",
                        description: "A comprehensive guide on how to prepare for interviews, build a portfolio, and land your dream job.",
                        category: "Placement",
                        published: true,
                        cover_image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=60"
                      }
                    ];

                    const { error } = await supabase.from("blogs").insert(fakeBlogs);
                    if (error) {
                      toast.error("Failed to seed blogs: " + error.message);
                    } else {
                      toast.success("3 Fake blog posts added successfully!");
                      fetchStats();
                    }
                  }}
                  variant="outline"
                  className="border-primary/60 text-primary hover:bg-primary/10"
                >
                  Seed Fake Blogs
                 </Button>
                 <Button 
                   onClick={async () => {
                     const fakeAbout = {
                       title: "DSoft Institute of Programming",
                       description: "Empowering students with practical programming skills and career guidance in the tech industry. Located in Hinganghat, we offer a wide range of courses from basics to advanced levels.",
                       mission: "To provide quality technical education and mentorship to aspiring developers, making them industry-ready.",
                       vision: "To become a leading technical education hub that fosters innovation and excellence in programming.",
                       image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60"
                     };

                     const { error } = await supabase.from("about_section").upsert([fakeAbout]);
                     if (error) {
                       toast.error("Failed to seed About section: " + error.message);
                     } else {
                       toast.success("About section seeded successfully!");
                       fetchStats();
                     }
                   }}
                   variant="outline"
                   className="border-primary/60 text-primary hover:bg-primary/10"
                 >
                   Seed About Section
                 </Button>
                 <Button 
                   onClick={async () => {
                     const fakeEnrollments = [
                       {
                         name: "Rahul Kumar",
                         email: "rahul@example.com",
                         phone: "9876543210",
                         course: "Web Development",
                         message: "I want to learn React and Node.js.",
                         status: "pending"
                       },
                       {
                         name: "Sneha Sharma",
                         email: "sneha@example.com",
                         phone: "9876543211",
                         course: "Python",
                         message: "Interested in Data Science.",
                         status: "pending"
                       },
                       {
                         name: "Amit Singh",
                         email: "amit@example.com",
                         phone: "9876543212",
                         course: "Java",
                         message: "Preparing for campus placements.",
                         status: "pending"
                       }
                     ];

                     const { error } = await supabase.from("enrollments").insert(fakeEnrollments);
                     if (error) {
                       toast.error("Failed to seed enrollments: " + error.message);
                     } else {
                       toast.success("3 Fake enrollments added successfully!");
                       fetchStats();
                     }
                   }}
                   variant="outline"
                   className="border-primary/60 text-primary hover:bg-primary/10"
                 >
                   Seed Fake Enrollments
                 </Button>
                 <Button 
                   onClick={async () => {
                     const fakeInquiries = [
                       {
                         name: "Vijay Patil",
                         email: "vijay@example.com",
                         phone: "9988776655",
                         message: "What is the fee structure for Java course?",
                         course_interest: "Java",
                         status: "pending"
                       },
                       {
                         name: "Pooja Deshmukh",
                         email: "pooja@example.com",
                         phone: "8877665544",
                         message: "Do you provide weekend batches for Python?",
                         course_interest: "Python",
                         status: "pending"
                       }
                     ];

                     const { error } = await supabase.from("inquiries").insert(fakeInquiries);
                     if (error) {
                       toast.error("Failed to seed inquiries: " + error.message);
                     } else {
                       toast.success("2 Fake inquiries added successfully!");
                       fetchStats();
                     }
                   }}
                   variant="outline"
                   className="border-primary/60 text-primary hover:bg-primary/10"
                 >
                   Seed Fake Inquiries
                 </Button>
               </div>
             </div>

            <div className="bg-card rounded-2xl glow-card glow-border border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Recent actions will be displayed here.</p>
            </div>
          </div>
        );
      case "enrollments": return <EnrollmentManager />;
      case "inquiries": return <InquiryManager />;
      case "gallery": return <GalleryManager />;
      case "blogs": return <BlogManager />;
      case "testimonials": return <TestimonialManager />;
      case "about": return <AboutEditor />;
      case "approvals": return <StudentApprovals />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transform transition-transform lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-xl font-bold tracking-tight">
              DSoft <span className="text-gradient">Admin</span>
            </h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${activeSection === item.id 
                    ? 'bg-gradient-primary text-white' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <Button 
            variant="ghost" 
            className="mt-auto w-full justify-start gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-8 justify-between lg:justify-end">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">Full Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-primary p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-bold text-primary">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight capitalize">
              {activeSection.replace('-', ' ')}
            </h2>
            <p className="text-muted-foreground">
              {menuItems.find(i => i.id === activeSection)?.label}
            </p>
          </div>

          {renderSection()}
        </div>
      </main>
    </div>
  );
}

