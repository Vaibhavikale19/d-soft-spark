import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

interface AboutContent {
  id?: string;
  title: string;
  description: string;
  mission: string;
  vision: string;
  image_url?: string;
}

export default function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    title: "",
    description: "",
    mission: "",
    vision: "",
    image_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_section")
      .select("*")
      .maybeSingle();

    if (error) {
      toast.error("Failed to fetch About content");
    } else if (data) {
      setContent(data);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let image_url = content.image_url;

      if (file) {
        let uploadFile = file;
        
        // Compress if large
        if (uploadFile.size > 500 * 1024) { // > 500KB
          toast.info("Compressing image for faster upload...");
          uploadFile = await compressImage(uploadFile);
        }

        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `about-image.${fileExt}`;
        const filePath = `about/${fileName}`;

        // Using upsert for the file
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, uploadFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);
        
        image_url = publicUrl;
      }

      const payload = { ...content, image_url };
      
      const { error } = await supabase
        .from("about_section")
        .upsert([payload]);

      if (error) throw error;
      toast.success("About section updated successfully");
      fetchAboutContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">About DSoft Editor</h2>
        <Button variant="outline" size="sm" onClick={fetchAboutContent}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institute Title</Label>
              <Input 
                value={content.title} 
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="e.g. DSoft Institute of Programming"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description / Bio</Label>
              <Textarea 
                value={content.description} 
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                placeholder="Write about the institute..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mission</Label>
              <Textarea 
                value={content.mission} 
                onChange={(e) => setContent({ ...content, mission: e.target.value })}
                placeholder="Our mission..."
              />
            </div>

            <div className="space-y-2">
              <Label>Vision</Label>
              <Textarea 
                value={content.vision} 
                onChange={(e) => setContent({ ...content, vision: e.target.value })}
                placeholder="Our vision..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institute Image</Label>
              <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-4 bg-muted/50 min-h-[250px]">
                {content.image_url ? (
                  <img src={content.image_url} alt="Institute" className="max-h-48 rounded-lg shadow-sm" />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <p>No image uploaded</p>
                    <p className="text-xs">Recommended size: 800x600</p>
                  </div>
                )}
                <Input type="file" onChange={handleFileChange} accept="image/*" className="max-w-[200px]" />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-primary" disabled={saving}>
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
