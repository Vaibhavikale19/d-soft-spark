import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Upload, Plus, X, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  created_at: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    file: null as File | null,
    url: ""
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch gallery images");
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      let file = formData.file;
      
      // Compress if large
      if (file.size > 500 * 1024) { // > 500KB
        toast.info("Compressing image for faster upload...");
        file = await compressImage(file);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("gallery")
        .insert([{
          url: publicUrl,
          title: formData.title,
          description: formData.description
        }]);

      if (insertError) throw insertError;

      toast.success("Image added to gallery");
      setIsAddOpen(false);
      setFormData({ id: "", title: "", description: "", file: null, url: "" });
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || "Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let url = formData.url;

      if (formData.file) {
        const file = formData.file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
        
        url = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("gallery")
        .update({
          url,
          title: formData.title,
          description: formData.description
        })
        .eq("id", formData.id);

      if (updateError) throw updateError;

      toast.success("Image updated");
      setIsEditOpen(false);
      setFormData({ id: "", title: "", description: "", file: null, url: "" });
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || "Failed to update image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // Extract file path from URL
      const path = url.split("/").pop();
      if (path) {
        await supabase.storage.from("images").remove([`gallery/${path}`]);
      }

      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;

      toast.success("Image deleted");
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image");
    }
  };

  const openEditDialog = (image: GalleryImage) => {
    setFormData({
      id: image.id,
      title: image.title,
      description: image.description,
      file: null,
      url: image.url
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gallery Manager</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Image Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Image Description"
                />
              </div>
              <div className="space-y-2">
                <Label>Image File</Label>
                <Input type="file" onChange={handleFileChange} accept="image/*" required />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          No images in gallery.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="group relative bg-card rounded-xl overflow-hidden glow-border border border-border">
              <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold truncate">{image.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" onClick={() => openEditDialog(image)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(image.id, image.url)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Image Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Image Description"
              />
            </div>
            <div className="space-y-2">
              <Label>Replace Image (Optional)</Label>
              <Input type="file" onChange={handleFileChange} accept="image/*" />
            </div>
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Updating..." : "Update Image"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
