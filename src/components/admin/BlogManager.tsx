import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  category: string;
  published: boolean;
  created_at: string;
}

const CATEGORIES = ["Tech", "Placement", "Student Success", "Event", "News"];

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    category: "Tech",
    published: true,
    file: null as File | null,
    cover_image: ""
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch blog posts");
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let cover_image = formData.cover_image;

      if (formData.file) {
        let file = formData.file;
        
        // Compress if large
        if (file.size > 500 * 1024) { // > 500KB
          toast.info("Compressing image for faster upload...");
          file = await compressImage(file);
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blogs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
        
        cover_image = publicUrl;
      }

      const blogData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        published: formData.published,
        cover_image
      };

      if (formData.id) {
        const { error } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Blog post updated");
      } else {
        const { error } = await supabase
          .from("blogs")
          .insert([blogData]);
        if (error) throw error;
        toast.success("Blog post created");
      }

      setIsOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, cover_image: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const path = cover_image.split("/").pop();
      if (path) {
        await supabase.storage.from("images").remove([`blogs/${path}`]);
      }

      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;

      toast.success("Blog post deleted");
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ published: !published })
        .eq("id", id);
      if (error) throw error;
      toast.success(published ? "Post unpublished" : "Post published");
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const openEditDialog = (blog: BlogPost) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      category: blog.category,
      published: blog.published,
      file: null,
      cover_image: blog.cover_image
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      category: "Tech",
      published: true,
      file: null,
      cover_image: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blogs & Insights Manager</h2>
        <Dialog open={isOpen} onOpenChange={(val) => {
          setIsOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Post Title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <Input type="file" onChange={handleFileChange} accept="image/*" required={!formData.id} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Post Content"
                  className="min-h-[200px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Saving..." : (formData.id ? "Update Post" : "Create Post")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          No blog posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="flex gap-4 p-4 bg-card rounded-xl glow-border border border-border group">
              <img src={blog.cover_image} alt={blog.title} className="w-24 h-24 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {blog.category}
                  </span>
                  {!blog.published && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full uppercase tracking-wider">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-semibold truncate">{blog.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{blog.description}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => togglePublish(blog.id, blog.published)}>
                  {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(blog)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(blog.id, blog.cover_image)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
