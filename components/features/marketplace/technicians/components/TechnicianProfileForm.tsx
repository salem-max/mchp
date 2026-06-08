"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

const SKILL_SUGGESTIONS = ["Plumbing", "Electrical", "HVAC", "Carpentry", "Painting", "Appliance Repair", "Roofing", "Welding"];

export default function TechnicianProfileForm() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/technician/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const p = data.technicianProfile ?? data;
        setSkills(p.skills ?? []);
        setHourlyRate(p.hourlyRate?.toString() ?? "");
        setIsAvailable(p.isAvailable ?? false);
      })
      .catch(() => {});
  }, []);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/technician/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skills, hourlyRate: Number(hourlyRate) || null, isAvailable }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Technician Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Hourly Rate (RM)</Label>
          <Input type="number" placeholder="50" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min={0} />
        </div>

        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
            />
            <Button type="button" size="icon" variant="outline" onClick={() => addSkill(skillInput)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SKILL_SUGGESTIONS.filter((s: any) => !skills.includes(s)).map((s: any) => (
              <button key={s} onClick={() => addSkill(s)} className="text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                + {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {skills.map((s: any) => (
              <Badge key={s} variant="secondary" className="gap-1">
                {s}
                <button onClick={() => setSkills((prev) => prev.filter((x: any) => x !== s))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="avail" checked={isAvailable} onCheckedChange={setIsAvailable} />
          <Label htmlFor="avail">Available for jobs</Label>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
